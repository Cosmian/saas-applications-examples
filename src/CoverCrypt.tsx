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
import { HeadingWithDivider } from "./Layout";
import { KeysUid, createCovercryptKeyPair } from "./actions/createCovercryptKeyPair";
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
import { EncryptedResult, PolicyAxisItem } from "./actions/types";
import DatabaseSchema from "./assets/db-schema.png";
import DecryptionInKMS from "./assets/decryption_in_KMS.drawio.svg";
import DecryptionInBrowser from "./assets/decryption_in_presentation_layer.drawio.svg";
import EmployeesDatabaseImage from "./assets/employees-database.png";
import { CodeHighlighter } from "./components/CodeHighlighter";
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
  const [keyPair, setKeyPair] = useState<undefined | KeysUid>();
  const [decryptionKeyUid, setDecryptionKeyUid] = useState<undefined | string>();
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
  const [jsCode, setjsCode] = useState<CodeContent>();
  const [javaCode, setJavaCode] = useState<CodeContent>();

  const toast = useToast();

  useEffect(() => {
    getTextFromJsFile();
    getTextFromJavaFile();
  }, []);

  useEffect(() => {
    const getHealth = async (): Promise<void> => {
      setHealth(await getKmsVersion(kmsToken));
    };
    getHealth();
  }, [kmsToken]);

  const getTextFromJsFile = async (): Promise<void> => {
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
    setjsCode(tempCode);
  };
  const getTextFromJavaFile = async (): Promise<void> => {
    const tempCode: CodeContent = {};
    const files = [
      "createCovercryptKeyPair",
      "createDecryptionKey",
      "createPolicy",
      "decryptDataInKms",
      "decryptDataLocally",
      "encryptDataInKms",
      "encryptDataLocally",
    ];
    for (const file of files) {
      const response = await fetch(`./actions/${file}.java`);
      const text = await response.text();
      tempCode[file] = text; // You can set any value you want here
    }
    setJavaCode(tempCode);
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
        setDecryptionKeyUid(await createDecryptionKey(kmsToken, keyPair.masterSecretKeyUId, decryptionAccessPolicy, tags));
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
    if (localEncryptedData && decryptionKeyUid) {
      const retrievedDecryptionKey = await retrieveDecryptionKey(kmsToken, decryptionKeyUid as string);
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
    if (kmsEncryptedData && decryptionKeyUid) {
      const clearMarketing: Employee[] = await Promise.all(
        kmsEncryptedData.map(async (row) => {
          try {
            const marketing = await decryptDataInKms(row.marketing, kmsToken, decryptionKeyUid);
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
            const hr = await decryptDataInKms(row.hr, kmsToken, decryptionKeyUid);
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
        Fast, post-quantum attribute-based encryption with <em>Covercrypt</em>
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
          Consider 2 policy axes: <Text as="b">Department</Text> and <Text as="b">Country</Text>. Each axis is partitioned by attributes:{" "}
          <Text as="b">Marketing and HR</Text> for the department axis and <Text as="b">France, Spain, and Germany</Text> for the Country
          axis.
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
          <HeadingWithDivider heading="Test KMS health with KMS version" />
          {/* TEST KMS */}
          <CodeHighlighter codeInput={jsCode?.testKmsVersion} language="Javascript" />
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
              <HeadingWithDivider heading="Create policy" />
              <CodeHighlighter codeInput={[jsCode?.createPolicy, javaCode?.createPolicy]} />
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
              <HeadingWithDivider heading="Create Covercrypt master Key Pair" />
              <Text>
                The master key pair is made of a public key, that is only used to encrypt data with attributes and a master private key,
                that is only used to create user decryption keys.
              </Text>
              <CodeHighlighter codeInput={[jsCode?.createCovercryptKeyPair, javaCode?.createCovercryptKeyPair]} />
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
              <HeadingWithDivider heading="Create a User Decryption Key with an access policy" />
              <Text>
                A user decryption key is issued from the master private key and for a given access policy that will determine its rights to
                decrypt some of the ciphertexts. User decryption keys have a unique fingerprint: two keys with the same policy will have a
                different value, so they can easily be traced in case of leakage. They are anonymous too: there is no way to determine what
                they will decrypt, by simply looking at the key.
              </Text>
              <CodeHighlighter codeInput={[jsCode?.createDecryptionKey, javaCode?.createDecryptionKey]} />
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
              {decryptionKeyUid && (
                <UnorderedList>
                  <ListItem>
                    Access policy: <Code>{ACCESS_POLICY}</Code>
                  </ListItem>
                  <ListItem>
                    decryptionKey: <Code>{decryptionKeyUid}</Code>
                  </ListItem>
                </UnorderedList>
              )}

              {/* LOCATE KEYS */}
              <HeadingWithDivider heading="Locate Keys by tag" />
              <Text>
                Keys, like any other cryptographic objects in the Cosmian KMS server can be conveniently tagged with custom labels. These
                tags can then be used to locate the objects and manipulate them.
              </Text>
              <CodeHighlighter codeInput={jsCode?.locateKeysByTags} language="Javascript" />
              <Stack spacing={5} direction="row">
                <Input placeholder="Tags separate with commas" onChange={(e) => setLocateKeyInput(e.target.value)} />
                <Button onClick={locateKeys} width="50%">
                  Locate keys by tags
                </Button>
              </Stack>
              {locatedKeys && locatedKeys.length > 0 && (
                <Flex gap="2" direction="row">
                  <CheckCircleIcon color="green.500" />
                  Located key(s)' Uid:{" "}
                  <Stack>
                    {locatedKeys.map((key, i) => (
                      <Code key={i}>{key}</Code>
                    ))}
                  </Stack>
                </Flex>
              )}

              {/* ENCRYPT/DECRYPT IN BROWSER */}
              <HeadingWithDivider heading="Encrypt and Decrypt data in the presentation layer" />
              <Text>
                Encryption and decryption algorithms can be run in the presentation layer, including the browser, using the Cosmian &nbsp;
                <i>cloudproof</i> libraries. This implementation minimizes calls to the KMS server; it does however leak the decryption key
                to the presentation layer. The <i>cloudproof</i> libraries are available in multiple languages: Javascript, Java, Rust,
                Python, C/C++, Flutter, ...
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
              <CodeHighlighter codeInput={[jsCode?.encryptDataLocally, javaCode?.encryptDataLocally]} />
              <Heading as="h3" size="md">
                Decrypt
              </Heading>
              <Text>First, retrieve the user decryption key from the KMS.</Text>
              <CodeHighlighter codeInput={[jsCode?.retrieveDecryptionKey, javaCode?.retrieveDecryptionKey]} />
              <CodeHighlighter codeInput={[jsCode?.decryptDataLocally, javaCode?.decryptDataLocally]} />
              <ButtonGroup isAttached variant="outline" isDisabled={keyPair == null}>
                <Button onClick={() => handleEncrypt({ browser: true })} width="50%">
                  Encrypt data in browser
                </Button>
                <Button
                  onClick={() => handleDecryptLocally()}
                  width="50%"
                  isDisabled={localEncryptedData == null || decryptionKeyUid == null}
                >
                  Decrypt in browser
                </Button>
              </ButtonGroup>
              {localEncryptedData && localEncryptedData.length > 0 && (
                <EncryptedTable caption={"Encrypted in browser"} data={localEncryptedData} />
              )}
              {localClearData && <EmployeeTable caption={"Decrypted in browser"} data={localClearData} />}

              {/* ENCRYPT/DECRYPT IN KMS */}
              <HeadingWithDivider heading="Encrypt and Decrypt data in the KMS" />
              <Text>
                The safest implementation is to call the KMS, whether on-prem or secured in the cloud, to decrypt (or encrypt) the data. The
                key stays within the KMS and is not leaked to the presentation layer; it does however require a call to the KMS for each
                encryption/decryption request and thus increases the load on the KMS. In order to minimize calls, the Cosmian KMS supports
                bulk encryption/decryption requests.
              </Text>
              <Image boxSize="100%" maxWidth={800} alignSelf={"center"} objectFit="cover" src={DecryptionInKMS} alt="Decryption in KMS" />
              <Heading as="h3" size="md">
                Encrypt
              </Heading>
              <CodeHighlighter codeInput={[jsCode?.encryptDataInKms, javaCode?.encryptDataInKms]} />
              <Heading as="h3" size="md">
                Decrypt
              </Heading>
              <CodeHighlighter codeInput={[jsCode?.decryptDataInKms, javaCode?.decryptDataInKms]} />
              <ButtonGroup isAttached variant="outline" isDisabled={keyPair == null}>
                <Button onClick={() => handleEncrypt({ browser: false })} width="50%">
                  Encrypt data in KMS
                </Button>
                <Button onClick={() => handleDecryptInKms()} width="50%" isDisabled={kmsEncryptedData == null || decryptionKeyUid == null}>
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
