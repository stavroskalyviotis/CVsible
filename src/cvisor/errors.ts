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
        return rateLimitedMessage(error.resetInSeconds, dictionary);
      case "unavailable":
        return dictionary.cvisor.errorUnavailable;
      case "refused":
        return dictionary.cvisor.errorRefused;
      default:
        return dictionary.cvisor.errorGeneric;
    }
  }
  return dictionary.cvisor.errorGeneric;
}

/** Reports the real time left on the bucket rather than a flat "tomorrow" —
 *  the number shrinks the closer the reader is to being able to try again. */
function rateLimitedMessage(resetInSeconds: number | undefined, dictionary: Dictionary): string {
  if (!resetInSeconds || resetInSeconds <= 0) return dictionary.cvisor.errorRateLimited;
  const hours = Math.max(1, Math.ceil(resetInSeconds / 3600));
  if (hours === 1) return dictionary.cvisor.errorRateLimitedInOneHour;
  return dictionary.cvisor.errorRateLimitedInHours.replace("{v}", String(hours));
}
