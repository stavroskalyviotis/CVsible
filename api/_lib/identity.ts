import type { VercelRequest } from "@vercel/node";
import { getUserIdFromToken } from "./supabaseAdmin.js";
import { getClientIdentifier } from "./rateLimit.js";

/** Rate-limit bucket key: the signed-in account when present, IP otherwise.
 *  Keying by account is what makes it possible to later swap in a per-plan
 *  limit (paid vs free) without touching the endpoints that call this. */
export async function resolveIdentifier(req: VercelRequest): Promise<string> {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  const userId = await getUserIdFromToken(token);
  return userId ? `user:${userId}` : `ip:${getClientIdentifier(req)}`;
}
