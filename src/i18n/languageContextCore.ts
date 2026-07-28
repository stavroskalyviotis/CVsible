import { createContext } from "react";
import type { LanguageCode } from "../types";
import type { Dictionary } from "./translations";

const STORAGE_KEY = "cvsible:language";

export interface LanguageContextValue {
  language: LanguageCode;
  dictionary: Dictionary;
  setLanguage: (language: LanguageCode) => void;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function detectLanguage(): LanguageCode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "el" || stored === "en") return stored;
  return navigator.language.slice(0, 2) === "el" ? "el" : "en";
}

export function persistLanguage(language: LanguageCode): void {
  localStorage.setItem(STORAGE_KEY, language);
}
