"use client";
import { useEffect, useRef, useState } from "react";
import type { Character, Beat, Zone } from "@/lib/data";
import type { ProjectData } from "@/lib/repo/project";
import { STRUCTURES, structureById } from "@/lib/structures";
import StageMap from "./StageMap";
import { toast } from "./toast";

const LANES = ["LAB", "MARKET", "WASTELANDS", "ACCORD", "ACCORD_CITY"];
const LANEFRAC: Record<string, number> = {
  LAB: 0.1, MARKET: 0.28, WASTELANDS: 0.5, ACCORD: 0.71, ACCORD_CITY: 0.9,
};

function threadColor(id: string) {
  if (typeof window === "undefined") return "#888";
  return (
    getComputedStyle(document.documentElement).getPropertyValue("--" + id).trim() || "#888"
  );
}
function esc(t: string) {
  return (t || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

interface StoryData {
  characters: Character[];
  beats: Beat[];
  zones: Record<string, Zone>;
}

function Threads({ characters, beats, zones }: StoryData) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState<string | null>(null);

  useEffect(() => {
    render();
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotlight]);

  function render() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const PLOTX = 235, PLOTW = 560, RIGHT = 60, TOP = 64, ROWH = 122, BOT = 34;
    const W = PLOTX + PLOTW + RIGHT, H = TOP + (beats.length - 1) * ROWH + BOT;
    const laneX: Record<string, number> = {};
    LANES.forEach((k) => (laneX[k] = PLOTX + LANEFRAC[k] * PLOTW));
    const pos: Record<string, ({ x: number; y: number; z: string; s: string } | undefined)[]> = {};
    characters.forEach((c) => (pos[c.id] = []));
    beats.forEach((b, i) => {
      const y = TOP + i * ROWH;
      const groups: Record<string, string[]> = {};
      characters.forEach((c) => {
        const p = b.pos[c.id];
        if (!p) return;
        (groups[p.z] = groups[p.z] || []).push(c.id);
      });
      Object.keys(groups).forEach((z) => {
        const arr = groups[z];
        arr.forEach((cid, idx) => {
          pos[cid][i] = {
            x: laneX[z] + (idx - (arr.length - 1) / 2) * 20,
            y,
            z,
            s: b.pos[cid].s,
          };
        });
      });
    });
    let s = `<svg id="story" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`;
    LANES.forEach((k) => {
      const w = zones[k].label.split(" ");
      let l1 = zones[k].label, l2 = "";
      if (w.length > 1) {
        const mid = Math.ceil(w.length / 2);
        l1 = w.slice(0, mid).join(" ");
        l2 = w.slice(mid).join(" ");
      }
      s += `<text class="laneHdr" text-anchor="middle"><tspan x="${laneX[k]}" y="18">${esc(l1)}</tspan>${l2 ? `<tspan x="${laneX[k]}" y="32">${esc(l2)}</tspan>` : ""}</text>`;
    });
    beats.forEach((b, i) => {
      const y = TOP + i * ROWH;
      s += `<line class="beatRule" x1="18" y1="${y}" x2="${W - 18}" y2="${y}"/>`;
      s += `<text class="beatAct" x="18" y="${y - 7}">${b.act}</text>`;
      s += `<text class="beatTitle" x="18" y="${y + 13}">${esc(b.title)}</text>`;
      s += `<text class="laneHdr" x="18" y="${y + 29}" style="font-size:10px;text-transform:none;letter-spacing:0">${esc(b.meta)}</text>`;
    });
    characters.forEach((c) => {
      const pts = pos[c.id].filter(Boolean) as { x: number; y: number }[];
      if (!pts.length) return;
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let k = 1; k < pts.length; k++) {
        const pr = pts[k - 1], p = pts[k], my = (pr.y + p.y) / 2;
        d += ` C ${pr.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
      }
      const dim = spotlight && spotlight !== c.id ? " dim" : "";
      s += `<path class="thread${dim}" data-c="${c.id}" d="${d}" stroke="${threadColor(c.id)}"/>`;
    });
    characters.forEach((c) => {
      pos[c.id].forEach((p, i) => {
        if (!p) return;
        const dim = spotlight && spotlight !== c.id ? " dim" : "";
        s += `<circle class="node${dim}" data-c="${c.id}" data-name="${esc(c.name)}" data-loc="${esc(zones[p.z].label)}" data-act="${esc(beats[i].title)}" data-do="${esc(p.s)}" cx="${p.x}" cy="${p.y}" r="6.5" fill="${threadColor(c.id)}" stroke="#0e0f12" stroke-width="2"/>`;
      });
    });
    s += `</svg>`;
    wrap.innerHTML = s;

    const tip = tipRef.current!;
    wrap.querySelectorAll<SVGCircleElement>("#story .node").forEach((n) => {
      n.addEventListener("mousemove", (e) => {
        const d = n.dataset;
        tip.innerHTML = `<b>${d.name}</b> · ${d.loc}<br>${d.act}: ${d.do}`;
        tip.style.opacity = "1";
        tip.style.left = Math.min((e as MouseEvent).clientX + 14, window.innerWidth - 270) + "px";
        tip.style.top = (e as MouseEvent).clientY + 14 + "px";
      });
      n.addEventListener("mouseleave", () => (tip.style.opacity = "0"));
    });
  }

  return (
    <div>
      <div className="banner">
        Each colored line is a character. Threads run top (Act I) to bottom (Act V), drifting between
        location columns; when lines bundle together those characters are in the same place. Hover any
        point for what they&apos;re doing. Click a name to spotlight its thread.
      </div>
      <div className="legend">
        {characters.map((c) => (
          <div
            key={c.id}
            className={"lg" + (spotlight && spotlight !== c.id ? " dim" : "")}
            onClick={() => setSpotlight((s) => (s === c.id ? null : c.id))}
          >
            <span className="d" style={{ background: threadColor(c.id) }} />
            {c.name}
          </div>
        ))}
      </div>
      <div id="storyWrap" ref={wrapRef} />
      <div className="storytip" ref={tipRef} />
    </div>
  );
}

// Overlay a proven beat-sheet (Save the Cat / Hero's Journey / Story Circle) on
// the story's beats: pick a template, tag each beat with its structural role,
// and see which template beats are still uncovered.
function StructureView({ beats: initialBeats, project }: { beats: Beat[]; project: ProjectData }) {
  const [templateId, setTemplateId] = useState<string>(project.structureTemplate ?? "");
  const [beats, setBeats] = useState<Beat[]>(initialBeats);
  const structure = structureById(templateId);

  async function save(body: unknown) {
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast("Saved");
    } catch {
      toast("Save failed");
    }
  }
  function setTemplate(id: string) {
    setTemplateId(id);
    save({ kind: "project", structureTemplate: id || null });
  }
  function setFn(beatId: string, fn: string) {
    setBeats((prev) => prev.map((b) => (b.id === beatId ? { ...b, beatFunction: fn || null } : b)));
    save({ kind: "beat-function", id: beatId, beatFunction: fn || null });
  }
  const assigned = new Set(beats.map((b) => b.beatFunction).filter(Boolean) as string[]);

  return (
    <div>
      <div className="banner">
        Map your beats onto a proven structure. Pick a template, tag each beat with its role, and the
        coverage list flags which template beats you haven&apos;t hit yet (e.g. a missing Midpoint).
      </div>
      <div className="field" style={{ maxWidth: 360 }}>
        <label>Structure template</label>
        <select value={templateId} onChange={(e) => setTemplate(e.target.value)}>
          <option value="">— none —</option>
          {STRUCTURES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {structure && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 14 }}>
          <div>
            <h3 className="section" style={{ fontSize: 14 }}>
              Your beats
            </h3>
            <div style={{ display: "grid", gap: 8 }}>
              {beats.map((b) => (
                <div
                  key={b.id ?? b.title}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 180px",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div className="muted" style={{ fontSize: 11 }}>
                      {b.act}
                    </div>
                    <div>{b.title}</div>
                  </div>
                  <select
                    value={b.beatFunction ?? ""}
                    onChange={(e) => b.id && setFn(b.id, e.target.value)}
                  >
                    <option value="">— role —</option>
                    {structure.beats.map((tb) => (
                      <option key={tb.name} value={tb.name}>
                        {tb.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="section" style={{ fontSize: 14 }}>
              {structure.name} — coverage
            </h3>
            <div style={{ display: "grid", gap: 6 }}>
              {structure.beats.map((tb) => {
                const hit = assigned.has(tb.name);
                return (
                  <div
                    key={tb.name}
                    style={{
                      display: "flex",
                      gap: 8,
                      padding: "6px 8px",
                      borderRadius: 6,
                      background: hit ? "rgba(80,200,120,0.10)" : "rgba(220,80,80,0.08)",
                    }}
                  >
                    <span style={{ width: 16 }}>{hit ? "✓" : "○"}</span>
                    <div>
                      <div style={{ fontSize: 13 }}>
                        <b>{tb.name}</b>{" "}
                        <span className="muted" style={{ fontSize: 11 }}>
                          · {tb.at}
                        </span>
                      </div>
                      <div className="muted" style={{ fontSize: 11 }}>
                        {tb.blurb}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Storyline tab shell: three views over the same beats/zones data — the threads
// chart (lines over time), the stage map (who is where, when), and the structure
// overlay (beats mapped onto a template).
export default function Storyline({
  characters,
  beats,
  zones,
  project,
}: StoryData & { project: ProjectData }) {
  const [view, setView] = useState<"threads" | "map" | "structure">("threads");
  return (
    <div>
      <h2 className="section">
        {view === "threads"
          ? "Storyline Chart — character threads through time"
          : view === "map"
            ? "Storyline Chart — who is where, when"
            : "Storyline Chart — beat structure"}
      </h2>
      <div className="viewtoggle">
        <button
          className={"vt" + (view === "threads" ? " active" : "")}
          onClick={() => setView("threads")}
        >
          Threads
        </button>
        <button className={"vt" + (view === "map" ? " active" : "")} onClick={() => setView("map")}>
          Map
        </button>
        <button
          className={"vt" + (view === "structure" ? " active" : "")}
          onClick={() => setView("structure")}
        >
          Structure
        </button>
      </div>
      {view === "threads" && <Threads characters={characters} beats={beats} zones={zones} />}
      {view === "map" && <StageMap characters={characters} beats={beats} zones={zones} />}
      {view === "structure" && <StructureView beats={beats} project={project} />}
    </div>
  );
}
