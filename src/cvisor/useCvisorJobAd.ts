import { useState } from "react";

const STORAGE_KEY = "cvsible:cvisor-job";

export function useCvisorJobAd() {
  const [jobAd, setJobAdState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });

  const setJobAd = (value: string) => {
    setJobAdState(value);
    try {
      if (value) {
        localStorage.setItem(STORAGE_KEY, value);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // storage full or unavailable, ignore
    }
  };

  return [jobAd, setJobAd] as const;
}
