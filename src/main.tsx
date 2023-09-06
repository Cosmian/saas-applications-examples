import { AppState, Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { auth0_config } from "./utils/config.ts";

import { ChakraProvider, extendTheme, withDefaultColorScheme } from "@chakra-ui/react";

const onRedirectCallback = (_appState: AppState | undefined): void => {
  window.location.replace(window.location.pathname);
};

const providerConfig = {
  domain: auth0_config.domain,
  clientId: auth0_config.client,
  onRedirectCallback,
  authorizationParams: {
    redirect_uri: window.location.origin,
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
