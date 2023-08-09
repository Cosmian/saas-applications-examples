import { useAuth0 } from "@auth0/auth0-react";
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
  ListItem,
  OrderedList,
  Spinner,
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
import Layout from "./Layout";
import DatabaseSchema from "./assets/db-schema.png";
import EmployeesDatabaseImage from "./assets/employees-database.png";
import {
  EncryptedResult,
  KeysID,
  PolicyAxisItem,
  createKeys,
  createPolicy,
  decryptDataInKms,
  decryptDataLocally,
  encryptDataInKms,
  encryptDataLocally,
  getKmsVersion,
  retrieveDecryptionKey,
  retrieveKeys,
} from "./utils/actions";
import { Employee, employees } from "./utils/employees";

const POLICY_AXIS: PolicyAxisItem[] = [
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

const ACCESS_POLICY = "(country::France || country::Spain || country::Germany) && (department::HR || department::Marketing)";

const App = (): JSX.Element => {
  const [health, setHealth] = useState<undefined | string>();
  const [kmsVersion, setKmsVersion] = useState<undefined | string>();
  const [kmsToken, setKmsToken] = useState<undefined | string>();
  const [policy, setPolicy] = useState<undefined | Policy>();
  const [keysId, setKeysId] = useState<undefined | KeysID>();
  const [localEncryptedData, setLocalEncryptedData] = useState<undefined | EncryptedResult[]>();
  const [localClearData, setLocalClearData] = useState<undefined | Employee[]>();
  const [kmsEncryptedData, setKmsEncryptedData] = useState<undefined | EncryptedResult[]>();
  const [kmsClearData, setKmsClearData] = useState<undefined | Employee[]>();

  const { isLoading, error, user, loginWithRedirect, getIdTokenClaims, logout, isAuthenticated } = useAuth0();
  const toast = useToast();

  useEffect(() => {
    if (kmsToken) {
      const getHealth = async (): Promise<void> => {
        setHealth(await getKmsVersion(kmsToken));
      };
      getHealth();
    }
  }, [kmsToken]);

  useEffect(() => {
    if (user) {
      const getToken = async (): Promise<void> => {
        const claims = await getIdTokenClaims();
        setKmsToken(claims?.__raw);
      };
      getToken();
    }
  }, [user]);

  //
  // Auth0 actions
  //

  const handleLogout = (): void => {
    logout({ logoutParams: { returnTo: window.location.origin } });
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
      if (kmsToken) {
        setKmsVersion(await getKmsVersion(kmsToken));
      }
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

  const handleCreateKeys = async (): Promise<void> => {
    try {
      if (kmsToken && policy) {
        const decryptionAccessPolicy = ACCESS_POLICY;
        setKeysId(await createKeys(kmsToken, policy, decryptionAccessPolicy));
      }
    } catch (error) {
      toastError(error);
    }
  };

  const handleEncrypt = async ({ browser = false }): Promise<void> => {
    try {
      if (keysId && policy && kmsToken) {
        const { masterPublicKeyBytes } = await retrieveKeys(kmsToken, keysId);
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
                keysId.masterPublicKeyUID
              );
              const encryptedHr = await encryptDataInKms(
                JSON.stringify({
                  email: employee.email,
                  salary: employee.salary,
                }),
                kmsToken,
                ACCESS_POLICY,
                keysId.masterPublicKeyUID
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
        if (keysId && localEncryptedData && kmsToken) {
          // retrieve decryption key
          const decryptionKey = await retrieveDecryptionKey(kmsToken, keysId.decryptionKeyUID);
          const clear = await Promise.all(
            localEncryptedData.map(async (row) => {
              const marketing = await decryptDataLocally(row.marketing, decryptionKey.bytes());
              const hr = await decryptDataLocally(row.hr, decryptionKey.bytes());
              const all = { ...JSON.parse(marketing), ...JSON.parse(hr) };
              return all;
            })
          );
          setLocalClearData(clear);
          setLocalEncryptedData(undefined);
        }
      } else {
        if (keysId && kmsEncryptedData && kmsToken) {
          const clear = await Promise.all(
            kmsEncryptedData.map(async (row) => {
              const marketing = await decryptDataInKms(row.marketing, kmsToken, keysId.masterSecretKeyUID, ACCESS_POLICY);
              const hr = await decryptDataInKms(row.hr, kmsToken, keysId.masterSecretKeyUID, ACCESS_POLICY);
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

  // render

  if (isLoading) {
    return (
      <Layout>
        <Center style={{ minHeight: "100vh" }}>
          <Spinner size="xl" />
        </Center>
      </Layout>
    );
  }

  if (error) {
    return (
      <>
        <Layout>
          <Center style={{ minHeight: "100vh" }}>
            {error && <>Error</>}
            <Button onClick={() => loginWithRedirect()}>Login with Auth0</Button>
          </Center>
        </Layout>
      </>
    );
  }

  return (
    <Layout>
      <Flex flexDirection={"column"} gap="8">
        {/* INTRO */}
        <Heading as="h1" size="2xl">
          Cosmian for Saas Applications
        </Heading>
        <Text fontSize="xl">
          Test KMS + PKI basics actions combined with our attribute-based encryption scheme: CoverCrypt.
          <br />
          You can find documentation for all these actions in <Code>/src/utils/actions.ts</Code>.
        </Text>
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
            applications, ETLs, etc.) do not have to be secured and can directly hold the key, relaxing constraints on the infrastructure.
            The public key can encrypt for any partition defined by the policy.
            <br />
            Decryption keys can decrypt a subset of the partitions defined by the policy.
          </Text>
        </Box>

        {!isAuthenticated && <Button onClick={() => loginWithRedirect()}>Login with Auth0</Button>}

        {isAuthenticated && (
          <>
            <Button onClick={handleLogout} style={{ position: "absolute", top: 20, right: 20 }}>
              Log out
            </Button>
            {/* TEST KMS */}
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

                {/* CREATE KEYS */}
                <Button onClick={handleCreateKeys} isDisabled={policy == null}>
                  Create keys
                </Button>
                {keysId && (
                  <UnorderedList>
                    <ListItem>masterPublicKeyUID: {<Code>{keysId.masterPublicKeyUID}</Code>}</ListItem>
                    <ListItem>
                      masterSecretKeyUID: <Code>{keysId.masterSecretKeyUID}</Code>
                    </ListItem>
                    <ListItem>
                      decryptionKeyUID: <Code>{keysId.decryptionKeyUID}</Code>
                    </ListItem>
                  </UnorderedList>
                )}

                {/* ENCRYPT/DECRYPT IN BROWSER */}
                <ButtonGroup isAttached variant="outline" isDisabled={keysId == null}>
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
                {localClearData && (
                  <>
                    <Center gap="2">
                      <CheckCircleIcon color="green.500" />
                      Decrypted with access policy: <Code>{ACCESS_POLICY}</Code>
                    </Center>
                    <EmployeeTable caption={"Decrypted in browser"} data={localClearData} />
                  </>
                )}

                {/* ENCRYPT/DECRYPT IN KMS */}
                <ButtonGroup isAttached variant="outline" isDisabled={keysId == null}>
                  <Button onClick={() => handleEncrypt({ browser: false })} width="50%">
                    Encrypt data in KMS
                  </Button>
                  <Button onClick={() => handleDecrypt({ browser: false })} width="50%" isDisabled={kmsEncryptedData == null}>
                    Decrypt data in KMS
                  </Button>
                </ButtonGroup>

                {kmsEncryptedData && kmsEncryptedData.length > 0 && <EncryptedTable caption={"Encrypted in KMS"} data={kmsEncryptedData} />}
                {kmsClearData && (
                  <>
                    <Center gap="2">
                      <CheckCircleIcon color="green.500" />
                      Decrypted with access policy: <Code>{ACCESS_POLICY}</Code>
                    </Center>
                    <EmployeeTable caption={"Decrypted in KMS"} data={kmsClearData} />
                  </>
                )}
              </>
            )}
          </>
        )}
      </Flex>
    </Layout>
  );
};

export default App;

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

const Jsoncode = ({ code }: { code: unknown }): JSX.Element => {
  return (
    <Box bg="orange.50" border="1px" borderColor="orange.100" color="gray.700" fontSize="sm" p="5">
      <pre style={{}}>{JSON.stringify(code, undefined, 2)}</pre>
    </Box>
  );
};
