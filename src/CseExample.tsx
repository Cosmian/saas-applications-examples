import { ArrowForwardIcon, CheckCircleIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { Button, Code, Divider, Flex, Heading, Image, Link, Stack, Text, Textarea, useToast } from "@chakra-ui/react";
import { KMIPOperations, KmsClient } from "cloudproof_js";
import aes from "js-crypto-aes";
import React, { useEffect, useState } from "react";
import { BACKEND_URL } from "./actions/backendConfig";
import { createSymmetricKey } from "./actions/createSymmetricKey";
import { decryptWithAes } from "./actions/decryptWithAes";
import { sendEncryptedDocument } from "./actions/sendEncryptedDocument";
import CseExampleFlow from "./assets/cse_google_architecture.drawio.png";
import CodeHighlighter from "./components/CodeHighlighter";

type CodeContent = {
  [key: string]: string;
};

const CseExample: React.FC<{ kmsToken: string }> = ({ kmsToken }) => {
  const [jsCode, setjsCode] = useState<CodeContent>();
  const [symmetricKeyUid, setSymmetricKeyUid] = useState<undefined | string>();
  const [textInput, setTextInput] = useState<string>(
    "Client-side encryption is the cryptographic technique of encrypting data on the sender's side, before it is transmitted to a server such as a cloud storage service. Client-side encryption features an encryption key that is not available to the service provider, making it difficult or impossible for service providers to decrypt hosted data. Client-side encryption allows for the creation of applications whose providers cannot access the data its users have stored, thus offering a high level of privacy. Those applications are sometimes marketed under the misleading term 'zero-knowledge'."
  );
  const [encryptedTextInput, setEncryptedTextInput] = useState<undefined | string>();
  const [response, setResponse] = useState<undefined | { nonce: string; encrypted_summary: string }>();

  const [encryptedSummary, setEncryptedSummary] = useState<undefined | string>();
  const [clearSummary, setClearSummary] = useState<undefined | string>();
  const [keyBytes, setKeyBytes] = useState<undefined | Uint8Array>();

  const toast = useToast();

  useEffect(() => {
    getTextFromJsFile();
  }, []);

  const getTextFromJsFile = async (): Promise<void> => {
    const tempCode: CodeContent = {};
    const files = ["createSymmetricKey", "sendEncryptedDocument", "decryptWithAes"];
    for (const file of files) {
      const response = await fetch(`./actions/${file}.ts`);
      const text = await response.text();
      tempCode[file] = text;
    }
    setjsCode(tempCode);
  };

  const toastError = (error: unknown): void => {
    toast({
      title: typeof error === "string" ? error : (error as Error).message,
      status: "error",
      isClosable: true,
    });
    console.error(error);
  };

  const handleCreateSymmetricKey = async (): Promise<void> => {
    try {
      const keyUid = await createSymmetricKey(kmsToken);
      setSymmetricKeyUid(keyUid);
      const client = new KmsClient(BACKEND_URL, kmsToken);
      await client.grantAccess(keyUid, "*", KMIPOperations.get);
    } catch (error) {
      toastError(error);
    }
  };

  const handleSendEncryptedDocument = async (): Promise<void> => {
    try {
      if (symmetricKeyUid) {
        const textEncoder = new TextEncoder();
        const bytesInput = textEncoder.encode(textInput);
        const iv = new Uint8Array(12);
        self.crypto.getRandomValues(iv);
        const client = new KmsClient(BACKEND_URL, kmsToken);
        const key = await client.getObject(symmetricKeyUid);

        if (key.type === "SymmetricKey") {
          const keyBytes = key.value.keyBlock.bytes();
          setKeyBytes(keyBytes);
          const encText = await aes.encrypt(bytesInput, keyBytes, { name: "AES-GCM", iv });
          setEncryptedTextInput(btoa(String.fromCodePoint(...encText)));
          const res = await sendEncryptedDocument(bytesInput, keyBytes, symmetricKeyUid, iv);
          setResponse(res);
          setEncryptedSummary(res.encrypted_summary);
        }
      }
    } catch (error) {
      toastError(error);
    }
  };

  const handleDecryptSummary = async (): Promise<void> => {
    if (response && keyBytes) {
      const clearText = await decryptWithAes(response.encrypted_summary, keyBytes, response.nonce);
      setClearSummary(clearText);
    }
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const inputValue = e.target.value;
    setTextInput(inputValue);
  };

  return (
    <Flex flexDirection={"column"} gap="5">
      <Stack spacing={3}>
        <Heading as="h2" size="lg" mb={4}>
          Client-side encryption
        </Heading>
        <Text>
          Using{" "}
          <Link fontSize="md" color="orange.500" textDecoration="underline" href="https://support.google.com/a/answer/10741897" isExternal>
            Google client-side encryption
            <ExternalLinkIcon mx="2px" />
          </Link>
          , we show how to summarize an encrypted document, using <Text as="b">Cosmian KMS</Text> and <Text as="b">Cosmian VM</Text>.
        </Text>
        <Text>The encrypted summary is retrieved, and the decrypted on client side.</Text>
        <Image boxSize="100%" maxWidth={700} alignSelf={"center"} objectFit="cover" src={CseExampleFlow} alt="CSE example flow" my={6} />
      </Stack>
      {/* CREATE SYMMETRIC KEY */}
      <Divider />
      <Heading as="h3" size="md">
        Create Symmetric key
      </Heading>
      <Text>A symmetric key is created and used to encrypt and decrypt the document and its summary.</Text>
      <CodeHighlighter codeInput={jsCode?.createSymmetricKey} language={"Javascript"} />
      <Button onClick={handleCreateSymmetricKey} width="100%">
        Create symmetric key
      </Button>
      {symmetricKeyUid && (
        <Text>
          Symmetric key UID: <Code>{symmetricKeyUid}</Code>
        </Text>
      )}
      {/* SEND ENCRYPTED DOCUMENT */}
      <Divider />
      <Heading as="h3" size="md">
        Encrypt and send document
      </Heading>{" "}
      <Text>Document is encrypted using aes and sent to the microservice in order to summarize it.</Text>
      <CodeHighlighter codeInput={jsCode?.sendEncryptedDocument} language={"Javascript"} />
      <Text as="b">Text to summarize:</Text>
      <Textarea value={textInput} onChange={handleTextInput} size="m" height="150px" borderRadius="10" p="5" />
      <Button
        onClick={handleSendEncryptedDocument}
        width="100%"
        isDisabled={!symmetricKeyUid}
        isLoading={encryptedSummary === undefined && encryptedTextInput !== undefined}
        leftIcon={encryptedSummary ? <CheckCircleIcon /> : <ArrowForwardIcon />}
      >
        {!encryptedTextInput ? "Encrypt and send document" : "Summary is ready"}
      </Button>
      {encryptedTextInput && (
        <>
          <Text as="b">Encrypted text:</Text>
          <Code>{encryptedTextInput}</Code>
        </>
      )}
      {/* DECRYPT SUMMARY*/}
      <Divider />
      <Heading as="h3" size="md">
        Decrypt summary
      </Heading>{" "}
      <Text>Summary is decrypted using aes.</Text>
      <CodeHighlighter codeInput={jsCode?.decryptWithAes} language={"Javascript"} />
      <Text as="b">Encrypted summary:</Text>
      {encryptedSummary ? (
        <Text size="m">{encryptedSummary}</Text>
      ) : (
        <Text as="i" ml="10">
          Waiting for summary
        </Text>
      )}
      <Button onClick={handleDecryptSummary} width="100%" isDisabled={!encryptedSummary}>
        Decrypt summary
      </Button>
      {clearSummary && (
        <>
          <Text as="b">Decrypted summary:</Text>
          <Code>{clearSummary}</Code>
        </>
      )}
    </Flex>
  );
};

export default CseExample;
