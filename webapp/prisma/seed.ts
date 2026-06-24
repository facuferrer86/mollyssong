// One-time importer: current TS defaults + Screenplay markdown + any override
// JSON -> Postgres. Idempotent in the sense that it WIPES and re-inserts, so
// re-running resets all data to defaults (don't run against a DB with edits you
// want to keep). Run via `npm run db:seed`.
//
// Image rescue: if Supabase is configured (SUPABASE_URL + SERVICE_ROLE_KEY),
// every character/gallery/room image is downloaded and re-hosted to permanent
// storage. Without it, the original (expiring!) URLs are kept — run again with
// Supabase set before the Pikaso tokens expire 2026-06-27.
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { CHARS, BEATS, ZONES } from "../lib/data";
import { LOCATIONS } from "../lib/locations";
import { storageConfigured, uploadFromUrl } from "../lib/storage";
import { prodId } from "../lib/images";

const prisma = new PrismaClient();

const ACT_ORDER = [
  "Act_I_Growing_Up",
  "Act_II_The_Discovery",
  "Act_III_The_Escape",
  "Act_IV_The_Revelation",
  "Act_V_The_Sacrifice",
];
const actRank = (k: string) => (ACT_ORDER.indexOf(k) === -1 ? 99 : ACT_ORDER.indexOf(k));
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readOverrides(name: string): any {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", name), "utf8"));
  } catch {
    return {};
  }
}

async function hostImage(srcUrl: string, keyPrefix: string): Promise<string> {
  if (!storageConfigured()) return srcUrl;
  try {
    return await uploadFromUrl(srcUrl, keyPrefix);
  } catch (e) {
    console.warn(`  ! image rescue failed (${keyPrefix}): ${(e as Error).message}`);
    return srcUrl;
  }
}

async function main() {
  console.log(
    storageConfigured()
      ? "Seeding (rescuing images to Supabase Storage)…"
      : "Seeding (NO Supabase configured — keeping original image URLs)…"
  );

  // Wipe in FK-safe order.
  await prisma.beatPosition.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.roomImage.deleteMany();
  await prisma.room.deleteMany();
  await prisma.location.deleteMany();
  await prisma.scene.deleteMany();
  await prisma.beat.deleteMany();
  await prisma.character.deleteMany();
  await prisma.zone.deleteMany();

  // Zones
  const zoneKeys = Object.keys(ZONES);
  for (let i = 0; i < zoneKeys.length; i++) {
    const z = ZONES[zoneKeys[i]];
    await prisma.zone.create({
      data: { key: zoneKeys[i], label: z.label, x: z.x, y: z.y, w: z.w, h: z.h, order: i },
    });
  }

  // Characters (+ gallery), with image rescue
  const charOv = readOverrides("character-overrides.json");
  for (let i = 0; i < CHARS.length; i++) {
    const c = CHARS[i];
    const ov = charOv[c.id] || {};
    const fields = { ...c.fields, ...(ov.fields || {}) };
    const prompt = ov.prompt !== undefined ? ov.prompt : c.prompt;
    const img = await hostImage(c.img, `characters/${prodId(c.img) || c.id}`);
    await prisma.character.create({
      data: { id: c.id, name: c.name, color: c.color, img, role: c.role, fields, prompt, order: i },
    });
    for (let g = 0; g < c.gallery.length; g++) {
      const gi = c.gallery[g];
      const u = await hostImage(gi.u, `characters/${prodId(gi.u) || `${c.id}-${g}`}`);
      await prisma.galleryImage.create({ data: { characterId: c.id, u, l: gi.l, order: g } });
    }
  }

  // Beats (+ positions)
  for (let i = 0; i < BEATS.length; i++) {
    const b = BEATS[i];
    const id = `beat-${i}`;
    await prisma.beat.create({
      data: { id, act: b.act, title: b.title, meta: b.meta, links: b.links, order: i },
    });
    for (const charId of Object.keys(b.pos)) {
      const p = b.pos[charId];
      await prisma.beatPosition.create({
        data: { beatId: id, characterId: charId, zoneKey: p.z, s: p.s },
      });
    }
  }

  // Locations (+ rooms + images), applying any location overrides
  const locOv = readOverrides("location-overrides.json");
  for (let li = 0; li < LOCATIONS.length; li++) {
    const loc = LOCATIONS[li];
    const lo = locOv[loc.id] || {};
    await prisma.location.create({
      data: {
        id: loc.id,
        name: loc.name,
        zoneKey: loc.zoneKey,
        color: loc.color,
        summary: lo.summary ?? loc.summary,
        order: li,
      },
    });
    for (let ri = 0; ri < loc.rooms.length; ri++) {
      const room = loc.rooms[ri];
      const ro = (lo.rooms || {})[room.id] || {};
      const f = ro.fields || {};
      const created = await prisma.room.create({
        data: {
          id: room.id,
          locationId: loc.id,
          name: f.name ?? room.name,
          lighting: f.lighting ?? room.lighting,
          sounds: f.sounds ?? room.sounds,
          ambient: f.ambient ?? room.ambient,
          furniture: f.furniture ?? room.furniture,
          map: f.map ?? room.map,
          prompt: f.prompt ?? room.prompt,
          order: ri,
        },
      });
      const hidden = new Set<string>(ro.hidden || []);
      const allImgs = [...room.images.filter((im) => !hidden.has(im.id)), ...(ro.images || [])];
      for (let ii = 0; ii < allImgs.length; ii++) {
        const im = allImgs[ii];
        const u = await hostImage(im.u, `locations/${loc.id}/${room.id}/${im.id}`);
        await prisma.roomImage.create({
          data: {
            id: im.id,
            roomPk: created.pk,
            u,
            l: im.l,
            cam: im.cam ?? undefined,
            base: !!im.base,
            remote: u, // u is a public URL, suitable as the reframe source
            order: ii,
          },
        });
      }
    }
  }

  // Scenes from the archived Screenplay markdown (act subfolders only).
  const screenplay = path.resolve(process.cwd(), "..", "archive", "Screenplay");
  let folders: string[] = [];
  try {
    folders = fs
      .readdirSync(screenplay, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    /* no Screenplay dir */
  }
  folders.sort((a, b) => actRank(a) - actRank(b) || a.localeCompare(b));
  let sceneCount = 0;
  for (const folder of folders) {
    const dir = path.join(screenplay, folder);
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".md"))
      .sort();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = fs.readFileSync(path.join(dir, file), "utf8");
      await prisma.scene.create({
        data: {
          id: `${folder}/${file}`,
          act: pretty(folder),
          actKey: folder,
          title: titleFromFile(file),
          slug: file,
          text,
          order: i,
        },
      });
      sceneCount++;
    }
  }

  const [chars, beats, zones, locs, rooms, scenes] = await Promise.all([
    prisma.character.count(),
    prisma.beat.count(),
    prisma.zone.count(),
    prisma.location.count(),
    prisma.room.count(),
    prisma.scene.count(),
  ]);
  console.log(
    `Done: ${chars} characters, ${beats} beats, ${zones} zones, ${locs} locations, ${rooms} rooms, ${scenes} scenes (${sceneCount} from markdown).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
