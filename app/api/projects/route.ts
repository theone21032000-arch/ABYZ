import { auth, currentUser } from "@clerk/nextjs/server";
import { createProjectForUser, listProjectsForUser } from "@/lib/data/projects";
import { upsertUserFromClerk } from "@/lib/data/users";
import { createProjectSchema } from "@/lib/validators/project";

async function requireDatabaseUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses.find((address) => address.id === clerkUser.primaryEmailAddressId)?.emailAddress;
  if (!clerkUser || !email) return null;

  await upsertUserFromClerk({
    id: userId,
    email,
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null
  });
  return userId;
}

export async function GET() {
  const userId = await requireDatabaseUser();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await listProjectsForUser(userId));
}

export async function POST(request: Request) {
  const userId = await requireDatabaseUser();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = createProjectSchema.safeParse(await request.json());
  if (!body.success) return Response.json({ error: "Invalid project", issues: body.error.issues }, { status: 400 });
  return Response.json(await createProjectForUser(userId, body.data), { status: 201 });
}
