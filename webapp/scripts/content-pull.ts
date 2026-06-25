// content:pull — snapshot the canon from Postgres (Supabase) into the git-tracked
// content/ JSON mirror at the repo root. READ-ONLY against the DB.
//
// The content/ mirror is a CLAUDE-CODE-FACING working copy of the data — not for
// humans (humans use the website). It is a faithful, lossless JSON dump so Claude
// can read/edit canon as files and push changes back. App-managed fields (image
// URLs, gallery, room renders) are included under "_readonly" for context but are
// IGNORED by content:push — they are owned by the app/DB.
//
// Run before editing canon with Claude, or after editing in the app, to refresh.
// Companion: content-push.ts.
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const ROOT = path.resolve(process.cwd(), "..", "content");

function writeJson(rel: string, data: unknown) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function pullCharacters(): Promise<number> {
  const chars = await prisma.character.findMany({
    orderBy: { order: "asc" },
    include: { gallery: { orderBy: { order: "asc" } } },
  });
  for (const c of chars) {
    writeJson(`characters/${c.id}.json`, {
      id: c.id,
      name: c.name,
      color: c.color,
      role: c.role,
      fields: c.fields ?? {},
      prompt: c.prompt,
      order: c.order,
      _readonly: {
        img: c.img,
        gallery: c.gallery.map((g) => ({ u: g.u, l: g.l })),
        mapX: c.mapX,
        mapY: c.mapY,
      },
    });
  }
  return chars.length;
}

async function pullScenes(): Promise<number> {
  const scenes = await prisma.scene.findMany({ orderBy: [{ actKey: "asc" }, { order: "asc" }] });
  for (const s of scenes) {
    // id is "<actKey>/<slug>"; mirror the folder structure, strip .md for the filename.
    const file = `scenes/${s.actKey}/${s.slug.replace(/\.md$/i, "")}.json`;
    writeJson(file, {
      id: s.id,
      actKey: s.actKey,
      slug: s.slug,
      act: s.act,
      title: s.title,
      order: s.order,
      text: s.text,
    });
  }
  return scenes.length;
}

async function pullLocations(): Promise<number> {
  const locs = await prisma.location.findMany({
    orderBy: { order: "asc" },
    include: {
      rooms: { orderBy: { order: "asc" }, include: { images: { orderBy: { order: "asc" } } } },
    },
  });
  for (const l of locs) {
    writeJson(`locations/${l.id}.json`, {
      id: l.id,
      name: l.name,
      zoneKey: l.zoneKey,
      color: l.color,
      order: l.order,
      summary: l.summary,
      rooms: l.rooms.map((r) => ({
        id: r.id,
        name: r.name,
        lighting: r.lighting,
        sounds: r.sounds,
        ambient: r.ambient,
        furniture: r.furniture,
        map: r.map,
        prompt: r.prompt,
        _readonly: {
          images: r.images.map((im) => ({ id: im.id, l: im.l, u: im.u, base: im.base })),
        },
      })),
    });
  }
  return locs.length;
}

async function pullBeats(): Promise<number> {
  const beats = await prisma.beat.findMany({ orderBy: { order: "asc" }, include: { positions: true } });
  writeJson(
    "beats.json",
    beats.map((b) => ({
      id: b.id,
      act: b.act,
      title: b.title,
      meta: b.meta,
      order: b.order,
      beatFunction: b.beatFunction,
      _readonly: {
        links: b.links ?? [],
        positions: b.positions.map((p) => ({ characterId: p.characterId, zoneKey: p.zoneKey, s: p.s })),
      },
    }))
  );
  return beats.length;
}

async function pullRelationships(): Promise<number> {
  const rels = await prisma.relationship.findMany({ orderBy: { order: "asc" } });
  writeJson(
    "relationships.json",
    rels.map((r) => ({
      id: r.id,
      fromId: r.fromId,
      toId: r.toId,
      type: r.type,
      label: r.label,
      order: r.order,
    }))
  );
  return rels.length;
}

async function pullProject(): Promise<void> {
  const p = await prisma.project.findUnique({ where: { id: "molly" } });
  writeJson("project.json", {
    id: "molly",
    logline: p?.logline ?? "",
    theme: p?.theme ?? "",
    worldRules: Array.isArray(p?.worldRules) ? p?.worldRules : [],
    forbids: Array.isArray(p?.forbids) ? p?.forbids : [],
    structureTemplate: p?.structureTemplate ?? null,
  });
}

async function main() {
  const chars = await pullCharacters();
  const scenes = await pullScenes();
  const locs = await pullLocations();
  const beats = await pullBeats();
  const rels = await pullRelationships();
  await pullProject();
  console.log(
    `content:pull → ${chars} characters, ${scenes} scenes, ${locs} locations, ${beats} beats, ${rels} relationships, 1 project written to content/.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
