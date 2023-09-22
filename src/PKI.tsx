import { CheckCircleIcon } from "@chakra-ui/icons";
import { Button, Center, Code, Flex, Heading, Image, ListItem, OrderedList, Stack, Text, UnorderedList, useToast } from "@chakra-ui/react";
import { KmsObject } from "cloudproof_js";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ACCESS_POLICY, POLICY_AXIS } from "./CoverCrypt";
import { ClientBadge, CodeHighlighter, HeadingWithCode } from "./Layout";
import { createCovercryptKeyPair } from "./actions/createCovercryptKeyPair";
import { createDecryptionKey } from "./actions/createDecryptionKey";
import { createPolicy } from "./actions/createPolicy";
import { decryptDataInKms } from "./actions/decryptDataInKms";
import { encryptDataInKms } from "./actions/encryptDataInKms";
import { fetchPKI } from "./actions/fetchPKI";
import { fetchWrappedKey } from "./actions/fetchWrappedKey";
import { saveInPKI } from "./actions/saveInPKI";
import { saveObjectInPKI } from "./actions/saveObjectInPKI";
import { getKmsVersion } from "./actions/testKmsVersion";
import { EncryptedResult, KeysId } from "./actions/types";
import { wrapKeyInCertificate } from "./actions/wrapKeyInCertificate";
import PkiDrawIo from "./assets/pki.drawio.svg";
import { EmployeeTable, EncryptedTable } from "./components/Table";
import { Employee, employees } from "./utils/employees";

export const CLIENT_2_TOKEN = import.meta.env.VITE_CLIENT_2_TOKEN as string;
type CodeContent = {
  [key: string]: string;
};

const PKI: React.FC<{ kmsToken: string }> = ({ kmsToken }) => {
  const toast = useToast();

  // kms
  const [health, setHealth] = useState<undefined | string>();
  // keys
  const [clientTwoKeyPair, setClientTwoKeyPair] = useState<undefined | KeysId>();
  const [clientOneUdkUid, setClientOneUdkUid] = useState<undefined | string>();
  // data
  const [kmsEncryptedData, setKmsEncryptedData] = useState<undefined | EncryptedResult[]>();
  const [clearData, setClearData] = useState<undefined | Employee[]>();
  // actions
  const [wrappedPk2, setWrappedPk2] = useState<
    | undefined
    | {
        certBytes: Uint8Array;
        privateKeyBytes: Uint8Array;
      }
  >(undefined);
  const [savedSk2, setSavedSk2] = useState<undefined | string>();
  const [publishedWrappedPkUid, setPublisheWrappedPkUid] = useState<undefined | string>();
  const [certificate, setCertificate] = useState<undefined | KmsObject>();
  const [certificateUid, setCertificateUid] = useState<undefined | string>();
  const [wrappedUdk, setWrappedUdk] = useState<undefined | KmsObject>();
  const [wrappedUdkUid, setWrappedUdkUid] = useState<undefined | string>();
  const [wrappedUdk2, setWrappedUdk2] = useState<undefined | KmsObject>();
  const [unwrappedUdkUid, setUnwrappedUdkUid] = useState<undefined | string>();
  const [code, setCode] = useState<CodeContent>();

  useEffect(() => {
    getHealth();
    getTextFromFile();
    clientOneActions();
    clientTwoActions();
  }, [kmsToken]);

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

  const getTextFromFile = async (): Promise<void> => {
    const tempCode: CodeContent = {};
    const files = ["fetchPKI", "fetchWrappedKey", "saveInPKI", "saveObjectInPKI", "wrapKeyInCertificate", "decryptDataInKms"];
    for (const file of files) {
      const response = await fetch(`./actions/${file}.ts`);
      const text = await response.text();
      tempCode[file] = text; // You can set any value you want here
    }
    setCode(tempCode);
  };

  const clientOneActions = async (): Promise<void> => {
    // generate policy + key pair
    const policy = await createPolicy(POLICY_AXIS);
    const keyPair = await createCovercryptKeyPair(kmsToken, policy);
    // generate decryption key
    const decryptionKey = await createDecryptionKey(kmsToken, keyPair.masterSecretKeyUID, ACCESS_POLICY);
    setClientOneUdkUid(decryptionKey);
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
    setClientTwoKeyPair(keyPair);
  };

  // Client 2
  const wrapPkInCertificate = (): void => {
    const { certBytes, privateKeyBytes } = wrapKeyInCertificate();
    setWrappedPk2({ certBytes, privateKeyBytes });
  };

  // Client 2
  const saveSk2 = async (): Promise<void> => {
    if (wrappedPk2) {
      const savedSk2Uid = await saveInPKI(CLIENT_2_TOKEN, uuidv4(), wrappedPk2.privateKeyBytes);
      setSavedSk2(savedSk2Uid);
    }
  };

  // Client 2
  const publishWrappedPK = async (): Promise<void> => {
    if (wrappedPk2) {
      const wrappedPkCertUid = await saveInPKI(CLIENT_2_TOKEN, uuidv4(), wrappedPk2.certBytes);
      setPublisheWrappedPkUid(wrappedPkCertUid);
    }
  };

  // Client 1
  const getCertificateFromPki = async (): Promise<void> => {
    if (publishedWrappedPkUid) {
      const kmsObject = await fetchPKI(kmsToken, publishedWrappedPkUid);
      setCertificate(kmsObject);
      // Then save certificate in KMS
      if (kmsObject.type === "Certificate") {
        const uid = await saveInPKI(kmsToken, uuidv4(), kmsObject.value.certificateValue);
        setCertificateUid(uid);
      }
    }
  };

  // Client 1
  const retrieveWrappedUdk = async (): Promise<void> => {
    if (certificateUid && clientOneUdkUid) {
      const wrappedKey = await fetchWrappedKey(kmsToken, clientOneUdkUid, certificateUid);
      setWrappedUdk(wrappedKey);
    }
  };

  // Client 1
  const sendWrappedUdk = async (): Promise<void> => {
    if (wrappedUdk && wrappedUdk.type === "PrivateKey") {
      const uid = await saveObjectInPKI(kmsToken, uuidv4(), wrappedUdk, false);
      setWrappedUdkUid(uid);
    }
  };

  // Client 2
  const retrieveWrappedUdkFromKMS = async (): Promise<void> => {
    if (wrappedUdkUid) {
      const obj = await fetchPKI(CLIENT_2_TOKEN, wrappedUdkUid);
      setWrappedUdk2(obj);
    }
  };

  // Client 2
  const unwrapUdk = async (): Promise<void> => {
    if (wrappedUdk2) {
      const uid = await saveObjectInPKI(CLIENT_2_TOKEN, uuidv4(), wrappedUdk2, true);
      setUnwrappedUdkUid(uid);
    }
  };

  // Client 2
  const decryptData = async (): Promise<void> => {
    if (kmsEncryptedData && unwrappedUdkUid) {
      const clearMarketing: Employee[] = await Promise.all(
        kmsEncryptedData.map(async (row) => {
          try {
            const marketing = await decryptDataInKms(row.marketing, kmsToken, unwrappedUdkUid);
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
            const hr = await decryptDataInKms(row.hr, kmsToken, unwrappedUdkUid);
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

      setClearData(clearEmployee as Employee[]);
    }
  };

  const utf8decoder = new TextDecoder("utf-8");
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
          <HeadingWithCode heading="Wrap Public key in a certificate" code="/src/actions/wrapKeyInCertificate.ts" />
          <CodeHighlighter codeInput={code?.wrapKeyInCertificate} />
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
              <Center gap="2">{utf8decoder.decode(wrappedPk2.certBytes)}</Center>
            </>
          )}

          {/* 2 - CLIENT 2: SAVE SK_2 in KMS */}
          <HeadingWithCode heading="Save the Secret Key" code="/src/actions/saveInPKI.ts" />
          <CodeHighlighter codeInput={code?.saveInPKI} />
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
                OK. Secret key <Code>sk_2</Code> saved in KMS 2 under uid: <Code>{savedSk2}</Code>
              </Center>
            </>
          )}

          {/* 3 - CLIENT 2: PUBLISH WRAPPED Public KEY in KMS */}
          <HeadingWithCode heading="Publish the wrapped Public Key" code="/src/actions/saveInPKI.ts" />
          <CodeHighlighter codeInput={code?.saveInPKI} />
          <Text>
            <ClientBadge client={2}>Client 2</ClientBadge> publishes its public key <Code>pk_2</Code> wrapped with the certificat in the{" "}
            <Text as="b">SaaS KMS</Text>
          </Text>
          <Button onClick={publishWrappedPK} width="100%" isDisabled={!savedSk2} colorScheme="red" variant="outline">
            Publish wrapped Public Key
          </Button>
          {publishedWrappedPkUid && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Wrapped public key <Code>pk_2</Code> has been published in SaaS KMS under uid: <Code>{publishedWrappedPkUid}</Code>
              </Center>
            </>
          )}

          {/* 4 - CLIENT 1: GET CERTIFICATE */}
          <HeadingWithCode heading="Get certificate" code="/src/actions/fetchPKI.ts" />
          <CodeHighlighter codeInput={code?.fetchPKI} />
          <Text>
            <ClientBadge client={1}>Client 1</ClientBadge> gets the certificate from the <Text as="b">SaaS KMS</Text>
          </Text>
          <Button onClick={getCertificateFromPki} width="100%" isDisabled={!publishedWrappedPkUid} colorScheme="blue" variant="outline">
            Get certificate
          </Button>
          {certificate && certificateUid && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Certificate downloaded from SaaS KMS and save under uid: <Code>{certificateUid}</Code>.
              </Center>
              {certificate.type === "Certificate" && (
                <Center gap="2">{utf8decoder.decode(certificate.value.certificateValue as Uint8Array)}</Center>
              )}
            </>
          )}

          {/* 7 - CLIENT 1: RETRIEVE WRAPPED DECRYPTION KEY */}
          <HeadingWithCode heading="Retrieve wrapped Decryption Key" code="/src/actions/fetchWrappedKey.ts" />
          <CodeHighlighter codeInput={code?.fetchWrappedKey} />
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

          {/* 8 - CLIENT 1: SEND wrapped key in SaaS KMS */}
          <HeadingWithCode heading="Send wrapped Decryption Key in Saas KMS" code="/src/actions/saveObjectInPKI.ts" />
          <CodeHighlighter codeInput={code?.saveObjectInPKI} />
          <Text>
            <ClientBadge client={1}>Client 1</ClientBadge> send wrapped Decryption Key in <Text as="b">SaaS KMS</Text>.
          </Text>
          <Button onClick={sendWrappedUdk} width="100%" isDisabled={!wrappedUdk} colorScheme="blue" variant="outline">
            Send wrapped Decryption Key
          </Button>
          {wrappedUdkUid && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Wrapped Decryption key <Code>Enc(udk_1)</Code> has been saved in SaaS KMS under uid: <Code>{wrappedUdkUid}</Code>.
              </Center>
            </>
          )}

          {/* 9 - CLIENT2: Retrieve wrapped decrytion key from SaaS KMS */}
          <HeadingWithCode heading="Retrieve wrapped decrytion key" code="/src/actions/fetchPKI.ts" />
          <CodeHighlighter codeInput={code?.fetchPKI} />
          <Text>
            <ClientBadge client={2}>Client 2</ClientBadge> retrieve wrapped decrytion key from <Text as="b">SaaS KMS</Text>.
          </Text>
          <Button onClick={retrieveWrappedUdkFromKMS} width="100%" isDisabled={!wrappedUdkUid} colorScheme="red" variant="outline">
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
          <HeadingWithCode heading="Import and unwrap decryption key" code="/src/actions/saveObjectInPKI.ts" />
          <CodeHighlighter codeInput={code?.saveObjectInPKI} />
          <Text>
            <ClientBadge client={2}>Client 2</ClientBadge> import and unwrap decryption key <Code>Enc(udk_1)</Code> in{" "}
            <Text as="b">KMS 2</Text>.
          </Text>
          <Button onClick={unwrapUdk} isDisabled={!wrappedUdk2} colorScheme="red" variant="outline">
            Unwrap Decryption key
          </Button>
          {unwrappedUdkUid && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Wrapped Decryption key <Code>Enc(udk_1)</Code> has been unwrapped under uid: <Code>{unwrappedUdkUid}</Code>.
              </Center>
            </>
          )}

          {/* 11 - CLIENT 2: DECRYPT EMPLOYEE TABLE */}
          <HeadingWithCode heading="Decrypt Employee table" code="/src/actions/decryptDataInKms.ts" />
          <CodeHighlighter codeInput={code?.decryptDataInKms} />
          <Text>
            <ClientBadge client={2}>Client 2</ClientBadge> decrypts the Employee table, prviously encrypted by{" "}
            <ClientBadge client={1}>Client 1</ClientBadge>.
          </Text>
          <Button onClick={decryptData} isDisabled={!unwrappedUdkUid} colorScheme="red" variant="outline">
            Decrypt data
          </Button>
          {clearData && <EmployeeTable data={clearData} />}
        </>
      )}
    </Flex>
  );
};

export default PKI;
