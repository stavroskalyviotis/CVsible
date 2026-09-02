import { describe, it, expect } from "vitest";
import { createId } from "./id";

describe("createId", () => {
  it("returns a non-empty string", () => {
    expect(typeof createId()).toBe("string");
    expect(createId().length).toBeGreaterThan(0);
  });

  it("returns unique values across calls", () => {
    const ids = new Set(Array.from({ length: 200 }, () => createId()));
    expect(ids.size).toBe(200);
  });
});
