"use client";
import { useRef, useState } from "react";
import type { ProjectData } from "@/lib/repo/project";
import { toast } from "./toast";

type ListKey = "worldRules" | "forbids";

export default function Bible({ initial }: { initial: ProjectData }) {
  const [p, setP] = useState<ProjectData>(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function queueSave(next: ProjectData) {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "project", ...next }),
        });
        toast("Saved to project");
      } catch {
        toast("Save failed");
      }
    }, 600);
  }
  function patch(up: Partial<ProjectData>) {
    setP((prev) => {
      const next = { ...prev, ...up };
      queueSave(next);
      return next;
    });
  }
  function setItem(key: ListKey, idx: number, val: string) {
    patch({ [key]: p[key].map((x, i) => (i === idx ? val : x)) } as Partial<ProjectData>);
  }
  function addItem(key: ListKey) {
    patch({ [key]: [...p[key], ""] } as Partial<ProjectData>);
  }
  function removeItem(key: ListKey, idx: number) {
    patch({ [key]: p[key].filter((_, i) => i !== idx) } as Partial<ProjectData>);
  }

  function list(key: ListKey, label: string, hint: string) {
    return (
      <div className="field">
        <label>{label}</label>
        <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>
          {hint}
        </div>
        {p[key].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <input
              style={{ flex: 1 }}
              value={item}
              onChange={(e) => setItem(key, i, e.target.value)}
            />
            <button className="btn" onClick={() => removeItem(key, i)} title="Remove">
              &times;
            </button>
          </div>
        ))}
        <button className="btn" onClick={() => addItem(key)}>
          + Add
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section">World Bible</h2>
      <div className="banner">
        The project&apos;s top-level canon — the single source of truth for premise, theme, the rules
        of the world, and the lines the story never crosses. Edits save automatically.
      </div>
      <div style={{ maxWidth: 760 }}>
        <div className="field">
          <label>Logline</label>
          <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>
            One sentence: protagonist + goal + obstacle + stakes.
          </div>
          <textarea rows={2} value={p.logline} onChange={(e) => patch({ logline: e.target.value })} />
        </div>
        <div className="field">
          <label>Theme</label>
          <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>
            The underlying question the story explores.
          </div>
          <textarea rows={3} value={p.theme} onChange={(e) => patch({ theme: e.target.value })} />
        </div>
        {list(
          "worldRules",
          "World Rules",
          "The 'physics' of the universe — what the Accord can and can't do, the social order, constraints every scene must honour."
        )}
        {list(
          "forbids",
          "The Bible Forbids",
          "Moves the story never makes — continuity guardrails and out-of-character actions to avoid."
        )}
      </div>
    </div>
  );
}
