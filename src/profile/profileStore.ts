import type { UserProfile } from "../types";
import { supabase } from "../lib/supabaseClient";
import { normalizeProfile } from "../data/normalize";

export class ProfileError extends Error {
  code: "not_configured" | "unauthorized" | "unknown";
  constructor(code: ProfileError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

function requireClient() {
  if (!supabase) throw new ProfileError("not_configured");
  return supabase;
}

interface ProfileRow {
  data: UserProfile;
  updated_at: string;
}

/** The signed-in user's profile, or null when they have never saved one.
 *  Null is a real state, not an error: it is what a first-time visitor sees. */
export async function fetchProfile(): Promise<UserProfile | null> {
  const client = requireClient();
  const { data, error } = await client.from("profiles").select("data, updated_at").maybeSingle();
  if (error) throw new ProfileError("unknown", error.message);
  if (!data) return null;
  return normalizeProfile((data as ProfileRow).data);
}

/** One row per user, so every save is an upsert on the primary key. */
export async function saveProfile(userId: string, profile: UserProfile): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from("profiles")
    .upsert({ user_id: userId, data: profile }, { onConflict: "user_id" });
  if (error) throw new ProfileError("unknown", error.message);
}
