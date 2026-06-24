import { getCharacters } from "@/lib/repo/characters";
import { getLocations } from "@/lib/repo/locations";
import { getScenes } from "@/lib/repo/scenes";
import { getBeats, getZones } from "@/lib/repo/storyline";
import { createClient } from "@/lib/supabase/server";
import Hub from "@/components/Hub";

export const dynamic = "force-dynamic"; // always read fresh from the DB

export default async function Page() {
  const supabase = createClient();
  const [{ data: { user } }, characters, locations, scenes, beats, zones] = await Promise.all([
    supabase.auth.getUser(),
    getCharacters(),
    getLocations(),
    getScenes(),
    getBeats(),
    getZones(),
  ]);
  return (
    <Hub
      characters={characters}
      locations={locations}
      scenes={scenes}
      beats={beats}
      zones={zones}
      userEmail={user?.email ?? null}
    />
  );
}
