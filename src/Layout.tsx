import { Box, Code, Container, Divider, Heading, VStack } from "@chakra-ui/react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atelierSulphurpoolDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

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
  if (codeInput == null) return <></>;
  return (
    <SyntaxHighlighter language={language ? language : "typescript"} style={atelierSulphurpoolDark} showLineNumbers>
      {codeInput}
    </SyntaxHighlighter>
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
