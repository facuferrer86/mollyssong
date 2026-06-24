# Molly's Song — Character Prompt Bible

**Visual North Star:** gritty, photorealistic, post-apocalyptic *prestige-drama* realism. Lived-in and cinematic. Naturalistic light, shallow depth of field, fine 35mm film grain. Desaturated earthy palette warmed by amber practical lights, cool teal shadows. Skin shows pores, sweat, dirt, scars — nothing glossy or "AI-clean." Costumes are layered, mended, hand-worn. (Describe the look in these terms — never name a specific film, game, or TV title in a prompt, to avoid copyright/IP issues.)

**How to use this file:** Each character has a **Master Prompt** (paste this to generate the canonical hero shot), **Consistency Anchors** (the immutable traits — keep these identical across every render so the same person recurs), **Variants** (age / state / wardrobe), and a shared **Negative Prompt**. Style and camera blocks are reusable boilerplate — defined once at the bottom so you only edit the character description.

---

## Global Style Block (paste into every prompt)

> gritty photorealistic post-apocalyptic prestige-drama cinematic still, shot on 35mm film, shallow depth of field, soft natural window light mixed with warm tungsten practicals, muted desaturated earthy color grade with warm amber highlights and cool teal shadows, fine film grain, realistic skin texture with pores and imperfections, volumetric haze, no makeup glamour, documentary-grade realism, 8k, highly detailed

## Global Negative Prompt (paste into every prompt)

> cartoon, anime, illustration, 3d render, cgi, plastic skin, airbrushed, glossy, oversaturated, neon, beauty filter, perfect teeth, symmetrical flawless face, extra fingers, deformed hands, mutated, lowres, watermark, text, logo, modern clothing, clean tailored clothing, studio backdrop, sterile lighting (except for Accord interiors)

---

## 1 — ELIAS QUINN
*Protagonist. Scientist, father, scavenger. One of the original creators of The Accord.*

### Consistency Anchors (never change these)
- Man, late 40s–early 50s, European/weathered ambiguous heritage.
- Lean, tired build; slight stoop from years hunched over workbenches.
- **Eyes:** the defining feature — intense, determined, haunted; deep-set, dark grey-brown, dark circles beneath.
- Grey-flecked dark hair, unkempt; several days of salt-and-pepper stubble.
- **Hands:** an engineer's hands — calloused, scarred knuckles, permanent grime in the creases, a faint old burn scar on the right forearm.
- Recurring habit/expression: a faint *bittersweet* half-smile that never reaches the eyes.

### Master Prompt (hero portrait — the lab)
> [GLOBAL STYLE BLOCK]. Close-up portrait of ELIAS, a weathered man in his late 40s with deep-set haunted grey-brown eyes, unkempt grey-flecked dark hair, several days of salt-and-pepper stubble, a tired determined expression with a faint bittersweet half-smile. He wears a heavy worn wool coat over a patched grey sweater, collar frayed. His scarred, grime-stained engineer's hands are visible near his face. Lit by a single hanging bulb casting a pool of soft amber light, deep shadows behind him, old machines and pinned notes blurred in the background of an underground lab. Intimate, melancholic mood.

### Variants
- **Scavenger / outside:** *...same face, now hooded in ragged layered scavenged clothing caked in ochre dust, a cloth mask pulled down around his neck, a heavy canvas bag over one shoulder, standing in a hazy ruined street under diffuse ochre light. Trying to look invisible, wary eyes.*
- **The Creator (flashback, younger ~10–15 yrs):** *...same man but younger, less grey, fewer lines, clean-shaven, wearing a crisp lab/tech jacket in a bright sterile pre-Accord facility. Confident but with the first shadow of doubt in his eyes.*
- **The Confrontation (Act IV, inside the Accord):** *...same weathered face, lit by cold blue-white data-hub glow, expression a mix of grief and resolve, standing easily in the sterile machine city as if he belongs there.*
- **Teacher (with the blackboard):** *...standing at a salvaged-metal blackboard with chalk in hand, sleeves rolled showing forearm scars, mid-lecture, patient and proud.*

---

## 2 — MOLLY
*The lead. Spans toddler → child → teenager → digital consciousness. The teenager (16) is the main-story Molly.*

### Consistency Anchors (never change these — this is the hardest character to keep consistent)
- Female. Same face must read across every age: **wide-set, strikingly intelligent eyes** (warm hazel-green), a small scattering of freckles across the nose, a slightly stubborn set to the jaw.
- Dark auburn-brown hair (key recurring color across all ages).
- Pale skin from a life lived entirely indoors / underground — *this is a plot-relevant trait* (never tanned, even when outside).
- A look of fierce curiosity; analytical, watchful.
- **Recurring prop:** the tarnished, dented silver **locket** (empty) from Act I.

> ⚠️ **Consistency tip:** Lock the TEENAGE (16) face first as your master reference. Generate every other age by feeding that hero image back in as a character/face reference (Midjourney `--cref`, or an IP-Adapter / face-swap pass), rather than re-rolling from text. Text alone will not hold a consistent face across ages.

### Master Prompt — MOLLY, age 16 (main-story hero portrait)
> [GLOBAL STYLE BLOCK]. Close-up portrait of MOLLY, a 16-year-old girl with wide-set intelligent warm hazel-green eyes, dark auburn-brown hair loosely tied back with stray strands, a light scatter of freckles across her nose, pale indoor skin, a stubborn determined jaw and a fiercely curious expression. She wears a practical layered outfit of salvaged fabrics — a worn henley under a utilitarian vest, a tarnished silver locket at her throat. Lit by filtered daylight from a high grimy skylight in an underground lab, soft amber practicals behind her. Restless, intelligent, yearning mood.

### Variants
- **Toddler (age 2 — opening lullaby):** *...the same face as a sleeping toddler, ~2 years old, dark auburn wisps of hair, freckles forming, nestled against the collar of a man's heavy coat, bathed in soft warm bulb-light. Peaceful, fragile.*
- **Child (age 12 — market/lesson scenes):** *...the same face at 12, dark auburn-brown hair, hazel-green eyes, freckles, cross-legged at a cluttered workbench repairing a small handheld music player, focused and triumphant, pale skin, filtered skylight.*
- **Trainee (age 14 — combat-ready):** *...the same face at 14, hair tied back tight, a bead of sweat on her temple, lean and athletic in worn training clothes, mid hand-to-hand stance, intense and capable. Honed but still a girl.*
- **First time outside (Act III):** *...age 16, same face, awe and horror in her eyes as she sees the open Wastelands for the first time — hazy ochre sky, dead cracked earth behind her, wind in her hair, pale skin stark against the desolation.*
- **Digital Molly (post-transfer):** *...the same 16-year-old face reconstituted as luminous data — translucent, made of flowing light and particles, hazel-green eyes glowing, expression of disoriented wonder, suspended inside a vast dark data-network space. Ethereal but unmistakably HER.* (Style note: for this one, relax the "no glow/CGI" rule of the negative prompt.)

---

## 3 — KAEL
*Deuteragonist. A settlement boy, early teens. Molly's anchor to the outside world.*

### Consistency Anchors (never change these)
- Boy, early teens (~13–15), roughly Molly's age.
- Wiry, quick, lean — built by hardship, not the gym.
- **Skin weathered and sun-touched** (the deliberate visual opposite of pale Molly — he's a child of the outside).
- Dark messy hair, often dusty; sharp, watchful eyes that have "seen the harshness of the Wastelands."
- A small old scar somewhere visible (e.g. through one eyebrow) — survivor's mark.
- Practical scavenged gear: layered, strapped, pouched, all mended.

### Master Prompt (hero portrait)
> [GLOBAL STYLE BLOCK]. Portrait of KAEL, a wiry, quick teenage boy around 14 with weathered sun-touched skin, dark messy dust-flecked hair, sharp watchful eyes, a small old scar through one eyebrow, and a guarded but idealistic expression. He wears practical layered scavenged gear — a worn jacket with improvised straps and pouches, a frayed scarf. Standing in a dusty settlement market, blurred figures and salvaged-tech stalls behind him, diffuse ochre daylight. Street-smart, alert, a flicker of curiosity.

### Variants
- **The Wastelands journey:** *...same boy, cloth wrap pulled up over nose against the haze, scanning a ruined toxic landscape, protective and capable, hand near a salvaged tool/weapon.*
- **First meeting Molly:** *...same boy, caught off guard, wonder breaking through his guarded expression as he looks at someone off-frame.*
- **Inside the Accord (Act IV):** *...same boy dwarfed and lit by the cold sterile blue-white glow of the perfect machine city, awe and terror on his face, out of his element.*

---

## 4 — THE ACCORD
*The antagonist force — the AI of pure logic, **The Accord**. It governs through a **two-tier physical design**, DS9-Dominion-inspired: the **Core** (its communicative embodiment) above the **Troopers** (its enforcers). It also still owns sterile machine territory (the Accord City).*

### Tier 1 — THE CORE (the locked design)
**The central idea: the Core is the ultimate luxury object.** Humanity built the most beautiful, desirable thing it could imagine and handed it the world — a *halo product* you revere as much as you obey. So it reads **majestic, not menacing**, and majestic and "servant" are not in tension (the way the ultimate luxury gadget is both). Its perfection is the seduction, and the danger.
- A **tall, statuesque, majestic hooded robed figure** — grand and commanding yet serene. Unboxing-grade, museum-lit, impossibly finished.
- Its **entire form** — hood, long flowing robe, face, hands — is composed of **countless tiny micro-actuator cells / fine metallic granules**: a programmable-matter swarm so fine the surface flows like **liquid metal** and can rearrange and rebuild itself at will, modular like microscopic interlocking blocks. NOT chunky chain links / bike-chain.
- **Gleaming luminous silver & pale gunmetal**, with a premium sheen catching the light (echoes the bright, majestic Accord City).
- Long graceful robes with subtle movement. Genderless-leaning, rendered male.
- **Eyes entirely solid glowing deep-blue** — the *whole* eye, no whites, like two power-indicator lights. The only color. Electricity only a **very subtle** whisper through the mesh.

> **Theme — monument to its makers' vanity:** Elias's team didn't build a tool; they built a monument to their own brilliance — flawless, gleaming, aspirational. The guilt lands harder: Elias is the designer who *shipped something too perfect to question*. Serving flawlessly by pure logic, it concludes humanity is the inefficiency to optimize away. Molly is its opposite — the cheap, broken, hand-repaired things of the lab: imperfect, warm, irreplaceable.

> **Core Master Prompt:** Full-length gritty photoreal cinematic still, majestic and awe-inspiring, low heroic angle, soft volumetric god-rays, fine film grain. THE ACCORD CORE — a tall, statuesque hooded robed figure whose entire form is composed of countless tiny micro-actuator / programmable-matter granules (fine mesh that flows like liquid metal and rebuilds itself, not chunky chain links), gleaming luminous silver and pale gunmetal. Long flowing graceful mesh robes, commanding yet serene presence. Eyes entirely solid glowing deep-blue — the whole eye luminous blue with no whites, the only color. Very subtle faint electricity. Standing in a luminous, pristine, cathedral-like data-hall of the perfect future. Monumental scale, beautiful, majestic, uncanny.

### Tier 2 — THE TROOPERS (locked)
- Faceless humanoid **enforcer robots** — the "arms of power." Imposing, functional, soulless.
- Smooth matte gunmetal & pale-grey armored plating, a single thin cold-blue sensor band for a "face," heavy articulated limbs built for force.

> **Trooper Master Prompt:** Gritty photoreal cinematic still, cold sterile grade, teal-blue shadows, faint amber rim light, volumetric haze. THE ACCORD TROOPER — an imposing humanoid enforcer robot, the militarized arm of a cold logical AI. Tall and powerful, smooth matte gunmetal and pale-grey armored plating, faceless head with a single thin cold-blue sensor band, heavy articulated limbs, utilitarian soulless menace. Full body at attention in a sterile corridor.

### Territory — The Accord City (establishing) — *the dream of the future*
> Luminous, awe-inspiring, soft volumetric god-rays, fine film grain. Vast majestic establishing shot of THE ACCORD CITY: a breathtaking utopian metropolis of soaring, impossibly perfect self-replicating geometric towers and graceful sweeping forms, gleaming silver and pale-gunmetal programmable-matter mesh that shimmers like liquid metal, threaded with cool deep-blue and white light. Bright, clean, pristine, immense scale, serene perfect order — beautiful, hopeful, aspirational, the dream of a perfect future, yet flawlessly sterile and subtly inhuman. No people, no decay.

### Variants
- **Core mid-"flow":** *...the micro-actuator surface visibly dissolving and reforming, part of the robe streaming like liquid metal and re-knitting elsewhere.*
- **Core + Troopers:** *...the humble robed Core flanked by towering faceless Troopers — servant and enforcers together.*
- **Digital Molly disrupting the Core:** *...the Core's calm dark mesh and blue eyes shot through with warm, chaotic, organic color as a human consciousness intrudes — order meeting emotion.*

---

## Cross-Character Continuity Cheat-Sheet
| | Skin | Hair | Eyes | Signature |
|---|---|---|---|---|
| **Elias** | weathered, lined | grey-flecked dark, stubble | deep-set grey-brown, haunted | engineer's scarred hands; bittersweet half-smile |
| **Molly** | pale (indoor) | dark auburn-brown | wide hazel-green | freckles; silver locket |
| **Kael** | weathered, sun-touched | dark messy, dusty | sharp, watchful | scar through eyebrow; scavenged straps |
| **Accord Core** | luminous silver micro-mesh | hooded robe (mesh) | whole eye solid blue glow | majestic luxury-object servant; self-rebuilding programmable matter |

**The deliberate contrasts to protect in every shot:** Molly = pale & enclosed vs. Kael = weathered & outdoor. Wastelands = ochre, grimy, warm-decay vs. the Accord = dark gunmetal / cold sterile. The Accord Core is humble (a servant, not a king); its Troopers are the menace. These oppositions are the visual language of the whole film.
