import type { Dictionary } from "../i18n/translations";
import { CvisorApiError } from "./api";

export function mapCvisorErrorMessage(error: unknown, dictionary: Dictionary): string {
  if (error instanceof CvisorApiError) {
    switch (error.code) {
      case "missing_fields":
        return dictionary.cvisor.errorMissingFields;
      case "text_too_long":
        return dictionary.cvisor.errorTooLong;
      case "rate_limited":
        return dictionary.cvisor.errorRateLimited;
      case "refused":
        return dictionary.cvisor.errorRefused;
      default:
        return dictionary.cvisor.errorGeneric;
    }
  }
  return dictionary.cvisor.errorGeneric;
}
