import { auth } from "@clerk/nextjs/server";
import { getProjectByIdForUser } from "@/lib/data/projects";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return Response.json({ error: "Missing project id" }, { status: 400 });

  const project = await getProjectByIdForUser(id, userId);
  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

  return Response.json(project);
}

