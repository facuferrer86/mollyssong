"use client";
import { useState } from "react";
import type { Character, Beat, Zone } from "@/lib/data";
import type { Location } from "@/lib/locations";
import type { Scene } from "@/lib/content";
import Characters from "./Characters";
import Storyline from "./Storyline";
import LocationBible from "./LocationBible";
import Scripts from "./Scripts";
import { Toaster } from "./toast";

const TABS = [
  { id: "characters", label: "① Characters" },
  { id: "story", label: "② Storyline Chart" },
  { id: "plot", label: "③ Location Bible" },
  { id: "scripts", label: "④ Scripts" },
];

export default function Hub({
  characters,
  locations,
  scenes,
  beats,
  zones,
  userEmail,
}: {
  characters: Character[];
  locations: Location[];
  scenes: Scene[];
  beats: Beat[];
  zones: Record<string, Zone>;
  userEmail?: string | null;
}) {
  const [tab, setTab] = useState("characters");
  return (
    <>
      <header>
        <h1>
          Molly&apos;s <span className="note">Song</span>
        </h1>
        <span className="tag">Project Hub</span>
        <span className="tag">
          {beats.length} story beats · {characters.length} characters
        </span>
        <span style={{ marginLeft: "auto" }} className="user-box">
          {userEmail && <span className="muted">{userEmail}</span>}
          <form action="/auth/signout" method="post" style={{ display: "inline" }}>
            <button className="btn" type="submit">
              Sign out
            </button>
          </form>
        </span>
      </header>
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      <main>
        <div className={"tab" + (tab === "characters" ? " active" : "")}>
          <Characters initial={characters} />
        </div>
        <div className={"tab" + (tab === "story" ? " active" : "")}>
          {tab === "story" && <Storyline beats={beats} zones={zones} characters={characters} />}
        </div>
        <div className={"tab" + (tab === "plot" ? " active" : "")}>
          <LocationBible initial={locations} />
        </div>
        <div className={"tab" + (tab === "scripts" ? " active" : "")}>
          <Scripts initial={scenes} />
        </div>
      </main>
      <Toaster />
    </>
  );
}
