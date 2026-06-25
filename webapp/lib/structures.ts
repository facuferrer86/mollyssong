// Beat-structure templates overlaid on the storyline. Each template is an
// ordered list of named beats with a rough page/time position and a one-line
// gloss. A story beat can be tagged with one of these names (its beatFunction);
// the Structure view then shows which template beats are still uncovered.

export interface TemplateBeat {
  name: string;
  at: string; // rough position, as % of runtime
  blurb: string;
}

export interface Structure {
  id: string;
  name: string;
  beats: TemplateBeat[];
}

export const STRUCTURES: Structure[] = [
  {
    id: "save-the-cat",
    name: "Save the Cat! (15 beats)",
    beats: [
      { name: "Opening Image", at: "1%", blurb: "Tone/world snapshot — the 'before' picture." },
      { name: "Theme Stated", at: "5%", blurb: "Someone voices the lesson the hero must learn." },
      { name: "Set-Up", at: "1–10%", blurb: "Ordinary world, status quo, who matters." },
      { name: "Catalyst", at: "12%", blurb: "The inciting incident; the disruptive event." },
      { name: "Debate", at: "12–25%", blurb: "The hero hesitates and resists the call." },
      { name: "Break into Two", at: "25%", blurb: "The hero commits; point of no return." },
      { name: "B Story", at: "30%", blurb: "Subplot (often love/mentor) that carries the theme." },
      { name: "Fun and Games", at: "30–55%", blurb: "Promise of the premise; the trailer moments." },
      { name: "Midpoint", at: "55%", blurb: "False victory or false defeat; stakes raised." },
      { name: "Bad Guys Close In", at: "55–75%", blurb: "Pressure tightens; the hero loses control." },
      { name: "All Is Lost", at: "75%", blurb: "Major setback; often a 'whiff of death'." },
      { name: "Dark Night of the Soul", at: "75–85%", blurb: "Rock bottom." },
      { name: "Break into Three", at: "85%", blurb: "Revelation; A and B stories fuse into the solution." },
      { name: "Finale", at: "85–99%", blurb: "The hero applies the lesson and wins." },
      { name: "Final Image", at: "99%", blurb: "Mirror of the opening, showing transformation." },
    ],
  },
  {
    id: "heros-journey",
    name: "Hero's Journey (12 stages)",
    beats: [
      { name: "Ordinary World", at: "0–10%", blurb: "The hero's normal life before the story." },
      { name: "Call to Adventure", at: "10%", blurb: "A challenge or quest is presented." },
      { name: "Refusal of the Call", at: "12%", blurb: "The hero hesitates or refuses." },
      { name: "Meeting the Mentor", at: "15%", blurb: "Guidance and the means to begin." },
      { name: "Crossing the First Threshold", at: "25%", blurb: "Commitment to the adventure; the new world." },
      { name: "Tests, Allies, Enemies", at: "30–45%", blurb: "Learning the rules; forging bonds." },
      { name: "Approach to the Inmost Cave", at: "50%", blurb: "Nearing the central ordeal." },
      { name: "Ordeal", at: "55–65%", blurb: "The greatest fear; a brush with death." },
      { name: "Reward (Seizing the Sword)", at: "70%", blurb: "Surviving, the hero takes the prize." },
      { name: "The Road Back", at: "80%", blurb: "Driven to complete the journey; chase/recommitment." },
      { name: "Resurrection", at: "90%", blurb: "The climax; final test, hero is transformed." },
      { name: "Return with the Elixir", at: "99%", blurb: "Home, bringing something to benefit the world." },
    ],
  },
  {
    id: "story-circle",
    name: "Dan Harmon Story Circle (8 steps)",
    beats: [
      { name: "You", at: "0%", blurb: "A character in a zone of comfort." },
      { name: "Need", at: "12%", blurb: "They want something (this breaks the comfort)." },
      { name: "Go", at: "25%", blurb: "They cross into an unfamiliar situation." },
      { name: "Search", at: "40%", blurb: "They adapt and face trials." },
      { name: "Find", at: "50%", blurb: "They get what they wanted…" },
      { name: "Take", at: "65%", blurb: "…but pay a heavy price (lowest point)." },
      { name: "Return", at: "80%", blurb: "They come back to the familiar world." },
      { name: "Change", at: "99%", blurb: "They return transformed." },
    ],
  },
];

export function structureById(id: string | null | undefined): Structure | null {
  return STRUCTURES.find((s) => s.id === id) ?? null;
}
