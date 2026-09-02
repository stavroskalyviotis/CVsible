/** Word lists backing the ATS heuristics. Kept apart from the analyser so the
 *  scoring logic stays readable. */

export const ACTION_VERBS_EN = [
  "achieved", "advised", "analysed", "analyzed", "architected", "automated", "built", "coached",
  "consolidated", "converted", "created", "cut", "delivered", "designed", "developed", "directed",
  "drove", "established", "expanded", "generated", "grew", "implemented", "improved", "increased",
  "influenced", "initiated", "introduced", "launched", "led", "maintained", "managed", "mentored",
  "migrated", "negotiated", "optimised", "optimized", "orchestrated", "owned", "planned",
  "prototyped", "rebuilt", "redesigned", "reduced", "refactored", "resolved", "restructured",
  "scaled", "secured", "shipped", "simplified", "standardised", "standardized", "streamlined",
  "supervised", "supported", "tested", "trained", "transformed",
];

export const ACTION_VERBS_EL = [
  "ανέλαβα", "ανέπτυξα", "αναδιοργάνωσα", "αναβάθμισα", "αξιοποίησα", "απλοποίησα", "αύξησα",
  "βελτίωσα", "βελτιστοποίησα", "δημιούργησα", "διαχειρίστηκα", "διηύθυνα", "εγκατέστησα",
  "εισήγαγα", "εκπαίδευσα", "εξοικονόμησα", "επέβλεψα", "επεξεργάστηκα", "επιτάχυνα", "καθιέρωσα",
  "κατασκεύασα", "μείωσα", "μετέφερα", "οργάνωσα", "παρέδωσα", "σχεδίασα", "συντόνισα",
  "συνέβαλα", "υλοποίησα", "υποστήριξα", "ηγήθηκα",
];

const STOPWORDS_EN = new Set([
  "the", "and", "for", "with", "you", "your", "our", "are", "will", "have", "has", "that", "this",
  "from", "who", "what", "into", "not", "but", "all", "any", "can", "able", "using", "use", "used",
  "work", "working", "role", "team", "teams", "job", "position", "company", "must", "should",
  "would", "about", "more", "other", "such", "than", "then", "them", "they", "their", "there",
  "been", "being", "also", "well", "years", "year", "experience", "skills", "strong", "good",
  "great", "new", "one", "two", "three", "day", "days", "per", "via", "etc", "plus", "within",
  "across", "while", "when", "where", "how", "why", "which", "each", "every", "may", "might",
]);

const STOPWORDS_EL = new Set([
  "και", "της", "του", "των", "τον", "την", "στο", "στη", "στην", "στον", "στα", "στις", "στους",
  "για", "από", "που", "είναι", "θα", "να", "με", "σε", "ως", "τα", "το", "οι", "ένα", "μια",
  "έναν", "μας", "σας", "τους", "όπως", "κατά", "μετά", "πριν", "προς", "εργασία", "εμπειρία",
  "γνώση", "γνώσεις", "θέση", "εταιρεία", "ομάδα", "χρόνια", "έτη", "καλή", "άριστη", "πολύ",
  "όλα", "όλες", "όλους", "αυτό", "αυτή", "αυτά", "δεν", "αν", "ή", "τι", "ενώ", "επίσης",
]);

export function isStopword(word: string): boolean {
  return STOPWORDS_EN.has(word) || STOPWORDS_EL.has(word);
}
