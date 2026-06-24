import { NextRequest, NextResponse } from "next/server";
import { writeScene } from "@/lib/repo/scenes";
import { updateCharacter } from "@/lib/repo/characters";
import { setLocationSummary, setRoomFields, removeRoomImage } from "@/lib/repo/locations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.kind === "scene") {
      const saved = await writeScene(String(body.id), String(body.text ?? ""));
      return NextResponse.json({ ok: true, path: `Screenplay/${saved}` });
    }
    if (body.kind === "character") {
      const override = await updateCharacter(String(body.id), {
        fields: body.fields,
        prompt: body.prompt,
      });
      return NextResponse.json({ ok: true, override });
    }
    if (body.kind === "location-summary") {
      const locations = await setLocationSummary(String(body.locationId), String(body.summary ?? ""));
      return NextResponse.json({ ok: true, locations });
    }
    if (body.kind === "room-fields") {
      const locations = await setRoomFields(
        String(body.locationId),
        String(body.roomId),
        body.fields || {}
      );
      return NextResponse.json({ ok: true, locations });
    }
    if (body.kind === "room-image-remove") {
      const locations = await removeRoomImage(
        String(body.locationId),
        String(body.roomId),
        String(body.imageId)
      );
      return NextResponse.json({ ok: true, locations });
    }
    return NextResponse.json({ ok: false, error: "unknown kind" }, { status: 400 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "save failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
