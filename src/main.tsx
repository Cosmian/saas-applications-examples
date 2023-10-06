import { Auth0Provider, Auth0ProviderOptions } from "@auth0/auth0-react";
import { ChakraProvider, extendTheme, withDefaultColorScheme } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./main.css";
import { auth0_config } from "./utils/config.ts";

let redirect_uri = window.location.origin;
if (window.location.pathname === "/zt" || window.location.pathname === "/ztrust" || window.location.pathname === "/zerotrust")
  redirect_uri = window.location.origin + window.location.pathname;
const providerConfig: Auth0ProviderOptions = {
  domain: auth0_config.domain,
  clientId: auth0_config.client,
  authorizationParams: {
    redirect_uri: redirect_uri,
  },
};

const customTheme = extendTheme(
  {
    colors: {
      orange: {
        50: "#ffeadf",
        100: "#ffc8b2",
        200: "#fba584",
        300: "#f78254",
        400: "#f45e25",
        500: "#da450b",
        600: "#ab3507",
        700: "#7a2504",
        800: "#4b1500",
        900: "#1f0400",
      },
    },
  },
  withDefaultColorScheme({ colorScheme: "orange" })
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider {...providerConfig}>
      <ChakraProvider theme={customTheme}>
        <App />
      </ChakraProvider>
    </Auth0Provider>
  </React.StrictMode>
);
