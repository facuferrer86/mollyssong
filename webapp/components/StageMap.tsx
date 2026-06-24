"use client";
import { useState } from "react";
import type { Character, Beat, Zone } from "@/lib/data";

// The "who is where, when" stage map — scrub through the beats and watch the
// characters move between zones. Formerly the standalone "Plot Locations" tab;
// now the Map sub-view of the Storyline tab (same beats/zones data as the
// threads chart, just shown spatially instead of as lines over time).
export default function StageMap({
  characters,
  beats,
  zones,
}: {
  characters: Character[];
  beats: Beat[];
  zones: Record<string, Zone>;
}) {
  const [i, setI] = useState(0);
  const beat = beats[i];

  // group characters by zone for this beat
  const byZone: Record<string, Character[]> = {};
  characters.forEach((c) => {
    const p = beat.pos[c.id];
    if (!p) return;
    (byZone[p.z] = byZone[p.z] || []).push(c);
  });

  // compute token centers (percent) per character
  const center: Record<string, { x: number; y: number }> = {};
  const tokens: { c: Character; left: number; top: number }[] = [];
  Object.keys(byZone).forEach((zk) => {
    const z = zones[zk];
    const arr = byZone[zk];
    arr.forEach((c, idx) => {
      const cx = z.x + z.w / 2;
      const cy = z.y + 16 + idx * 16 + (z.h - 20) / 2 - (arr.length - 1) * 8;
      tokens.push({ c, left: cx, top: cy });
      center[c.id] = { x: cx, y: cy + 1.5 };
    });
  });

  return (
    <div>
      <div className="scrub">
        <div className="beatlabel">
          <div>
            <span className="act">{beat.act}</span>
            <div className="t">{beat.title}</div>
          </div>
          <div className="muted">{beat.meta}</div>
        </div>
        <input
          type="range"
          min={0}
          max={beats.length - 1}
          step={1}
          value={i}
          onChange={(e) => setI(+e.target.value)}
        />
        <div className="ticks">
          {beats.map((b, k) => (
            <span key={k} className={k === i ? "on" : ""} onClick={() => setI(k)}>
              {b.title}
            </span>
          ))}
        </div>
      </div>
      <div className="stage-wrap">
        <div id="stage">
          <svg className="links" viewBox="0 0 100 100" preserveAspectRatio="none">
            {(beat.links || []).map(([a, b], k) => {
              if (!center[a] || !center[b]) return null;
              return (
                <line
                  key={k}
                  x1={center[a].x}
                  y1={center[a].y}
                  x2={center[b].x}
                  y2={center[b].y}
                  stroke="var(--amber)"
                  strokeWidth={0.4}
                  strokeDasharray="1 1"
                  opacity={0.55}
                />
              );
            })}
          </svg>
          {Object.keys(zones).map((k) => {
            const z = zones[k];
            return (
              <div
                key={k}
                className="zone"
                style={{ left: z.x + "%", top: z.y + "%", width: z.w + "%", height: z.h + "%" }}
              >
                <span className="zlab">{z.label}</span>
              </div>
            );
          })}
          {tokens.map(({ c, left, top }) => (
            <div
              key={c.id}
              className="token"
              style={{ left: `calc(${left}% - 55px)`, top: top + "%" }}
            >
              <span className="dot" style={{ background: c.color }}>
                {c.name[0]}
              </span>
              {c.name.split(" ")[0]}
            </div>
          ))}
        </div>
        <div className="sidepanel">
          <h3>At this moment</h3>
          <div>
            {characters.map((c) => {
              const p = beat.pos[c.id];
              if (!p) return null;
              return (
                <div className="statusrow" key={c.id}>
                  <span className="sd" style={{ background: c.color }} />
                  <span className="stxt">
                    <b>
                      {c.name} — {zones[p.z].label}
                    </b>
                    <span>{p.s}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
