import { Redis } from "@upstash/redis";
import type { VercelRequest } from "@vercel/node";
import { RATE_LIMIT_TTL_SECONDS } from "./constants.js";

let cachedClient: Redis | null | undefined;

function getClient(): Redis | null {
  if (cachedClient !== undefined) return cachedClient;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  cachedClient = url && token ? new Redis({ url, token }) : null;
  return cachedClient;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  /** Seconds until the bucket resets. 0 when not meaningful (allowed, or
   *  rate limiting isn't active). */
  resetInSeconds: number;
}

let cachedUnlimitedIps: Set<string> | undefined;

function getUnlimitedIps(): Set<string> {
  if (cachedUnlimitedIps) return cachedUnlimitedIps;
  cachedUnlimitedIps = new Set(
    (process.env.CVISOR_UNLIMITED_IPS ?? "")
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean),
  );
  return cachedUnlimitedIps;
}

export async function checkDailyLimit(bucket: string, identifier: string, limit: number): Promise<RateLimitResult> {
  if (getUnlimitedIps().has(identifier)) {
    return { allowed: true, remaining: limit, limit, resetInSeconds: 0 };
  }
  const redis = getClient();
  if (!redis) {
    // No Redis configured yet — fail open rather than blocking the feature entirely.
    return { allowed: true, remaining: limit, limit, resetInSeconds: 0 };
  }
  try {
    const key = `cvisor:${bucket}:${identifier}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, RATE_LIMIT_TTL_SECONDS);
    }
    const allowed = count <= limit;
    // Only worth the extra round trip once the caller actually needs a
    // countdown to show — the happy path never asks the key its TTL.
    const resetInSeconds = allowed ? 0 : Math.max(0, await redis.ttl(key));
    return { allowed, remaining: Math.max(0, limit - count), limit, resetInSeconds };
  } catch (error) {
    // Rate limiting must never take the whole feature down — fail open and log for visibility.
    console.error("cvisor rate limit check failed", error);
    return { allowed: true, remaining: limit, limit, resetInSeconds: 0 };
  }
}

export function getClientIdentifier(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = raw?.split(",")[0]?.trim();
  return ip || "unknown";
}
