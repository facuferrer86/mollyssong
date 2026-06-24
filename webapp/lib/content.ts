// Scene shape shared by the scenes repo and the Scripts UI. The filesystem
// reader/writer that used to live here has been replaced by Postgres — see
// lib/repo/scenes.ts. Kept as a types-only module so existing imports of
// `Scene` keep working.

export interface Scene {
  id: string; // relative path, e.g. Act_I_Growing_Up/Scene_01_The_Lullaby.md
  act: string;
  title: string;
  text: string;
  empty?: boolean;
}
