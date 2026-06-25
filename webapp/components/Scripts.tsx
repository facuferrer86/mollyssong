"use client";
import { useState } from "react";
import type { Scene } from "@/lib/content";
import { parseFountain, tokensToHtml, SCREENPLAY_CSS } from "@/lib/fountain";
import { tokensToFdx } from "@/lib/fdx";
import { toast } from "./toast";

export default function Scripts({ initial }: { initial: Scene[] }) {
  const [scenes, setScenes] = useState<Scene[]>(initial);
  const [curId, setCurId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string>("");
  const [mode, setMode] = useState<"write" | "preview">("write");

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
    a.download = cur.title.replace(/[^a-z0-9]+/gi, "_") + ".fountain";
    a.click();
    toast("Downloaded");
  }
  function printScene() {
    if (!cur) return;
    const html = tokensToHtml(parseFountain(cur.text));
    const w = window.open("", "_blank");
    if (!w) {
      toast("Allow pop-ups to print");
      return;
    }
    w.document.write(
      `<!doctype html><html><head><title>${cur.title}</title><style>${SCREENPLAY_CSS}</style></head><body><div class="screenplay">${html}</div></body></html>`
    );
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }
  function exportFdx() {
    if (!cur) return;
    const fdx = tokensToFdx(parseFountain(cur.text));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([fdx], { type: "application/xml" }));
    a.download = cur.title.replace(/[^a-z0-9]+/gi, "_") + ".fdx";
    a.click();
    toast("Exported .fdx");
  }

  return (
    <div>
      <h2 className="section">Scripts</h2>
      <div className="banner">
        Scenes are written in <b>Fountain</b> (plain-text screenplay): <code>INT./EXT.</code> scene
        headings, an UPPERCASE line for a character cue with the dialogue beneath it, <code>(beats)</code>{" "}
        in parentheses, and transitions like <code>CUT TO:</code>. Toggle <b>Preview</b> to see it
        formatted, then <b>Print → PDF</b> or <b>Export .fdx</b> for Final Draft. Edits save to the DB.
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
            <button
              className={"btn" + (mode === "write" ? " primary" : "")}
              onClick={() => setMode("write")}
              disabled={!cur}
            >
              Write
            </button>
            <button
              className={"btn" + (mode === "preview" ? " primary" : "")}
              onClick={() => setMode("preview")}
              disabled={!cur}
            >
              Preview
            </button>
            <button className="btn" onClick={saveToFile} disabled={!cur}>
              Save
            </button>
            <button className="btn" onClick={copyScene} disabled={!cur}>
              Copy
            </button>
            <button className="btn" onClick={printScene} disabled={!cur}>
              Print → PDF
            </button>
            <button className="btn" onClick={exportFdx} disabled={!cur}>
              Export .fdx
            </button>
            <button className="btn" onClick={downloadScene} disabled={!cur}>
              .fountain
            </button>
          </div>
          {mode === "write" ? (
            <textarea
              value={cur ? cur.text : ""}
              placeholder="Pick a scene from the list to start editing…  (Fountain: INT. LAB - NIGHT / CHARACTER / dialogue)"
              onChange={(e) => edit(e.target.value)}
              disabled={!cur}
            />
          ) : (
            <div className="screenplay-scroll" style={{ flex: 1, overflowY: "auto", background: "#fff", borderRadius: 6 }}>
              <style>{SCREENPLAY_CSS}</style>
              <div
                className="screenplay"
                dangerouslySetInnerHTML={{ __html: cur ? tokensToHtml(parseFountain(cur.text)) : "" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
