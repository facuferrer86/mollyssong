// Screenplay scenes from Postgres. Replaces the filesystem getScenes/writeScene
// in lib/content.ts. Empty-act placeholders are synthesized at read time (there
// is no DB row for them); the first save of a placeholder creates the row.
import { prisma } from "@/lib/db";
import type { Scene } from "@/lib/content";

const ACT_ORDER = [
  "Act_I_Growing_Up",
  "Act_II_The_Discovery",
  "Act_III_The_Escape",
  "Act_IV_The_Revelation",
  "Act_V_The_Sacrifice",
];

function pretty(folder: string) {
  const parts = folder.split("_");
  const act = parts[1] ? `Act ${parts[1]}` : folder;
  const rest = parts.slice(2).join(" ");
  return rest ? `${act} — ${rest}` : act;
}

function titleFromFile(file: string) {
  const base = file.replace(/\.md$/i, "");
  const parts = base.split("_");
  if (parts[0]?.toLowerCase() === "scene" && parts[1]) {
    const num = parts[1];
    const rest = parts.slice(2).join(" ");
    return rest ? `Scene ${num} — ${rest}` : `Scene ${num}`;
  }
  return base.replace(/_/g, " ");
}

function actRank(actKey: string) {
  const i = ACT_ORDER.indexOf(actKey);
  return i === -1 ? 99 : i;
}

export async function getScenes(): Promise<Scene[]> {
  const rows = await prisma.scene.findMany();
  rows.sort(
    (a, b) => actRank(a.actKey) - actRank(b.actKey) || a.order - b.order || a.slug.localeCompare(b.slug)
  );

  const out: Scene[] = [];
  const actsSeen = new Set<string>();
  for (const s of rows) {
    actsSeen.add(s.actKey);
    out.push({ id: s.id, act: s.act, title: s.title, text: s.text });
  }
  // Canonical acts with no scenes yet get a placeholder to write into.
  for (const actKey of ACT_ORDER) {
    if (actsSeen.has(actKey)) continue;
    out.push({
      id: `${actKey}/Scene_01_Untitled.md`,
      act: pretty(actKey),
      title: "Scene 1 — (to write)",
      text: "",
      empty: true,
    });
  }
  // Keep canonical act order; placeholders land at their act's position.
  out.sort((a, b) => {
    const ak = a.id.split("/")[0];
    const bk = b.id.split("/")[0];
    return actRank(ak) - actRank(bk);
  });
  return out;
}

export async function writeScene(id: string, text: string): Promise<string> {
  // id is a relative path like "Act_I_Growing_Up/Scene_01_The_Lullaby.md".
  const safe = id.replace(/^[/\\]+/, "").replace(/\.\.[/\\]/g, "");
  const [actKey, ...rest] = safe.split("/");
  const slug = rest.join("/") || safe;
  const act = pretty(actKey);
  const title = titleFromFile(slug);

  const existing = await prisma.scene.findUnique({ where: { id: safe } });
  const order = existing
    ? existing.order
    : await prisma.scene.count({ where: { actKey } });

  await prisma.scene.upsert({
    where: { id: safe },
    update: { text, act, title },
    create: { id: safe, act, actKey, title, slug, text, order },
  });
  return safe;
}
