import { getPrisma } from "@/lib/database";

type ClerkUser = { id: string; email: string; name: string | null };

export function upsertUserFromClerk(user: ClerkUser) {
  return getPrisma().user.upsert({
    where: { id: user.id },
    update: { email: user.email, name: user.name },
    create: user
  });
}
