import { CheckCircleIcon } from "@chakra-ui/icons";
import { Button, Code, Flex, Heading, Input, Stack, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Jsoncode } from "./App";
import { ACCESS_POLICY, POLICY_AXIS } from "./CoverCrypt";
import { KeysID, createCovercryptKeys, createPolicy, createSymmetricKey, locateKeysByTags } from "./utils/actions";

const Tags: React.FC<{ kmsToken: string }> = ({ kmsToken }) => {
  const [symmetricKeyInput, setSymmetricKeyInput] = useState<string | null>(null);
  const [covercryptKeyInput, setCovercryptKeyInput] = useState<string | null>(null);
  const [locateKeyInput, setLocateKeyInput] = useState<string | null>(null);
  const [symmetricKeyId, setSymmetricKeyId] = useState<string | null>(null);
  const [covercryptKeysId, setCovercryptKeysId] = useState<KeysID | null>(null);
  const [locatedKeys, setLocatedKeys] = useState<string[] | null>(null);

  const toast = useToast();

  useEffect(() => {
    return () => {
      // cleanup
    };
  }, []);

  useEffect(() => {
    if (symmetricKeyInput === "") setSymmetricKeyId(null);
    if (covercryptKeyInput === "") setCovercryptKeysId(null);
    if (locateKeyInput === "") setLocatedKeys(null);
  }, [symmetricKeyInput, covercryptKeyInput, locateKeyInput]);

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

  const createCovercryptKeyPair = async (): Promise<void> => {
    try {
      let tags: string[] | undefined;
      if (covercryptKeyInput) tags = covercryptKeyInput.replace(/ /g, "").split(",");
      const policy = await createPolicy(POLICY_AXIS);
      const ids = await createCovercryptKeys(kmsToken, policy, ACCESS_POLICY, tags);
      setCovercryptKeysId(ids);
    } catch (error) {
      toast({
        title: (error as Error).message,
        status: "error",
        isClosable: true,
      });
      console.error(error);
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

  return (
    <Flex flexDirection={"column"} gap="8">
      <Heading as="h2" size="lg">
        Create symmetric key with tags
      </Heading>
      <Stack spacing={5} direction="row">
        <Input placeholder="Create tags separate with commas" onChange={(e) => setSymmetricKeyInput(e.target.value)} />
        <Button onClick={createSymmetrickKey} width="50%">
          Create symmetric key
        </Button>
      </Stack>
      {symmetricKeyId && (
        <Flex gap="2" direction="row">
          <CheckCircleIcon color="green.500" />
          Symmetric key Id: <Code>{symmetricKeyId}</Code>
        </Flex>
      )}

      <Heading as="h2" size="lg">
        Create Covercrypt keys with tags
      </Heading>
      <Stack spacing={5} direction="row">
        <Input placeholder="Create tags separate with commas" onChange={(e) => setCovercryptKeyInput(e.target.value)} />
        <Button onClick={createCovercryptKeyPair} width="50%">
          Create covercrypt keys
        </Button>
      </Stack>
      {covercryptKeysId && (
        <Flex gap="2" direction="row">
          <CheckCircleIcon color="green.500" />
          Covercrypt keys Id: <Jsoncode code={covercryptKeysId} />
        </Flex>
      )}

      <Heading as="h2" size="lg">
        Locate keys with tags
      </Heading>
      <Stack spacing={5} direction="row">
        <Input placeholder="Create tags separate with commas" onChange={(e) => setLocateKeyInput(e.target.value)} />
        <Button onClick={locateKeys} width="50%">
          Locate symmetric key
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
    </Flex>
  );
};

Tags.propTypes = {};

export default Tags;
