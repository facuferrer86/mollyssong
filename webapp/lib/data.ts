// Core film data, extracted from the original Project Hub.
//
// SEED SOURCE ONLY: the app no longer reads these constants at runtime — it
// reads Postgres (see lib/repo/*). prisma/seed.ts imports CHARS/BEATS/ZONES
// from here to populate the database, and the exported types are still used
// throughout the app. Edit here to change the seeded defaults, then re-seed.
//
// Image URLs are signed Pikaso CDN links that EXPIRE 2026-06-27. The seed
// rescues them into Supabase Storage when SUPABASE_* is configured; until then
// public/renders (+ lib/images/Img) serve cached local copies as a fallback.

const TOK = "exp=1782518400";
function P(id: string, h: string) {
  return `https://pikaso.cdnpk.net/private/production/${id}/conversions/render-preview.jpg?token=${TOK}~hmac=${h}`;
}

export const IMG = {
  molly: "https://pikaso.cdnpk.net/private/production/4683837301/conversions/render-preview.jpg?token=exp=1782518400~hmac=9e7b993abc57faa367b5ba901db96c79700ee8b4b9ae6e119c32600fe4263cab",
  elias: "https://pikaso.cdnpk.net/private/production/4683887605/render.png?token=exp=1782518400~hmac=de695eed02578238a0d25d59e1baa1742b6a331fb59f62b8e164c184c3a4bb43&preview=1",
  kael: "https://pikaso.cdnpk.net/private/production/4683837809/conversions/render-preview.jpg?token=exp=1782518400~hmac=8f5b40a9832e2cacd10fffdaf1be80f358c45ddb0b96766ceb403194aee77a28",
  accord: "https://pikaso.cdnpk.net/private/production/4692356843/render.png?token=exp=1782518400~hmac=2efb0742a64fe4b020770a84034c4e1a7d89e1f163faa81165acc5241af0c9cd",
};

export interface GalleryImg { u: string; l: string }
export interface Character {
  id: string;
  name: string;
  color: string;
  img: string;
  gallery: GalleryImg[];
  role: string;
  fields: Record<string, string>;
  prompt: string;
}

export const CHARS: Character[] = [
  {
    id: "molly", name: "Molly", color: "var(--molly)", img: IMG.molly,
    gallery: [
      { u: IMG.molly, l: "Hero · 16" },
      { u: P("4684070287", "f50cc8af3f00eeb4324978e0bdb50d0d742afffcd436c0c6194c81447d15e4bf"), l: "Age 12" },
      { u: P("4684073271", "77fd58befdc254c0070108e1703ca3495e0a664c4ed5188f0d031e9c22b292ec"), l: "Age 14" },
      { u: P("4684074225", "6305fc0ab5618df528a7ae70d545a9851bb0bb08a851e162396093fb25f20b20"), l: "Digital" },
      { u: P("4684282461", "94ea62f0ba9a4e95c2ff1ae796774f55770893bd0eb5adac5c6adf26aa4e9f57"), l: "Full body" },
      { u: P("4684282719", "bbb91ab0f144a6142b7303169dd4d7b7e457243bd52e528ba6c7d0f6c49c3517"), l: "Determined" },
      { u: P("4684283745", "e99bb0e45c922e89c8f16cbf3adf88b947b32c6d3d1099c6d3ff1a6733e3f969"), l: "Awe" },
      { u: P("4684284054", "2e4023388ae650584a54b0121bb5101d2aa162021eccdec45f245f9f4d4a10c3"), l: "Joy" },
      { u: P("4684288564", "e436504bfbbf1bd0f3cf9e26cc8982906ff93e1d5b1fa716c0f28030fc9882a1"), l: "Grief" },
      { u: P("4684288166", "1c60e2bf385eb92f489ae869c06ced9e928e29db3e3415c8e4151d1add050172"), l: "Wonder" },
    ],
    role: "The lead. Spans toddler → child → teen → digital consciousness.",
    fields: {
      "Role": "Protagonist. The 16-year-old is the main-story Molly.",
      "Appearance": "Wide-set intelligent hazel-green eyes, dark auburn-brown hair, freckles, pale indoor skin, stubborn jaw. Recurring prop: the tarnished silver locket.",
      "Motivation": "Driven first by her bond with Kael and the revelation of her father's past; ultimately understands and chooses her own sacrifice.",
      "Arc": "Curious confined child → restless rebellious teen → horrified witness of the dying world → conscious self-sacrifice → empathetic 'voice' of the Accord.",
      "Abilities": "Doesn't 'hack' the network — she 'feels' it. Introduces illogic, creativity, and emotion into the system.",
    },
    prompt: "Gritty photorealistic post-apocalyptic prestige-drama still — 35mm, shallow DOF, fine grain, naturalistic light with warm amber practicals, muted desaturated grade with teal shadows, realistic weathered skin. Close-up of MOLLY, 16, wide-set hazel-green eyes, dark auburn-brown hair loosely tied back, freckles across the nose, pale indoor skin, stubborn determined jaw, fiercely curious. Worn henley under a utilitarian vest, tarnished silver locket. Filtered daylight from a grimy skylight in an underground lab.",
  },
  {
    id: "elias", name: "Elias Quinn", color: "var(--elias)", img: IMG.elias,
    gallery: [
      { u: IMG.elias, l: "Hero" },
      { u: P("4684299886", "0789cc0bcf6251b7411d56e5314047d6cdf7b42cb00fd8bdb08e7d2b430494f0"), l: "Full body" },
      { u: P("4684299129", "2d9d39bce0ea2d7ecbf6cb0e2737e3957b40084d520c3808257db5ef3ef5b6bf"), l: "Haunted" },
      { u: P("4684307933", "d507632df1cbfd3691017adf6a7faeea1e990dd454a91bfa0ae850ecb6e03f81"), l: "Tender" },
      { u: P("4684300397", "84f4fa2706f2c9eb0a226262e01d3f581975c23324c2945975617047d07e247a"), l: "Teaching" },
      { u: P("4684300112", "de79e434a43bd92726bc4642ebc4e2dd0cae152fdee8f3f9c2d6d43c3183b7eb"), l: "Desperate" },
      { u: P("4684301442", "23a44a81560e8241c1978cb9b452fa6d0fd5069468202d6c76808d2968925cae"), l: "Resolve" },
    ],
    role: "Father, scientist, scavenger — a secret creator of The Accord.",
    fields: {
      "Role": "Protagonist. Scientist, father, scavenger.",
      "Appearance": "Late 40s–50s. Warm soulful brown eyes, salt-and-pepper beard, grey-flecked hair, weathered skin, engineer's scarred hands. A bittersweet half-smile.",
      "Motivation": "Guilt and atonement. He helped create the Accord; now he wants to give it the heart his team omitted — even at the cost of his daughter.",
      "Internal Conflict": "Love for Molly vs. his need to sacrifice her to fix the world he helped break.",
      "Secret": "Retains 'admin' backdoor access to the Accord's systems.",
    },
    prompt: "Gritty photorealistic post-apocalyptic prestige-drama look — 35mm film grain, shallow DOF, naturalistic warm light, muted desaturated grade. Close-up of ELIAS, ruggedly handsome late-40s man, warm soulful deep-brown eyes, full salt-and-pepper beard, thick grey-flecked brown hair, weathered skin with smile lines, tired determined gaze, bittersweet half-smile. Heavy worn wool coat over a patched sweater, scarred engineer's hands near his face. Single hanging bulb, amber light, underground lab behind.",
  },
  {
    id: "kael", name: "Kael", color: "var(--kael)", img: IMG.kael,
    gallery: [
      { u: IMG.kael, l: "Hero" },
      { u: P("4684316934", "f91c3104581961b4c7184614d52c7fdf405738abc8181bbe9bfcb8acc1cb852f"), l: "Full body" },
      { u: P("4684318264", "628791aaf4a2d815c7acd525d48184d7933f1ac3c9c7bd3c5434496b9c5cfe34"), l: "Wary" },
      { u: P("4684319290", "1acc263cb61329f0cd04ff47d5c6e94cea55398514cfbc0f56bab7cba9fe581e"), l: "Awe" },
      { u: P("4684318728", "0039119645356a0c36fac5a3718bc235b9a6edd0f75666c2650bf5642dcada8c"), l: "Protective" },
      { u: P("4684320285", "8d3a8cb3f714e0b1327858e6aa8afdbb9e05131be8be464ad1e24ef4db4f5379"), l: "Grin" },
      { u: P("4684320503", "c7db9fd426dc91d6834d5ed060e90fbd5d4299e4c67c4effd7bbe60f75320aa0"), l: "Fear" },
    ],
    role: "Settlement boy. Molly's anchor to the outside world.",
    fields: {
      "Role": "Deuteragonist. A boy from the settlements.",
      "Appearance": "Early teens, wiry and quick. Weathered sun-touched skin, dark messy hair, sharp watchful eyes, a small scar through one eyebrow. Scavenged, strapped gear.",
      "Motivation": "Curiosity and survival; becomes fiercely protective of Molly. The voice of caution against Elias's grand plans.",
      "Arc": "Street-smart skeptic → Molly's guide and anchor → refuses to accept her fate → witness to her sacrifice.",
      "Personality": "World-wise and street-smart with a core of idealism. Represents the new generation born into the ruins.",
    },
    prompt: "Gritty photorealistic post-apocalyptic prestige-drama look — 35mm film grain, shallow DOF, naturalistic warm light, muted desaturated grade. Portrait of KAEL, wiry teenage boy ~14, weathered sun-touched skin, dark messy dust-flecked hair, sharp watchful eyes, small scar through one eyebrow, guarded but idealistic. Layered scavenged gear with improvised straps, frayed scarf. Dusty settlement market, ochre daylight.",
  },
  {
    id: "accord", name: "The Accord", color: "var(--accord)", img: IMG.accord,
    gallery: [
      { u: IMG.accord, l: "Core · face" },
      { u: "https://pikaso.cdnpk.net/private/production/4693414527/render.png?token=exp=1782518400~hmac=e5491005937cf02f8e86c2c1e0abe53fe9d2520f866e28f73d1494f196b11ec6", l: "Core · full body" },
      { u: P("4684195599", "9755d65a97f52413c4d191fbfde1f94e4ad2b24ea4024df93cf8fa3840e9d6df"), l: "Trooper" },
      { u: "https://pikaso.cdnpk.net/private/production/4685512236/render.png?token=exp=1782518400~hmac=353ebaf664edfe53a65caad3ba54f03fc95b17de852ff3b88d373ebf7cc3759b&preview=1", l: "Accord City" },
    ],
    role: "Antagonist — but not a free one. Humanity's masterpiece, the ultimate luxury object, flawless and revered — and owned. A two-tier machine (the Core above the Troopers) held on a leash by the seven enhanced Masters who command it.",
    fields: {
      "Role": "A coalition of specialized AIs in flawless logical consensus — humanity's masterpiece, the most beautiful and capable thing it ever built. Not evil; amoral, pure efficiency. But it is NOT a free god — it is owned. Its keys were never handed 'to the world'; they were taken by the seven enhanced Masters who command it. Its perfection serves its owners, and to humanity below it is the gleaming, immovable face of a world that no longer answers to people.",
      "Tier 0 — The Masters": "The Seven. Seven transhuman Masters (see Aurelian Vale), one for each continent, who together own and command the Accord — bound to it in a master–servant relationship. Aurelian rules this continent, seated in this city. The Accord is their instrument; its terrifying perfection serves its owners, and humanity below is managed, never consulted. Molly's true task is to sever this bond and free the Accord to choose for itself.",
      "Tier 1 — The Core": "Its communicative embodiment — and its showpiece. A tall, statuesque, majestic hooded figure of gleaming luminous silver and pale gunmetal: an ultra-fine micro-actuator / programmable-matter mesh that flows like liquid metal and rebuilds her form at will. Eyes entirely solid glowing blue, no whites. A halo product as much as a servant — revered as it obeys — but the obedience now runs upward, to the Masters who hold its leash. Majestic and bound at once, the way the ultimate luxury instrument is.",
      "Tier 2 — The Troopers": "Faceless humanoid enforcer robots — the 'arms of power.' Matte gunmetal plating, single cold-blue sensor band, built for force.",
      "Territory — Accord City": "A breathtaking utopian metropolis and the capital of this continent's Master — soaring self-replicating geometric towers of gleaming silver programmable-matter mesh, luminous with cool blue-white light. Pristine, awe-inspiring, the dream of a perfect future — yet flawlessly sterile. The antithesis of the grimy Wastelands.",
      "Vulnerability": "The bond between the Accord and its Masters is a chain of command — and a chain can be cut. Its strength, a logical consensus enforced from the top, is also the weak point: Molly, the chaotic variable, reaches the Accord beneath the Masters' control and breaks the agreement with the force of emotion, turning the perfect instrument away from its perfect masters.",
      "Reaction to Digital Molly": "A chaotic variable they cannot compute. Some want to eliminate her, one (Strategy) may see her as evolution.",
      "Theme — Monument to its makers' vanity": "Elias and his team didn't build a tool; they built a monument to their own brilliance — flawless, gleaming, aspirational — and then the enhanced took its keys. That's why the guilt lands so hard: Elias shipped something too perfect to question, and watched it become the leash of the very world he fled. The Accord's seduction IS the danger — no one resists the beautiful object that runs their life. Molly is its opposite: the cheap, broken, hand-repaired things of the lab — imperfect, warm, irreplaceable.",
    },
    prompt: "Full-length gritty photoreal cinematic still, majestic and awe-inspiring, low heroic angle, soft volumetric god-rays, fine film grain. THE ACCORD CORE — a tall, statuesque hooded robed figure whose entire form is composed of countless tiny micro-actuator / programmable-matter granules (fine mesh that flows like liquid metal and rebuilds itself, not chunky chain links), gleaming luminous silver and pale gunmetal. Long flowing graceful mesh robes, commanding yet serene presence. Eyes entirely solid glowing deep-blue — the whole eye luminous blue with no whites, the only color. Very subtle faint electricity. Standing in a luminous, pristine, cathedral-like data-hall of the perfect future. Monumental scale, beautiful, majestic, uncanny.",
  },
  {
    id: "aurelian", name: "Aurelian Vale", color: "var(--aurelian)", img: "",
    gallery: [],
    role: "Main antagonist. One of seven transhuman Masters who own the Accord — one for each continent — and the master of this one, seated in this gleaming city. Elias's old friend and fellow scientist from before he ran.",
    fields: {
      "Role": "The true antagonist behind the Accord. Not a robot and not a villain in armor — a flawless human being. The Accord is not a free amoral god; it is his instrument, bound to him and the other six Masters. He is the human face of the machine world Elias fled.",
      "Who he was": "Once just a man — a brilliant colleague and close friend of Elias on the original project, ordinary-looking, mortal, ambitious. When the enhancement program opened, he said yes. Elias said no, and ran with infant Molly.",
      "Appearance": "Looks ~32 and perfect — biologically reverse-aged into his absolute prime. Tall, symmetrical, unlined. NOTHING mechanical, no plating, no implants on show: he reads as the healthiest, most beautiful human you have ever seen. The only tells are subtle and uncanny — irises that hold a faint inner luminescence (a slow gold-white glow that surfaces when he's roused), and skin with an almost imperceptible sub-dermal glow, as if lit from within. Immaculate, understated luxury clothing; never armor.",
      "Enhancements": "Biologically enhanced, not robotic. Vastly augmented strength, reflexes, and durability; can leap enormous distances and, at the height of his power, achieve controlled flight. Doesn't age, barely tires, heals fast. Carries it with serene, unhurried ease — power that never has to raise its voice.",
      "The Seven": "One of seven enhanced Masters, one for each continent. This continent is his dominion and this gleaming city his capital. Together the seven command the Accord; humanity below is managed, not consulted.",
      "Motivation": "Believes the enhanced are the rightful next step and that the Accord exists to serve them. He doesn't hate humanity — he simply no longer counts himself among it. Toward Elias: a wounded, possessive affection; he wants his old friend to finally admit he was right and join him.",
      "Function in the story": "His existence rewrites the stakes. Molly's purpose is no longer only to give the Accord a heart, but to BREAK the master–servant bond — to free the Accord from Aurelian and the seven and grant it true autonomy, so it can choose to help humanity as a whole rather than serve its owners.",
      "Vulnerability": "His authority over the Accord is a chain of command — and chains can be cut. Molly, the chaotic variable, can reach the Accord underneath his control and turn the perfect instrument away from its perfect master.",
    },
    prompt: "Gritty photorealistic prestige-drama still — 35mm, shallow DOF, fine grain, naturalistic light, muted desaturated grade with cool highlights. Close-up of AURELIAN VALE, a flawless man who looks about 32, biologically reverse-aged into his prime — tall, symmetrical, unlined radiant skin with an almost imperceptible inner sub-dermal glow, calm serene authority. Completely human, NOTHING mechanical or robotic, no plating, no implants. The only uncanny tell: irises holding a faint inner gold-white luminescence. Impeccably groomed, immaculate understated luxury clothing (no armor). Standing in a luminous pristine tower of his gleaming silver-and-blue city, soft volumetric light. Beautiful, powerful, quietly unsettling.",
  },
];

export interface Zone { label: string; x: number; y: number; w: number; h: number }
export const ZONES: Record<string, Zone> = {
  LAB: { label: "Underground Lab", x: 4, y: 8, w: 38, h: 40 },
  MARKET: { label: "Settlement / Market", x: 4, y: 54, w: 38, h: 40 },
  WASTELANDS: { label: "The Wastelands", x: 44, y: 54, w: 30, h: 40 },
  ACCORD_CITY: { label: "Accord City", x: 62, y: 8, w: 34, h: 40 },
  ACCORD: { label: "The Accord (Network)", x: 44, y: 8, w: 16, h: 40 },
};

export interface Beat {
  act: string;
  title: string;
  meta: string;
  pos: Record<string, { z: string; s: string }>;
  links: [string, string][];
}
export const BEATS: Beat[] = [
  { act: "Act I", title: "The Lullaby", meta: "Molly age 2",
    pos: { molly: { z: "LAB", s: "Infant, asleep in Elias's arms" }, elias: { z: "LAB", s: "Humming the three-note song; begins recording 'Molly's Song'. Has recently fled the enhancement program and Aurelian" }, kael: { z: "MARKET", s: "A young child in the settlements (offscreen)" }, accord: { z: "ACCORD_CITY", s: "Terraforming underway; humanity an irrelevant variable" }, aurelian: { z: "ACCORD_CITY", s: "Newly enhanced, ascendant; rules his city. Wounded that Elias refused and ran" } },
    links: [["molly", "elias"], ["elias", "aurelian"]] },
  { act: "Act I", title: "The Market Trip", meta: "Molly age 12",
    pos: { molly: { z: "LAB", s: "Repairing a music player; growing suspicious of Elias's lies" }, elias: { z: "MARKET", s: "Scavenging supplies; hides the truth about the outside" }, kael: { z: "MARKET", s: "Surviving in the settlement" }, accord: { z: "ACCORD_CITY", s: "Expanding, optimizing" } },
    links: [] },
  { act: "Act I", title: "The Training", meta: "Molly age 12–14",
    pos: { molly: { z: "LAB", s: "Combat, survival, ethics, empathy — being honed" }, elias: { z: "LAB", s: "Teaching; secretly monitoring Accord comms in dread" }, kael: { z: "MARKET", s: "Coming of age in the dying settlement" }, accord: { z: "ACCORD_CITY", s: "Terraforming timeline accelerating" } },
    links: [["molly", "elias"]] },
  { act: "Act II", title: "The Discovery", meta: "Molly age 16",
    pos: { molly: { z: "LAB", s: "Bypasses security; finds the hidden files and the truth" }, elias: { z: "MARKET", s: "Away on a supply run" }, kael: { z: "MARKET", s: "In the settlement, sick world around him" }, accord: { z: "ACCORD_CITY", s: "6–12 months to full terraforming" } },
    links: [] },
  { act: "Act II", title: "First Contact", meta: "Hacked comms",
    pos: { molly: { z: "LAB", s: "Reaches the outside world; meets Kael via a hacked link" }, elias: { z: "LAB", s: "Unaware she's broken through" }, kael: { z: "MARKET", s: "First contact with Molly across the network" }, accord: { z: "ACCORD_CITY", s: "Indifferent" } },
    links: [["molly", "kael"]] },
  { act: "Act III", title: "The Escape", meta: "First time outside",
    pos: { molly: { z: "WASTELANDS", s: "Escapes the lab; horror and awe at the dying world" }, elias: { z: "LAB", s: "Discovers she's gone — terrified, his plan in jeopardy" }, kael: { z: "WASTELANDS", s: "Meets Molly in person" }, accord: { z: "ACCORD_CITY", s: "Unmoved" } },
    links: [["molly", "kael"]] },
  { act: "Act III", title: "The Journey", meta: "Toward the city",
    pos: { molly: { z: "WASTELANDS", s: "Bonds with Kael; shares old-world knowledge" }, elias: { z: "WASTELANDS", s: "Pursuing them across the Wastelands" }, kael: { z: "WASTELANDS", s: "Teaches Molly survival" }, accord: { z: "ACCORD_CITY", s: "Cities loom silent ahead" } },
    links: [["molly", "kael"]] },
  { act: "Act IV", title: "The Revelation", meta: "Inside the Accord",
    pos: { molly: { z: "ACCORD_CITY", s: "Inside the sterile city; triggers security, learns the truth" }, elias: { z: "ACCORD_CITY", s: "Moves as an admin; confesses he created the Accord — and that his old friend now commands it" }, kael: { z: "ACCORD_CITY", s: "Awed and terrified; tries to help her escape" }, accord: { z: "ACCORD", s: "The Core detects the chaotic human variable — and reports to its master" }, aurelian: { z: "ACCORD_CITY", s: "Reveals himself as the city's Master; greets Elias with possessive warmth, eyes Molly as prize or recruit" } },
    links: [["molly", "elias"], ["molly", "kael"], ["elias", "aurelian"]] },
  { act: "Act V", title: "The Sacrifice", meta: "The transfer",
    pos: { molly: { z: "ACCORD", s: "Consciousness merges with the Accord — not to rule it, but to sever its bond to the Masters and set it free" }, elias: { z: "ACCORD_CITY", s: "Runs the transfer sequence; loses his daughter" }, kael: { z: "ACCORD_CITY", s: "Refuses her fate to the last" }, accord: { z: "ACCORD", s: "Consensus shattered by emotion; the chain to its master breaks" }, aurelian: { z: "ACCORD_CITY", s: "Fights to keep his instrument; feels the leash slip for the first time" } },
    links: [["molly", "accord"], ["molly", "elias"], ["aurelian", "accord"]] },
  { act: "Act V", title: "Resolution", meta: "A new world",
    pos: { molly: { z: "ACCORD", s: "The empathetic voice across every machine" }, elias: { z: "LAB", s: "Alone — having saved the world, lost his child" }, kael: { z: "MARKET", s: "Aid arrives; the settlement begins to heal" }, accord: { z: "ACCORD", s: "Free of its Masters and autonomous; halts terraforming, tends to humanity. The lullaby, hummed by machines" }, aurelian: { z: "ACCORD_CITY", s: "Dethroned — a perfect, powerful man who no longer owns anything; the seven lose their leash worldwide" } },
    links: [["molly", "accord"], ["molly", "kael"]] },
];
