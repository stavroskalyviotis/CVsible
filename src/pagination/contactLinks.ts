import type { ContactItem } from "../types";

export function formatDateOfBirth(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** A real href, so the exported PDF carries clickable, machine-readable links. */
export function contactHref(item: ContactItem): string | null {
  const value = item.value.trim();
  if (!value) return null;
  if (item.type === "email") return `mailto:${value}`;
  if (item.type === "phone") return `tel:${value.replace(/[^\d+]/g, "")}`;
  if (item.type === "location") return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (item.type === "linkedin" || item.type === "github" || item.type === "x" || item.type === "website") {
    return `https://${value.replace(/^\/+/, "")}`;
  }
  return null;
}
