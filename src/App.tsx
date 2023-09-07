import { useAuth0 } from "@auth0/auth0-react";
import { Button, Center, Flex, Heading, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import CoverCrypt from "./CoverCrypt";
import Layout from "./Layout";

const App = (): JSX.Element => {
  const [kmsToken, setKmsToken] = useState<undefined | string>();

  const { isLoading, error, user, loginWithRedirect, getIdTokenClaims, logout, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (user) {
      const getToken = async (): Promise<void> => {
        const claims = await getIdTokenClaims();
        setKmsToken(claims?.__raw);
      };
      getToken();
    }
  }, [user]);

  //
  // Auth0 actions
  //

  const handleLogout = (): void => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  if (isLoading) {
    return (
      <Layout>
        <Center style={{ minHeight: "100vh" }}>
          <Spinner size="xl" />
        </Center>
      </Layout>
    );
  }

  if (error) {
    return (
      <>
        <Layout>
          <Center style={{ minHeight: "100vh" }}>
            {error && <>Error</>}
            <Button onClick={() => loginWithRedirect()}>Login with Auth0</Button>
          </Center>
        </Layout>
      </>
    );
  }

  return (
    <Layout>
      <Flex flexDirection={"column"} gap="8">
        {/* INTRO */}
        <Heading as="h1" size="2xl">
          Cosmian for Saas Applications
        </Heading>
        <Text fontSize="xl">Code samples for developers.</Text>

        {!isAuthenticated && <Button onClick={() => loginWithRedirect()}>Login with Auth0</Button>}
        {isAuthenticated && (
          <>
            <Button onClick={handleLogout} style={{ position: "absolute", top: 20, right: 20 }}>
              Log out
            </Button>
            <Tabs isLazy>
              <TabList>
                <Tab>Covercrypt & KMS actions</Tab>
              </TabList>

              <TabPanels marginBottom={12}>
                <TabPanel>{kmsToken && <CoverCrypt kmsToken={kmsToken} />}</TabPanel>
              </TabPanels>
            </Tabs>
          </>
        )}
      </Flex>
    </Layout>
  );
};

export default App;
