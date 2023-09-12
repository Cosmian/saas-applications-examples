import { CheckIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Code,
  Container,
  Divider,
  Heading,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atelierSulphurpoolDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { EncryptedResult } from "./actions/types";
import { Employee } from "./utils/employees";

const Layout = ({ children }: { children: JSX.Element }): JSX.Element => {
  return (
    <VStack style={{ minHeight: "100vh" }}>
      <Container maxW="1200px" marginY={50} style={{ minHeight: "100vh" }}>
        {children}
      </Container>
    </VStack>
  );
};

export default Layout;

export const CodeHigligter: React.FC<{ codeInput: string | undefined; language?: string }> = ({ codeInput, language }) => {
  const [copied, setCopied] = useState(false);

  if (codeInput == null) return <></>;

  const handleCopy = (): void => {
    navigator.clipboard.writeText(codeInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  return (
    <Box textAlign="right">
      <Button
        leftIcon={copied ? <CheckIcon /> : undefined}
        size="xs"
        colorScheme="whiteAlpha"
        position="relative"
        top="30px"
        right="5px"
        onClick={handleCopy}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
      <SyntaxHighlighter
        language={language ? language : "typescript"}
        style={atelierSulphurpoolDark}
        showLineNumbers
        customStyle={{ textAlign: "left" }}
      >
        {codeInput}
      </SyntaxHighlighter>
    </Box>
  );
};

export const Jsoncode = ({ code }: { code: unknown }): JSX.Element => {
  return (
    <Box bg="orange.50" border="1px" borderColor="orange.100" color="gray.700" fontSize="sm" p="5">
      <pre style={{}}>{JSON.stringify(code, undefined, 2)}</pre>
    </Box>
  );
};

export const HeadingWithCode: React.FC<{ heading: string; code?: string | string[] }> = ({ heading, code }) => {
  return (
    <>
      <Divider colorScheme="blackAlpha" />
      <Heading as="h2" size="lg">
        {heading}
      </Heading>
      {code && typeof code === "object" && code.map((item, i) => <Code key={i}>{item}</Code>)}
      {code && typeof code === "string" && <Code>{code}</Code>}
    </>
  );
};

export const EmployeeTable: React.FC<{ data: Employee[]; caption?: string }> = ({ data, caption }) => {
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

export const EncryptedTable: React.FC<{ data: EncryptedResult[]; caption?: string }> = ({ data, caption }) => {
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
