import { CheckCircleIcon } from "@chakra-ui/icons";
import {
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { FetchChains, FetchEntries, FindexKey, InsertChains, Label, Location, UpsertEntries } from "cloudproof_js";
import { useEffect, useState } from "react";
import { CodeHighlighter, HeadingWithCode } from "./Layout";
import { createFindexKey } from "./actions/createFindexKey";
import { defineLabel } from "./actions/defineLabel";
import { searchWords } from "./actions/searchWords";
import { upsertData } from "./actions/upsertData";
import FindexSchema from "./assets/findex.svg";
import { EmployeeTable } from "./components/Table";
import { Employee, employees } from "./utils/employees";

type CodeContent = {
  [key: string]: string;
};

type FindexProps = {
  fetchEntries: FetchEntries;
  fetchChains: FetchChains;
  upsertEntries: UpsertEntries;
  insertChains: InsertChains;
};

const Findex: React.FC<FindexProps> = ({ fetchEntries, fetchChains, upsertEntries, insertChains }) => {
  const [code, setCode] = useState<CodeContent>();
  const [findexKey, setFindexKey] = useState<undefined | FindexKey>(undefined);
  const [label, setLabel] = useState<undefined | Label>(undefined);
  const [inputLabel, setInputLabel] = useState<undefined | string>(undefined);
  const [inputWords, setInputWords] = useState<string[] | null>(null);
  const [results, setResults] = useState<Employee[] | null>(null);

  const toast = useToast();

  useEffect(() => {
    getTextFromFile();
  }, []);

  const getTextFromFile = async (): Promise<void> => {
    const tempCode: CodeContent = {};
    const files = ["createFindexKey", "defineLabel", "defineCallbacks", "upsertData", "searchWords"];
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

  const handleCreateFindexKey = async (): Promise<void> => {
    try {
      setFindexKey(createFindexKey());
    } catch (error) {
      toastError(error);
    }
  };

  const handleDefineLabel = async (): Promise<void> => {
    try {
      if (inputLabel) {
        setLabel(defineLabel(inputLabel));
      }
    } catch (error) {
      toastError(error);
    }
  };

  const handleUpsertData = async (): Promise<void> => {
    try {
      const indexedEntries = employees.map((employee) => ({
        indexedValue: Location.fromNumber(employee.uuid),
        keywords: [
          employee.first.toLowerCase(),
          employee.last.toLowerCase(),
          employee.email.toLowerCase(),
          employee.country.toLowerCase(),
          employee.salary.toString(),
        ],
      }));
      if (findexKey && label) {
        await upsertData(findexKey, label, indexedEntries, fetchEntries, upsertEntries, insertChains);
        toast({
          title: "Data indexed.",
          description: "Employees table has been indexed.",
          status: "success",
          isClosable: true,
        });
      }
    } catch (error) {
      toastError(error);
    }
  };

  const handleSearchWords = async (): Promise<void> => {
    try {
      if (findexKey && label && inputWords) {
        const res = await searchWords(findexKey, label, inputWords, fetchEntries, fetchChains);
        const resultEmployees = res
          .map((result) => employees.find((employee) => result.toNumber() === employee.uuid))
          .filter((employee) => employee);
        setResults(resultEmployees as Employee[]);
      }
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <Flex flexDirection={"column"} gap="8">
      {/* INTRO */}
      <Heading as="h2" size="lg">
        Search on encrypted data with <em>Findex</em>
      </Heading>
      <Stack spacing={3}>
        <Text>
          Cosmian Findex is a Searchable Encryption scheme that allows the building of encrypted indexes. One can efficiently search these
          encrypted indexes using encrypted queries and receive encrypted responses. Since the environment cannot learn anything about the
          content of the index, the queries, or the responses, one can use Zero-Trust environments, such as the public cloud, to store the
          indexes.
        </Text>
        <Image boxSize="100%" maxWidth={1200} alignSelf={"center"} objectFit="cover" src={FindexSchema} alt="Findex schema" />
      </Stack>

      <Stack spacing={3}>
        {/* CREATE FINDEX KEY */}
        <HeadingWithCode heading="Generate Findex key" code="/src/actions/createFindexKey.ts" />
        <Text>Findex uses a single symmetric 128 bit key to upsert and search.</Text>
        <CodeHighlighter codeInput={code?.createFindexKey} />
        <Button onClick={handleCreateFindexKey} width="100%">
          Create Findex key
        </Button>
        {findexKey && (
          <Center gap="2">
            <CheckCircleIcon color="green.500" />
            Findex key created
          </Center>
        )}
      </Stack>

      <Stack spacing={3}>
        {/* CREATE FINDEX LABEL */}
        <HeadingWithCode heading="Labeling: salting the encryption" code="/src/actions/defineLabel.ts" />
        <Text>
          When indexing, Findex uses an arbitrarily chosen public label; this label may represent anything, such as a period, e.g., “Q1
          2022”. Changing it regularly significantly increases the difficulty of performing statistical attacks.
        </Text>
        <CodeHighlighter codeInput={code?.defineLabel} />
        <Stack spacing={5} direction="row">
          <Input
            width="50%"
            placeholder="Label"
            onChange={(e) => {
              setInputLabel(e.target.value);
            }}
          />
          <Button onClick={handleDefineLabel} width="50%">
            Define Label
          </Button>
        </Stack>
        {label && (
          <Center gap="2">
            <CheckCircleIcon color="green.500" />
            Label defined
          </Center>
        )}
      </Stack>

      <Stack spacing={3}>
        {/* DEFINE CALLBACKS*/}
        <HeadingWithCode heading="Define callbacks" code="/src/actions/defineCallbacks.ts" />
        <Text>
          The Findex library abstracts the calls to the tables hosting the indexes. The developer is expected to provide the database’s
          backend, typically a fast key/value store, and implement the necessary code in the callbacks used by Findex. Findex uses two
          tables: the Entry table and the Chain table. Both have two columns: uid and value.
        </Text>
        <Text>
          To keep it simple here, we can use in-memory tables for which default callbacks are available in <b>cloudproof_js</b>.
        </Text>
        <CodeHighlighter codeInput={code?.defineCallbacks} />
      </Stack>

      <Stack spacing={3}>
        {/* INDEX DATABASE */}
        <HeadingWithCode heading="Index database" code="/src/actions/upsertData.ts" />
        <Text>
          To perform insertions or updates (a.k.a upserts), supply an array of IndexedEntry. This structure maps an IndexedValue to a list
          of Keywords.
        </Text>
        <Text>Its definition is:</Text>
        <CodeHighlighter codeInput={code?.upsertData} />
        <Text>In this example we will index employees’ database:</Text>
        <EmployeeTable data={employees} />

        <Button onClick={handleUpsertData} width="100%" isDisabled={!findexKey || !label}>
          Index database
        </Button>
      </Stack>

      <Stack spacing={3}>
        {/* SEARCH WORDS */}
        <HeadingWithCode heading="Search words" code="/src/actions/searchWords.ts" />
        <Text>Querying the index is performed using the search function.</Text>
        <CodeHighlighter codeInput={code?.searchWords} />
        <Stack spacing={5} direction="row">
          <Input
            width="50%"
            placeholder="Words to search - ex: Susan"
            onChange={(e) => {
              setInputWords(e.target.value.split(" ").map((word) => word.toLowerCase()));
            }}
          />
          <Button onClick={handleSearchWords} width="50%" isDisabled={!findexKey || !label}>
            Search in database
          </Button>
        </Stack>
        <Stack>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>First name</Th>
                  <Th>Last name</Th>
                  <Th>Country</Th>
                  <Th>Email</Th>
                  <Th>Salary</Th>
                </Tr>
              </Thead>
              <Tbody>
                {results &&
                  results.map((employee, i) => (
                    <Tr key={i}>
                      <Td>{employee.first}</Td>
                      <Td>{employee.last}</Td>
                      <Td>{employee.country}</Td>
                      <Td>{employee.email}</Td>
                      <Td>{employee.salary}</Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Stack>
      </Stack>
    </Flex>
  );
};

export default Findex;
