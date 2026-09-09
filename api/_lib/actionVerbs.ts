/** Does a bullet lead with an action?
 *
 *  VERBATIM COPY of src/ats/actionVerbs.ts. The serverless functions build
 *  from their own tsconfig, which does not reach into src/, so the list has
 *  to exist twice — and the last time it did, the two drifted until a CV
 *  whose every bullet opened with a real verb scored 0%. api/_lib/
 *  actionVerbs.test.ts fails if these two files ever disagree again, so edit
 *  src/ats/actionVerbs.ts and copy it here rather than editing this one.
 *
 *  Matching is by stem, not by whole word: one entry covers "coordinated",
 *  "coordinating" and "coordinates". Stems are stored already normalised —
 *  lowercase and, for Greek, without accents.
 */

/** Greek verbs take an augment in the past tense, which rewrites the front of
 *  the word ("αναπτύσσω" → "ανέπτυξα"), so both shapes are listed. Action
 *  nouns are in here too: "Διαχείριση ομάδας" is how a large share of Greek
 *  CVs open a bullet, and it leads with an action just as plainly as the
 *  verb does. */
export const ACTION_STEMS_EL = [
  "αναβαθμ", "αναδιοργαν", "αναλαβ", "αναλυ", "ανασχεδιασ", "αναπτυ", "ανελαβ", "ανεπτυ",
  "ανταποκρ", "αξιολογ", "αξιοποι", "απλοποι", "αποκαταστ", "αυξησ", "αυξαν",
  "βελτιστοποι", "βελτιω", "βοηθησ",
  "γραψ", "γραφ",
  "δημιουργ", "διαπραγματ", "διαχειρ", "διδαξ", "διδασκ", "διεκπεραιω", "διερευν", "διηυθυν",
  "διοικ", "διοργαν", "διορθω",
  "εγκαταστ", "εγκατεστ", "εισηγαγ", "εισηγη", "εκπαιδευ", "εκπροσωπ", "ελεγξ", "ελεγχ",
  "ενημερω", "ενισχυ", "ενσωματω", "εξοικονομ", "εξυπηρετ", "επεκτειν", "επεξεργ",
  "επιβλεπ", "επεβλεπ", "επικοινων", "επιλυ", "επιταχυν", "επιτυχ", "εφαρμο",
  "ηγηθηκ", "ηγησ",
  "θεσπισ",
  "καθιερω", "καταγρα", "κατεγρα", "κατασκευ", "κερδισ",
  "λειτουργ",
  "μειω", "μεταφερ", "μετεφερ", "μετατρε",
  "οργανω",
  "παραγ", "παραδ", "παρεδ", "παρακολουθ", "παρουσιασ", "παρειχ", "παρεχ", "προγραμματ",
  "προωθ", "πωλησ",
  "σχεδια", "συγκεντρω", "συλλογ", "συλλεξ", "συμμετ", "συνεβαλ", "συνεργα",
  "συντηρ", "συντονι", "συνταξ", "συνταττ",
  "τηρησ",
  "υλοποι", "υποστηρι", "υπολογι",
  "φροντ",
  "χειριστ", "χειριζ", "χρησιμοποι",
];

/** English is regular enough that a stem covers every tense that matters. */
export const ACTION_STEMS_EN = [
  "accelerat", "accomplish", "achiev", "acquir", "adapt", "administer", "advis", "advocat",
  "analys", "analyz", "answer", "anticipat", "architect", "arrang", "assembl", "assess",
  "assign", "assist", "audit", "author", "automat", "award",
  "balanc", "boost", "brief", "budget", "built", "build",
  "calculat", "campaign", "captur", "carri", "carry", "catalog", "central", "chair", "chang",
  "clarifi", "clean", "close", "coach", "collaborat", "collect", "combin", "communicat",
  "compil", "complet", "compos", "comput", "conceiv", "conduct", "configur", "connect",
  "consolidat", "construct", "consult", "contribut", "control", "convert", "coordinat",
  "correct", "counsel", "creat", "cultivat", "custom", "cut",
  "debug", "decreas", "defin", "deliver", "demonstrat", "deploy", "design", "detect",
  "determin", "develop", "devis", "diagnos", "direct", "discover", "dispatch", "distribut",
  "document", "doubl", "draft", "drove", "drive",
  "earn", "edit", "educat", "eliminat", "enabl", "encourag", "enforc", "engineer", "enhanc",
  "ensur", "establish", "estimat", "evaluat", "examin", "execut", "expand", "expedit",
  "experiment", "explain", "explor", "extend",
  "facilitat", "file", "financ", "focus", "forecast", "formulat", "foster", "found",
  "gather", "generat", "govern", "grew", "grow", "guid",
  "handl", "help", "hire", "host",
  "identifi", "implement", "improv", "increas", "influenc", "inform", "initiat", "innovat",
  "inspect", "install", "institut", "instruct", "integrat", "interpret", "interview",
  "introduc", "invent", "investigat", "issu",
  "join", "judg",
  "launch", "lead", "led", "learn", "lectur", "leverag", "licens", "lift", "log",
  "maintain", "manag", "manufactur", "map", "market", "measur", "mediat", "mentor", "merg",
  "migrat", "minimis", "minimiz", "model", "moderat", "modifi", "monitor", "motivat", "mov",
  "navigat", "negotiat", "normalis", "normaliz",
  "observ", "obtain", "offer", "operat", "optimis", "optimiz", "orchestrat", "order",
  "organis", "organiz", "orient", "outlin", "overhaul", "oversaw", "oversee", "own",
  "packag", "partner", "perform", "persuad", "pilot", "pioneer", "plan", "prepar", "present",
  "preserv", "prevent", "prioritis", "prioritiz", "process", "procur", "produc", "program",
  "project", "promot", "proof", "propos", "prototyp", "provid", "publish", "purchas",
  "qualifi", "quantifi",
  "rais", "rebuilt", "rebuild", "receiv", "recommend", "reconcil", "record",
  "recruit", "redesign", "reduc", "refactor", "referr", "refin", "regulat", "reinforc",
  "remodel", "renegotiat", "reorganis", "reorganiz", "repair", "replac", "report",
  "represent", "research", "resolv", "respond", "restor", "restructur", "retain", "retriev",
  "review", "revis", "revitalis", "revitaliz", "rewrote", "rewrit", "rout", "run", "ran",
  "safeguard", "sav", "scal", "schedul", "screen", "secur", "select", "sold", "sell", "serv",
  "set", "shap", "shar", "ship", "simplifi", "simulat", "solv", "sort", "sourc",
  "spearhead", "specifi", "spoke", "speak", "sponsor", "staff", "standardis", "standardiz",
  "steer", "streamlin", "strengthen", "structur", "studi", "submitt", "succeed", "suggest",
  "summaris", "summariz", "supervis", "suppli", "support", "surpass", "survey", "sustain",
  "synthesis", "synthesiz", "systemat",
  "tabulat", "tackl", "target", "taught", "teach", "test", "track", "train", "transform",
  "translat", "transmitt", "transport", "treat", "trebl", "tripl", "troubleshoot", "tutor",
  "uncover", "undertook", "undertak", "unifi", "updat", "upgrad", "utilis", "utiliz",
  "validat", "valu", "verifi", "visualis", "visualiz", "volunteer",
  "won", "win", "wrote", "writ",
];

const LEADING_BULLET = /^\s*([•▪◦‣·*+–—-]|\d+[.)])\s+/;
const COMBINING_MARKS = /[̀-ͯ]/g;

/** Lowercase, accent-stripped, so "Ανέπτυξα" and "ανεπτυξα" match the same
 *  stem and an all-caps bullet is not treated as a different word. */
export function normalizeForVerbMatch(value: string): string {
  return value
    .toLocaleLowerCase("el")
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when the line opens with an action.
 *
 *  Only the first word is judged, which is the whole point of the rule: a
 *  bullet that buries its verb behind "Was responsible for" reads as a duty
 *  list, not an achievement, and that is exactly what this is meant to catch. */
export function startsWithActionVerb(line: string): boolean {
  const first = normalizeForVerbMatch(line.replace(LEADING_BULLET, "")).split(" ")[0] ?? "";
  if (first.length < 2) return false;
  return (
    ACTION_STEMS_EN.some((stem) => first.startsWith(stem)) ||
    ACTION_STEMS_EL.some((stem) => first.startsWith(stem))
  );
}

/** Share of the given lines that open with an action, 0-1. Empty input is 0. */
export function actionVerbRatio(lines: string[]): number {
  if (lines.length === 0) return 0;
  return lines.filter(startsWithActionVerb).length / lines.length;
}
