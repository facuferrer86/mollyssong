// Project-level story bible (singleton row, id == "molly"). Read returns sane
// defaults when the row doesn't exist yet; writes upsert. worldRules/forbids are
// stored as JSON string arrays.
import { prisma } from "@/lib/db";

const ID = "molly";

export interface ProjectData {
  logline: string;
  theme: string;
  worldRules: string[];
  forbids: string[];
  structureTemplate: string | null;
}

function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export async function getProject(): Promise<ProjectData> {
  const p = await prisma.project.findUnique({ where: { id: ID } });
  return {
    logline: p?.logline ?? "",
    theme: p?.theme ?? "",
    worldRules: strList(p?.worldRules),
    forbids: strList(p?.forbids),
    structureTemplate: p?.structureTemplate ?? null,
  };
}

export async function updateProject(patch: Partial<ProjectData>): Promise<ProjectData> {
  const data: {
    logline?: string;
    theme?: string;
    worldRules?: string[];
    forbids?: string[];
    structureTemplate?: string | null;
  } = {};
  if (typeof patch.logline === "string") data.logline = patch.logline;
  if (typeof patch.theme === "string") data.theme = patch.theme;
  if (Array.isArray(patch.worldRules)) data.worldRules = strList(patch.worldRules);
  if (Array.isArray(patch.forbids)) data.forbids = strList(patch.forbids);
  if (patch.structureTemplate !== undefined) data.structureTemplate = patch.structureTemplate;

  await prisma.project.upsert({
    where: { id: ID },
    update: data,
    create: { id: ID, ...data },
  });
  return getProject();
}
