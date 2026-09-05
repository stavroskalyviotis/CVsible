import { describe, it, expect, beforeEach, vi } from "vitest";

describe("checkDailyLimit — Redis unavailable", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.CVISOR_UNLIMITED_IPS;
  });

  it("fails closed when Redis is not configured, instead of allowing unlimited calls", async () => {
    const { checkDailyLimit } = await import("./rateLimit");
    const result = await checkDailyLimit("cvfix", "1.2.3.4", 8);
    expect(result.allowed).toBe(false);
    expect(result.unavailable).toBe(true);
  });

  it("still allows an explicitly unlimited identifier even without Redis", async () => {
    process.env.CVISOR_UNLIMITED_IPS = "9.9.9.9";
    const { checkDailyLimit } = await import("./rateLimit");
    const result = await checkDailyLimit("cvfix", "9.9.9.9", 8);
    expect(result.allowed).toBe(true);
    expect(result.unavailable).toBeUndefined();
  });
});
