// Typed relationship edges between characters, plus the node-position writer for
// the relationship map. Same return-shape convention as the other repos.
import { prisma } from "@/lib/db";

export interface Relationship {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  label: string;
  order: number;
}

export async function getRelationships(): Promise<Relationship[]> {
  const rows = await prisma.relationship.findMany({ orderBy: { order: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    fromId: r.fromId,
    toId: r.toId,
    type: r.type,
    label: r.label,
    order: r.order,
  }));
}

export interface RelationshipInput {
  id?: string;
  fromId?: string;
  toId?: string;
  type?: string;
  label?: string;
}

export async function upsertRelationship(input: RelationshipInput): Promise<Relationship[]> {
  if (input.id) {
    const data: Record<string, unknown> = {};
    if (typeof input.fromId === "string") data.fromId = input.fromId;
    if (typeof input.toId === "string") data.toId = input.toId;
    if (typeof input.type === "string") data.type = input.type;
    if (typeof input.label === "string") data.label = input.label;
    await prisma.relationship.update({ where: { id: input.id }, data });
  } else {
    if (!input.fromId || !input.toId) throw new Error("fromId and toId are required");
    const order = await prisma.relationship.count();
    await prisma.relationship.create({
      data: {
        fromId: input.fromId,
        toId: input.toId,
        type: input.type ?? "",
        label: input.label ?? "",
        order,
      },
    });
  }
  return getRelationships();
}

export async function deleteRelationship(id: string): Promise<Relationship[]> {
  await prisma.relationship.deleteMany({ where: { id } });
  return getRelationships();
}

export async function setCharacterNode(id: string, mapX: number, mapY: number): Promise<void> {
  await prisma.character.update({ where: { id }, data: { mapX, mapY } });
}
