// Minimal front-matter (YAML-subset) parse/serialize for the content/ mirror.
// A flat block of `key: value` scalar lines between --- fences, plus a free-form
// markdown body. Values with special characters are double-quoted (JSON-escaped);
// everything else is emitted bare. No nesting, no lists — structured/multi-line
// content lives in the body as `##` (and `###`) sections. Deliberately tiny so
// the sync scripts need no YAML dependency.

export type Frontmatter = Record<string, string>;

function needsQuote(v: string): boolean {
  return (
    v === "" ||
    /^[\s"'#]/.test(v) ||
    /\s$/.test(v) ||
    v.includes(": ") ||
    /:$/.test(v) ||
    v.includes("#") ||
    v.includes("\n")
  );
}

export function serializeFrontmatter(data: Frontmatter, body: string): string {
  const lines = Object.entries(data).map(([k, v]) => {
    const val = needsQuote(v) ? JSON.stringify(v) : v;
    return `${k}: ${val}`;
  });
  const fm = `---\n${lines.join("\n")}\n---\n`;
  const trimmed = body.replace(/^\n+/, "");
  return `${fm}\n${trimmed}${trimmed.endsWith("\n") ? "" : "\n"}`;
}

export function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const text = raw.replace(/^﻿/, "");
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return { data: {}, body: text };
  const data: Frontmatter = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.startsWith('"')) {
      try {
        val = JSON.parse(val) as string;
      } catch {
        /* keep raw */
      }
    }
    data[key] = val;
  }
  return { data, body: text.slice(m[0].length) };
}

export interface Section {
  key: string;
  value: string;
}

// Split a markdown body into an ordered list of `#`-level sections. Deeper
// headings (e.g. ### inside a ## section) stay inside their parent's value.
export function parseSections(body: string, level = 2): Section[] {
  const hashes = "#".repeat(level);
  const re = new RegExp(`^${hashes}\\s+(.+?)\\s*$`, "gm");
  const matches = [...body.matchAll(re)];
  const out: Section[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = (matches[i].index ?? 0) + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index ?? body.length : body.length;
    out.push({ key: matches[i][1].trim(), value: body.slice(start, end).trim() });
  }
  return out;
}

export function serializeSections(sections: Section[], level = 2): string {
  const hashes = "#".repeat(level);
  return sections.map((s) => `${hashes} ${s.key}\n\n${s.value}`).join("\n\n");
}
