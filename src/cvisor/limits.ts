/** Copies of the input ceilings the API enforces.
 *
 *  The serverless build cannot import from src/, so these live in two places.
 *  They matter on the client for one reason: a job ad pasted past the limit is
 *  rejected with a 400 after the request has been made, which reads as "the
 *  feature is broken" rather than "that ad is too long". Showing the count as
 *  it is typed turns a failure into a fact. ./limits.test.ts fails if the two
 *  copies ever drift apart.
 */

export const MAX_JOB_AD_CHARS = 6000;
export const MAX_BACKGROUND_CHARS = 8000;
export const MAX_SECTION_TEXT_CHARS = 4000;
export const MAX_RESUME_TEXT_CHARS = 20000;
