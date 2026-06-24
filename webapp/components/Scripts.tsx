"use client";
import { useState } from "react";
import type { Scene } from "@/lib/content";
import { toast } from "./toast";

export default function Scripts({ initial }: { initial: Scene[] }) {
  const [scenes, setScenes] = useState<Scene[]>(initial);
  const [curId, setCurId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string>("");

  const cur = curId ? scenes.find((s) => s.id === curId) : null;

  // group by act, preserving order
  const acts: { act: string; scenes: Scene[] }[] = [];
  scenes.forEach((s) => {
    let g = acts.find((a) => a.act === s.act);
    if (!g) {
      g = { act: s.act, scenes: [] };
      acts.push(g);
    }
    g.scenes.push(s);
  });

  function edit(text: string) {
    if (!curId) return;
    setScenes((prev) => prev.map((s) => (s.id === curId ? { ...s, text, empty: false } : s)));
    setSaved("• unsaved");
  }

  async function saveToFile() {
    if (!cur) return;
    setSaved("saving…");
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "scene", id: cur.id, text: cur.text }),
      });
      if (!res.ok) throw new Error();
      setSaved("• saved to file");
      toast("Saved to Screenplay file");
    } catch {
      setSaved("save failed");
      toast("Save failed");
    }
  }

  function copyScene() {
    if (!cur) return;
    navigator.clipboard.writeText(cur.text);
    toast("Scene copied");
  }
  function downloadScene() {
    if (!cur) return;
    const blob = new Blob([cur.text], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = cur.title.replace(/[^a-z0-9]+/gi, "_") + ".md";
    a.click();
    toast("Downloaded");
  }

  return (
    <div>
      <h2 className="section">Scripts</h2>
      <div className="banner">
        These load straight from your <b>Screenplay/</b> files. Edit a scene and click <b>Save to file</b>{" "}
        to write it back to the real markdown — no more changes trapped in one browser. Empty acts show a
        placeholder you can write into; saving creates the file.
      </div>
      <div className="script-layout">
        <div className="scenelist">
          {acts.map((a) => (
            <div key={a.act}>
              <div className="actname">{a.act}</div>
              {a.scenes.map((s) => (
                <div
                  key={s.id}
                  className={"scene" + (s.empty ? " empty" : "") + (s.id === curId ? " active" : "")}
                  onClick={() => {
                    setCurId(s.id);
                    setSaved("");
                  }}
                >
                  {s.title}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="editor">
          <div className="etop">
            <div className="title">{cur ? cur.title : "Select a scene"}</div>
            <span className="savestate">{saved}</span>
            <button className="btn primary" onClick={saveToFile} disabled={!cur}>
              Save to file
            </button>
            <button className="btn" onClick={copyScene} disabled={!cur}>
              Copy
            </button>
            <button className="btn" onClick={downloadScene} disabled={!cur}>
              Download .md
            </button>
          </div>
          <textarea
            value={cur ? cur.text : ""}
            placeholder="Pick a scene from the list to start editing…"
            onChange={(e) => edit(e.target.value)}
            disabled={!cur}
          />
        </div>
      </div>
    </div>
  );
}
