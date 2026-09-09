import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUserIdFromToken, getSupabaseAdminClient } from "./_lib/supabaseAdmin.js";

export const config = { maxDuration: 15 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  const userId = await getUserIdFromToken(token);
  if (!userId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    res.status(500).json({ error: "not_configured" });
    return;
  }

  // Saved CVs and the master profile cascade-delete via their user_id
  // foreign keys onto auth.users.
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("delete-account error", error);
    res.status(500).json({ error: "delete_failed" });
    return;
  }

  res.status(200).json({ ok: true });
}
