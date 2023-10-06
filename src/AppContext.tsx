import { createContext } from "react";

export type LanguageType = "java" | "javascript";
export type SiteTitleType = "zerotrust" | "saas";

type AppContextType = {
  language: LanguageType;
  switchLanguage: (language: LanguageType) => void;
  siteTitle: SiteTitleType;
  switchSiteTitle: (title: SiteTitleType) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export default AppContext;
