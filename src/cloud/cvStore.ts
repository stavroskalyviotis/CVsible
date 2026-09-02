import type { CvData } from "../types";
import { supabase } from "../lib/supabaseClient";

export const MAX_CVS_PER_USER = 10;

export type ApplicationStatus = "sent" | "interviewing" | "offer" | "rejected" | "no_response";

export interface ApplicationEntry {
  id: string;
  company: string;
  role: string;
  date: string;
  status: ApplicationStatus;
  note?: string;
  url?: string;
}

export interface CloudCv {
  id: string;
  name: string;
  data: CvData;
  isPublic: boolean;
  publicId: string | null;
  history: ApplicationEntry[];
  updatedAt: string;
  createdAt: string;
}

export class CloudCvError extends Error {
  code: "not_configured" | "limit_reached" | "unauthorized" | "not_found" | "unknown";
  constructor(code: CloudCvError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

function requireClient() {
  if (!supabase) throw new CloudCvError("not_configured");
  return supabase;
}

interface CvRow {
  id: string;
  name: string;
  data: CvData;
  is_public: boolean;
  public_id: string | null;
  history: ApplicationEntry[] | null;
  updated_at: string;
  created_at: string;
}

const CV_COLUMNS = "id, name, data, is_public, public_id, history, updated_at, created_at";

function fromRow(row: CvRow): CloudCv {
  return {
    id: row.id,
    name: row.name,
    data: row.data,
    isPublic: row.is_public,
    publicId: row.public_id,
    history: row.history ?? [],
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

export async function listCvs(): Promise<CloudCv[]> {
  const client = requireClient();
  const { data, error } = await client.from("cvs").select(CV_COLUMNS).order("updated_at", { ascending: false });
  if (error) throw new CloudCvError("unknown", error.message);
  return (data as CvRow[]).map(fromRow);
}

export async function createCv(userId: string, name: string, data: CvData): Promise<CloudCv> {
  const client = requireClient();
  const { data: row, error } = await client
    .from("cvs")
    .insert({ user_id: userId, name, data })
    .select(CV_COLUMNS)
    .single();
  if (error) {
    if (error.message.includes("cv_limit_reached")) throw new CloudCvError("limit_reached");
    throw new CloudCvError("unknown", error.message);
  }
  return fromRow(row as CvRow);
}

export async function updateCvHistory(id: string, history: ApplicationEntry[]): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("cvs").update({ history }).eq("id", id);
  if (error) throw new CloudCvError("unknown", error.message);
}

export async function updateCvData(id: string, data: CvData): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("cvs").update({ data }).eq("id", id);
  if (error) throw new CloudCvError("unknown", error.message);
}

export async function renameCv(id: string, name: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("cvs").update({ name }).eq("id", id);
  if (error) throw new CloudCvError("unknown", error.message);
}

export async function deleteCv(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("cvs").delete().eq("id", id);
  if (error) throw new CloudCvError("unknown", error.message);
}

export async function duplicateCv(userId: string, source: CloudCv, name: string): Promise<CloudCv> {
  return createCv(userId, name, source.data);
}

export async function setCvPublic(id: string, isPublic: boolean): Promise<string | null> {
  const client = requireClient();
  const publicId = isPublic ? crypto.randomUUID().replace(/-/g, "") : null;
  const { error } = await client.from("cvs").update({ is_public: isPublic, public_id: publicId }).eq("id", id);
  if (error) throw new CloudCvError("unknown", error.message);
  return publicId;
}

export interface PublicCvResult {
  name: string;
  data: CvData;
  updatedAt: string;
}

export async function fetchPublicCv(publicId: string): Promise<PublicCvResult | null> {
  const client = requireClient();
  const { data, error } = await client.rpc("get_public_cv", { lookup_id: publicId });
  if (error) throw new CloudCvError("unknown", error.message);
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return null;
  return { name: row.name, data: row.data, updatedAt: row.updated_at };
}
