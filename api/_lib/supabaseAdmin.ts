import { createClient } from "@supabase/supabase-js";

let cachedAnon: ReturnType<typeof createClient> | null | undefined;

function getAnonClient() {
  if (cachedAnon !== undefined) return cachedAnon;
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  cachedAnon = url && anonKey ? createClient(url, anonKey) : null;
  return cachedAnon;
}

/** Verifies a browser-supplied access token against Supabase Auth and returns
 *  the user id it belongs to, or null if absent/invalid/not configured. */
export async function getUserIdFromToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const client = getAnonClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

let cachedAdmin: ReturnType<typeof createClient> | null | undefined;

/** Service-role client — only for endpoints that must act on a user's behalf
 *  (account deletion). Never expose this key to the browser. */
export function getSupabaseAdminClient(): ReturnType<typeof createClient> | null {
  if (cachedAdmin !== undefined) return cachedAdmin;
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cachedAdmin = url && serviceKey ? createClient(url, serviceKey) : null;
  return cachedAdmin;
}
