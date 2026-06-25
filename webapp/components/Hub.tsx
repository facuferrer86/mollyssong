"use client";
import { useState } from "react";
import type { Character, Beat, Zone } from "@/lib/data";
import type { Location } from "@/lib/locations";
import type { Scene } from "@/lib/content";
import type { ProjectData } from "@/lib/repo/project";
import type { Shot } from "@/lib/repo/shots";
import type { Relationship } from "@/lib/repo/relationships";
import Characters from "./Characters";
import Relationships from "./Relationships";
import Storyline from "./Storyline";
import LocationBible from "./LocationBible";
import Scripts from "./Scripts";
import Storyboard from "./Storyboard";
import Bible from "./Bible";
import { Toaster } from "./toast";

const TABS = [
  { id: "characters", label: "① Characters" },
  { id: "relationships", label: "② Relationships" },
  { id: "story", label: "③ Storyline Chart" },
  { id: "plot", label: "④ Location Bible" },
  { id: "scripts", label: "⑤ Scripts" },
  { id: "storyboard", label: "⑥ Storyboard" },
  { id: "bible", label: "⑦ World Bible" },
];

export default function Hub({
  characters,
  locations,
  scenes,
  beats,
  zones,
  project,
  shots,
  relationships,
  userEmail,
}: {
  characters: Character[];
  locations: Location[];
  scenes: Scene[];
  beats: Beat[];
  zones: Record<string, Zone>;
  project: ProjectData;
  shots: Shot[];
  relationships: Relationship[];
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
        <div className={"tab" + (tab === "relationships" ? " active" : "")}>
          {tab === "relationships" && (
            <Relationships characters={characters} initial={relationships} />
          )}
        </div>
        <div className={"tab" + (tab === "story" ? " active" : "")}>
          {tab === "story" && (
            <Storyline beats={beats} zones={zones} characters={characters} project={project} />
          )}
        </div>
        <div className={"tab" + (tab === "plot" ? " active" : "")}>
          <LocationBible initial={locations} />
        </div>
        <div className={"tab" + (tab === "scripts" ? " active" : "")}>
          <Scripts initial={scenes} />
        </div>
        <div className={"tab" + (tab === "storyboard" ? " active" : "")}>
          {tab === "storyboard" && <Storyboard scenes={scenes} initialShots={shots} />}
        </div>
        <div className={"tab" + (tab === "bible" ? " active" : "")}>
          {tab === "bible" && <Bible initial={project} />}
        </div>
      </main>
      <Toaster />
    </>
  );
}
