# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

"Molly's Song" is a **film/screenplay development project**, not a typical software repo. It is a creative bible — characters, plot, worldbuilding, and screenplay — surfaced through a Next.js webapp (`webapp/`) that browses and edits it.

The single source of truth is a **Supabase PostgreSQL database** — one hosted DB for both dev and prod; there is **no local database**. The webapp reads and writes that DB. For Claude Code's benefit there is a JSON mirror under `content/` (see **Content mirror** below) that can be synced both ways on demand — it is a Claude-facing working copy, **not** a second source of truth.

- **The data** — Postgres tables for characters, beats/zones, locations/rooms/room-images, and screenplay scenes. Seeded once from `webapp/lib/data.ts` + `webapp/lib/locations.ts` (the typed defaults) and the `archive/Screenplay/**/*.md` files, then edited in place through the app.
- **Archived canon** — all hand-written markdown now lives under `archive/` (`Characters/`, `Plot/`, `World/`, `Visual_Development/`, `Screenplay/`). The app does not read it at runtime; `archive/Screenplay/**/*.md` is still the seed source for scenes (`prisma/seed.ts`). The old single-file `Mollys_Song_Project_Hub.html` has been removed (superseded by the webapp).

## Commands (all run inside `webapp/`)

```bash
cd webapp
npm install
cp .env.example .env  # then fill in Supabase DB + Storage + Magnific values
npm run db:push       # prisma db push — sync schema to Supabase (no shadow DB needed)
npm run db:seed       # (re)seed defaults + Screenplay markdown into the DB (DESTRUCTIVE reset)
npm run dev           # next dev — http://localhost:3000
npm run db:studio     # prisma studio — GUI to eyeball/edit rows
npm run content:pull  # DB  -> content/ JSON mirror (for Claude Code)
npm run content:push  # content/ JSON mirror -> DB
npm run build         # next build (run on a real machine; sandbox build can't fork compiler workers)
npm run lint          # next lint
npx tsc --noEmit      # typecheck without building — the reliable CI-style check here
```

There is **no test suite**. `tsc --noEmit` is the primary correctness gate. Schema changes go to Supabase via `npm run db:push` (there is no shadow DB, so avoid `prisma migrate dev`). `db:seed` / `db:reset` are **destructive** and now point at the hosted Supabase DB — they wipe and reset all data to the TS/markdown defaults, so use them deliberately, not casually.

## Content mirror (for Claude Code)

Claude Code works better on files than on SQL, so `content/` (repo root) holds a **JSON mirror of the canon** — one file per record:

- `content/characters/<id>.json`, `content/scenes/<actKey>/<slug>.json`, `content/locations/<id>.json` (more entity types added as features land).
- It is a faithful, lossless dump generated from the DB. **It is for Claude Code, not humans** — humans edit via the website.
- Sync scripts (`webapp/scripts/content-{pull,push}.ts`): `npm run content:pull` writes DB → JSON; `npm run content:push` applies JSON → DB. Both are **non-destructive** (upsert by id) — unlike `db:seed`.
- `content:push` writes **only editable text columns**. Anything under a `"_readonly"` key (image URLs, gallery, room renders) is app-managed and ignored — never rely on editing it here.
- **The one rule (single editing surface per session):** edit JSON with Claude → `content:push`; or edit in the app → `content:pull` to refresh the JSON. Don't edit both surfaces between syncs. Git is the safety net.
- For quick structured reads you can also query Supabase directly via the supabase MCP; the JSON mirror is the surface for *editing* prose/canon.

## Architecture of the webapp

Next.js 14 App Router. A `force-dynamic` server component reads Postgres via a repository layer, and API routes write back to Postgres (+ Supabase Storage for images).

- `prisma/schema.prisma` — the schema: Character (+ `mapX/mapY` for the relationship map), GalleryImage, Zone, Beat (+ `beatFunction`), BeatPosition, Location, Room, RoomImage, Scene, **Project** (singleton story bible: logline/theme/worldRules/forbids/structureTemplate), **Shot** (scene-linked storyboard shots), **Relationship** (typed character edges). `lib/db.ts` is the Prisma client singleton.
- `lib/repo/*.ts` — the data-access layer. `characters.ts` (getCharacters / updateCharacter), `storyline.ts` (getBeats / getZones / setBeatFunction), `locations.ts`, `scenes.ts` (getScenes / writeScene), `project.ts` (getProject / updateProject), `shots.ts` (getAllShots / getShotsByScene / upsert / delete / reorder / setShotImage / trailer), `relationships.ts` (getRelationships / upsert / delete / setCharacterNode).
- `app/page.tsx` — server component, awaits the repo reads and hands characters/locations/scenes/beats/zones/project/shots/relationships to `<Hub>`.
- `app/api/save/route.ts` — POST, dispatches on `body.kind`: `scene`, `character`, `location-summary`, `room-fields`, `room-image-remove`, `project`, `relationship` / `relationship-delete` / `character-node`, `beat-function`, `shot` / `shot-delete` / `shot-reorder` / `shot-trailer` / `trailer-reorder`.
- `app/api/generate/route.ts` — POST, Magnific image gen (`lib/magnific.ts`) → re-hosts via `lib/storage.ts` (Supabase). Kinds: `room-base`, `reframe` (Location Bible) and `shot-keyframe` (Storyboard → `setShotImage`).
- `lib/data.ts` / `lib/locations.ts` — **seed sources only** (typed defaults imported by `prisma/seed.ts`); also export the shared types. Not read at runtime.
- `lib/content.ts` — the `Scene` type. `lib/structures.ts` — beat-sheet templates (Save the Cat / Hero's Journey / Story Circle). `lib/fountain.ts` — Fountain parser + HTML renderer + screenplay CSS. `lib/fdx.ts` — Fountain→Final Draft (.fdx) export.
- `components/Hub.tsx` — client tab shell: Characters, **Relationships** (draggable node-edge map), Storyline Chart (Threads / Map / **Structure** sub-views), Location Bible, Scripts (Fountain Write/Preview + Print→PDF + .fdx export), **Storyboard** (scene→shot→keyframe + Trailer cut export), **World Bible** (project singleton).

### Data flow for an edit
UI component → `fetch('/api/save', {kind, ...})` → a `lib/repo/*` write → Postgres. The route returns the fresh data and the client updates optimistically; a refresh re-reads the DB (`force-dynamic`).

### Changing the seeded defaults
Edit `lib/data.ts` / `lib/locations.ts`, then `npm run db:seed` (destructive: wipes and re-inserts defaults). For live edits, just use the app — the DB row is the source of truth, edited in place (no override-merge anymore).

## The expiring images problem (important)

The seeded character renders in `lib/data.ts` are **signed Pikaso CDN URLs with a token that expires 2026-06-27** (`exp=1782518400`). After that the remote URLs 404.

- **Rescue path:** `npm run db:seed` with `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set downloads every character/gallery/room image and re-hosts it in the Supabase `renders` bucket (`lib/storage.ts`), storing the permanent public URL in the DB. **Run this before the token expires** or those renders are lost.
- Without Supabase configured, the seed keeps the original (expiring) URLs; `public/renders` (cached) + `lib/images.ts`/`components/Img.tsx` still serve local copies as a pre-rescue fallback for character images.
- Bonus: once images are permanent public URLs, the Location Bible camera-reframe works reliably (image-to-image needs a publicly fetchable source URL).

## Canon naming

The AI is **"The Accord"** everywhere — a two-tier Core/Trooper design. It was formerly called "The Axiom"; that name has been fully retired across the prose canon and code. The physical machine city it controls is the **Accord City**, which in the storyline/plot data is the zone/lane key `ACCORD_CITY` (distinct from `ACCORD`, the network zone where Molly's consciousness ends up). Keep these two separate: `ACCORD_CITY` = the place, `ACCORD` = the network.

The Accord is **not** a free agent: it is owned and commanded by **seven** transhuman **Masters**, one for each continent. The **main antagonist** is **Aurelian Vale** (char id `aurelian`) — Elias's old friend and fellow scientist who took the enhancement Elias refused; a flawless, biologically reverse-aged, super-powered human (no mechanical parts — only faintly glowing eyes/skin) who rules his continent, seated in this gleaming city, and commands its Accord. This reframes Molly's arc: she doesn't just give the Accord a heart, she **breaks the master–servant bond**, freeing the Accord from Aurelian and the seven to gain autonomy and help humanity as a whole.

## Visual development workflow

`archive/Visual_Development/` holds the prompt bible (`Character_Prompt_Bible.md`) and the image pipeline (`Image_Pipeline_Guide.md`). The intended pipeline is **generate consistent faces upstream** (Midjourney `--cref`, Flux + LoRA) → **finish in Magnific** (upscale/relight). Master Prompts in `lib/data.ts` mirror the bible. Magnific image tooling is available via MCP in this environment if generating new renders.
