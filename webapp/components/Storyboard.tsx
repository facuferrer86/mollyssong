"use client";
import { useRef, useState } from "react";
import type { Scene } from "@/lib/content";
import type { Shot } from "@/lib/repo/shots";
import { toast } from "./toast";

const SHOT_SIZES = ["", "EWS", "WS", "FS", "MS", "MCU", "CU", "ECU", "Insert"];
const ANGLES = ["", "Eye level", "High", "Low", "Overhead", "Dutch", "OTS", "POV"];
const MOVES = ["", "Static", "Pan", "Tilt", "Dolly", "Tracking", "Crane", "Handheld", "Push in", "Pull out", "Zoom"];

type Mode = "scenes" | "trailer";

export default function Storyboard({ scenes, initialShots }: { scenes: Scene[]; initialShots: Shot[] }) {
  const [shots, setShots] = useState<Shot[]>(initialShots);
  const [mode, setMode] = useState<Mode>("scenes");
  const [curId, setCurId] = useState<string | null>(null);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const sceneById = new Map(scenes.map((s) => [s.id, s]));
  const cur = curId ? scenes.find((s) => s.id === curId) : null;
  const sceneShots = curId
    ? shots.filter((s) => s.sceneId === curId).sort((a, b) => a.order - b.order)
    : [];
  const trailerShots = shots
    .filter((s) => s.inTrailer)
    .sort((a, b) => (a.trailerOrder ?? 0) - (b.trailerOrder ?? 0));

  // group scenes by act for the picker
  const acts: { act: string; scenes: Scene[] }[] = [];
  scenes.forEach((s) => {
    let g = acts.find((a) => a.act === s.act);
    if (!g) {
      g = { act: s.act, scenes: [] };
      acts.push(g);
    }
    g.scenes.push(s);
  });

  function mergeScene(sceneId: string, list: Shot[]) {
    setShots((prev) => prev.filter((s) => s.sceneId !== sceneId).concat(list));
  }
  function setBusyFlag(pk: string, on: boolean) {
    setBusy((prev) => {
      const next = new Set(prev);
      if (on) next.add(pk);
      else next.delete(pk);
      return next;
    });
  }

  async function post(body: unknown) {
    const res = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("save failed");
    return res.json();
  }

  function queueSave(pk: string) {
    clearTimeout(timers.current[pk]);
    timers.current[pk] = setTimeout(async () => {
      const shot = shots.find((s) => s.pk === pk);
      if (!shot) return;
      try {
        await post({
          kind: "shot",
          shot: {
            pk: shot.pk,
            sceneId: shot.sceneId,
            title: shot.title,
            description: shot.description,
            shotSize: shot.shotSize,
            angle: shot.angle,
            movement: shot.movement,
            lens: shot.lens,
            lighting: shot.lighting,
            durationSec: shot.durationSec,
            prompt: shot.prompt,
            notes: shot.notes,
          },
        });
        toast("Shot saved");
      } catch {
        toast("Save failed");
      }
    }, 600);
  }

  function editShot(pk: string, patch: Partial<Shot>) {
    setShots((prev) => prev.map((s) => (s.pk === pk ? { ...s, ...patch } : s)));
    queueSave(pk);
  }

  async function addShot() {
    if (!curId || cur?.empty) return;
    try {
      const { shots: list } = await post({ kind: "shot", shot: { sceneId: curId, title: "New shot" } });
      mergeScene(curId, list as Shot[]);
    } catch {
      toast("Could not add shot");
    }
  }
  async function removeShot(pk: string, sceneId: string) {
    if (!window.confirm("Delete this shot?")) return;
    try {
      const { shots: list } = await post({ kind: "shot-delete", pk });
      mergeScene(sceneId, list as Shot[]);
    } catch {
      toast("Delete failed");
    }
  }
  async function move(pk: string, dir: -1 | 1) {
    const ordered = [...sceneShots];
    const i = ordered.findIndex((s) => s.pk === pk);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ordered.length) return;
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    mergeScene(curId!, ordered.map((s, k) => ({ ...s, order: k })));
    try {
      const { shots: list } = await post({
        kind: "shot-reorder",
        sceneId: curId,
        order: ordered.map((s) => s.pk),
      });
      mergeScene(curId!, list as Shot[]);
    } catch {
      toast("Reorder failed");
    }
  }
  async function generate(pk: string) {
    setBusyFlag(pk, true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "shot-keyframe", pk }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "generate failed");
      const updated = data.shot as Shot;
      setShots((prev) => prev.map((s) => (s.pk === pk ? { ...s, imageUrl: updated.imageUrl } : s)));
      toast("Keyframe generated");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Generate failed");
    } finally {
      setBusyFlag(pk, false);
    }
  }
  async function toggleTrailer(pk: string, inTrailer: boolean) {
    try {
      const { allShots } = await post({ kind: "shot-trailer", pk, inTrailer });
      setShots(allShots as Shot[]);
    } catch {
      toast("Failed");
    }
  }
  async function moveTrailer(pk: string, dir: -1 | 1) {
    const ordered = [...trailerShots];
    const i = ordered.findIndex((s) => s.pk === pk);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ordered.length) return;
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    try {
      const { allShots } = await post({ kind: "trailer-reorder", order: ordered.map((s) => s.pk) });
      setShots(allShots as Shot[]);
    } catch {
      toast("Reorder failed");
    }
  }
  function copyPrompt(prompt: string) {
    navigator.clipboard.writeText(prompt);
    toast("Prompt copied");
  }

  function specLine(s: Shot) {
    return [s.shotSize, s.angle, s.movement, s.lens].filter(Boolean).join(" · ");
  }

  function download(name: string, text: string, type: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
    toast("Downloaded");
  }
  function exportMd() {
    const total = trailerShots.reduce((n, s) => n + (s.durationSec ?? 0), 0);
    const lines = [
      "# Molly's Song — Trailer Shot List",
      `${trailerShots.length} shots · ~${total.toFixed(1)}s`,
      "",
    ];
    trailerShots.forEach((s, i) => {
      const sc = sceneById.get(s.sceneId);
      const spec = specLine(s) || "—";
      lines.push(`## ${i + 1}. ${s.title || "(untitled)"}  [${spec}]`);
      if (s.durationSec != null) lines.push(`Duration: ${s.durationSec}s`);
      if (sc) lines.push(`Scene: ${sc.act} / ${sc.title}`);
      if (s.description) lines.push(`Description: ${s.description}`);
      if (s.lighting) lines.push(`Lighting: ${s.lighting}`);
      if (s.prompt) lines.push(`Prompt: ${s.prompt}`);
      lines.push("");
    });
    download("mollys-song-trailer-shotlist.md", lines.join("\n"), "text/markdown");
  }
  function exportCsv() {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const head = [
      "order",
      "scene",
      "title",
      "shotSize",
      "angle",
      "movement",
      "lens",
      "lighting",
      "durationSec",
      "prompt",
    ];
    const rows = trailerShots.map((s, i) => {
      const sc = sceneById.get(s.sceneId);
      return [
        String(i + 1),
        sc ? `${sc.act} / ${sc.title}` : "",
        s.title,
        s.shotSize,
        s.angle,
        s.movement,
        s.lens,
        s.lighting,
        s.durationSec != null ? String(s.durationSec) : "",
        s.prompt,
      ]
        .map(esc)
        .join(",");
    });
    download("mollys-song-trailer-shotlist.csv", [head.join(","), ...rows].join("\n"), "text/csv");
  }

  return (
    <div>
      <h2 className="section">Storyboard &amp; Shot List</h2>
      <div className="banner">
        Break each scene into shots — camera spec + an AI keyframe prompt. Generate a keyframe per shot,
        then star the strongest ones into the <b>Trailer</b> cut and export an ordered shot list to drive
        your generation queue.
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button className={"btn" + (mode === "scenes" ? " primary" : "")} onClick={() => setMode("scenes")}>
          Scenes
        </button>
        <button className={"btn" + (mode === "trailer" ? " primary" : "")} onClick={() => setMode("trailer")}>
          Trailer cut ({trailerShots.length})
        </button>
      </div>

      {mode === "scenes" && (
        <div className="script-layout">
          <div className="scenelist">
            {acts.map((a) => (
              <div key={a.act}>
                <div className="actname">{a.act}</div>
                {a.scenes.map((s) => {
                  const n = shots.filter((x) => x.sceneId === s.id).length;
                  return (
                    <div
                      key={s.id}
                      className={"scene" + (s.empty ? " empty" : "") + (s.id === curId ? " active" : "")}
                      onClick={() => setCurId(s.id)}
                    >
                      {s.title}
                      {n > 0 && <span className="muted"> · {n}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="editor" style={{ padding: 12, overflowY: "auto" }}>
            {!cur && <div className="muted">Pick a scene to break it into shots.</div>}
            {cur?.empty && (
              <div className="muted">
                “{cur.title}” isn’t written yet. Add it in the <b>Scripts</b> tab first, then storyboard it
                here.
              </div>
            )}
            {cur && !cur.empty && (
              <>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                  <div className="title" style={{ fontWeight: 600 }}>
                    {cur.title}
                  </div>
                  <button className="btn primary" style={{ marginLeft: "auto" }} onClick={addShot}>
                    + Add shot
                  </button>
                </div>
                {sceneShots.length === 0 && <div className="muted">No shots yet — add the first one.</div>}
                <div style={{ display: "grid", gap: 14 }}>
                  {sceneShots.map((s, idx) => (
                    <div
                      key={s.pk}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "220px 1fr",
                        gap: 12,
                        border: "1px solid var(--line, #2a2a2a)",
                        borderRadius: 8,
                        padding: 10,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            aspectRatio: "16 / 9",
                            background: "#111",
                            borderRadius: 6,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {s.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={s.imageUrl}
                              alt={s.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
                              onClick={() => window.open(s.imageUrl, "_blank")}
                            />
                          ) : (
                            <span className="muted" style={{ fontSize: 11 }}>
                              no keyframe
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                          <button className="btn" disabled={busy.has(s.pk)} onClick={() => generate(s.pk)}>
                            {busy.has(s.pk) ? "Generating…" : s.imageUrl ? "Regenerate" : "Generate keyframe"}
                          </button>
                          <button className="btn" onClick={() => copyPrompt(s.prompt)} disabled={!s.prompt}>
                            Copy prompt
                          </button>
                        </div>
                        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                          <button className="btn" onClick={() => move(s.pk, -1)} disabled={idx === 0}>
                            ↑
                          </button>
                          <button
                            className="btn"
                            onClick={() => move(s.pk, 1)}
                            disabled={idx === sceneShots.length - 1}
                          >
                            ↓
                          </button>
                          <button
                            className={"btn" + (s.inTrailer ? " primary" : "")}
                            onClick={() => toggleTrailer(s.pk, !s.inTrailer)}
                            title="Include in trailer cut"
                          >
                            {s.inTrailer ? "★ in trailer" : "☆ trailer"}
                          </button>
                          <button className="btn" onClick={() => removeShot(s.pk, s.sceneId)}>
                            Delete
                          </button>
                        </div>
                      </div>

                      <div style={{ display: "grid", gap: 8 }}>
                        <input
                          placeholder="Shot title"
                          value={s.title}
                          onChange={(e) => editShot(s.pk, { title: e.target.value })}
                        />
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <select value={s.shotSize} onChange={(e) => editShot(s.pk, { shotSize: e.target.value })}>
                            {SHOT_SIZES.map((o) => (
                              <option key={o} value={o}>
                                {o || "size…"}
                              </option>
                            ))}
                          </select>
                          <select value={s.angle} onChange={(e) => editShot(s.pk, { angle: e.target.value })}>
                            {ANGLES.map((o) => (
                              <option key={o} value={o}>
                                {o || "angle…"}
                              </option>
                            ))}
                          </select>
                          <select value={s.movement} onChange={(e) => editShot(s.pk, { movement: e.target.value })}>
                            {MOVES.map((o) => (
                              <option key={o} value={o}>
                                {o || "move…"}
                              </option>
                            ))}
                          </select>
                          <input
                            style={{ width: 110 }}
                            placeholder="lens"
                            value={s.lens}
                            onChange={(e) => editShot(s.pk, { lens: e.target.value })}
                          />
                          <input
                            style={{ width: 80 }}
                            type="number"
                            step="0.5"
                            placeholder="sec"
                            value={s.durationSec ?? ""}
                            onChange={(e) =>
                              editShot(s.pk, {
                                durationSec: e.target.value === "" ? null : Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <input
                          placeholder="lighting"
                          value={s.lighting}
                          onChange={(e) => editShot(s.pk, { lighting: e.target.value })}
                        />
                        <textarea
                          rows={2}
                          placeholder="What happens in this shot"
                          value={s.description}
                          onChange={(e) => editShot(s.pk, { description: e.target.value })}
                        />
                        <textarea
                          rows={3}
                          className="promptbox"
                          placeholder="Image-gen prompt for the keyframe"
                          value={s.prompt}
                          onChange={(e) => editShot(s.pk, { prompt: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {mode === "trailer" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div className="muted">
              {trailerShots.length} shots · ~
              {trailerShots.reduce((n, s) => n + (s.durationSec ?? 0), 0).toFixed(1)}s
            </div>
            <button className="btn" style={{ marginLeft: "auto" }} onClick={exportMd} disabled={!trailerShots.length}>
              Export .md
            </button>
            <button className="btn" onClick={exportCsv} disabled={!trailerShots.length}>
              Export .csv
            </button>
          </div>
          {trailerShots.length === 0 && (
            <div className="muted">
              No shots in the trailer cut yet. In <b>Scenes</b>, star (☆ → ★) the shots you want.
            </div>
          )}
          <div style={{ display: "grid", gap: 8 }}>
            {trailerShots.map((s, idx) => {
              const sc = sceneById.get(s.sceneId);
              return (
                <div
                  key={s.pk}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 120px 1fr auto",
                    gap: 10,
                    alignItems: "center",
                    border: "1px solid var(--line, #2a2a2a)",
                    borderRadius: 8,
                    padding: 8,
                  }}
                >
                  <div style={{ fontWeight: 600, textAlign: "center" }}>{idx + 1}</div>
                  <div
                    style={{
                      aspectRatio: "16 / 9",
                      background: "#111",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    {s.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.imageUrl}
                        alt={s.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.title || "(untitled)"}</div>
                    <div className="muted" style={{ fontSize: 11 }}>
                      {[specLine(s), s.durationSec != null ? `${s.durationSec}s` : "", sc?.title]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn" onClick={() => moveTrailer(s.pk, -1)} disabled={idx === 0}>
                      ↑
                    </button>
                    <button
                      className="btn"
                      onClick={() => moveTrailer(s.pk, 1)}
                      disabled={idx === trailerShots.length - 1}
                    >
                      ↓
                    </button>
                    <button className="btn" onClick={() => toggleTrailer(s.pk, false)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
