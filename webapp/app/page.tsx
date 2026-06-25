import { getCharacters } from "@/lib/repo/characters";
import { getLocations } from "@/lib/repo/locations";
import { getScenes } from "@/lib/repo/scenes";
import { getBeats, getZones } from "@/lib/repo/storyline";
import { getProject } from "@/lib/repo/project";
import { getAllShots } from "@/lib/repo/shots";
import { getRelationships } from "@/lib/repo/relationships";
import { createClient } from "@/lib/supabase/server";
import Hub from "@/components/Hub";

export const dynamic = "force-dynamic"; // always read fresh from the DB

export default async function Page() {
  const supabase = createClient();
  const [{ data: { user } }, characters, locations, scenes, beats, zones, project, shots, relationships] =
    await Promise.all([
      supabase.auth.getUser(),
      getCharacters(),
      getLocations(),
      getScenes(),
      getBeats(),
      getZones(),
      getProject(),
      getAllShots(),
      getRelationships(),
    ]);
  return (
    <Hub
      characters={characters}
      locations={locations}
      scenes={scenes}
      beats={beats}
      zones={zones}
      project={project}
      shots={shots}
      relationships={relationships}
      userEmail={user?.email ?? null}
    />
  );
}
