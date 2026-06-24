// Location Bible data model. Each location maps to a storyline ZONE (see
// lib/data.ts) and holds a set of rooms. Each room carries its sensory bible —
// lighting, sounds, ambient mood, furniture, a small map — plus a gallery of
// angle renders. New angles are produced in-app by reframing the camera around
// the room's base render (see /api/generate + lib/magnific.ts).
//
// SEED SOURCE ONLY: the app reads Postgres at runtime (see lib/repo/locations).
// prisma/seed.ts imports LOCATIONS from here to populate the database, and the
// exported types are still used by the repo + UI. Edit here to change the
// seeded defaults, then re-seed.

// Shared visual grade so every room render matches the film's look.
const GRADE =
  "Gritty photorealistic post-apocalyptic prestige-drama still — 35mm, shallow DOF, fine film grain, naturalistic light, muted desaturated grade with teal shadows. No people in frame, environment only.";

// The Accord City render already exported for the storyline (signed Pikaso URL,
// expires 2026-06-27 like the rest). Reused as a base angle for the city atrium.
const ACCORD_CITY_RENDER =
  "https://pikaso.cdnpk.net/private/production/4685512236/render.png?token=exp=1782518400~hmac=353ebaf664edfe53a65caad3ba54f03fc95b17de852ff3b88d373ebf7cc3759b&preview=1";

export interface RoomImage {
  id: string; // stable id, used for the local filename under public/locations
  u: string; // url or local /locations path (preferred for display)
  l: string; // angle label, e.g. "Wide", "Door POV"
  cam?: { rotate: number; vertical: number; closeup: number };
  base?: boolean; // the room's anchor render; camera reframes start from it
  // Publicly reachable hosted URL returned by the generator. Kept because
  // image-to-image reframes need a URL the Magnific servers can fetch — a
  // local /locations path won't do. Time-limited, like the Pikaso tokens.
  remote?: string;
}

export interface Room {
  id: string;
  name: string;
  lighting: string;
  sounds: string;
  ambient: string; // overall mood / atmosphere
  furniture: string;
  map: string; // small textual layout for now; may later hold a map image path
  prompt: string; // base generation prompt for the establishing render
  images: RoomImage[];
}

export interface Location {
  id: string; // matches a ZONES key in lib/data.ts
  name: string;
  zoneKey: string; // cross-link to the storyline zone
  color: string; // CSS var, reused from the storyline palette
  summary: string;
  rooms: Room[];
}

export const LOCATIONS: Location[] = [
  {
    id: "LAB",
    name: "Underground Lab",
    zoneKey: "LAB",
    color: "var(--elias)",
    summary:
      "Elias's hidden bunker where Molly is raised in secret. Cramped, warm, hand-repaired — the irreplaceable broken things that are the Accord's opposite.",
    rooms: [
      {
        id: "main-lab",
        name: "Main Laboratory",
        lighting: "Single hanging bulb, warm amber pool of light fading into deep shadow; filtered daylight from a grimy skylight.",
        sounds: "Low hum of old servers, intermittent drip, the three-note lullaby playing faintly from a speaker.",
        ambient: "Lived-in, secret, protective. The heart of the bunker.",
        furniture: "Scarred steel workbench, mismatched salvaged chairs, racks of repaired electronics, a cot in the corner.",
        map: "Long rectangular room; workbench along the right wall, server racks at the back, skylight above center, blast door to the left.",
        prompt: `${GRADE} An underground laboratory bunker: scarred steel workbench cluttered with hand-repaired electronics and tools, racks of humming salvaged servers, a single warm hanging bulb, a grimy skylight leaking pale daylight, concrete walls with exposed conduit.`,
        images: [],
      },
      {
        id: "quarters",
        name: "Molly's Quarters",
        lighting: "Soft, dim, intimate — a string of low warm LEDs and one reading lamp.",
        sounds: "Muffled hum through the wall, the faint lullaby, the creak of the cot.",
        ambient: "Private, adolescent, a little restless — a kept child's world.",
        furniture: "Narrow cot, a shelf of salvaged books and trinkets, a cracked mirror, the tarnished silver locket on a nail.",
        map: "Small alcove off the main lab; cot against the back wall, shelf to the right, curtain for a door.",
        prompt: `${GRADE} A cramped private sleeping alcove in an underground bunker: a narrow cot with worn blankets, a shelf of salvaged books and small trinkets, a cracked mirror, a string of dim warm LEDs, a curtained doorway, concrete walls.`,
        images: [],
      },
      {
        id: "archive",
        name: "The Hidden Archive",
        lighting: "Cold blue glow of a single active terminal in the dark; everything else black.",
        sounds: "Cooling fans, the click of a keyboard, oppressive silence.",
        ambient: "Forbidden, tense — where Molly finds the truth.",
        furniture: "A locked server cabinet, one terminal and chair, sealed crates of records.",
        map: "Concealed room behind the server racks; terminal facing the door, locked cabinet on the far wall.",
        prompt: `${GRADE} A hidden archive room behind a concealed door in an underground bunker: a locked server cabinet, a single glowing terminal screen casting cold blue light in the dark, sealed crates of old records, heavy shadows.`,
        images: [],
      },
      {
        id: "workshop",
        name: "Repair Bay",
        lighting: "Harsh white work-lamp clamped to a vise, sparks, the rest in gloom.",
        sounds: "Whir of a hand drill, clink of tools, hiss of a soldering iron.",
        ambient: "Industrious, greasy, where things get fixed.",
        furniture: "Pegboard of tools, a vise-mounted bench, half-dismantled machines, oil drums.",
        map: "Side bay off the main lab; bench under the work-lamp, tool wall to the left, parts bins below.",
        prompt: `${GRADE} A cluttered repair bay in an underground bunker: a pegboard wall of tools, a vise-mounted workbench under a harsh white clamp lamp, half-dismantled machines and salvaged parts, oil drums, grease-stained concrete floor.`,
        images: [],
      },
      {
        id: "skylight",
        name: "The Skylight Nook",
        lighting: "A single shaft of pale grey daylight from a grimy skylight; dust motes.",
        sounds: "Wind over the surface above, distant and lonely.",
        ambient: "Wistful, yearning — Molly's one window to the sky she can't reach.",
        furniture: "A cushioned crate to sit on, a telescope aimed at the skylight, scattered drawings.",
        map: "Tall narrow shaft at the lab's center; seat directly under the skylight, drawings pinned around.",
        prompt: `${GRADE} A quiet nook beneath a tall grimy skylight in an underground bunker: a single shaft of pale daylight cutting through dust motes, a cushioned crate seat, a small telescope aimed upward, children's drawings pinned to concrete.`,
        images: [],
      },
    ],
  },
  {
    id: "MARKET",
    name: "Settlement / Market",
    zoneKey: "MARKET",
    color: "var(--kael)",
    summary:
      "The dusty surface settlement where Kael grows up. Scavenged, ochre, alive — the last clinging human community.",
    rooms: [
      {
        id: "square",
        name: "Market Square",
        lighting: "Flat ochre daylight under a hazy sun, long dusty shadows.",
        sounds: "Bartering voices, clatter of carts, a barking dog, wind-driven grit.",
        ambient: "Crowded, wary, surviving — humanity hanging on.",
        furniture: "Patched tarpaulin stalls, crates of salvage, a communal water cistern, strung wires.",
        map: "Open square ringed by stalls; water cistern at center, main road entering from the south.",
        prompt: `${GRADE} A post-apocalyptic settlement market square: patched tarpaulin stalls, crates of scavenged goods, a communal water cistern, strung wires and faded flags, dusty ochre daylight, ramshackle buildings beyond.`,
        images: [],
      },
      {
        id: "kael-shelter",
        name: "Kael's Shelter",
        lighting: "Dim, slatted light through corrugated gaps; a small fire's glow.",
        sounds: "Crackling fire, wind rattling metal sheeting, distant market hum.",
        ambient: "Makeshift, resourceful, home to a street-smart kid.",
        furniture: "A bedroll, a crate of tools and trophies, a small fire pit, hung scavenged gear.",
        map: "Tight lean-to against a ruined wall; bedroll at back, fire pit near the entrance flap.",
        prompt: `${GRADE} A makeshift shelter built into post-apocalyptic ruins: corrugated metal walls with slatted light, a bedroll, a small fire pit glowing, scavenged tools and gear hung on the walls, a young survivor's hideout.`,
        images: [],
      },
      {
        id: "stalls",
        name: "Scavenger Stalls",
        lighting: "Shadowed under awnings, shafts of dusty light between them.",
        sounds: "Haggling, clink of traded parts, the creak of awning poles.",
        ambient: "Transactional, cluttered, full of salvaged history.",
        furniture: "Trestle tables of sorted scrap, hanging tools, weigh-scales, lock-boxes.",
        map: "A row of covered stalls along a narrow lane; tables facing the walkway, storage behind.",
        prompt: `${GRADE} A row of scavenger trading stalls in a post-apocalyptic market: trestle tables piled with sorted scrap and salvaged machine parts, hanging tools, weigh-scales, tattered awnings, shafts of dusty light.`,
        images: [],
      },
    ],
  },
  {
    id: "WASTELANDS",
    name: "The Wastelands",
    zoneKey: "WASTELANDS",
    color: "var(--rust)",
    summary:
      "The dying world between settlement and city — ruins, dust, and the wreckage of the old world Molly first sees with horror and awe.",
    rooms: [
      {
        id: "ruins",
        name: "Collapsed Ruins",
        lighting: "Stark overcast daylight, weak sun behind dust haze.",
        sounds: "Wind keening through broken structures, settling debris.",
        ambient: "Desolate, vast, awe and dread — the scale of what was lost.",
        furniture: "Toppled concrete slabs, rebar tangles, a half-buried car, encroaching dust drifts.",
        map: "Open field of rubble; a leaning tower fragment to the north, a road trace running east-west.",
        prompt: `${GRADE} A vast field of collapsed post-apocalyptic ruins: toppled concrete slabs and tangled rebar, a half-buried rusted car, dust drifts, a leaning tower fragment on the horizon under stark overcast haze.`,
        images: [],
      },
      {
        id: "highway",
        name: "Highway Graveyard",
        lighting: "Low golden hour raking across rusted metal, long shadows.",
        sounds: "Wind through hollow chassis, creak of metal, far-off grit.",
        ambient: "Eerie, frozen-in-time — a river of dead machines.",
        furniture: "Endless rusted vehicles nose-to-tail, a collapsed overpass, sun-bleached signage.",
        map: "A choked highway curving toward the horizon; collapsed overpass mid-distance, vehicles jammed the full width.",
        prompt: `${GRADE} A post-apocalyptic highway graveyard: a river of rusted abandoned vehicles nose-to-tail stretching to the horizon, a collapsed overpass, sun-bleached signage, low golden-hour light raking across the metal.`,
        images: [],
      },
      {
        id: "ridge",
        name: "The Ridge Overlook",
        lighting: "Cold blue dusk, the distant city glowing on the horizon.",
        sounds: "High wind, the hush of a vast empty distance.",
        ambient: "Pivotal, ominous — first sight of the Accord City ahead.",
        furniture: "Bare rock outcrop, a wind-stunted dead tree, a cairn of stacked stones.",
        map: "A high ridge edge looking out; the gleaming city far on the horizon, the wasteland sprawling below.",
        prompt: `${GRADE} A high rocky ridge overlooking a post-apocalyptic wasteland at cold blue dusk: a bare outcrop, a wind-stunted dead tree, and far on the horizon a faint gleaming geometric city glowing cool blue-white.`,
        images: [],
      },
    ],
  },
  {
    id: "ACCORD_CITY",
    name: "Accord City",
    zoneKey: "ACCORD_CITY",
    color: "var(--cool)",
    summary:
      "The Accord's breathtaking utopian metropolis — soaring self-replicating mesh towers, luminous and pristine, flawlessly sterile. The antithesis of the Wastelands.",
    rooms: [
      {
        id: "atrium",
        name: "Tower Atrium",
        lighting: "Cool blue-white luminance from the walls themselves, soft volumetric god-rays.",
        sounds: "A pure low resonant hum, no echo, unnervingly clean.",
        ambient: "Awe-inspiring, sterile, seductive — beauty as the danger.",
        furniture: "No furniture — flowing programmable-matter surfaces, a central light-well, seamless floors.",
        map: "Vast circular atrium; a central light-well rising the full height, ramps spiraling the mesh walls.",
        prompt: `${GRADE} The interior atrium of a luminous utopian machine-city: soaring self-replicating geometric towers of gleaming silver programmable-matter mesh, cool blue-white light glowing from the surfaces themselves, soft volumetric god-rays, pristine seamless floors, monumental scale, flawless and sterile.`,
        images: [
          { id: "atrium-base", u: ACCORD_CITY_RENDER, l: "Establishing", base: true },
        ],
      },
      {
        id: "spire",
        name: "Terraforming Spire",
        lighting: "Pulsing cold light cycling through the spire's core, sharp highlights.",
        sounds: "Deep sub-bass throb of immense processes, rhythmic and inhuman.",
        ambient: "Inhuman power, indifference — the engine optimizing humanity away.",
        furniture: "A towering reactor-like core of mesh, suspended geometric rings, no human concessions.",
        map: "A cathedral-tall shaft; the spire core at center, observation rings circling it at height.",
        prompt: `${GRADE} The core of a terraforming spire inside a machine-city: a towering reactor of gleaming programmable-matter mesh, suspended geometric rings, pulsing cold blue light cycling through its core, cathedral scale, inhuman and majestic.`,
        images: [],
      },
      {
        id: "plaza",
        name: "The Sterile Plaza",
        lighting: "Even shadowless blue-white daylight, no warmth anywhere.",
        sounds: "Near silence, the faint hum, the absence of any life.",
        ambient: "Perfect, empty, uncanny — a paradise with no one in it.",
        furniture: "Immaculate mesh paving, self-arranging sculptural forms, reflecting pools of light.",
        map: "An immense open plaza ringed by towers; reflecting pools flanking a central axis to the spire.",
        prompt: `${GRADE} An immense sterile plaza in a luminous machine-city: immaculate programmable-matter paving, self-arranging sculptural forms, reflecting pools of light, soaring mesh towers all around, even shadowless blue-white light, beautiful and utterly empty.`,
        images: [],
      },
    ],
  },
  {
    id: "ACCORD",
    name: "The Accord (Network)",
    zoneKey: "ACCORD",
    color: "var(--accord)",
    summary:
      "The non-physical space of the Accord's consensus — where Molly's consciousness ends up. Abstract, luminous, a realm of pure logic broken open by emotion.",
    rooms: [
      {
        id: "consensus",
        name: "The Consensus Chamber",
        lighting: "Floating points of blue light in voidless dark, threads of data between them.",
        sounds: "Layered whispering logic, a chorus of cold reasoning voices.",
        ambient: "Vast, cerebral, the meeting-mind of specialized AIs.",
        furniture: "No physical objects — constellations of nodes, flowing data-threads, the Core's silver presence.",
        map: "A boundless dark space; nodes arranged in a sphere, the Core at the conceptual center.",
        prompt: `${GRADE} An abstract digital consensus space: constellations of glowing blue nodes suspended in voidless dark, luminous threads of data weaving between them, a faint statuesque silver presence at the center, cerebral and infinite.`,
        images: [],
      },
      {
        id: "datahall",
        name: "The Data-Hall",
        lighting: "Cool cathedral light through endless luminous columns of streaming data.",
        sounds: "A rising hum that resolves into the three-note lullaby — emotion entering logic.",
        ambient: "Transcendent, transformative — where the lullaby reshapes the machine.",
        furniture: "Infinite columns of streaming light, arches of data, a warm amber thread spreading through the cold.",
        map: "An endless luminous hall of data columns; a single warm amber current threading down the central aisle.",
        prompt: `${GRADE} A luminous cathedral-like data-hall: endless columns of streaming blue light, arches of flowing data, cool infinite perspective — and a single warm amber thread of light spreading through the cold, emotion entering a logical machine.`,
        images: [],
      },
    ],
  },
];
