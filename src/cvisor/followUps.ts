import type { LanguageCode } from "../types";
import { postJson } from "./api";

/** Asks what else is worth knowing about a job the candidate just described.
 *
 *  Never throws: the follow-ups are a bonus on top of a question that has
 *  already been answered, and stalling the interview because a nice-to-have
 *  call failed would be the wrong trade. A failure simply means no extra
 *  questions for that job. */
export async function requestFollowUps(params: {
  role: string;
  company: string;
  story: string;
  jobAd: string;
  language: LanguageCode;
}): Promise<string[]> {
  try {
    const response = await postJson<{ questions: string[] }>("/api/cvisor-followup", params);
    return Array.isArray(response.questions) ? response.questions : [];
  } catch {
    return [];
  }
}
