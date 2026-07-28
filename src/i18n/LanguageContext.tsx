import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LanguageCode } from "../types";
import { dictionaries } from "./translations";
import type { Dictionary } from "./translations";

const STORAGE_KEY = "cvsible:language";

function detectLanguage(): LanguageCode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "el" || stored === "en") return stored;
  return navigator.language.slice(0, 2) === "el" ? "el" : "en";
}

interface LanguageContextValue {
  language: LanguageCode;
  dictionary: Dictionary;
  setLanguage: (language: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(detectLanguage);

  const setLanguage = (next: LanguageCode) => {
    setLanguageState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo<LanguageContextValue>(
    () => ({ language, dictionary: dictionaries[language], setLanguage }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
