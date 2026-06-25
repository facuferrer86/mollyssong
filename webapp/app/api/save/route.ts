import { NextRequest, NextResponse } from "next/server";
import { writeScene } from "@/lib/repo/scenes";
import { updateCharacter } from "@/lib/repo/characters";
import { setLocationSummary, setRoomFields, removeRoomImage } from "@/lib/repo/locations";
import { updateProject } from "@/lib/repo/project";
import { setBeatFunction } from "@/lib/repo/storyline";
import {
  upsertRelationship,
  deleteRelationship,
  setCharacterNode,
} from "@/lib/repo/relationships";
import {
  upsertShot,
  deleteShot,
  reorderShots,
  setShotTrailer,
  reorderTrailer,
} from "@/lib/repo/shots";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.kind === "scene") {
      const saved = await writeScene(String(body.id), String(body.text ?? ""));
      return NextResponse.json({ ok: true, path: `Screenplay/${saved}` });
    }
    if (body.kind === "project") {
      const project = await updateProject({
        logline: body.logline,
        theme: body.theme,
        worldRules: body.worldRules,
        forbids: body.forbids,
        structureTemplate: body.structureTemplate,
      });
      return NextResponse.json({ ok: true, project });
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
    if (body.kind === "relationship") {
      const relationships = await upsertRelationship(body.relationship || {});
      return NextResponse.json({ ok: true, relationships });
    }
    if (body.kind === "relationship-delete") {
      const relationships = await deleteRelationship(String(body.id));
      return NextResponse.json({ ok: true, relationships });
    }
    if (body.kind === "character-node") {
      await setCharacterNode(String(body.id), Number(body.mapX), Number(body.mapY));
      return NextResponse.json({ ok: true });
    }
    if (body.kind === "beat-function") {
      const beats = await setBeatFunction(
        String(body.id),
        body.beatFunction ? String(body.beatFunction) : null
      );
      return NextResponse.json({ ok: true, beats });
    }
    if (body.kind === "shot") {
      const shots = await upsertShot(body.shot);
      return NextResponse.json({ ok: true, shots });
    }
    if (body.kind === "shot-delete") {
      const shots = await deleteShot(String(body.pk));
      return NextResponse.json({ ok: true, shots });
    }
    if (body.kind === "shot-reorder") {
      const shots = await reorderShots(String(body.sceneId), body.order as string[]);
      return NextResponse.json({ ok: true, shots });
    }
    if (body.kind === "shot-trailer") {
      const shots = await setShotTrailer(String(body.pk), Boolean(body.inTrailer));
      return NextResponse.json({ ok: true, allShots: shots });
    }
    if (body.kind === "trailer-reorder") {
      const shots = await reorderTrailer(body.order as string[]);
      return NextResponse.json({ ok: true, allShots: shots });
    }
    return NextResponse.json({ ok: false, error: "unknown kind" }, { status: 400 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "save failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
