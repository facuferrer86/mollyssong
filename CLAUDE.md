# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

"Molly's Song" is a **film/screenplay development project**, not a typical software repo. It is a creative bible — characters, plot, worldbuilding, and screenplay — surfaced through a Next.js webapp (`webapp/`) that browses and edits it.

The single source of truth is now a **PostgreSQL database** (Supabase in prod, docker Postgres locally). The webapp reads and writes that DB; there is no longer a markdown/JSON/hardcoded split to keep in sync.

- **The data** — Postgres tables for characters, beats/zones, locations/rooms/room-images, and screenplay scenes. Seeded once from `webapp/lib/data.ts` + `webapp/lib/locations.ts` (the typed defaults) and the `Screenplay/**/*.md` files, then edited in place through the app.
- **Legacy / retired** — the markdown under `Characters/`, `Plot/`, `World/`, `Visual_Development/` is no longer read by the app (kept as a manual archive). `Screenplay/**/*.md` is the seed source for scenes but is not read at runtime after seeding. The standalone `Mollys_Song_Project_Hub.html` (single-file, localStorage-only) was superseded by the webapp.

## Commands (all run inside `webapp/`)

```bash
cd webapp
npm install
cp .env.example .env  # then fill in DB + Supabase + Magnific values
docker compose up -d  # local Postgres on host port 5544 (avoids common 5432 clashes)
npm run db:migrate    # prisma migrate dev — apply schema
npm run db:seed       # import defaults + Screenplay markdown into the DB
npm run dev           # next dev — http://localhost:3000
npm run db:studio     # prisma studio — GUI to eyeball/edit rows
npm run build         # next build (run on a real machine; sandbox build can't fork compiler workers)
npm run lint          # next lint
npx tsc --noEmit      # typecheck without building — the reliable CI-style check here
```

There is **no test suite**. `tsc --noEmit` is the primary correctness gate. `npm run db:reset` re-applies migrations and re-seeds (destructive — resets all data to defaults).

## Architecture of the webapp

Next.js 14 App Router. A `force-dynamic` server component reads Postgres via a repository layer, and API routes write back to Postgres (+ Supabase Storage for images).

- `prisma/schema.prisma` — the schema (Character, GalleryImage, Zone, Beat, BeatPosition, Location, Room, RoomImage, Scene). `lib/db.ts` is the Prisma client singleton.
- `lib/repo/*.ts` — the data-access layer. `characters.ts` (getCharacters / updateCharacter), `storyline.ts` (getBeats / getZones — rebuilds each beat's `pos` map from BeatPosition rows), `locations.ts` (getLocations / getRoom / setLocationSummary / setRoomFields / addRoomImage / removeRoomImage), `scenes.ts` (getScenes — synthesizes empty-act placeholders; writeScene — upsert).
- `app/page.tsx` — server component, awaits the repo reads and hands characters/locations/scenes/beats/zones to `<Hub>`.
- `app/api/save/route.ts` — POST, dispatches on `body.kind`: `scene`, `character`, `location-summary`, `room-fields`, `room-image-remove`.
- `app/api/generate/route.ts` — POST, Magnific image gen (`lib/magnific.ts`) → re-hosts the result via `lib/storage.ts` (Supabase) → `addRoomImage`.
- `lib/data.ts` / `lib/locations.ts` — **seed sources only** (typed defaults imported by `prisma/seed.ts`); also export the shared types. Not read at runtime.
- `lib/content.ts` — now just the `Scene` type.
- `components/Hub.tsx` — client tab shell: Characters, Storyline Chart, Location Bible, Scripts. Storyline has Threads + Map sub-views.

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

The antagonist AI is **"The Accord"** everywhere — a two-tier Core/Trooper design. It was formerly called "The Axiom"; that name has been fully retired across the prose canon and code. The physical machine city it controls is the **Accord City**, which in the storyline/plot data is the zone/lane key `ACCORD_CITY` (distinct from `ACCORD`, the network zone where Molly's consciousness ends up). Keep these two separate: `ACCORD_CITY` = the place, `ACCORD` = the network.

## Visual development workflow

`Visual_Development/` holds the prompt bible (`Character_Prompt_Bible.md`) and the image pipeline (`Image_Pipeline_Guide.md`). The intended pipeline is **generate consistent faces upstream** (Midjourney `--cref`, Flux + LoRA) → **finish in Magnific** (upscale/relight). Master Prompts in `lib/data.ts` mirror the bible. Magnific image tooling is available via MCP in this environment if generating new renders.
