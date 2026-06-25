// Storyline data (zones + beats) from Postgres. Replaces the ZONES/BEATS
// constants. getBeats rebuilds the per-beat `pos` map from BeatPosition rows.
import { prisma } from "@/lib/db";
import type { Beat, Zone } from "@/lib/data";

export async function getZones(): Promise<Record<string, Zone>> {
  const rows = await prisma.zone.findMany({ orderBy: { order: "asc" } });
  const out: Record<string, Zone> = {};
  for (const z of rows) out[z.key] = { label: z.label, x: z.x, y: z.y, w: z.w, h: z.h };
  return out;
}

export async function setBeatFunction(id: string, beatFunction: string | null): Promise<Beat[]> {
  await prisma.beat.update({ where: { id }, data: { beatFunction } });
  return getBeats();
}

export async function getBeats(): Promise<Beat[]> {
  const rows = await prisma.beat.findMany({
    orderBy: { order: "asc" },
    include: { positions: true },
  });
  return rows.map((b) => {
    const pos: Record<string, { z: string; s: string }> = {};
    for (const p of b.positions) pos[p.characterId] = { z: p.zoneKey, s: p.s };
    return {
      id: b.id,
      act: b.act,
      title: b.title,
      meta: b.meta,
      pos,
      links: (b.links as [string, string][]) ?? [],
      beatFunction: b.beatFunction,
    };
  });
}
