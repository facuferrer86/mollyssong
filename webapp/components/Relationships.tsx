"use client";
import { useRef, useState } from "react";
import type { Character } from "@/lib/data";
import type { Relationship } from "@/lib/repo/relationships";
import { toast } from "./toast";

const REL_TYPES = ["ally", "mentor", "antagonist", "family", "love", "rival", "creator", "other"];
const TYPE_COLOR: Record<string, string> = {
  ally: "#4fb286",
  mentor: "#5b8def",
  antagonist: "#d4604f",
  family: "#c79a3f",
  love: "#d46fae",
  rival: "#e0843f",
  creator: "#7d6fd4",
  other: "#8a8a8a",
  "": "#8a8a8a",
};

type Pt = { x: number; y: number };

export default function Relationships({
  characters,
  initial,
}: {
  characters: Character[];
  initial: Relationship[];
}) {
  const [rels, setRels] = useState<Relationship[]>(initial);
  const [pos, setPos] = useState<Record<string, Pt>>(() => {
    const p: Record<string, Pt> = {};
    const n = Math.max(1, characters.length);
    characters.forEach((c, i) => {
      if (c.mapX != null && c.mapY != null) {
        p[c.id] = { x: c.mapX, y: c.mapY };
      } else {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        p[c.id] = { x: 50 + 32 * Math.cos(a), y: 50 + 36 * Math.sin(a) };
      }
    });
    return p;
  });
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<string | null>(null);

  const [from, setFrom] = useState(characters[0]?.id ?? "");
  const [to, setTo] = useState(characters[1]?.id ?? characters[0]?.id ?? "");
  const [type, setType] = useState("ally");
  const [label, setLabel] = useState("");

  async function save(body: unknown): Promise<{ relationships?: Relationship[] }> {
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      return (await res.json()) as { relationships?: Relationship[] };
    } catch {
      toast("Save failed");
      return {};
    }
  }

  function clientToPct(e: React.PointerEvent): Pt {
    const rect = wrapRef.current!.getBoundingClientRect();
    const x = Math.max(3, Math.min(97, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(4, Math.min(96, ((e.clientY - rect.top) / rect.height) * 100));
    return { x, y };
  }
  function onMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const p = clientToPct(e);
    setPos((prev) => ({ ...prev, [drag.current as string]: p }));
  }
  function onUp() {
    const id = drag.current;
    drag.current = null;
    if (!id) return;
    const p = pos[id];
    if (p) save({ kind: "character-node", id, mapX: p.x, mapY: p.y });
  }

  async function addEdge() {
    if (!from || !to || from === to) {
      toast("Pick two different characters");
      return;
    }
    const { relationships } = await save({
      kind: "relationship",
      relationship: { fromId: from, toId: to, type, label },
    });
    if (relationships) setRels(relationships);
    setLabel("");
  }
  async function delEdge(id: string) {
    const { relationships } = await save({ kind: "relationship-delete", id });
    if (relationships) setRels(relationships);
  }
  const nameOf = (id: string) => characters.find((c) => c.id === id)?.name ?? id;

  return (
    <div>
      <h2 className="section">Character Relationships</h2>
      <div className="banner">
        Map who relates to whom. Drag the character nodes to lay out the web, then add typed edges
        (mentor, antagonist, love…) below. Layout and edges save automatically.
      </div>

      <div
        ref={wrapRef}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          background: "#0e0f12",
          border: "1px solid var(--line, #2a2a2a)",
          borderRadius: 8,
          overflow: "hidden",
          touchAction: "none",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          {rels.map((r) => {
            const a = pos[r.fromId];
            const b = pos[r.toId];
            if (!a || !b) return null;
            return (
              <line
                key={r.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={TYPE_COLOR[r.type] ?? "#8a8a8a"}
                strokeWidth={0.4}
                opacity={0.85}
              />
            );
          })}
        </svg>

        {rels.map((r) => {
          const a = pos[r.fromId];
          const b = pos[r.toId];
          if (!a || !b) return null;
          const txt = r.label || r.type;
          if (!txt) return null;
          return (
            <div
              key={r.id}
              style={{
                position: "absolute",
                left: `${(a.x + b.x) / 2}%`,
                top: `${(a.y + b.y) / 2}%`,
                transform: "translate(-50%, -50%)",
                fontSize: 10,
                padding: "1px 5px",
                borderRadius: 4,
                background: "rgba(0,0,0,0.6)",
                color: TYPE_COLOR[r.type] ?? "#ccc",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              {txt}
            </div>
          );
        })}

        {characters.map((c) => {
          const p = pos[c.id];
          if (!p) return null;
          return (
            <div
              key={c.id}
              onPointerDown={() => (drag.current = c.id)}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "grab",
                userSelect: "none",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: c.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0e0f12",
                  fontWeight: 700,
                  border: "2px solid #0e0f12",
                }}
              >
                {c.name[0]}
              </span>
              <span style={{ fontSize: 11, marginTop: 2, color: "#ddd" }}>{c.name.split(" ")[0]}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "14px 0", flexWrap: "wrap" }}>
        <select value={from} onChange={(e) => setFrom(e.target.value)}>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {REL_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={to} onChange={(e) => setTo(e.target.value)}>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input placeholder="label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <button className="btn primary" onClick={addEdge}>
          + Add relationship
        </button>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {rels.length === 0 && <div className="muted">No relationships yet — add one above.</div>}
        {rels.map((r) => (
          <div key={r.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span
              style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_COLOR[r.type] ?? "#888" }}
            />
            <span>
              {nameOf(r.fromId)}{" "}
              <span className="muted">
                {r.type}
                {r.label ? ` (${r.label})` : ""}
              </span>{" "}
              → {nameOf(r.toId)}
            </span>
            <button className="btn" style={{ marginLeft: "auto" }} onClick={() => delEdge(r.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
