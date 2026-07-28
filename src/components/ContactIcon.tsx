import type { ContactType } from "../types";
import { BrandIcon } from "./BrandIcon";
import { Icon } from "./Icon";

export function ContactIcon({ type, size = 13 }: { type: ContactType; size?: number }) {
  switch (type) {
    case "email":
      return <Icon name="mail" size={size} />;
    case "phone":
      return <Icon name="phone" size={size} />;
    case "location":
      return <Icon name="map-pin" size={size} />;
    case "website":
      return <Icon name="globe" size={size} />;
    case "linkedin":
      return <Icon name="linkedin" size={size} />;
    case "github":
      return <BrandIcon name="github" size={size} />;
    case "x":
      return <BrandIcon name="x" size={size} />;
    case "custom":
      return <Icon name="globe" size={size} />;
    default:
      return null;
  }
}
