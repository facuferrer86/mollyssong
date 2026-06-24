// Server-only bridge to Supabase Storage. Replaces the old local-filesystem
// image persistence (public/renders, public/locations) so the app works on a
// hosted/serverless deploy with no writable disk.
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // admin-grade, server-only
const BUCKET = process.env.STORAGE_BUCKET || "renders";

export function storageConfigured(): boolean {
  return !!(URL && KEY);
}

function client() {
  if (!URL || !KEY) {
    throw new Error(
      "Supabase storage not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
    );
  }
  return createClient(URL, KEY, { auth: { persistSession: false } });
}

function extFor(contentType: string, url: string): string {
  if (/png/i.test(contentType) || /\.png(\?|$)/i.test(url)) return "png";
  if (/webp/i.test(contentType) || /\.webp(\?|$)/i.test(url)) return "webp";
  return "jpg";
}

// Download a (possibly expiring) source URL and re-host it in the bucket under
// `${keyPrefix}.<ext>`. Returns the permanent public URL.
export async function uploadFromUrl(srcUrl: string, keyPrefix: string): Promise<string> {
  const res = await fetch(srcUrl);
  if (!res.ok) throw new Error(`Could not download image (${res.status})`);
  const contentType = res.headers.get("content-type") || "";
  const bytes = Buffer.from(await res.arrayBuffer());
  const key = `${keyPrefix}.${extFor(contentType, srcUrl)}`;

  const sb = client();
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(key, bytes, { contentType: contentType || undefined, upsert: true });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  return sb.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
}
