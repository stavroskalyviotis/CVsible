import type { CvData, LanguageCode } from "../types";
import { postJson } from "../cvisor/api";
import { cvSourceText, cvToDraft } from "../cvisor/cvToDraft";
import type { CvFixResult } from "./types";

/** Asks CVfix what it would change about this CV.
 *
 *  One request, not a loop: CVfix returns proposals rather than a finished
 *  document, so there is nothing to iterate towards on the server — the
 *  candidate is the one who decides, change by change.
 *
 *  `extraSource` carries the raw text of an uploaded file. The structured CV
 *  always vouches for itself, but an extraction holds detail that structuring
 *  dropped, and a rewrite is allowed to draw on anything the candidate said. */
export function requestCvFix(params: {
  cv: CvData;
  jobAd: string;
  language: LanguageCode;
  extraSource?: string;
}): Promise<CvFixResult> {
  return postJson<CvFixResult>("/api/cvfix", {
    draft: cvToDraft(params.cv),
    source: [cvSourceText(params.cv), params.extraSource ?? ""].filter(Boolean).join("\n"),
    jobAd: params.jobAd,
    language: params.language,
  });
}
