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
  | "sparkles"
  | "calendar"
  | "refresh"
  | "check"
  | "alert"
  | "x-circle"
  | "more"
  | "user"
  | "log-out"
  | "menu"
  | "file-text"
  | "shield"
  | "target"
  | "eye"
  | "zap"
  | "link"
  | "copy"
  | "undo"
  | "redo"
  | "coffee";

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
  calendar: "M4 5h16v16H4z M4 9h16 M8 3v4 M16 3v4",
  refresh:
    "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  check: "M20 6 9 17l-5-5",
  alert: "M12 3 2 20h20z M12 9v5 M12 17.5v.5",
  "x-circle": "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M15 9l-6 6 M9 9l6 6",
  more: "M5 12h.5 M11.75 12h.5 M18.5 12h.5",
  user: "M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z M4 21a8 8 0 0 1 16 0",
  "log-out": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  menu: "M3 6h18 M3 12h18 M3 18h18",
  "file-text": "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M14 3v6h6 M8 13h8 M8 17h5",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  eye: "M12 5c5 0 9 4.5 10 7-1 2.5-5 7-10 7S3 14.5 2 12c1-2.5 5-7 10-7z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  zap: "M13 2 4 14h7l-1 8 9-12h-7z",
  link: "M9 15l6-6 M8.5 6.5l1-1a3.5 3.5 0 0 1 5 5l-1 1 M15.5 17.5l-1 1a3.5 3.5 0 0 1-5-5l1-1",
  copy: "M8 8h11v11H8z M5 16H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v1",
  undo: "M3 10h11a5 5 0 0 1 0 10h-3 M3 10l4.5-4.5 M3 10l4.5 4.5",
  redo: "M21 10H10a5 5 0 0 0 0 10h3 M21 10l-4.5-4.5 M21 10l-4.5 4.5",
  coffee: "M18 8h1a4 4 0 0 1 0 8h-1 M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z M6 1v3 M10 1v3 M14 1v3",
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
