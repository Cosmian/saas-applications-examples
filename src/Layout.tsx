import { Badge, Code, Container, Divider, Heading, VStack } from "@chakra-ui/react";

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

export const ClientBadge: React.FC<{ client: 1 | 2 | undefined; children: JSX.Element | string }> = ({ client, children }) => {
  const getColor = (): "blue" | "green" | undefined => {
    switch (client) {
      case 1:
        return "blue";
      case 2:
        return "green";
      default:
        return undefined;
    }
  };
  return (
    <Badge variant="outline" colorScheme={getColor()} style={{ translate: "0 -1px" }}>
      {children}
    </Badge>
  );
};

export const ClientOne = (): JSX.Element => {
  return <ClientBadge client={1}>Client 1</ClientBadge>;
};
export const ClientTwo = (): JSX.Element => {
  return <ClientBadge client={2}>Client 2</ClientBadge>;
};
