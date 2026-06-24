import { NextRequest, NextResponse } from "next/server";
import { getLocations, getRoom, addRoomImage } from "@/lib/repo/locations";
import { uploadFromUrl } from "@/lib/storage";
import { mysticGenerate, reframe, MagnificError, type Cam } from "@/lib/magnific";
import type { RoomImage } from "@/lib/locations";

export const runtime = "nodejs";
export const maxDuration = 300; // generation can take a couple of minutes

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const locId = String(body.locationId);
    const roomId = String(body.roomId);
    const room = await getRoom(locId, roomId);
    if (!room) {
      return NextResponse.json({ ok: false, error: "Unknown room" }, { status: 404 });
    }

    const id = `${roomId}-${Date.now().toString(36)}`;
    let hosted: string;
    let label: string;
    let cam: Cam | undefined;
    let base = false;

    if (body.kind === "room-base") {
      hosted = await mysticGenerate(room.prompt);
      label = "Establishing";
      base = room.images.length === 0;
    } else if (body.kind === "reframe") {
      const src = room.images.find((im) => im.id === String(body.baseImageId));
      const srcUrl = src?.remote || src?.u;
      if (!src || !srcUrl || srcUrl.startsWith("/")) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "This base image has no public URL to reframe from. Generate a fresh establishing shot first.",
          },
          { status: 400 }
        );
      }
      cam = {
        rotate: Number(body.cam?.rotate ?? 45),
        vertical: Number(body.cam?.vertical ?? 0),
        closeup: Number(body.cam?.closeup ?? 5),
      };
      hosted = await reframe(srcUrl, room.prompt, cam);
      label = String(body.label || "New angle");
    } else {
      return NextResponse.json({ ok: false, error: "unknown kind" }, { status: 400 });
    }

    // Re-host the (expiring) generator URL to permanent storage.
    const u = await uploadFromUrl(hosted, `locations/${locId}/${roomId}/${id}`);
    const img: RoomImage = { id, u, l: label, remote: u, base, ...(cam ? { cam } : {}) };
    await addRoomImage(locId, roomId, img);

    return NextResponse.json({ ok: true, image: img, locations: await getLocations() });
  } catch (e: unknown) {
    const msg =
      e instanceof MagnificError ? e.message : e instanceof Error ? e.message : "generate failed";
    const status = e instanceof MagnificError ? 400 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
