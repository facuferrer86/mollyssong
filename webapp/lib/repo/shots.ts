// Shot reads/writes against Postgres. A Shot belongs to a Scene and carries the
// camera spec + a generated keyframe. Same return-shape convention as the other
// repos so the API routes call them 1:1.
import { prisma } from "@/lib/db";

export interface Shot {
  pk: string;
  sceneId: string;
  order: number;
  title: string;
  description: string;
  shotSize: string;
  angle: string;
  movement: string;
  lens: string;
  lighting: string;
  durationSec: number | null;
  prompt: string;
  imageUrl: string;
  clipUrl: string | null;
  notes: string;
  inTrailer: boolean;
  trailerOrder: number | null;
}

type ShotRow = {
  pk: string;
  sceneId: string;
  order: number;
  title: string;
  description: string;
  shotSize: string;
  angle: string;
  movement: string;
  lens: string;
  lighting: string;
  durationSec: number | null;
  prompt: string;
  imageUrl: string;
  clipUrl: string | null;
  notes: string;
  inTrailer: boolean;
  trailerOrder: number | null;
};

function toDTO(r: ShotRow): Shot {
  return { ...r };
}

export async function getAllShots(): Promise<Shot[]> {
  const rows = await prisma.shot.findMany({ orderBy: [{ sceneId: "asc" }, { order: "asc" }] });
  return rows.map(toDTO);
}

export async function getShotsByScene(sceneId: string): Promise<Shot[]> {
  const rows = await prisma.shot.findMany({ where: { sceneId }, orderBy: { order: "asc" } });
  return rows.map(toDTO);
}

export async function getShot(pk: string): Promise<Shot | null> {
  const r = await prisma.shot.findUnique({ where: { pk } });
  return r ? toDTO(r) : null;
}

export interface ShotInput {
  pk?: string;
  sceneId: string;
  title?: string;
  description?: string;
  shotSize?: string;
  angle?: string;
  movement?: string;
  lens?: string;
  lighting?: string;
  durationSec?: number | null;
  prompt?: string;
  notes?: string;
}

const TEXT_FIELDS = [
  "title",
  "description",
  "shotSize",
  "angle",
  "movement",
  "lens",
  "lighting",
  "prompt",
  "notes",
] as const;

// Create (no pk) or update (pk) a shot, then return the scene's full shot list.
export async function upsertShot(input: ShotInput): Promise<Shot[]> {
  const data: Record<string, unknown> = {};
  for (const k of TEXT_FIELDS) {
    if (typeof input[k] === "string") data[k] = input[k];
  }
  if (input.durationSec === null || typeof input.durationSec === "number") {
    data.durationSec = input.durationSec;
  }

  if (input.pk) {
    await prisma.shot.update({ where: { pk: input.pk }, data });
  } else {
    const order = await prisma.shot.count({ where: { sceneId: input.sceneId } });
    await prisma.shot.create({
      data: { sceneId: input.sceneId, order, ...data },
    });
  }
  return getShotsByScene(input.sceneId);
}

export async function deleteShot(pk: string): Promise<Shot[]> {
  const shot = await prisma.shot.findUnique({ where: { pk } });
  if (!shot) return [];
  await prisma.shot.delete({ where: { pk } });
  return getShotsByScene(shot.sceneId);
}

// Persist a new ordering for a scene's shots (pks in the desired order).
export async function reorderShots(sceneId: string, pks: string[]): Promise<Shot[]> {
  await prisma.$transaction(
    pks.map((pk, i) => prisma.shot.update({ where: { pk }, data: { order: i } }))
  );
  return getShotsByScene(sceneId);
}

export async function setShotImage(pk: string, imageUrl: string): Promise<Shot | null> {
  const r = await prisma.shot.update({ where: { pk }, data: { imageUrl } });
  return toDTO(r);
}

// Toggle a shot's membership in the trailer cut. When adding, it lands at the
// end of the current trailer ordering.
export async function setShotTrailer(
  pk: string,
  inTrailer: boolean,
  trailerOrder?: number | null
): Promise<Shot[]> {
  let order = trailerOrder ?? null;
  if (inTrailer && order == null) {
    order = await prisma.shot.count({ where: { inTrailer: true } });
  }
  await prisma.shot.update({
    where: { pk },
    data: { inTrailer, trailerOrder: inTrailer ? order : null },
  });
  return getAllShots();
}

// Persist a new ordering for the trailer cut (pks in the desired order).
export async function reorderTrailer(pks: string[]): Promise<Shot[]> {
  await prisma.$transaction(
    pks.map((pk, i) => prisma.shot.update({ where: { pk }, data: { trailerOrder: i } }))
  );
  return getAllShots();
}
