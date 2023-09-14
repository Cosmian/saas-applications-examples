import { Button, Code, Flex, Heading, Image, ListItem, OrderedList, Stack, Text, UnorderedList, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ACCESS_POLICY, POLICY_AXIS } from "./CoverCrypt";
import { HeadingWithCode } from "./Layout";
import { createCovercryptKeyPair } from "./actions/createCovercryptKeyPair";
import { createDecryptionKey } from "./actions/createDecryptionKey";
import { createPolicy } from "./actions/createPolicy";
import { encryptDataInKms } from "./actions/encryptDataInKms";
import { getKmsVersion } from "./actions/testKmsVersion";
import { EncryptedResult, KeysId } from "./actions/types";
import PkiDrawIo from "./assets/pki.drawio.svg";
import { EncryptedTable } from "./components/Table";
import { employees } from "./utils/employees";

const PKI: React.FC<{ kmsToken: string }> = ({ kmsToken }) => {
  const toast = useToast();

  // kms
  const [health, setHealth] = useState<undefined | string>();

  // keys
  const [clientOneKeyPair, setClientOneKeyPair] = useState<undefined | KeysId>();
  const [clientTwoKeyPair, setClientTwoKeyPair] = useState<undefined | KeysId>();
  const [clientOnedecryptionKey, setClientOneDecryptionKey] = useState<undefined | string>();

  // data
  const [kmsEncryptedData, setKmsEncryptedData] = useState<undefined | EncryptedResult[]>();
  // const [kmsClearData, setKmsClearData] = useState<undefined | Employee[]>();

  useEffect(() => {
    const getHealth = async (): Promise<void> => {
      try {
        setHealth(await getKmsVersion(kmsToken));
      } catch (error) {
        toast({
          title: (error as Error).message,
          status: "error",
          isClosable: true,
        });
        console.error(error);
      }
    };
    getHealth();

    clientOneActions();
    clientTwoActions();
  }, [kmsToken]);

  const clientOneActions = async (): Promise<void> => {
    // generate policy + key pair
    const policy = await createPolicy(POLICY_AXIS);
    const keyPair = await createCovercryptKeyPair(kmsToken, policy);
    setClientOneKeyPair(keyPair);
    // generate decryption key
    const decryptionKey = await createDecryptionKey(kmsToken, keyPair.masterSecretKeyUID, ACCESS_POLICY);
    setClientOneDecryptionKey(decryptionKey);
    // encrypt table
    try {
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
      setKmsEncryptedData(encryptedEmployees);
    } catch (error) {
      console.error(error);
    }
  };

  const clientTwoActions = async (): Promise<void> => {
    // create policy + key pair
    const policy = await createPolicy(POLICY_AXIS);
    const keyPair = await createCovercryptKeyPair(kmsToken, policy);
    setClientTwoKeyPair(keyPair);
  };

  const handleWrapPkInCertificate = () => {
    //
  };

  const handlePublishKey = () => {
    //
  };

  console.log(clientOneKeyPair);
  console.log(clientOnedecryptionKey);
  console.log(health);

  return (
    <Flex flexDirection={"column"} gap="8">
      {/* INTRO */}
      <Heading as="h2" size="lg">
        Distributing keys between clients with Cosmian PKI
      </Heading>
      <Stack spacing={3}>
        <Text>
          Cosmian provides a Public Key Infrastructure (PKI) to allow the secure distribution of decryption keys between clients. The PKI is
          integrated inside the enclaved KMS installed by the SaaS provider.
        </Text>
        <Text>The typical flow for the distribution of a decryption key is illustrated in the following diagram.</Text>
        <Text>
          Say Client 1 wants to provide Client 2 with a decryption key <Code>sk_a</Code> to decrypt data previously encrypted under Client
          1’s key.
        </Text>
        <OrderedList>
          <ListItem>
            Client 2 (the recipient) generates a key pair <Code>sk_2/pk_2</Code> and publishes its public key <Code>pk_2</Code> wrapped in a
            certificate in the SaaS PKI.
          </ListItem>
          <ListItem>
            Client 1 recovers Client 2’s certificate then wraps (i.e., encrypts) the decryption key <Code>sk_a</Code> under the public key{" "}
            <Code>pk_2</Code> and publishes the wrapped key in the SaaS PKI.{" "}
          </ListItem>
          <ListItem>
            Client 2 recovers the wrapped key <Code>sk_a</Code> from the SaaS PKI and unwraps it (i.e., decrypts it) using its private key{" "}
            <Code>sk_2</Code>.
          </ListItem>
        </OrderedList>
        <Text>The flow is independent of Client 1 and Client 2 using their own KMS or the SaaS provider’s enclaved KMS. </Text>
        <Image boxSize="100%" maxWidth={600} alignSelf={"center"} objectFit="cover" src={PkiDrawIo} alt="Employees database schema" />
      </Stack>

      {health && kmsEncryptedData && kmsEncryptedData.length > 0 && clientTwoKeyPair && (
        <>
          {/* Encrypted Table */}
          <HeadingWithCode heading="Data encrypted under Client 1’s key" />
          <Stack spacing={3}>
            <Text>
              <Text as="b">Client 1</Text> and <Text as="b">Client 2</Text> has allready done theses actions:
            </Text>
            <UnorderedList>
              <ListItem>
                <Text as="b">Client 1</Text> has generated Key Pair
              </ListItem>
              <ListItem>
                <Text as="b">Client 1</Text> has encrypted Employee Table
              </ListItem>
              <ListItem>
                <Text as="b">Client 1</Text> has generated a Decryption key
              </ListItem>
              <ListItem>
                <Text as="b">Client 2</Text> has generated Key Pair
              </ListItem>
            </UnorderedList>
          </Stack>
          <EncryptedTable caption={"Encrypted in KMS"} data={kmsEncryptedData} />

          {/* CLIENT 2 : WRAP IN CERTIFICATE */}
          <HeadingWithCode heading="Wrap Public key in a certificate" />
          <Text>
            <Text as="b">Client 2</Text> wraps its public key <Code>pk_2</Code> in a certificate.
          </Text>
          <Button onClick={handleWrapPkInCertificate} width="100%" disabled>
            Wrapped pk_2 in a certificate
          </Button>

          {/* CLIENT 2 : WRAP IN CERTIFICATE */}
          <HeadingWithCode heading="Publish the wrapped Public Key in the SaaS PKI" />
          <Text>
            <Text as="b">Client 2</Text> publishes its wrapped public key <Code>pk_2</Code> in the <Text as="b">SaaS PKI</Text>
          </Text>
          <Button onClick={handlePublishKey} width="100%" disabled>
            Publish wrapped pk_2
          </Button>
        </>
      )}
    </Flex>
  );
};

export default PKI;
