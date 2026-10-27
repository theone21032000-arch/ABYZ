import type { CreateProjectInput } from "@/lib/validators/project";
import { getPrisma } from "@/lib/database";

export function listProjectsForUser(clerkUserId: string) {
  return getPrisma().project.findMany({
    where: { ownerId: clerkUserId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, description: true, type: true, stage: true, updatedAt: true }
  });
}

export function getProjectByIdForUser(id: string, clerkUserId: string) {
  return getPrisma().project.findFirst({
    where: { id, ownerId: clerkUserId },
    include: {
      thoughts: {
        orderBy: { position: "asc" }
      }
    }
  });
}

export function createProjectForUser(clerkUserId: string, input: CreateProjectInput) {
  return getPrisma().project.create({
    data: { ...input, ownerId: clerkUserId }
  });
}
