// Maps a remote Pikaso CDN url to a stable local path under /public/renders.
// The save-images script writes files using the same scheme, so once it runs,
// the app serves local copies that never expire.

export function prodId(url: string): string | null {
  const m = url.match(/production\/(\d+)\//);
  return m ? m[1] : null;
}

export function localFor(url: string): string | null {
  const id = prodId(url);
  if (!id) return null;
  const ext = /\.png(\?|$)/i.test(url) ? "png" : "jpg";
  return `/renders/${id}.${ext}`;
}
