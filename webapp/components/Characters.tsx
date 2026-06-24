"use client";
import { useEffect, useRef, useState } from "react";
import type { Character } from "@/lib/data";
import Img from "./Img";
import { toast } from "./toast";

export default function Characters({ initial }: { initial: Character[] }) {
  const [chars, setChars] = useState<Character[]>(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [heroSrc, setHeroSrc] = useState<string>("");
  const [selIdx, setSelIdx] = useState(0);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const open = openId ? chars.find((c) => c.id === openId)! : null;

  function openDrawer(id: string) {
    const c = chars.find((x) => x.id === id)!;
    setOpenId(id);
    setHeroSrc(c.img);
    setSelIdx(0);
  }
  function close() {
    setOpenId(null);
  }

  // Esc to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  function queueSave(id: string) {
    clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(async () => {
      const c = chars.find((x) => x.id === id)!;
      try {
        await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "character", id, fields: c.fields, prompt: c.prompt }),
        });
        toast("Saved to project");
      } catch {
        toast("Save failed");
      }
    }, 600);
  }

  function editField(id: string, key: string, value: string) {
    setChars((prev) =>
      prev.map((c) => (c.id === id ? { ...c, fields: { ...c.fields, [key]: value } } : c))
    );
    queueSave(id);
  }
  function editPrompt(id: string, value: string) {
    setChars((prev) => prev.map((c) => (c.id === id ? { ...c, prompt: value } : c)));
    queueSave(id);
  }
  function copyPrompt(id: string) {
    const c = chars.find((x) => x.id === id)!;
    navigator.clipboard.writeText(c.prompt);
    toast("Prompt copied");
  }

  return (
    <div>
      <h2 className="section">Character Lookup &amp; Building</h2>
      <div className="banner">
        Click any character to view and edit their bible — role, appearance, motivation, arc, and the
        image-generation Master Prompt. Edits save to the project automatically.
      </div>
      <div className="char-grid">
        {chars.map((c) => (
          <div className="char-card" key={c.id} onClick={() => openDrawer(c.id)}>
            <div className="img" style={{ position: "relative" }}>
              <Img src={c.img} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 18%" }} />
            </div>
            <div className="meta">
              <div className="name">
                <span className="swatch" style={{ background: c.color }} />
                {c.name}
              </div>
              <div className="role">{c.role}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={"overlay" + (open ? " open" : "")} onClick={close} />
      <div className={"drawer" + (open ? " open" : "")}>
        {open && (
          <>
            <div className="closeX" onClick={close}>
              &times;
            </div>
            <div className="detail">
              <div className="left">
                <div className="heroBox">
                  <Img
                    src={heroSrc}
                    alt={open.name}
                    title="Click to open full image in a new tab"
                    onClick={() => window.open(heroSrc, "_blank")}
                  />
                </div>
                {open.gallery.length > 0 && (
                  <div className="gallery">
                    {open.gallery.map((g, i) => (
                      <div
                        key={i}
                        className={"g" + (i === selIdx ? " sel" : "")}
                        onClick={() => {
                          setHeroSrc(g.u);
                          setSelIdx(i);
                        }}
                      >
                        <Img src={g.u} loading="lazy" alt={g.l} />
                        <div className="gl">{g.l}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="right">
                <h2>
                  <span className="swatch" style={{ background: open.color }} />
                  {open.name}
                </h2>
                <div className="muted" style={{ marginTop: 6, fontSize: 13.5 }}>
                  {open.role}
                </div>
                <div className="muted" style={{ margin: "8px 0 20px", fontSize: 11 }}>
                  {open.gallery.length} images · click a thumbnail to preview, click the big image to open
                  full size
                </div>
                {Object.keys(open.fields).map((k) => (
                  <div className="field" key={k}>
                    <label>{k}</label>
                    <textarea
                      rows={2}
                      value={open.fields[k]}
                      onChange={(e) => editField(open.id, k, e.target.value)}
                    />
                  </div>
                ))}
                <div className="field">
                  <label>Image Master Prompt (paste into your image generator)</label>
                  <textarea
                    rows={6}
                    className="promptbox"
                    value={open.prompt}
                    onChange={(e) => editPrompt(open.id, e.target.value)}
                  />
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button className="btn primary" onClick={() => copyPrompt(open.id)}>
                      Copy prompt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
