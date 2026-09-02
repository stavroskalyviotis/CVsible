import type { ContactItem, ContactType, CvData } from "../types";
import type { ParsedFields } from "../ats/parse";
import { createEmptyCvData } from "../data/defaultData";
import { createId } from "../utils/id";
import { applyDraft } from "./agent";
import type { CvDraft } from "./agent";

function contact(type: ContactType, value: string): ContactItem {
  return { id: createId(), type, value, label: "" };
}

/** Guesses the contact type from the shape of a URL, so a rebuilt CV keeps its
 *  links in the right slots. */
function urlContact(url: string): ContactItem {
  const lower = url.toLowerCase();
  if (lower.includes("linkedin.")) return contact("linkedin", url);
  if (lower.includes("github.")) return contact("github", url);
  if (lower.includes("twitter.") || lower.includes("x.com")) return contact("x", url);
  return contact("website", url);
}

/** Turns a CVfix result into a complete document: the restructured content
 *  from the draft, plus the identity fields the parser recovered from the
 *  original file. Starts from an ATS-safe template by design. */
export function draftToCvData(draft: CvDraft, fields: ParsedFields): CvData {
  const base = createEmptyCvData();

  const contacts: ContactItem[] = [];
  if (fields.emails[0]) contacts.push(contact("email", fields.emails[0]));
  if (fields.phones[0]) contacts.push(contact("phone", fields.phones[0]));
  fields.urls
    .filter((url) => !url.startsWith("mailto:") && !url.startsWith("tel:"))
    .slice(0, 3)
    .forEach((url) => contacts.push(urlContact(url)));

  return applyDraft(
    {
      ...base,
      showPhoto: false,
      personalInfo: {
        ...base.personalInfo,
        fullName: fields.name ?? "",
        contacts: contacts.length > 0 ? contacts : base.personalInfo.contacts,
      },
    },
    draft,
  );
}
