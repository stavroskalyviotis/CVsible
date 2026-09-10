import { describe, it, expect } from "vitest";
import * as client from "./limits";
import * as server from "../../api/_lib/constants";

/** A ceiling the client believes is higher than the one the server enforces
 *  produces a 400 the user cannot act on; one that is lower blocks input the
 *  server would have accepted. Either way the number has to be the same
 *  number, and it is written down twice only because api/ cannot import src/. */
describe("the client's input limits match the ones the API enforces", () => {
  it("agrees on every ceiling", () => {
    expect(client.MAX_JOB_AD_CHARS).toBe(server.MAX_JOB_AD_CHARS);
    expect(client.MAX_BACKGROUND_CHARS).toBe(server.MAX_BACKGROUND_CHARS);
    expect(client.MAX_SECTION_TEXT_CHARS).toBe(server.MAX_SECTION_TEXT_CHARS);
    expect(client.MAX_RESUME_TEXT_CHARS).toBe(server.MAX_RESUME_TEXT_CHARS);
  });
});
