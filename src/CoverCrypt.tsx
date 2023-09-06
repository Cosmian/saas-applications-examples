import { CheckCircleIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Code,
  Flex,
  Heading,
  Image,
  Input,
  ListItem,
  OrderedList,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";
import { Policy } from "cloudproof_js";
import { useEffect, useState } from "react";
import { Jsoncode } from "./App";
import { CodeHigligter } from "./Layout";
import { createCovercryptKeyPair } from "./actions/createCovercryptKeyPair";
import { createDecryptionKey } from "./actions/createDecryptionKey";
import { createPolicy } from "./actions/createPolicy";
import { createSymmetricKey } from "./actions/createSymmetricKey";
import { decryptDataInKms } from "./actions/decryptDataInKms";
import { decryptDataLocally } from "./actions/decryptDataLocally";
import { encryptDataInKms } from "./actions/encryptDataInKms";
import { encryptDataLocally } from "./actions/encryptDataLocally";
import { locateKeysByTags } from "./actions/locateKeysByTag";
import { retrieveDecryptionKey } from "./actions/retriveDecryptionKey";
import { retrieveKeyPair } from "./actions/retriveKeyPair";
import { getKmsVersion } from "./actions/testKmsVersion";
import { EncryptedResult, KeyPair, PolicyAxisItem } from "./actions/types";
import DatabaseSchema from "./assets/db-schema.png";
import EmployeesDatabaseImage from "./assets/employees-database.png";
import { Employee, employees } from "./utils/employees";

export const POLICY_AXIS: PolicyAxisItem[] = [
  {
    department: [
      { name: "Marketing", isHybridized: false },
      { name: "HR", isHybridized: false },
    ],
  },
  {
    country: [
      { name: "France", isHybridized: false },
      { name: "Spain", isHybridized: false },
      { name: "Germany", isHybridized: false },
    ],
  },
];

export const ACCESS_POLICY = "(country::France || country::Spain || country::Germany) && (department::HR || department::Marketing)";

type CodeContent = {
  [key: string]: string;
};

const CoverCrypt: React.FC<{ kmsToken: string }> = ({ kmsToken }) => {
  const [health, setHealth] = useState<undefined | string>();
  const [kmsVersion, setKmsVersion] = useState<undefined | string>();
  const [policy, setPolicy] = useState<undefined | Policy>();
  // keys
  const [keyPair, setKeyPair] = useState<undefined | KeyPair>();
  const [decryptionKey, setDecryptionKey] = useState<undefined | string>();
  const [symmetricKeyId, setSymmetricKeyId] = useState<string | null>(null);
  const [locatedKeys, setLocatedKeys] = useState<string[] | null>(null);

  // data
  const [localEncryptedData, setLocalEncryptedData] = useState<undefined | EncryptedResult[]>();
  const [localClearData, setLocalClearData] = useState<undefined | Employee[]>();
  const [kmsEncryptedData, setKmsEncryptedData] = useState<undefined | EncryptedResult[]>();
  const [kmsClearData, setKmsClearData] = useState<undefined | Employee[]>();
  // inputs
  const [symmetricKeyInput, setSymmetricKeyInput] = useState<string | null>(null);
  const [covercryptKeyInput, setCovercryptKeyInput] = useState<string | null>(null);
  const [decryptionKeyInput, setDecryptionKeyInput] = useState<string | null>(null);
  const [locateKeyInput, setLocateKeyInput] = useState<string | null>(null);
  // code
  const [code, setCode] = useState<CodeContent>();

  const toast = useToast();

  useEffect(() => {
    getTextFromFile();
  }, []);

  useEffect(() => {
    const getHealth = async (): Promise<void> => {
      setHealth(await getKmsVersion(kmsToken));
    };
    getHealth();
  }, [kmsToken]);

  const getTextFromFile = async (): Promise<void> => {
    const tempCode: CodeContent = {};
    const files = [
      "testKmsVersion",
      "createCovercryptKeyPair",
      "createDecryptionKey",
      "createPolicy",
      "createSymmetricKey",
      "decryptDataInKms",
      "decryptDataLocally",
      "encryptDataInKms",
      "encryptDataLocally",
      "locateKeysByTag",
      "retriveDecryptionKey",
      "retriveKeyPair",
      "testKmsVersion",
    ];
    for (const file of files) {
      const response = await fetch(`./actions/${file}.ts`);
      const text = await response.text();
      tempCode[file] = text; // You can set any value you want here
    }
    setCode(tempCode);
  };

  const toastError = (error: unknown): void => {
    toast({
      title: (error as Error).message,
      status: "error",
      isClosable: true,
    });
    console.error(error);
  };

  //
  // KMS actions
  //

  const handleGetVersion = async (): Promise<void> => {
    try {
      setKmsVersion(await getKmsVersion(kmsToken));
    } catch (error) {
      toastError(error);
    }
  };

  const handleCreatePolicy = async (): Promise<void> => {
    try {
      setPolicy(await createPolicy(POLICY_AXIS));
    } catch (error) {
      toastError(error);
    }
  };

  const handleCreateKeyPair = async (): Promise<void> => {
    try {
      if (policy) {
        let tags: string[] | undefined;
        if (covercryptKeyInput) tags = covercryptKeyInput.replace(/ /g, "").split(",");
        setKeyPair(await createCovercryptKeyPair(kmsToken, policy, tags));
      }
    } catch (error) {
      toastError(error);
    }
  };

  const createSymmetrickKey = async (): Promise<void> => {
    try {
      let tags: string[] | undefined;
      if (symmetricKeyInput) tags = symmetricKeyInput.replace(/ /g, "").split(",");
      const id = await createSymmetricKey(kmsToken, tags);
      setSymmetricKeyId(id);
    } catch (error) {
      toast({
        title: (error as Error).message,
        status: "error",
        isClosable: true,
      });
      console.error(error);
    }
  };

  const handleCreateDecryptionKey = async (): Promise<void> => {
    try {
      if (policy && keyPair) {
        let tags: string[] | undefined;
        if (decryptionKeyInput) tags = decryptionKeyInput.replace(/ /g, "").split(",");
        const decryptionAccessPolicy = ACCESS_POLICY;
        setDecryptionKey(await createDecryptionKey(kmsToken, keyPair.masterSecretKeyUID, decryptionAccessPolicy, tags));
      }
    } catch (error) {
      toastError(error);
    }
  };

  const locateKeys = async (): Promise<void> => {
    try {
      if (locateKeyInput) {
        const tags = locateKeyInput.replace(/ /g, "").split(",");
        const keys = await locateKeysByTags(kmsToken, tags);
        setLocatedKeys(keys);
      }
    } catch (error) {
      toast({
        title: (error as Error).message,
        status: "error",
        isClosable: true,
      });
      console.error(error);
    }
  };

  const handleEncrypt = async ({ browser = false }): Promise<void> => {
    try {
      if (keyPair && policy) {
        const { masterPublicKeyBytes } = await retrieveKeyPair(kmsToken, keyPair);
        if (browser) {
          const encryptedEmployees = await Promise.all(
            employees.map(async (employee) => {
              const encryptedMarketing = await encryptDataLocally(
                masterPublicKeyBytes,
                policy,
                `department::Marketing && country::${employee.country}`,
                new TextEncoder().encode(
                  JSON.stringify({
                    first: employee.first,
                    last: employee.last,
                    country: employee.country,
                  })
                )
              );
              const encryptedHr = await encryptDataLocally(
                masterPublicKeyBytes,
                policy,
                `department::HR && country::${employee.country}`,
                new TextEncoder().encode(
                  JSON.stringify({
                    email: employee.email,
                    salary: employee.salary,
                  })
                )
              );
              return { key: employee.uuid, marketing: encryptedMarketing, hr: encryptedHr };
            })
          );
          setLocalClearData(undefined);
          setLocalEncryptedData(encryptedEmployees);
        } else {
          const encryptedEmployees = await Promise.all(
            employees.map(async (employee) => {
              const encryptedMarketing = await encryptDataInKms(
                JSON.stringify({
                  first: employee.first,
                  last: employee.last,
                  country: employee.country,
                }),
                kmsToken,
                ACCESS_POLICY,
                keyPair.masterPublicKeyUID
              );
              const encryptedHr = await encryptDataInKms(
                JSON.stringify({
                  email: employee.email,
                  salary: employee.salary,
                }),
                kmsToken,
                ACCESS_POLICY,
                keyPair.masterPublicKeyUID
              );
              return { key: employee.uuid, marketing: encryptedMarketing, hr: encryptedHr };
            })
          );
          setKmsClearData(undefined);
          setKmsEncryptedData(encryptedEmployees);
        }
      }
    } catch (error) {
      toastError(error);
    }
  };

  const handleDecrypt = async ({ browser = false }): Promise<void> => {
    try {
      if (browser) {
        if (decryptionKey && localEncryptedData) {
          // retrieve decryption key
          const retrivedDecryptionKey = await retrieveDecryptionKey(kmsToken, decryptionKey);
          const clear = await Promise.all(
            localEncryptedData.map(async (row) => {
              const marketing = await decryptDataLocally(row.marketing, retrivedDecryptionKey.bytes());
              const hr = await decryptDataLocally(row.hr, retrivedDecryptionKey.bytes());
              const all = { ...JSON.parse(marketing), ...JSON.parse(hr) };
              return all;
            })
          );
          setLocalClearData(clear);
          setLocalEncryptedData(undefined);
        }
      } else {
        if (keyPair && kmsEncryptedData) {
          const clear = await Promise.all(
            kmsEncryptedData.map(async (row) => {
              const marketing = await decryptDataInKms(row.marketing, kmsToken, keyPair.masterSecretKeyUID, ACCESS_POLICY);
              const hr = await decryptDataInKms(row.hr, kmsToken, keyPair.masterSecretKeyUID, ACCESS_POLICY);
              const all = { ...JSON.parse(marketing), ...JSON.parse(hr) };
              return all;
            })
          );
          setKmsClearData(clear);
          setKmsEncryptedData(undefined);
        }
      }
    } catch (error) {
      toastError(error);
    }
  };

  console.log(code);

  // render

  return (
    <Flex flexDirection={"column"} gap="8">
      <Heading as="h2" size="lg">
        Example: employees database
      </Heading>
      <Image
        boxSize="100%"
        maxWidth={900}
        alignSelf={"center"}
        objectFit="cover"
        src={EmployeesDatabaseImage}
        alt="Employees database schema"
      />
      <Image boxSize="100%" maxWidth={700} alignSelf={"center"} objectFit="cover" src={DatabaseSchema} alt="Database schema" />

      <Box>
        <Text fontSize="md">
          Consider the following 2 policy axes, Department and Country which data are partitioned by the following attributes:
        </Text>
        <OrderedList>
          <ListItem>Department: Marketing and HR</ListItem>
          <ListItem>Country: France, Spain and Germany</ListItem>
        </OrderedList>
        <Text>
          Each pair (Department, Country) constitutes one of the XX=XX data partitions.
          <br />
          With Cosmian attribute-based encryption scheme, the encryption key is public. Encrypting systems (Spark, data engineering
          applications, ETLs, etc.) do not have to be secured and can directly hold the key, relaxing constraints on the infrastructure. The
          public key can encrypt for any partition defined by the policy.
          <br />
          Decryption keys can decrypt a subset of the partitions defined by the policy.
        </Text>
      </Box>

      {kmsToken && (
        <>
          {/* TEST KMS */}
          <CodeHigligter codeInput={code?.testKmsVersion} />
          <Button onClick={handleGetVersion} width="100%">
            Test KMS version
          </Button>
          {kmsVersion && (
            <Center gap="2">
              <CheckCircleIcon color="green.500" />
              KMS is running on version {kmsVersion}
            </Center>
          )}

          {health && (
            <>
              {/* CREATE POLICY */}
              <CodeHigligter codeInput={code?.createPolicy} />
              <Button onClick={handleCreatePolicy}>Create policy</Button>
              {policy && (
                <>
                  <Center gap="2">
                    <CheckCircleIcon color="green.500" />
                    OK, policy created:
                  </Center>
                  <Jsoncode code={POLICY_AXIS} />
                </>
              )}

              {/* CREATE SYMMETRIC KEY */}
              <CodeHigligter codeInput={code?.createSymmetricKey} />
              <Stack spacing={5} direction="row">
                <Input placeholder="Add tags separate with commas" onChange={(e) => setSymmetricKeyInput(e.target.value)} />
                <Button onClick={createSymmetrickKey} width="50%">
                  Create symmetric key
                </Button>
              </Stack>
              {symmetricKeyId && (
                <UnorderedList>
                  <ListItem>Symmetric Key Id: {<Code>{symmetricKeyId}</Code>}</ListItem>
                </UnorderedList>
              )}

              {/* CREATE KEY PAIR */}
              <CodeHigligter codeInput={code?.createCovercryptKeyPair} />
              <Stack spacing={5} direction="row">
                <Input placeholder="Add tags separate with commas" onChange={(e) => setCovercryptKeyInput(e.target.value)} />
                <Button onClick={handleCreateKeyPair} width="50%" isDisabled={policy == null}>
                  Create Master key pair
                </Button>
              </Stack>
              {keyPair && (
                <UnorderedList>
                  <ListItem>masterPublicKeyUID: {<Code>{keyPair.masterPublicKeyUID}</Code>}</ListItem>
                  <ListItem>
                    masterSecretKeyUID: <Code>{keyPair.masterSecretKeyUID}</Code>
                  </ListItem>
                </UnorderedList>
              )}

              {/* CREATE DECRYPTION KEY */}
              <CodeHigligter codeInput={code?.createDecryptionKey} />
              <Stack spacing={5} direction="row">
                <Input placeholder="Add tags separate with commas" onChange={(e) => setDecryptionKeyInput(e.target.value)} />
                <Button onClick={handleCreateDecryptionKey} isDisabled={policy == null} width="50%">
                  Create decryption key
                </Button>
              </Stack>
              {decryptionKey && (
                <UnorderedList>
                  <ListItem>
                    Access policy: <Code>{ACCESS_POLICY}</Code>
                  </ListItem>
                  <ListItem>
                    decryptionKey: <Code>{decryptionKey}</Code>
                  </ListItem>
                </UnorderedList>
              )}

              {/* LOCATE KEYS */}
              <CodeHigligter codeInput={code?.locatedKeys} />
              <Stack spacing={5} direction="row">
                <Input placeholder="Tags separate with commas" onChange={(e) => setLocateKeyInput(e.target.value)} />
                <Button onClick={locateKeys} width="50%">
                  Locate symmetric key by tags
                </Button>
              </Stack>
              {locatedKeys && locatedKeys.length > 0 && (
                <Flex gap="2" direction="row">
                  <CheckCircleIcon color="green.500" />
                  Located key(s)' Id:{" "}
                  <Stack>
                    {locatedKeys.map((key, i) => (
                      <Code key={i}>{key}</Code>
                    ))}
                  </Stack>
                </Flex>
              )}

              {/* ENCRYPT/DECRYPT IN BROWSER */}
              <CodeHigligter codeInput={code?.encryptDataLocally} />
              <CodeHigligter codeInput={code?.decryptDataLocally} />
              <ButtonGroup isAttached variant="outline" isDisabled={keyPair == null}>
                <Button onClick={() => handleEncrypt({ browser: true })} width="50%">
                  Encrypt data in browser
                </Button>
                <Button onClick={() => handleDecrypt({ browser: true })} width="50%" isDisabled={localEncryptedData == null}>
                  Decrypt in browser
                </Button>
              </ButtonGroup>
              {localEncryptedData && localEncryptedData.length > 0 && (
                <EncryptedTable caption={"Encrypted in browser"} data={localEncryptedData} />
              )}
              {localClearData && <EmployeeTable caption={"Decrypted in browser"} data={localClearData} />}

              {/* ENCRYPT/DECRYPT IN KMS */}
              <CodeHigligter codeInput={code?.encryptDataInKms} />
              <CodeHigligter codeInput={code?.decryptDataInKms} />
              <ButtonGroup isAttached variant="outline" isDisabled={keyPair == null}>
                <Button onClick={() => handleEncrypt({ browser: false })} width="50%">
                  Encrypt data in KMS
                </Button>
                <Button onClick={() => handleDecrypt({ browser: false })} width="50%" isDisabled={kmsEncryptedData == null}>
                  Decrypt data in KMS
                </Button>
              </ButtonGroup>

              {kmsEncryptedData && kmsEncryptedData.length > 0 && <EncryptedTable caption={"Encrypted in KMS"} data={kmsEncryptedData} />}
              {kmsClearData && <EmployeeTable caption={"Decrypted in KMS"} data={kmsClearData} />}
            </>
          )}
        </>
      )}
    </Flex>
  );
};

export default CoverCrypt;

const EmployeeTable: React.FC<{ data: Employee[]; caption?: string }> = ({ data, caption }) => {
  const header = Object.keys(data[0]);
  return (
    <TableContainer maxWidth="100%">
      <Table variant="simple" width="100%">
        <Thead>
          <Tr>
            {header.map((key, index) => (
              <Th key={index}>{key}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((item, index) => {
            return (
              <Tr key={index}>
                {Object.values(item).map((values, index) => (
                  <Td key={index}>{values}</Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
        {caption && <TableCaption>{caption}</TableCaption>}
      </Table>
    </TableContainer>
  );
};

const EncryptedTable: React.FC<{ data: EncryptedResult[]; caption?: string }> = ({ data, caption }) => {
  const header = Object.keys(data[0]);
  return (
    <TableContainer>
      <Table variant="simple" width={"100%"}>
        <Thead>
          <Tr>
            {header.map((key, index) => (
              <Th key={index}>{key}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((item, index) => {
            return (
              <Tr key={index}>
                {Object.values(item).map((values, index) => (
                  <Td key={index} style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: 400 }}>
                    {values}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
        {caption && <TableCaption>{caption}</TableCaption>}
      </Table>
    </TableContainer>
  );
};
