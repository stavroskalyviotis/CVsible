import type { LanguageCode } from "../types";
import { supabase } from "../lib/supabaseClient";

export type CvisorErrorCode =
  | "missing_fields"
  | "text_too_long"
  | "rate_limited"
  | "refused"
  | "empty_response"
  | "server_error"
  | "network_error"
  | "method_not_allowed";

export class CvisorApiError extends Error {
  code: CvisorErrorCode;
  /** Seconds until the daily limit resets, when `code === "rate_limited"`. */
  resetInSeconds?: number;
  constructor(code: CvisorErrorCode, resetInSeconds?: number) {
    super(code);
    this.code = code;
    this.resetInSeconds = resetInSeconds;
  }
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (supabase) {
    // Signed-in requests carry the account's access token so the server can
    // rate-limit per account instead of per IP.
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new CvisorApiError("network_error");
  }

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const code =
      payload && typeof payload === "object" && "error" in payload
        ? ((payload as { error: unknown }).error as CvisorErrorCode)
        : "server_error";
    const resetInSeconds =
      payload && typeof payload === "object" && "resetInSeconds" in payload
        ? ((payload as { resetInSeconds: unknown }).resetInSeconds as number)
        : undefined;
    throw new CvisorApiError(code, resetInSeconds);
  }

  return (await response.json()) as T;
}

export type CvisorSuggestSection = "summary" | "experience" | "education" | "project";

export interface CvisorSuggestContext {
  role?: string;
  company?: string;
  degree?: string;
  institution?: string;
  title?: string;
}

export async function suggestSectionText(params: {
  section: CvisorSuggestSection;
  text: string;
  jobAd?: string;
  language: LanguageCode;
  context?: CvisorSuggestContext;
}): Promise<string> {
  const response = await postJson<{ data: { suggestion: string } }>("/api/cvisor-suggest", params);
  return response.data.suggestion;
}
