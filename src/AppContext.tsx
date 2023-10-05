import { createContext } from "react";

export type LanguageType = "java" | "javascript";

type AppContextType = {
  language: LanguageType;
  switchLanguage: (language: LanguageType) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export default AppContext;
