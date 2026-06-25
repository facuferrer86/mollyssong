// content:push — apply edits from the content/ JSON mirror back into Postgres
// (Supabase). Non-destructive: upserts by id and writes ONLY the editable text
// columns. App-managed fields (image URLs, gallery, room renders, beat positions,
// camera data) are never touched — anything under "_readonly" in the JSON is
// ignored. Companion: content-pull.ts.
//
// Workflow rule (single editing surface per session): edit JSON with Claude →
// content:push; or edit in the app → content:pull to refresh the JSON. Git is the
// safety net.
import { PrismaClient, Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const ROOT = path.resolve(process.cwd(), "..", "content");

type Row = Record<string, unknown>;
const str = (v: unknown, d = ""): string => (typeof v === "string" ? v : d);
const num = (v: unknown, d = 0): number => (typeof v === "number" && Number.isFinite(v) ? v : d);
const obj = (v: unknown): Row => (v && typeof v === "object" && !Array.isArray(v) ? (v as Row) : {});
const list = (v: unknown): Row[] => (Array.isArray(v) ? (v as Row[]) : []);
const strs = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

function readJsonRecords(dir: string): Row[] {
  const base = path.join(ROOT, dir);
  if (!fs.existsSync(base)) return [];
  const out: Row[] = [];
  const walk = (d: string) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith(".json")) out.push(JSON.parse(fs.readFileSync(p, "utf8")) as Row);
    }
  };
  walk(base);
  return out;
}

async function pushCharacters(): Promise<number> {
  let n = 0;
  for (const c of readJsonRecords("characters")) {
    const id = str(c.id);
    if (!id) continue;
    const data = {
      name: str(c.name),
      color: str(c.color),
      role: str(c.role),
      fields: obj(c.fields) as unknown as Prisma.InputJsonValue,
      prompt: str(c.prompt),
      order: num(c.order),
    };
    const existing = await prisma.character.findUnique({ where: { id } });
    if (existing) {
      await prisma.character.update({ where: { id }, data });
    } else {
      // New character authored as a file: img is app-managed, default empty.
      await prisma.character.create({ data: { id, img: str(obj(c._readonly).img), ...data } });
    }
    n++;
  }
  return n;
}

async function pushScenes(): Promise<number> {
  let n = 0;
  for (const s of readJsonRecords("scenes")) {
    const id = str(s.id);
    if (!id) continue;
    const actKey = str(s.actKey) || id.split("/")[0];
    const slug = str(s.slug) || id.split("/").slice(1).join("/");
    const fields = {
      act: str(s.act),
      title: str(s.title),
      text: str(s.text),
      order: num(s.order),
    };
    await prisma.scene.upsert({
      where: { id },
      update: fields,
      create: { id, actKey, slug, ...fields },
    });
    n++;
  }
  return n;
}

async function pushLocations(): Promise<number> {
  let n = 0;
  for (const l of readJsonRecords("locations")) {
    const id = str(l.id);
    if (!id) continue;
    const loc = await prisma.location.findUnique({ where: { id } });
    if (!loc) continue; // locations are structural — don't create from files
    await prisma.location.update({
      where: { id },
      data: { name: str(l.name, loc.name), summary: str(l.summary) },
    });
    for (const r of list(l.rooms)) {
      const roomId = str(r.id);
      if (!roomId) continue;
      await prisma.room.updateMany({
        where: { locationId: id, id: roomId },
        data: {
          name: str(r.name),
          lighting: str(r.lighting),
          sounds: str(r.sounds),
          ambient: str(r.ambient),
          furniture: str(r.furniture),
          map: str(r.map),
          prompt: str(r.prompt),
        },
      });
    }
    n++;
  }
  return n;
}

async function pushBeats(): Promise<number> {
  const file = path.join(ROOT, "beats.json");
  if (!fs.existsSync(file)) return 0;
  const arr = JSON.parse(fs.readFileSync(file, "utf8")) as Row[];
  let n = 0;
  for (const b of arr) {
    const id = str(b.id);
    if (!id) continue;
    const existing = await prisma.beat.findUnique({ where: { id } });
    if (!existing) continue; // beats are structural — don't create from a file
    await prisma.beat.update({
      where: { id },
      data: {
        act: str(b.act, existing.act),
        title: str(b.title, existing.title),
        meta: str(b.meta, existing.meta),
        order: num(b.order, existing.order),
        beatFunction: typeof b.beatFunction === "string" && b.beatFunction ? b.beatFunction : null,
      },
    });
    n++;
  }
  return n;
}

async function pushRelationships(): Promise<number> {
  const file = path.join(ROOT, "relationships.json");
  if (!fs.existsSync(file)) return 0;
  const arr = JSON.parse(fs.readFileSync(file, "utf8")) as Row[];
  let n = 0;
  for (const r of arr) {
    const fromId = str(r.fromId);
    const toId = str(r.toId);
    if (!fromId || !toId) continue;
    const data = { fromId, toId, type: str(r.type), label: str(r.label), order: num(r.order) };
    const id = str(r.id);
    if (id) {
      const exists = await prisma.relationship.findUnique({ where: { id } });
      if (exists) await prisma.relationship.update({ where: { id }, data });
      else await prisma.relationship.create({ data: { id, ...data } });
    } else {
      await prisma.relationship.create({ data });
    }
    n++;
  }
  return n;
}

async function pushProject(): Promise<number> {
  const file = path.join(ROOT, "project.json");
  if (!fs.existsSync(file)) return 0;
  const p = JSON.parse(fs.readFileSync(file, "utf8")) as Row;
  const data = {
    logline: str(p.logline),
    theme: str(p.theme),
    worldRules: strs(p.worldRules) as unknown as Prisma.InputJsonValue,
    forbids: strs(p.forbids) as unknown as Prisma.InputJsonValue,
    structureTemplate: typeof p.structureTemplate === "string" ? p.structureTemplate : null,
  };
  await prisma.project.upsert({ where: { id: "molly" }, update: data, create: { id: "molly", ...data } });
  return 1;
}

async function main() {
  const chars = await pushCharacters();
  const scenes = await pushScenes();
  const locs = await pushLocations();
  const beats = await pushBeats();
  const rels = await pushRelationships();
  const proj = await pushProject();
  console.log(
    `content:push → ${chars} characters, ${scenes} scenes, ${locs} locations, ${beats} beats, ${rels} relationships, ${proj} project applied to the DB.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
