import { CheckCircleIcon } from "@chakra-ui/icons";
import { Button, Center, Code, Flex, Heading, Image, ListItem, OrderedList, Stack, Text, UnorderedList, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ACCESS_POLICY, POLICY_AXIS } from "./CoverCrypt";
import { ClientBadge, HeadingWithCode } from "./Layout";
import { createCovercryptKeyPair } from "./actions/createCovercryptKeyPair";
import { createDecryptionKey } from "./actions/createDecryptionKey";
import { createPolicy } from "./actions/createPolicy";
import { encryptDataInKms } from "./actions/encryptDataInKms";
import { getKmsVersion } from "./actions/testKmsVersion";
import { EncryptedResult, KeysId } from "./actions/types";
import PkiDrawIo from "./assets/pki.drawio.svg";
import { EmployeeTable, EncryptedTable } from "./components/Table";
import { Employee, employees } from "./utils/employees";

export const CLIENT_2_TOKEN = import.meta.env.VITE_CLIENT_2_TOKEN as string;

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
  const [clearData, setClearData] = useState<undefined | Employee[]>();
  // actions
  const [wrappedPk2, setWrappedPk2] = useState(false);
  const [savedSk2, setSavedSk2] = useState(false);
  const [publishedWrappedPublicKey, setPublisheWrappedPublishKey] = useState(false);
  const [certificate, setCertificate] = useState(false);
  const [wrappedUdk, setWrappedUdk] = useState(false);
  const [wrappedUdkInKMS, setWrappedUdkInKMS] = useState(false);
  const [wrappedUdk2, setWrappedUdk2] = useState(false);
  const [clearUdk, setClearUdk] = useState(false);

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
    const keyPair = await createCovercryptKeyPair(CLIENT_2_TOKEN, policy);
    console.log("keyPair", keyPair);
    setClientTwoKeyPair(keyPair);
  };

  const wrapPkInCertificate = () => {
    //
    setWrappedPk2(true);
  };

  const saveSk2 = () => {
    //
    setSavedSk2(true);
  };

  const publishWrappedPK = () => {
    //
    setPublisheWrappedPublishKey(true);
  };

  const getCertificateFromPki = () => {
    //
    setCertificate(true);
  };

  const retrieveWrappedUdk = () => {
    //
    setWrappedUdk(true);
  };

  const sendWrappedUdk = () => {
    //
    setWrappedUdkInKMS(true);
  };

  const retrieveWrappedUdkFromKMS = () => {
    setWrappedUdk2(true);
  };

  const unwrapUdk = () => {
    //
    setClearUdk(true);
  };

  const decryptData = () => {
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
          Say <ClientBadge client={1}>Client 1</ClientBadge> wants to provide <ClientBadge client={2}>Client 2</ClientBadge> with a
          decryption key <Code>sk_a</Code> to decrypt data previously encrypted under <ClientBadge client={1}>Client 1</ClientBadge>’s key.
        </Text>
        <OrderedList>
          <ListItem>
            <ClientBadge client={2}>Client 2</ClientBadge> Client 2 (the recipient) generates a key pair <Code>sk_2/pk_2</Code> and
            publishes its public key <Code>pk_2</Code> wrapped in a certificate in the SaaS PKI.
          </ListItem>
          <ListItem>
            <ClientBadge client={1}>Client 1</ClientBadge> recovers <ClientBadge client={2}>Client 2</ClientBadge>’s certificate then wraps
            (i.e., encrypts) the decryption key <Code>sk_a</Code> under the public key <Code>pk_2</Code> and publishes the wrapped key in
            the SaaS PKI.{" "}
          </ListItem>
          <ListItem>
            <ClientBadge client={2}>Client 2</ClientBadge> recovers the wrapped key <Code>sk_a</Code> from the SaaS PKI and unwraps it
            (i.e., decrypts it) using its private key <Code>sk_2</Code>.
          </ListItem>
        </OrderedList>
        <Text>
          The flow is independent of <ClientBadge client={1}>Client 1</ClientBadge> and <ClientBadge client={2}>Client 2</ClientBadge> using
          their own KMS or the SaaS provider’s enclaved KMS.{" "}
        </Text>
        <Image boxSize="100%" maxWidth={800} alignSelf={"center"} objectFit="cover" src={PkiDrawIo} alt="Employees database schema" />
      </Stack>

      {health && kmsEncryptedData && kmsEncryptedData.length > 0 && clientTwoKeyPair && (
        <>
          {/* Encrypted Table */}
          <HeadingWithCode heading="Data encrypted under Client 1’s key" />
          <Stack spacing={3}>
            <Text>
              <ClientBadge client={1}>Client 1</ClientBadge> and <ClientBadge client={2}>Client 2</ClientBadge> has allready done theses
              actions:
            </Text>
            <UnorderedList>
              <ListItem>
                <ClientBadge client={1}>Client 1</ClientBadge> has generated Key Pair <Code>sk_1/pk_1</Code>
              </ListItem>
              <ListItem>
                <ClientBadge client={1}>Client 1</ClientBadge> has encrypted Employee Table
              </ListItem>
              <ListItem>
                <ClientBadge client={1}>Client 1</ClientBadge> has generated a Decryption key <Code>udk_1</Code>
              </ListItem>
              <ListItem>
                <ClientBadge client={2}>Client 2</ClientBadge> has generated Key Pair <Code>sk_2/pk_2</Code>
              </ListItem>
            </UnorderedList>
          </Stack>
          <EncryptedTable caption={"Data encrypted under Client 1’s key"} data={kmsEncryptedData} colorScheme="blue" />

          {/* 1 - CLIENT 2: WRAP IN CERTIFICATE */}
          <HeadingWithCode heading="Wrap Public key in a certificate" />
          <Text>
            <ClientBadge client={2}>Client 2</ClientBadge> generates a <Text as="b">certificat</Text> wrapped with its public key{" "}
            <Code>pk_2</Code>.
          </Text>
          <Button onClick={wrapPkInCertificate} width="100%" colorScheme="red" variant="outline">
            Wrap Publick Key
          </Button>
          {wrappedPk2 && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Public key <Code>pk_2</Code> wrapped with certificate.
              </Center>
            </>
          )}

          {/* 2 - CLIENT 2: SAVE SK_2 in KMS */}
          <HeadingWithCode heading="Save the Secret Key" />
          <Text>
            <ClientBadge client={2}>Client 2</ClientBadge> saves its secret key <Code>sk_2</Code> in the <Text as="b">KMS 2</Text>
          </Text>
          <Button onClick={saveSk2} isDisabled={!wrappedPk2} colorScheme="red" variant="outline">
            Save Secret Key
          </Button>
          {savedSk2 && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Secret key <Code>sk_2</Code> saved in KMS 2.
              </Center>
            </>
          )}

          {/* 3 - CLIENT 2: PUBLISH WRAPPED Public KEY in KMS */}
          <HeadingWithCode heading="Publish the wrapped Public Key" />
          <Text>
            <ClientBadge client={2}>Client 2</ClientBadge> publishes its public key <Code>pk_2</Code> wrapped with the certificat in the{" "}
            <Text as="b">SaaS KMS</Text>
          </Text>
          <Button onClick={publishWrappedPK} width="100%" isDisabled={!savedSk2} colorScheme="red" variant="outline">
            Publish wrapped Public Key
          </Button>
          {publishedWrappedPublicKey && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Wrapped public key <Code>pk_2</Code> has been published in SaaS KMS.
              </Center>
            </>
          )}

          {/* 4 - CLIENT 1: GET CERTIFICATE */}
          <HeadingWithCode heading="Get certificate" />
          <Text>
            <ClientBadge client={1}>Client 1</ClientBadge> gets the certificate from the <Text as="b">SaaS KMS</Text>
          </Text>
          <Button onClick={getCertificateFromPki} width="100%" isDisabled={!publishedWrappedPublicKey} colorScheme="blue" variant="outline">
            Get certificate
          </Button>
          {certificate && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Certificate downloaded from SaaS KMS.
              </Center>
            </>
          )}

          {/* 7 - CLIENT 1: RETRIEVE WRAPPED DECRYPTION KEY */}
          <HeadingWithCode heading="Retrieve wrapped Decryption Key" />
          <Text>
            <ClientBadge client={1}>Client 1</ClientBadge> retrieve the user decryption key <Code>Enc(udk_1)</Code> with the certificate
            from <ClientBadge client={2}>Client 2</ClientBadge>.
          </Text>
          <Button onClick={retrieveWrappedUdk} width="100%" isDisabled={!certificate} colorScheme="blue" variant="outline">
            Retrieve Decryption Key
          </Button>
          {wrappedUdk && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Wrapped Decryption key <Code>Enc(udk_1)</Code> has been retrieved.
              </Center>
            </>
          )}

          {/* 8 - SEND wrapped key in SaaS KMS */}
          <HeadingWithCode heading="Send wrapped Decryption Key in Saas KMS" />
          <Text>
            <ClientBadge client={1}>Client 1</ClientBadge> send wrapped Decryption Key in <Text as="b">SaaS KMS</Text>.
          </Text>
          <Button onClick={sendWrappedUdk} width="100%" isDisabled={!wrappedUdk} colorScheme="blue" variant="outline">
            Send wrapped Decryption Key
          </Button>
          {wrappedUdkInKMS && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Wrapped Decryption key <Code>Enc(udk_1)</Code> has been saved in SaaS KMS.
              </Center>
            </>
          )}

          {/* 9 - Retrieve wrapped decrytion key from SaaS KMS */}
          <HeadingWithCode heading="Retrieve wrapped decrytion key" />
          <Text>
            <ClientBadge client={2}>Client 2</ClientBadge> retrieve wrapped decrytion key from <Text as="b">SaaS KMS</Text>.
          </Text>
          <Button onClick={retrieveWrappedUdkFromKMS} width="100%" isDisabled={!wrappedUdkInKMS} colorScheme="red" variant="outline">
            Retrieve wrapped Decryption Key
          </Button>
          {wrappedUdk2 && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Wrapped Decryption key <Code>Enc(udk_1)</Code> has been retrieved.
              </Center>
            </>
          )}

          {/* 10 - CLIENT 2: Import in KM 2 and unwrap decryption key */}
          <HeadingWithCode heading="Import and unwrap decryption key" />
          <Text>
            <ClientBadge client={2}>Client 2</ClientBadge> import and unwrap decryption key <Code>Enc(udk_1)</Code> in{" "}
            <Text as="b">KMS 2</Text>.
          </Text>
          <Button onClick={unwrapUdk} isDisabled={!wrappedUdk2} colorScheme="red" variant="outline">
            Unwrap Decryption key
          </Button>
          {clearUdk && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Wrapped Decryption key <Code>Enc(udk_1)</Code> has been unwrapped.
              </Center>
            </>
          )}

          {/* 11 - CLIENT 2: DECRYPT EMPLOYEE TABLE */}
          <HeadingWithCode heading="Decrypt Employee table" />
          <Text>
            <ClientBadge client={2}>Client 2</ClientBadge> decrypts the Employee table, prviously encrypted by{" "}
            <ClientBadge client={1}>Client 1</ClientBadge>.
          </Text>
          <Button onClick={decryptData} isDisabled={!clearUdk} colorScheme="red" variant="outline">
            Decrypt data
          </Button>
          {clearData && <EmployeeTable caption={"Decrypted in browser"} data={clearData} />}
        </>
      )}
    </Flex>
  );
};

export default PKI;
