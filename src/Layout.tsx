import { Container, VStack } from "@chakra-ui/react";
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

export const CodeHigligter: React.FC<{ codeInput: string | undefined }> = ({ codeInput }) => {
  if (codeInput == null) return <></>;
  return (
    <SyntaxHighlighter language="typescript" style={atelierSulphurpoolDark} showLineNumbers>
      {codeInput}
    </SyntaxHighlighter>
  );
};
