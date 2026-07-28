import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LanguageCode } from "../types";
import { dictionaries } from "./translations";
import { LanguageContext, detectLanguage, persistLanguage } from "./languageContextCore";
import type { LanguageContextValue } from "./languageContextCore";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(detectLanguage);

  const setLanguage = (next: LanguageCode) => {
    setLanguageState(next);
    persistLanguage(next);
  };

  const value = useMemo<LanguageContextValue>(
    () => ({ language, dictionary: dictionaries[language], setLanguage }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
