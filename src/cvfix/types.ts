/** One edit CVfix proposes. Mirrors CvFixChange in api/_lib/cvFixChanges.ts. */
export interface CvFixChange {
  id: string;
  /** Draft path, e.g. "experience[0].bullets[1]". Empty `before` is an addition. */
  path: string;
  /** Where in the CV, phrased for the candidate: "Barista · Coffee Lab". */
  where: string;
  before: string;
  after: string;
  why: string;
}

/** What the app's own report will say about the CV as it stands. Shown next to
 *  the changes so the candidate can see what the edits are moving. */
export interface CvFixMetrics {
  verbRatio: number;
  bulletCount: number;
  keywordRatio: number | null;
}

export interface CvFixResult {
  changes: CvFixChange[];
  metrics: CvFixMetrics;
  /** How many blocking problems the deterministic report found. */
  blocking: number;
  remaining: number;
}

export type ChangeDecision = "pending" | "accepted" | "skipped";
