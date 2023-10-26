import { useAuth0 } from "@auth0/auth0-react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Button, Center, Flex, Heading, Link, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { callbacksExamplesInMemory } from "cloudproof_js";
import { useEffect, useState } from "react";
import AppContext, { LanguageType, SiteTitleType } from "./AppContext";
import CoverCrypt from "./CoverCrypt";
import Findex from "./Findex";
import Layout from "./Layout";
import LoginPage from "./LoginPage";
import Overview from "./Overview";
import PKI from "./PKI";

const App = (): JSX.Element => {
  const [kmsToken, setKmsToken] = useState<undefined | string>();
  const [tabIndex, setTabIndex] = useState(0);
  const [language, setLanguage] = useState<LanguageType>("javascript");
  const [siteTitle, setSiteTitle] = useState<SiteTitleType>("saas");

  const { isLoading, error, user, loginWithRedirect, getIdTokenClaims, logout, isAuthenticated } = useAuth0();
  const { fetchEntries, fetchChains, upsertEntries, insertChains } = callbacksExamplesInMemory();

  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/zt" || path === "/ztrust" || path === "/zerotrust") {
      setSiteTitle("zerotrust");
    }
  }, []);

  useEffect(() => {
    if (user) {
      const getToken = async (): Promise<void> => {
        const claims = await getIdTokenClaims();
        setKmsToken(claims?.__raw);
      };
      getToken();
    }
  }, [user]);

  const onTabChange = (tabIndex: number): void => {
    window.scrollTo(0, 0);
    setTabIndex(tabIndex);
  };

  const switchLanguage = (language: LanguageType): void => {
    setLanguage(language);
  };
  const switchSiteTitle = (title: SiteTitleType): void => {
    setSiteTitle(title);
  };

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
    handleLogout();
    return (
      <>
        <Layout>
          <Center style={{ minHeight: "100vh" }}>
            <Flex direction="column" alignItems="center" gap={4}>
              {error && <>Error</>}
              <Button onClick={() => loginWithRedirect()}>Login with Auth0</Button>
            </Flex>
          </Center>
        </Layout>
      </>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage loginWithRedirect={loginWithRedirect} />;
  }

  return (
    <AppContext.Provider value={{ language, switchLanguage, siteTitle, switchSiteTitle }}>
      <Layout>
        <Flex flexDirection={"column"} gap="8">
          {/* INTRO */}
          <Heading as="h1" size="2xl">
            {siteTitle === "saas" ? "Cosmian for Saas Applications" : "Cosmian Zero Trust"}
          </Heading>
          <Heading as="h2" size="md" mt={4}>
            Post-quantum resistance for your SaaS Applications.
          </Heading>
          <Text>
            Check out the GitHub project repository{" "}
            <Link
              fontSize="md"
              color="orange.500"
              textDecoration="underline"
              href="https://github.com/Cosmian/saas-applications-examples"
              isExternal
            >
              https://github.com/Cosmian/saas-applications-examples <ExternalLinkIcon mx="2px" />
            </Link>
            <br />
            Cosmian official documentation{" "}
            <Link fontSize="md" color="orange.500" textDecoration="underline" href="https://docs.cosmian.com" isExternal>
              https://docs.cosmian.com <ExternalLinkIcon mx="2px" />
            </Link>
          </Text>

          <>
            <Button onClick={handleLogout} style={{ position: "absolute", top: 20, right: 20 }}>
              Log out
            </Button>
            <Tabs isLazy onChange={(index) => setTabIndex(index)} index={tabIndex}>
              <TabList>
                <Tab>Overview</Tab>
                <Tab>Attribute-based encryption</Tab>
                <Tab>Key distribution</Tab>
                <Tab>Search on encrypted data</Tab>
              </TabList>

              <TabPanels marginBottom={12}>
                <TabPanel>
                  <Overview onTabChange={onTabChange} />
                </TabPanel>
                <TabPanel>{kmsToken && <CoverCrypt kmsToken={kmsToken} />}</TabPanel>
                <TabPanel>{kmsToken && <PKI kmsToken={kmsToken} />}</TabPanel>
                <TabPanel>
                  {
                    <Findex
                      fetchEntries={fetchEntries}
                      fetchChains={fetchChains}
                      upsertEntries={upsertEntries}
                      insertChains={insertChains}
                    />
                  }
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        </Flex>
      </Layout>
    </AppContext.Provider>
  );
};

export default App;
