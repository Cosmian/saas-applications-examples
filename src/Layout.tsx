import { CheckIcon } from "@chakra-ui/icons";
import { Box, Button, Code, Container, Divider, Heading, VStack } from "@chakra-ui/react";
import { useState } from "react";
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

export const CodeHighlighter: React.FC<{ codeInput: string | undefined; language?: string }> = ({ codeInput, language }) => {
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
