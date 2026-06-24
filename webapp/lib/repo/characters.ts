// Character reads/writes against Postgres. Replaces the lib/data.ts CHARS
// constant + character-overrides.json merge. Returns the same Character shape
// the client already consumes.
import { prisma } from "@/lib/db";
import type { Character } from "@/lib/data";

export async function getCharacters(): Promise<Character[]> {
  const rows = await prisma.character.findMany({
    orderBy: { order: "asc" },
    include: { gallery: { orderBy: { order: "asc" } } },
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    img: c.img,
    gallery: c.gallery.map((g) => ({ u: g.u, l: g.l })),
    role: c.role,
    fields: (c.fields as Record<string, string>) ?? {},
    prompt: c.prompt,
  }));
}

// The client always sends the full fields object + prompt, so we replace
// wholesale (the old override-merge is gone — the row is the source of truth).
export async function updateCharacter(
  id: string,
  patch: { fields?: Record<string, string>; prompt?: string }
) {
  const data: { fields?: Record<string, string>; prompt?: string } = {};
  if (patch.fields) data.fields = patch.fields;
  if (typeof patch.prompt === "string") data.prompt = patch.prompt;
  await prisma.character.update({ where: { id }, data });
  return { id, ...data };
}
