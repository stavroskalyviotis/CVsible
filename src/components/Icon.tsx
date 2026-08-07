export type IconName =
  | "mail"
  | "phone"
  | "map-pin"
  | "globe"
  | "linkedin"
  | "briefcase"
  | "book"
  | "award"
  | "star"
  | "languages"
  | "folder"
  | "plus"
  | "trash"
  | "chevron-up"
  | "chevron-down"
  | "upload"
  | "download"
  | "arrow-left"
  | "arrow-right"
  | "x"
  | "grip"
  | "heart"
  | "type"
  | "layout"
  | "sparkles";

const paths: Record<IconName, string> = {
  mail: "M3 6h18v12H3z M3 6l9 7 9-7",
  phone:
    "M6.6 10.8a15.4 15.4 0 0 0 6.6 6.6l2.2-2.2a1.2 1.2 0 0 1 1.2-.3c1.3.4 2.7.6 4.1.6a1.2 1.2 0 0 1 1.2 1.2V21a1.2 1.2 0 0 1-1.2 1.2C11.4 22.2 1.8 12.6 1.8 1.2A1.2 1.2 0 0 1 3 0h4.3a1.2 1.2 0 0 1 1.2 1.2c0 1.4.2 2.8.6 4.1a1.2 1.2 0 0 1-.3 1.2z",
  "map-pin": "M12 22s7-6.5 7-12A7 7 0 1 0 5 10c0 5.5 7 12 7 12z M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M2 12h20 M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z",
  linkedin:
    "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  briefcase: "M3 8h18v11H3z M8 8V5h8v3 M3 13h18",
  book: "M4 4h9a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z M20 4v13 M4 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.5 13.5 7 22l5-3 5 3-1.5-8.5",
  star: "m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3 1.2-6.9-5-4.9 6.9-1z",
  languages: "M4 5h9 M8 3v2c0 4.4-2 8-5 10 M6 10c1 2 3 3.5 6 4 M13 21l4-9 4 9 M14.5 18h5",
  folder: "M3 6h6l2 3h10v11H3z",
  plus: "M12 5v14 M5 12h14",
  trash: "M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13",
  "chevron-up": "m6 15 6-6 6 6",
  "chevron-down": "m6 9 6 6 6-6",
  upload: "M12 16V4 M7 9l5-5 5 5 M4 20h16",
  download: "M12 4v12 M7 11l5 5 5-5 M4 20h16",
  "arrow-left": "M19 12H5 M11 6l-6 6 6 6",
  "arrow-right": "M5 12h14 M13 6l6 6-6 6",
  x: "M6 6l12 12 M18 6 6 18",
  grip: "M9 5v.01 M9 12v.01 M9 19v.01 M15 5v.01 M15 12v.01 M15 19v.01",
  heart:
    "M12 21s-7.5-4.6-10-9.3C.5 8 2 4 6 4c2 0 3.5 1 6 3.5C14.5 5 16 4 18 4c4 0 5.5 4 4 7.7C19.5 16.4 12 21 12 21z",
  type: "M4 7V4h16v3 M9 20h6 M12 4v16",
  layout: "M3 4h18v16H3z M3 9h18 M9 9v11",
  sparkles: "M12 3l1.6 4.9L18.5 9l-4.9 1.6L12 15.5l-1.6-4.9L5.5 9l4.9-1.6z M19 14l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z",
};

export function Icon({
  name,
  size = 16,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
