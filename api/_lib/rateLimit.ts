import { Redis } from "@upstash/redis";
import type { VercelRequest } from "@vercel/node";
import { RATE_LIMIT_TTL_SECONDS } from "./constants";

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
}

export async function checkDailyLimit(bucket: string, identifier: string, limit: number): Promise<RateLimitResult> {
  const redis = getClient();
  if (!redis) {
    // No Redis configured yet — fail open rather than blocking the feature entirely.
    return { allowed: true, remaining: limit, limit };
  }
  const key = `cvisor:${bucket}:${identifier}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_TTL_SECONDS);
  }
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), limit };
}

export function getClientIdentifier(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = raw?.split(",")[0]?.trim();
  return ip || "unknown";
}
