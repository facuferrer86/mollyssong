// Location Bible reads/writes against Postgres. Same function signatures and
// return shapes as the old lib/content.ts location helpers, so the API routes
// call them 1:1. The override-merge + "hidden defaults" machinery is gone:
// seeded rows ARE the source of truth, edited in place.
import { prisma } from "@/lib/db";
import type { Location, Room, RoomImage } from "@/lib/locations";

const ROOM_TEXT_FIELDS = [
  "name",
  "lighting",
  "sounds",
  "ambient",
  "furniture",
  "map",
  "prompt",
] as const;
type RoomTextField = (typeof ROOM_TEXT_FIELDS)[number];

type ImageRow = {
  id: string;
  u: string;
  l: string;
  cam: unknown;
  base: boolean;
  remote: string | null;
};

function toRoomImage(im: ImageRow): RoomImage {
  return {
    id: im.id,
    u: im.u,
    l: im.l,
    ...(im.cam ? { cam: im.cam as RoomImage["cam"] } : {}),
    ...(im.base ? { base: true } : {}),
    ...(im.remote ? { remote: im.remote } : {}),
  };
}

type RoomRow = {
  id: string;
  name: string;
  lighting: string;
  sounds: string;
  ambient: string;
  furniture: string;
  map: string;
  prompt: string;
  images: ImageRow[];
};

function toRoom(r: RoomRow): Room {
  return {
    id: r.id,
    name: r.name,
    lighting: r.lighting,
    sounds: r.sounds,
    ambient: r.ambient,
    furniture: r.furniture,
    map: r.map,
    prompt: r.prompt,
    images: r.images.map(toRoomImage),
  };
}

export async function getLocations(): Promise<Location[]> {
  const rows = await prisma.location.findMany({
    orderBy: { order: "asc" },
    include: {
      rooms: {
        orderBy: { order: "asc" },
        include: { images: { orderBy: { order: "asc" } } },
      },
    },
  });
  return rows.map((l) => ({
    id: l.id,
    name: l.name,
    zoneKey: l.zoneKey,
    color: l.color,
    summary: l.summary,
    rooms: l.rooms.map(toRoom),
  }));
}

export async function getRoom(locId: string, roomId: string): Promise<Room | null> {
  const r = await prisma.room.findUnique({
    where: { locationId_id: { locationId: locId, id: roomId } },
    include: { images: { orderBy: { order: "asc" } } },
  });
  return r ? toRoom(r) : null;
}

export async function setLocationSummary(locId: string, summary: string) {
  await prisma.location.update({ where: { id: locId }, data: { summary } });
  return getLocations();
}

export async function setRoomFields(
  locId: string,
  roomId: string,
  fields: Partial<Record<RoomTextField, string>>
) {
  const data: Partial<Record<RoomTextField, string>> = {};
  for (const k of ROOM_TEXT_FIELDS) {
    if (typeof fields[k] === "string") data[k] = fields[k];
  }
  await prisma.room.update({
    where: { locationId_id: { locationId: locId, id: roomId } },
    data,
  });
  return getLocations();
}

export async function addRoomImage(locId: string, roomId: string, img: RoomImage) {
  const room = await prisma.room.findUnique({
    where: { locationId_id: { locationId: locId, id: roomId } },
    include: { _count: { select: { images: true } } },
  });
  if (!room) throw new Error("Room not found");
  await prisma.roomImage.create({
    data: {
      id: img.id,
      roomPk: room.pk,
      u: img.u,
      l: img.l,
      cam: (img.cam as object) ?? undefined,
      base: !!img.base,
      remote: img.remote ?? null,
      order: room._count.images,
    },
  });
  return img;
}

export async function removeRoomImage(locId: string, roomId: string, imageId: string) {
  await prisma.roomImage.deleteMany({
    where: { id: imageId, room: { locationId: locId, id: roomId } },
  });
  return getLocations();
}
