/** Schema for the single-field "improve this text" endpoint. */

export const SUGGEST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["suggestion"],
  properties: {
    suggestion: {
      type: "string",
      description: "Η βελτιωμένη εκδοχή του κειμένου, στην ίδια μορφή (απλό κείμενο ή HTML) με το αρχικό.",
    },
  },
} as const;

export interface SuggestResult {
  suggestion: string;
}
