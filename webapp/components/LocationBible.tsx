"use client";
import { useRef, useState } from "react";
import type { Location, Room, RoomImage } from "@/lib/locations";
import Img from "./Img";
import { toast } from "./toast";

const SENSORY: { key: keyof Room; label: string; rows: number }[] = [
  { key: "lighting", label: "Lighting", rows: 2 },
  { key: "sounds", label: "Sounds", rows: 2 },
  { key: "ambient", label: "Ambient / Mood", rows: 2 },
  { key: "furniture", label: "Furniture", rows: 2 },
  { key: "map", label: "Small Map / Layout", rows: 2 },
];

// Lightweight client-side echo of lib/magnific.camInstruction, just for the
// preview line under the sliders. The real prompt is built server-side.
function camHint(rotate: number, vertical: number, closeup: number) {
  const r = ((rotate % 360) + 360) % 360;
  let turn = "same direction";
  if (r >= 15 && r <= 345) {
    if (r <= 180) turn = `${Math.round(r)}° right`;
    else turn = `${Math.round(360 - r)}° left`;
  }
  const height = vertical <= -10 ? "low angle" : vertical >= 60 ? "overhead" : vertical >= 25 ? "elevated" : "eye level";
  const dist = closeup >= 8 ? "tight close-up" : closeup >= 6 ? "closer" : closeup <= 2 ? "wide" : "medium";
  return `${turn} · ${height} · ${dist}`;
}

export default function LocationBible({ initial }: { initial: Location[] }) {
  const [locs, setLocs] = useState<Location[]>(initial);
  const [locId, setLocId] = useState(initial[0]?.id ?? "");
  const [roomId, setRoomId] = useState(initial[0]?.rooms[0]?.id ?? "");
  const [heroId, setHeroId] = useState<string | null>(null);
  const [cam, setCam] = useState({ rotate: 45, vertical: 0, closeup: 5 });
  const [angleLabel, setAngleLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const loc = locs.find((l) => l.id === locId) ?? locs[0];
  const room = loc?.rooms.find((r) => r.id === roomId) ?? loc?.rooms[0];
  const hero: RoomImage | undefined =
    room?.images.find((im) => im.id === heroId) ??
    room?.images.find((im) => im.base) ??
    room?.images[0];
  const canReframe = !!hero && !(hero.remote || hero.u).startsWith("/");

  function pickLocation(id: string) {
    setLocId(id);
    setRoomId(locs.find((l) => l.id === id)?.rooms[0]?.id ?? "");
    setHeroId(null);
  }
  function pickRoom(id: string) {
    setRoomId(id);
    setHeroId(null);
  }

  // --- text edits (debounced, like Characters) ---------------------------
  function queueSave(key: string, fn: () => Promise<Response>) {
    clearTimeout(saveTimers.current[key]);
    saveTimers.current[key] = setTimeout(async () => {
      try {
        const r = await fn();
        if (!r.ok) throw new Error();
        toast("Saved to project");
      } catch {
        toast("Save failed");
      }
    }, 600);
  }

  function editRoomField(key: keyof Room, value: string) {
    if (!loc || !room) return;
    setLocs((prev) =>
      prev.map((l) =>
        l.id !== loc.id
          ? l
          : { ...l, rooms: l.rooms.map((rm) => (rm.id === room.id ? { ...rm, [key]: value } : rm)) }
      )
    );
    queueSave(`${loc.id}/${room.id}`, () =>
      fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "room-fields",
          locationId: loc.id,
          roomId: room.id,
          fields: { [key]: value },
        }),
      })
    );
  }

  function editSummary(value: string) {
    if (!loc) return;
    setLocs((prev) => prev.map((l) => (l.id === loc.id ? { ...l, summary: value } : l)));
    queueSave(`${loc.id}/summary`, () =>
      fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "location-summary", locationId: loc.id, summary: value }),
      })
    );
  }

  // --- generation --------------------------------------------------------
  async function generate(payload: Record<string, unknown>, okMsg: string) {
    if (!loc || !room || busy) return;
    setBusy(true);
    toast("Generating…");
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId: loc.id, roomId: room.id, ...payload }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Generation failed");
      setLocs(data.locations);
      setHeroId(data.image.id);
      toast(okMsg);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  const genEstablishing = () => generate({ kind: "room-base" }, "Establishing shot ready");
  const genAngle = () =>
    generate(
      { kind: "reframe", baseImageId: hero?.id, cam, label: angleLabel || "New angle" },
      "New angle ready"
    );

  async function removeImage(imageId: string) {
    if (!loc || !room) return;
    try {
      const r = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "room-image-remove", locationId: loc.id, roomId: room.id, imageId }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error();
      setLocs(data.locations);
      setHeroId(null);
      toast("Removed");
    } catch {
      toast("Remove failed");
    }
  }

  function copyPrompt() {
    if (!room) return;
    navigator.clipboard.writeText(room.prompt);
    toast("Prompt copied");
  }

  if (!loc || !room) return <div className="muted">No locations defined.</div>;

  const angleCount = room.images.length;

  return (
    <div>
      <h2 className="section">Location Bible — rooms, atmosphere &amp; angles</h2>
      <div className="banner">
        Each location holds rooms; each room carries its lighting, sounds, ambient, furniture and a
        small map, plus a gallery of angles. Generate an establishing shot, then move the camera to
        capture new angles. Edits and renders save to your project.
      </div>

      {/* Location picker */}
      <div className="legend" style={{ marginBottom: 18 }}>
        {locs.map((l) => (
          <div
            key={l.id}
            className={"lg" + (l.id === loc.id ? " on" : "")}
            onClick={() => pickLocation(l.id)}
          >
            <span className="d" style={{ background: l.color }} />
            {l.name}
            <span className="muted" style={{ fontSize: 11 }}>
              · {l.rooms.length}
            </span>
          </div>
        ))}
      </div>

      <div className="script-layout">
        {/* Room list + location summary */}
        <div className="scenelist">
          <div className="actname">{loc.name}</div>
          <div style={{ padding: "11px 14px", borderTop: "1px solid var(--line)" }}>
            <textarea
              className="summary-edit"
              rows={4}
              value={loc.summary}
              onChange={(e) => editSummary(e.target.value)}
            />
          </div>
          <div className="actname">Rooms</div>
          {loc.rooms.map((rm) => (
            <div
              key={rm.id}
              className={"scene" + (rm.id === room.id ? " active" : "")}
              onClick={() => pickRoom(rm.id)}
            >
              {rm.name}
              <span className="muted" style={{ fontSize: 11, marginLeft: 6 }}>
                {rm.images.length || "—"}
              </span>
            </div>
          ))}
        </div>

        {/* Room detail */}
        <div className="roomview">
          <div className="roommedia">
            <div className="heroBox">
              {hero ? (
                <Img
                  src={hero.u}
                  alt={hero.l}
                  title="Click to open full image in a new tab"
                  onClick={() => window.open(hero.u, "_blank")}
                />
              ) : (
                <div className="emptyhero muted">
                  No renders yet.
                  <br />
                  Generate an establishing shot to begin.
                </div>
              )}
            </div>

            {angleCount > 0 && (
              <div className="gallery">
                {room.images.map((g) => (
                  <div
                    key={g.id}
                    className={"g" + (g.id === hero?.id ? " sel" : "")}
                    onClick={() => setHeroId(g.id)}
                  >
                    <Img src={g.u} loading="lazy" alt={g.l} />
                    <div className="gl">
                      {g.base ? "★ " : ""}
                      {g.l}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Camera controls */}
            <div className="camctl">
              <div className="camhead">
                <b>Camera</b>
                <span className="muted">{camHint(cam.rotate, cam.vertical, cam.closeup)}</span>
              </div>
              <div className="camrow">
                <label>Rotate</label>
                <input type="range" min={0} max={360} value={cam.rotate} onChange={(e) => setCam({ ...cam, rotate: +e.target.value })} />
                <span>{cam.rotate}°</span>
              </div>
              <div className="camrow">
                <label>Vertical</label>
                <input type="range" min={-30} max={90} value={cam.vertical} onChange={(e) => setCam({ ...cam, vertical: +e.target.value })} />
                <span>{cam.vertical}°</span>
              </div>
              <div className="camrow">
                <label>Closeup</label>
                <input type="range" min={0} max={10} value={cam.closeup} onChange={(e) => setCam({ ...cam, closeup: +e.target.value })} />
                <span>{cam.closeup}</span>
              </div>
              <input
                className="anglelabel"
                placeholder="Angle name (e.g. Door POV)"
                value={angleLabel}
                onChange={(e) => setAngleLabel(e.target.value)}
              />
              <div className="cambtns">
                <button className="btn" disabled={busy} onClick={genEstablishing}>
                  {busy ? "Working…" : "Generate establishing shot"}
                </button>
                <button
                  className="btn primary"
                  disabled={busy || !canReframe}
                  title={canReframe ? "" : "Generate an establishing shot first"}
                  onClick={genAngle}
                >
                  Move camera → new angle
                </button>
                {hero && (
                  <button className="btn" disabled={busy} onClick={() => removeImage(hero.id)}>
                    Remove shown
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sensory bible */}
          <div className="roomfields">
            <div className="field">
              <label>Room name</label>
              <input value={room.name} onChange={(e) => editRoomField("name", e.target.value)} />
            </div>
            {SENSORY.map((f) => (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                <textarea
                  rows={f.rows}
                  value={(room[f.key] as string) || ""}
                  onChange={(e) => editRoomField(f.key, e.target.value)}
                />
              </div>
            ))}
            <div className="field">
              <label>Base render prompt</label>
              <textarea
                rows={6}
                className="promptbox"
                value={room.prompt}
                onChange={(e) => editRoomField("prompt", e.target.value)}
              />
              <div style={{ marginTop: 8 }}>
                <button className="btn" onClick={copyPrompt}>
                  Copy prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
