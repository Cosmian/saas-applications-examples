import { CheckIcon } from "@chakra-ui/icons";
import { Box, Button, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atelierSulphurpoolDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import AppContext from "../AppContext";

type old_CodeHighlighterProps = {
  codeInput: string | string[] | undefined | Array<string | undefined>;
  language?: string;
};
type CodeHighlighterProps =
  | {
      codeInput: string[] | Array<string | undefined>;
      language?: null;
    }
  | {
      codeInput: string | undefined;
      language: string;
    };

export const CodeHighlighter: React.FC<CodeHighlighterProps> = ({ codeInput, language }) => {
  const context = useContext(AppContext);

  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (context?.language === "java") setTabIndex(0);
    if (context?.language === "javascript") setTabIndex(1);
  }, [context]);

  const handleSwithLanguage = (index: number): void => {
    setTabIndex(index);
    context?.switchLanguage(index === 0 ? "java" : "javascript");
  };

  if (typeof codeInput === "object") {
    return (
      <>
        <Tabs variant="enclosed" size="sm" onChange={(index) => handleSwithLanguage(index)} index={tabIndex}>
          <TabList>
            <Tab>Java</Tab>
            <Tab>Javascript</Tab>
          </TabList>

          <TabPanels>
            <TabPanel padding={0}>
              <Code code={codeInput[0] ? codeInput[0] : ""} language="java" />
            </TabPanel>
            <TabPanel padding={0}>
              <Code code={codeInput[1] ? codeInput[1] : ""} language="javascript" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </>
    );
  } else {
    return (
      <Tabs variant="enclosed" size="sm">
        <TabList>
          <Tab>{language ? language : "Javascript"}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel padding={0}>
            <Code code={codeInput ? codeInput : ""} language={language ? language : "bash"} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    );
  }
};
export default CodeHighlighter;

const Code: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Box position={"relative"} padding={0}>
      <Button
        leftIcon={copied ? <CheckIcon /> : undefined}
        size="xs"
        colorScheme="whiteAlpha"
        position="absolute"
        top="15px"
        right="15px"
        onClick={handleCopy}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
      <SyntaxHighlighter
        language={language}
        style={atelierSulphurpoolDark}
        customStyle={{ padding: 20 }}
        wrapLongLines={true}
        showLineNumbers={false} // disable line numbers to wrap long lines
      >
        {code}
      </SyntaxHighlighter>
    </Box>
  );
};
