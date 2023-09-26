import { CheckCircleIcon } from "@chakra-ui/icons";
import {
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
  Text,
  Tooltip,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";
import { Policy } from "cloudproof_js";
import { useEffect, useState } from "react";
import { CodeHighlighter, HeadingWithCode } from "./Layout";
import { createCovercryptKeyPair } from "./actions/createCovercryptKeyPair";
import { createDecryptionKey } from "./actions/createDecryptionKey";
import { createPolicy } from "./actions/createPolicy";
import { decryptDataInKms } from "./actions/decryptDataInKms";
import { decryptDataLocally } from "./actions/decryptDataLocally";
import { encryptDataInKms } from "./actions/encryptDataInKms";
import { encryptDataLocally } from "./actions/encryptDataLocally";
import { locateKeysByTags } from "./actions/locateKeysByTags";
import { retrieveDecryptionKey } from "./actions/retrieveDecryptionKey";
import { retrieveKeyPair } from "./actions/retrieveKeyPair";
import { getKmsVersion } from "./actions/testKmsVersion";
import { EncryptedResult, KeysId, PolicyAxisItem } from "./actions/types";
import DatabaseSchema from "./assets/db-schema.png";
import DecryptionInKMS from "./assets/decryption_in_KMS.drawio.svg";
import DecryptionInBrowser from "./assets/decryption_in_presentation_layer.drawio.svg";
import EmployeesDatabaseImage from "./assets/employees-database.png";
import { EmployeeTable, EncryptedTable } from "./components/Table";
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

export const ACCESS_POLICY = "(country::Germany) && (department::HR)";

type CodeContent = {
  [key: string]: string;
};

const CoverCrypt: React.FC<{ kmsToken: string }> = ({ kmsToken }) => {
  const [health, setHealth] = useState<undefined | string>();
  const [kmsVersion, setKmsVersion] = useState<undefined | string>();
  const [policy, setPolicy] = useState<undefined | Policy>();
  // keys
  const [keyPair, setKeyPair] = useState<undefined | KeysId>();
  const [decryptionKeyId, setDecryptionKeyId] = useState<undefined | string>();
  const [locatedKeys, setLocatedKeys] = useState<string[] | null>(null);

  // data
  const [localEncryptedData, setLocalEncryptedData] = useState<undefined | EncryptedResult[]>();
  const [localClearData, setLocalClearData] = useState<undefined | Employee[]>();
  const [kmsEncryptedData, setKmsEncryptedData] = useState<undefined | EncryptedResult[]>();
  const [kmsClearData, setKmsClearData] = useState<undefined | Employee[]>();
  // inputs
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
      "locateKeysByTags",
      "retrieveDecryptionKey",
      "retrieveKeyPair",
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
      title: typeof error === "string" ? error : (error as Error).message,
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

  const handleCreateDecryptionKey = async (): Promise<void> => {
    try {
      if (policy && keyPair) {
        let tags: string[] | undefined;
        if (decryptionKeyInput) tags = decryptionKeyInput.replace(/ /g, "").split(",");
        const decryptionAccessPolicy = ACCESS_POLICY;
        setDecryptionKeyId(await createDecryptionKey(kmsToken, keyPair.masterSecretKeyUId, decryptionAccessPolicy, tags));
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
                `department::Marketing && country::${employee.country}`,
                keyPair.masterPublicKeyUId
              );
              const encryptedHr = await encryptDataInKms(
                JSON.stringify({
                  email: employee.email,
                  salary: employee.salary,
                }),
                kmsToken,
                `department::HR && country::${employee.country}`,
                keyPair.masterPublicKeyUId
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

  const handleDecryptLocally = async (): Promise<void> => {
    if (localEncryptedData && decryptionKeyId) {
      const retrievedDecryptionKey = await retrieveDecryptionKey(kmsToken, decryptionKeyId as string);
      const clearMarketing: Employee[] = await Promise.all(
        localEncryptedData.map(async (row) => {
          try {
            const marketing = await decryptDataLocally(row.marketing, retrievedDecryptionKey.bytes());
            const decryptedMarketing = JSON.parse(marketing);
            return decryptedMarketing;
          } catch {
            //
          }
        })
      );
      const clearHR: Employee[] = await Promise.all(
        localEncryptedData.map(async (row) => {
          try {
            const hr = await decryptDataLocally(row.hr, retrievedDecryptionKey.bytes());
            const decryptedHR = JSON.parse(hr);
            return decryptedHR;
          } catch {
            //
          }
        })
      );

      const clearEmployee = clearMarketing.map((row, key) => {
        return {
          uuid: key,
          first: row?.first != null ? row.first : "–",
          last: row?.last != null ? row.last : "–",
          country: row?.country != null ? row.country : "–",
          email: clearHR[key]?.email != null ? clearHR[key].email : "–",
          salary: clearHR[key]?.salary != null ? clearHR[key].salary : "–",
        };
      });

      setLocalClearData(clearEmployee as Employee[]);
      setLocalEncryptedData(undefined);
    }
  };
  const handleDecryptInKms = async (): Promise<void> => {
    if (kmsEncryptedData && decryptionKeyId) {
      const clearMarketing: Employee[] = await Promise.all(
        kmsEncryptedData.map(async (row) => {
          try {
            const marketing = await decryptDataInKms(row.marketing, kmsToken, decryptionKeyId);
            const decryptedMarketing = JSON.parse(marketing);
            return decryptedMarketing;
          } catch {
            //
          }
        })
      );
      const clearHR: Employee[] = await Promise.all(
        kmsEncryptedData.map(async (row) => {
          try {
            const hr = await decryptDataInKms(row.hr, kmsToken, decryptionKeyId);
            const decryptedHr = JSON.parse(hr);
            return decryptedHr;
          } catch {
            //
          }
        })
      );

      const clearEmployee = clearMarketing.map((row, key) => {
        return {
          uuid: key,
          first: row?.first != null ? row.first : "–",
          last: row?.last != null ? row.last : "–",
          country: row?.country != null ? row.country : "–",
          email: clearHR[key]?.email != null ? clearHR[key].email : "–",
          salary: clearHR[key]?.salary != null ? clearHR[key].salary : "–",
        };
      });

      setKmsClearData(clearEmployee as Employee[]);
      setKmsEncryptedData(undefined);
    }
  };

  // render

  return (
    <Flex flexDirection={"column"} gap="8">
      {/* INTRO */}

      <Heading as="h2" size="lg">
        Test KMS actions combined with our attribute-based encryption scheme: Covercrypt.
      </Heading>
      <Heading as="h3" size="md">
        Example of use: employees database
      </Heading>
      <Image
        boxSize="100%"
        maxWidth={900}
        alignSelf={"center"}
        objectFit="cover"
        src={EmployeesDatabaseImage}
        alt="Employees database schema"
      />

      <Stack spacing={3}>
        <Text fontSize="md">
          Consider 2 policy axes: <Text as="b">Department</Text> and <Text as="b">Country</Text>. Each axes are partitioned by attributes:{" "}
          <Text as="b">Marketing and HR</Text> for the Departement axe and <Text as="b">France, Spain and Germany</Text> for the Country
          axe.
        </Text>
        <OrderedList>
          <ListItem>
            <Text as="b">Department</Text>: Marketing | HR
          </ListItem>
          <ListItem>
            <Text as="b">Country</Text>: France | Spain | Germany
          </ListItem>
        </OrderedList>
        <Text>
          With Cosmian attribute-based encryption scheme, the encryption key is public. Encrypting systems (Spark, data engineering
          applications, ETLs, etc.) do not have to be secured and can directly hold the key, relaxing constraints on the infrastructure. The
          public key can encrypt for any partition defined by the policy.
          <br />
          Decryption keys can decrypt a subset of the partitions defined by the policy.
        </Text>
      </Stack>
      <Image boxSize="100%" maxWidth={700} alignSelf={"center"} objectFit="cover" src={DatabaseSchema} alt="Database schema" />

      {kmsToken && (
        <>
          <HeadingWithCode heading="Test KMS health with KMS version" code="/src/actions/testKmsVersion.ts" />
          {/* TEST KMS */}
          <CodeHighlighter codeInput={code?.testKmsVersion} />
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
              <HeadingWithCode heading="Create policy" code="/src/actions/createPolicy.ts" />
              <CodeHighlighter codeInput={code?.createPolicy} />
              <Button onClick={handleCreatePolicy}>Create policy</Button>
              {policy && (
                <>
                  <Center gap="2">
                    <CheckCircleIcon color="green.500" />
                    OK, policy created:
                  </Center>
                  <CodeHighlighter codeInput={JSON.stringify(POLICY_AXIS, undefined, 2)} language={"json"} />
                </>
              )}

              {/* CREATE KEY PAIR */}
              <HeadingWithCode heading="Create Covercrypt master Key Pair" code="/src/actions/createCovercryptKeyPair.ts" />
              <CodeHighlighter codeInput={code?.createCovercryptKeyPair} />
              <Stack spacing={5} direction="row">
                <Input placeholder="Add tags separate with commas" onChange={(e) => setCovercryptKeyInput(e.target.value)} />
                {policy == null ? (
                  <Tooltip label="Create policy first">
                    <Button onClick={handleCreateKeyPair} width="50%" isDisabled>
                      Create Master key pair
                    </Button>
                  </Tooltip>
                ) : (
                  <Button onClick={handleCreateKeyPair} width="50%">
                    Create Master key pair
                  </Button>
                )}
              </Stack>
              {keyPair && (
                <UnorderedList>
                  <ListItem>masterPublicKeyUId: {<Code>{keyPair.masterPublicKeyUId}</Code>}</ListItem>
                  <ListItem>
                    masterSecretKeyUId: <Code>{keyPair.masterSecretKeyUId}</Code>
                  </ListItem>
                </UnorderedList>
              )}

              {/* CREATE DECRYPTION KEY */}
              <HeadingWithCode heading="Create Decryption Key with policy access" code="/src/actions/createDecryptionKey.ts" />
              <CodeHighlighter codeInput={code?.createDecryptionKey} />
              <Stack spacing={5} direction="row">
                <Input placeholder="Add tags separate with commas" onChange={(e) => setDecryptionKeyInput(e.target.value)} />
                {policy == null ? (
                  <Tooltip label="Create policy first">
                    <Button onClick={handleCreateDecryptionKey} isDisabled width="50%">
                      Create decryption key
                    </Button>
                  </Tooltip>
                ) : (
                  <Button onClick={handleCreateDecryptionKey} width="50%">
                    Create decryption key
                  </Button>
                )}
              </Stack>
              {decryptionKeyId && (
                <UnorderedList>
                  <ListItem>
                    Access policy: <Code>{ACCESS_POLICY}</Code>
                  </ListItem>
                  <ListItem>
                    decryptionKey: <Code>{decryptionKeyId}</Code>
                  </ListItem>
                </UnorderedList>
              )}

              {/* LOCATE KEYS */}
              <HeadingWithCode heading="Locate Keys by tag" code="/src/actions/locateKeysByTags.ts" />
              <CodeHighlighter codeInput={code?.locateKeysByTags} />
              <Stack spacing={5} direction="row">
                <Input placeholder="Tags separate with commas" onChange={(e) => setLocateKeyInput(e.target.value)} />
                <Button onClick={locateKeys} width="50%">
                  Locate keys by tags
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
              <HeadingWithCode heading="Encrypt & Decrypt data in browser" />
              <Text>
                The SaaS provider can implement the encryption and decryption algorithms in the presentation layer, using the Cosmian
                libraries.
              </Text>
              <Image
                boxSize="100%"
                maxWidth={800}
                alignSelf={"center"}
                objectFit="cover"
                src={DecryptionInBrowser}
                alt="Decryption in browser"
              />
              <Heading as="h3" size="md">
                Encrypt
              </Heading>
              <Code>/src/actions/encryptDataLocally.ts</Code>
              <CodeHighlighter codeInput={code?.encryptDataLocally} />
              <Heading as="h3" size="md">
                Decrypt
              </Heading>
              <Text>First retrieve the user decryption key from the KMS.</Text>
              <Code>/src/actions/retrieveDecryptionKey.ts</Code>
              <CodeHighlighter codeInput={code?.retrieveDecryptionKey} />
              <Code>/src/actions/decryptDataLocally.ts</Code>
              <CodeHighlighter codeInput={code?.decryptDataLocally} />
              <ButtonGroup isAttached variant="outline" isDisabled={keyPair == null}>
                <Button onClick={() => handleEncrypt({ browser: true })} width="50%">
                  Encrypt data in browser
                </Button>
                <Button
                  onClick={() => handleDecryptLocally()}
                  width="50%"
                  isDisabled={localEncryptedData == null || decryptionKeyId == null}
                >
                  Decrypt in browser
                </Button>
              </ButtonGroup>
              {localEncryptedData && localEncryptedData.length > 0 && (
                <EncryptedTable caption={"Encrypted in browser"} data={localEncryptedData} />
              )}
              {localClearData && <EmployeeTable caption={"Decrypted in browser"} data={localClearData} />}

              {/* ENCRYPT/DECRYPT IN KMS */}
              <HeadingWithCode heading="Encrypt & Decrypt data in KMS" />
              <Text>
                The safest implementation is to issue calls to the KMS, whether on-prem or SaaS, to decrypt (or encrypt) the data.
              </Text>
              <Image boxSize="100%" maxWidth={800} alignSelf={"center"} objectFit="cover" src={DecryptionInKMS} alt="Decryption in KMS" />
              <Heading as="h3" size="md">
                Encrypt
              </Heading>
              <Code>/src/actions/encryptDataInKms.ts</Code>
              <CodeHighlighter codeInput={code?.encryptDataInKms} />
              <Heading as="h3" size="md">
                Decrypt
              </Heading>
              <Code>/src/actions/decryptDataInKms.ts</Code>
              <CodeHighlighter codeInput={code?.decryptDataInKms} />
              <ButtonGroup isAttached variant="outline" isDisabled={keyPair == null}>
                <Button onClick={() => handleEncrypt({ browser: false })} width="50%">
                  Encrypt data in KMS
                </Button>
                <Button onClick={() => handleDecryptInKms()} width="50%" isDisabled={kmsEncryptedData == null || decryptionKeyId == null}>
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
