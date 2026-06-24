# Molly's Song — Project Hub (Next.js + Postgres)

A browsable, editable hub for the Molly's Song film bible. Four tabs (Characters,
Storyline Chart, Location Bible, Scripts) backed by a **PostgreSQL database** as the
single source of truth — Supabase in production, docker Postgres locally.

This app lives in `webapp/`. It used to read sibling markdown folders; now those are
the **seed source** only (`lib/data.ts` + `lib/locations.ts` + `Screenplay/**/*.md`),
imported into Postgres once and edited in place thereafter.

## Run it

```bash
cd webapp
npm install
cp .env.example .env      # fill in DB + Supabase + Magnific values
docker compose up -d      # local Postgres on host port 5544
npm run db:migrate        # apply the schema
npm run db:seed           # import defaults + Screenplay markdown into the DB
npm run dev               # http://localhost:3000
```

`npm run db:studio` opens Prisma Studio to eyeball/edit rows. `npm run db:reset`
re-applies migrations and re-seeds (destructive — resets to defaults).

For hosted/prod, point `DATABASE_URL`/`DIRECT_URL` at Supabase instead of docker (see
`.env.example`).

## ⚠️ Rescue the images first (time-sensitive)

The seeded character renders point at signed Pikaso CDN links that **expire
2026-06-27**. The seed re-hosts them permanently in Supabase Storage — but only if
Supabase is configured. So, before the deadline:

1. Create a Supabase project and a **public Storage bucket named `renders`**.
2. Put `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env`.
3. Run `npm run db:seed` — every character/gallery/room image is downloaded and
   re-hosted, and the DB stores the permanent public URL.

Without Supabase, the seed keeps the original (expiring) URLs; cached copies in
`public/renders` serve as a fallback until then.

## What's wired up

- **Characters** — grid + detail drawer with galleries and editable bible fields +
  Master Prompt. Edits POST to `/api/save` (`kind:"character"`) → `updateCharacter` →
  Postgres.
- **Storyline Chart** — two sub-views over the same beats/zones data: **Threads** (SVG
  character-thread diagram) and **Map** (timeline scrubber + location stage + "at this
  moment" panel, formerly the "Plot Locations" tab).
- **Location Bible** — locations → rooms, each with lighting / sounds / ambient /
  furniture / small-map fields and a gallery of camera angles. Generates renders
  in-app via the Magnific API (`/api/generate`), re-hosted to Supabase Storage.
- **Scripts** — screenplay scenes from the DB. Saving upserts the scene row; empty acts
  show a "to write" placeholder that becomes a real row on first save.

## Project layout

```
webapp/
  prisma/
    schema.prisma     DB schema (Character, Beat, Zone, Location, Room, RoomImage, Scene…)
    seed.ts           one-time importer: TS defaults + Screenplay md -> Postgres
  app/
    page.tsx          server component: awaits lib/repo reads, passes to <Hub>
    api/save/route.ts     POST: scene / character / location writes via lib/repo
    api/generate/route.ts POST: Magnific render/reframe -> Supabase Storage -> DB
  components/         Hub, Characters, Storyline, StageMap, LocationBible, Scripts, Img, toast
  lib/
    db.ts             Prisma client singleton
    repo/             data-access layer (characters, storyline, locations, scenes)
    storage.ts        Supabase Storage bridge (uploadFromUrl)
    magnific.ts       Magnific (Freepik) API bridge: Mystic + reframe
    data.ts           seed defaults: CHARS / BEATS / ZONES (+ shared types)
    locations.ts      seed defaults: LOCATIONS (+ shared types)
    content.ts        the Scene type
    images.ts         remote-url -> cached-local-path fallback for character images
  docker-compose.yml  local Postgres (host port 5544)
```

## Canon note

The antagonist AI is **"The Accord"** (two-tier Core / Trooper design) everywhere. The
former name "The Axiom" has been fully retired. The machine city is the **Accord
City**, stored as the zone/lane key `ACCORD_CITY` — distinct from `ACCORD`, the network
zone.

## Good next steps

- **Auth & collaboration** — add Supabase Auth + RLS and gate the write routes
  (`/api/save`, `/api/generate`). Until then, protect any public deploy (Vercel
  password / shared-secret header).
- Deploy to Vercel pointing at Supabase — the filesystem-write assumptions are gone, so
  it works on a read-only host.
- "New scene / new character / new room" creation from the UI.
- Optional: a build step that exports a readable markdown snapshot of the DB back into
  `Characters/`, `World/`, etc. for human archiving.
```
