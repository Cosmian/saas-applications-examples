import { CheckCircleIcon } from "@chakra-ui/icons";
import { Button, Center, Code, Flex, Heading, Image, ListItem, OrderedList, Stack, Text, UnorderedList, useToast } from "@chakra-ui/react";
import { KmsObject } from "cloudproof_js";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ACCESS_POLICY, POLICY_AXIS } from "./CoverCrypt";
import { ClientOne, ClientTwo, HeadingWithCode } from "./Layout";
import { createCovercryptKeyPair } from "./actions/createCovercryptKeyPair";
import { createDecryptionKey } from "./actions/createDecryptionKey";
import { createPolicy } from "./actions/createPolicy";
import { decryptDataInKms } from "./actions/decryptDataInKms";
import { encryptDataInKms } from "./actions/encryptDataInKms";
import { fetchPKI } from "./actions/fetchPKI";
import { fetchWrappedKey } from "./actions/fetchWrappedKey";
import { grantGetKeyAccess } from "./actions/grantGetKeyAccess";
import { getKmsVersion } from "./actions/testKmsVersion";
import { EncryptedResult } from "./actions/types";
import { uploadKeyInPKI } from "./actions/uploadKeyInPKI";
import { uploadPemInPKI } from "./actions/uploadPemInPKI";
import { wrapKeyInCertificate } from "./actions/wrapKeyInCertificate";
import PkiDrawIo from "./assets/pki.drawio.svg";
import { CodeHighlighter } from "./components/CodeHighlighter";
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
  const [accessGranted, setAccessGranted] = useState<undefined | boolean>();

  useEffect(() => {
    getHealth();
    getTextFromFile();
    clientOneActions();
  }, [kmsToken]);

  const toastError = (error: unknown): void => {
    toast({
      title: typeof error === "string" ? error : (error as Error).message,
      status: "error",
      isClosable: true,
    });
    console.error(error);
  };

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
    const files = [
      "fetchPKI",
      "fetchWrappedKey",
      "uploadPemInPKI",
      "uploadKeyInPKI",
      "wrapKeyInCertificate",
      "decryptDataInKms",
      "grantGetKeyAccess",
    ];
    for (const file of files) {
      const response = await fetch(`./actions/${file}.ts`);
      const text = await response.text();
      tempCode[file] = text; // You can set any value you want here
    }
    setCode(tempCode);
  };

  const clientOneActions = async (): Promise<void> => {
    try {
      // generate policy + key pair
      const policy = await createPolicy(POLICY_AXIS);
      const keyPair = await createCovercryptKeyPair(kmsToken, policy);
      // generate decryption key
      const decryptionKey = await createDecryptionKey(kmsToken, keyPair.masterSecretKeyUId, ACCESS_POLICY);
      setClientOneUdkUid(decryptionKey);
      // encrypt table
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
      const { certBytes, privateKeyBytes } = wrapKeyInCertificate();

      setKmsEncryptedData(encryptedEmployees);
      setWrappedPk2({ certBytes, privateKeyBytes });
    } catch (error) {
      toastError(error);
    }
  };

  // Client 2
  const saveSk2 = async (): Promise<void> => {
    if (wrappedPk2) {
      try {
        const savedSk2Uid = await uploadPemInPKI(CLIENT_2_TOKEN, uuidv4(), wrappedPk2.privateKeyBytes);
        setSavedSk2(savedSk2Uid);
      } catch (error) {
        toastError(error);
      }
    }
  };

  // Client 2
  const publishWrappedPK = async (): Promise<void> => {
    if (wrappedPk2) {
      try {
        const wrappedPkCertUid = await uploadPemInPKI(CLIENT_2_TOKEN, uuidv4(), wrappedPk2.certBytes);
        setPublisheWrappedPkUid(wrappedPkCertUid);
      } catch (error) {
        toastError(error);
      }
    }
  };

  // Client 2
  const grantAccessGetPk = async (): Promise<void> => {
    if (publishedWrappedPkUid) {
      try {
        grantGetKeyAccess(CLIENT_2_TOKEN, publishedWrappedPkUid, "*");
        setAccessGranted(true);
      } catch (error) {
        toastError(error);
      }
    }
  };

  // Client 1
  const getCertificateFromPki = async (): Promise<void> => {
    if (publishedWrappedPkUid) {
      try {
        const kmsObject = await fetchPKI(kmsToken, publishedWrappedPkUid);
        setCertificate(kmsObject);
        // Then save certificate in KMS
        if (kmsObject.type === "Certificate") {
          const uid = await uploadPemInPKI(kmsToken, uuidv4(), kmsObject.value.certificateValue);
          setCertificateUid(uid);
        }
      } catch (error) {
        toastError(error);
      }
    }
  };

  // Client 1
  const retrieveWrappedUdk = async (): Promise<void> => {
    if (certificateUid && clientOneUdkUid) {
      try {
        const wrappedKey = await fetchWrappedKey(kmsToken, clientOneUdkUid, certificateUid);
        setWrappedUdk(wrappedKey);
      } catch (error) {
        toastError(error);
      }
    }
  };

  // Client 1
  const sendWrappedUdk = async (): Promise<void> => {
    if (wrappedUdk && wrappedUdk.type === "PrivateKey") {
      try {
        const uid = await uploadKeyInPKI(kmsToken, uuidv4(), wrappedUdk, false);
        setWrappedUdkUid(uid);
        await grantGetKeyAccess(kmsToken, uid, "*");
      } catch (error) {
        toastError(error);
      }
    }
  };

  // Client 2
  const retrieveWrappedUdkFromKMS = async (): Promise<void> => {
    if (wrappedUdkUid) {
      try {
        const obj = await fetchPKI(CLIENT_2_TOKEN, wrappedUdkUid);
        setWrappedUdk2(obj);
      } catch (error) {
        toastError(error);
      }
    }
  };

  // Client 2
  const unwrapUdk = async (): Promise<void> => {
    if (wrappedUdk2 && publishedWrappedPkUid) {
      try {
        const uid = await uploadKeyInPKI(CLIENT_2_TOKEN, uuidv4(), wrappedUdk2, true, publishedWrappedPkUid);
        setUnwrappedUdkUid(uid);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Client 2
  const decryptData = async (): Promise<void> => {
    if (kmsEncryptedData && unwrappedUdkUid) {
      const clearMarketing: Employee[] = await Promise.all(
        kmsEncryptedData.map(async (row) => {
          try {
            const marketing = await decryptDataInKms(row.marketing, CLIENT_2_TOKEN, unwrappedUdkUid);
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
            const hr = await decryptDataInKms(row.hr, CLIENT_2_TOKEN, unwrappedUdkUid);
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
        Distributing keys between clients with <em>Cosmian PKI</em>
      </Heading>
      <Stack spacing={3}>
        <Text>
          Say <ClientOne /> wants to provide <ClientTwo /> with a decryption key <Code colorScheme="grey">sk_a</Code> to decrypt data previously encrypted with
          Covercrypt with <ClientOne />
          ’s public key <Code colorScheme="grey">pk_1</Code>.
        </Text>
        <Text>
          This decryption key is sensitive - and should be wrapped under <ClientTwo />’s public key 
          to be transferred from <ClientOne />'s KMS to <ClientTwo />’s KMS.{" "}
          Since their KMS cannot communicate, the clients are using the Public Key Infrastructure (PKI) built in Cosmian KMS to exchange keys.
        </Text>
        <Text>The typical flow for the distribution of a decryption key is illustrated in the following diagram.</Text>
        <Text>
          Say <ClientOne /> wants to provide <ClientTwo /> with a decryption key <Code colorScheme="grey">sk_a</Code> to decrypt data previously encrypted
          under <ClientOne />
          ’s key.
        </Text>
        <OrderedList>
          <ListItem>
            <ClientTwo /> (the recipient) generates a key pair <Code colorScheme="grey">sk_2/pk_2</Code> and publishes its public key <Code colorScheme="grey">pk_2</Code> wrapped
            in a certificate to the SaaS PKI.
          </ListItem>
          <ListItem>
            <ClientOne /> recovers <ClientTwo />’s certificate containing <Code colorScheme="grey">pk_2</Code>.
          </ListItem>
          <ListItem>
            <ClientOne /> wraps (i.e. encrypts) the decryption key <Code colorScheme="grey">sk_a</Code> under the public key <Code colorScheme="grey">pk_2</Code> and
            publishes the wrapped key in the SaaS PKI.{" "}
          </ListItem>          
          <ListItem>
            <ClientTwo /> recovers the wrapped key <Code colorScheme="grey">sk_a</Code> from the SaaS PKI and unwraps it (i.e. decrypts it) using its private
            key <Code colorScheme="grey">sk_2</Code>.
          </ListItem>
        </OrderedList>
        <Image boxSize="100%" maxWidth={800} alignSelf={"center"} objectFit="cover" src={PkiDrawIo} alt="Employees database schema" />
      </Stack>

      {health && kmsEncryptedData && kmsEncryptedData.length > 0 && (
        <>
          {/* Encrypted Table */}
          <HeadingWithCode heading="Data encrypted under Client 1’s key" />
          <Stack spacing={3}>
            <Text>
              Say <ClientOne /> has already done these actions:
            </Text>
            <UnorderedList>
              <ListItem>
                <ClientOne /> has generated a <Text as="b">Covercrypt Policy</Text> and a <Text as="b">Covercrypt master Key pair</Text>{" "}
                <Code colorScheme="grey">sk_1/pk_1</Code>
              </ListItem>
              <ListItem>
                <ClientOne /> has generated a <Text as="b">Covercrypt User Decryption Key</Text> <Code colorScheme="grey">sk_a</Code> that he wants to share
                with <ClientTwo />
              </ListItem>
              <ListItem>
                <ClientOne /> has encrypted an Employee Table using <Text as="b">Covercrypt</Text> elements
              </ListItem>
              <ListItem>
                <ClientTwo /> has a key pair <Code colorScheme="grey">sk_2/pk_2</Code> and its public key is signed as a <Text as="b">certificate</Text>
              </ListItem>
            </UnorderedList>
          </Stack>
          <EncryptedTable caption={"Data encrypted using Covercrypt"} data={kmsEncryptedData} colorScheme="blue" />

          {/* 2 - CLIENT 2: SAVE SK_2 in KMS */}
          <HeadingWithCode heading="Save the Secret Key" code="/src/actions/uploadPemInPKI.ts" />
          <CodeHighlighter codeInput={code?.uploadPemInPKI} />
          <Text>
            <ClientTwo /> saves its secret key <Code colorScheme="grey">sk_2</Code> in his own KMS <Text as="b">KMS 2</Text>
          </Text>
          <Button onClick={saveSk2} isDisabled={!wrappedPk2} colorScheme="green" variant="outline">
            Save Secret Key
          </Button>
          {savedSk2 && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Secret key <Code colorScheme="grey">sk_2</Code> saved in KMS 2 under uid: <Code colorScheme="grey">{savedSk2}</Code>
              </Center>
            </>
          )}

          {/* 3 - CLIENT 2: PUBLISH WRAPPED Public KEY in KMS */}
          <HeadingWithCode heading="Publish certificate" code="/src/actions/uploadPemInPKI.ts" />
          <CodeHighlighter codeInput={code?.uploadPemInPKI} />
          <Text>
            <ClientTwo /> publishes its public key <Code colorScheme="grey">pk_2</Code> wrapped in a certificate in the <Text as="b">SaaS KMS</Text>
          </Text>
          <Button onClick={publishWrappedPK} width="100%" isDisabled={!savedSk2} colorScheme="green" variant="outline">
            Publish certificate
          </Button>
          {publishedWrappedPkUid && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Wrapped public key <Code colorScheme="grey">pk_2</Code> has been published in SaaS KMS under uid: <Code colorScheme="grey">{publishedWrappedPkUid}</Code>
              </Center>
            </>
          )}

          {/* 3-bis - CLIENT 2: GRANT GET ACCESS oon Public KEY in KMS */}
          <HeadingWithCode heading="Grant access" code="/src/actions/grantGetKeyAccess.ts" />
          <CodeHighlighter codeInput={code?.grantGetKeyAccess} />
          <Text>
            <ClientTwo /> grants wildcard access for GET operation to his imported wrapped public key in <Text as="b">SaaS KMS</Text>
          </Text>
          <Button onClick={grantAccessGetPk} width="100%" isDisabled={!publishedWrappedPkUid} colorScheme="green" variant="outline">
            Grant access
          </Button>
          {accessGranted && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Access has been granted on <Code colorScheme="grey">pk_2</Code> in SaaS KMS for GET operation
              </Center>
            </>
          )}

          {/* 4 - CLIENT 1: GET CERTIFICATE */}
          <HeadingWithCode heading="Get certificate" code="/src/actions/fetchPKI.ts" />
          <CodeHighlighter codeInput={code?.fetchPKI} />
          <Text>
            <ClientOne /> gets the certificate from the <Text as="b">SaaS KMS</Text>
          </Text>
          <Button onClick={getCertificateFromPki} width="100%" isDisabled={!accessGranted} colorScheme="blue" variant="outline">
            Get certificate
          </Button>
          {certificate && certificateUid && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Certificate downloaded from SaaS KMS and save under uid: <Code colorScheme="grey">{certificateUid}</Code>.
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
            After importing in his KMS <ClientTwo />
            ’s certificate, <ClientOne /> retrieves the user decryption key from his KMS <Code colorScheme="grey">Wrap(sk_a)</Code> wrapped with 
            the public key of this certificate.
          </Text>
          <Button onClick={retrieveWrappedUdk} width="100%" isDisabled={!certificate} colorScheme="blue" variant="outline">
            Retrieve wrapped Decryption Key
          </Button>
          {wrappedUdk && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Wrapped Decryption key <Code colorScheme="grey">Wrap(sk_a)</Code> has been retrieved.
              </Center>
            </>
          )}

          {/* 8 - CLIENT 1: SEND wrapped key in SaaS KMS */}
          <HeadingWithCode heading="Send wrapped Decryption Key in Saas KMS" code="/src/actions/uploadKeyInPKI.ts" />
          <CodeHighlighter codeInput={code?.uploadKeyInPKI} />
          <Text>
            <ClientOne /> sends wrapped Decryption Key in <Text as="b">SaaS KMS</Text>, <ClientOne /> grants access to <ClientTwo /> for
            this key.
          </Text>
          <Button onClick={sendWrappedUdk} width="100%" isDisabled={!wrappedUdk} colorScheme="blue" variant="outline">
            Send wrapped Decryption Key
          </Button>
          {wrappedUdkUid && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Wrapped Decryption key <Code colorScheme="grey">Wrap(sk_a)</Code> has been saved in SaaS KMS under uid: <Code colorScheme="grey">{wrappedUdkUid}</Code>.
              </Center>
              <Center>Access has also been granted for GET operation for this key.</Center>
            </>
          )}

          {/* 9 - CLIENT2: Retrieve wrapped decryption key from SaaS KMS */}
          <HeadingWithCode heading="Retrieve wrapped decryption key" code="/src/actions/fetchPKI.ts" />
          <CodeHighlighter codeInput={code?.fetchPKI} />
          <Text>
            <ClientTwo /> retrieves the wrapped Decryption Key from <Text as="b">SaaS KMS</Text>.
          </Text>
          <Button onClick={retrieveWrappedUdkFromKMS} width="100%" isDisabled={!wrappedUdkUid} colorScheme="green" variant="outline">
            Retrieve wrapped Decryption Key
          </Button>
          {wrappedUdk2 && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Wrapped Decryption key <Code colorScheme="grey">Wrap(sk_a)</Code> has been retrieved.
              </Center>
            </>
          )}

          {/* 10 - CLIENT 2: Import in KM 2 and unwrap decryption key */}
          <HeadingWithCode heading="Import and unwrap Decryption Key" code="/src/actions/uploadKeyInPKI.ts" />
          <CodeHighlighter codeInput={code?.uploadKeyInPKI} />
          <Text>
            <ClientTwo /> imports and unwraps the decryption key <Code colorScheme="grey">Wrap(sk_a)</Code> in his KMS (<Text as="b">KMS 2</Text>).
          </Text>
          <Button onClick={unwrapUdk} isDisabled={!wrappedUdk2} colorScheme="green" variant="outline">
            Unwrap Decryption key
          </Button>
          {unwrappedUdkUid && (
            <>
              <Center gap="2">
                <CheckCircleIcon color="green.500" />
                OK. Wrapped Decryption key <Code colorScheme="grey">Wrap(sk_a)</Code> has been unwrapped under uid: <Code colorScheme="grey">{unwrappedUdkUid}</Code>.
              </Center>
            </>
          )}

          {/* 11 - CLIENT 2: DECRYPT EMPLOYEE TABLE */}
          <HeadingWithCode heading="Decrypt Employee table" code="/src/actions/decryptDataInKms.ts" />
          <CodeHighlighter codeInput={code?.decryptDataInKms} />
          <Text>
            <ClientTwo /> can decrypt the Employee table with his user decryption key, previously encrypted by <ClientOne /> using
            Covercrypt elements.
          </Text>
          <Button onClick={decryptData} isDisabled={!unwrappedUdkUid} colorScheme="green" variant="outline">
            Decrypt data
          </Button>
          {clearData && <EmployeeTable data={clearData} />}
        </>
      )}
    </Flex>
  );
};

export default PKI;
