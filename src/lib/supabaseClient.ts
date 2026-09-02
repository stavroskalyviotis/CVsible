import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Google sign-in and cloud save are optional: without these env vars the app
// still works fully in local-only mode, it just never shows the auth UI.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const isCloudConfigured = supabase !== null;
