"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";

interface UpdateProfileInput {
  name: string;
  bio?: string;
  expertise?: string;
}

export async function updateProfile(
  data: UpdateProfileInput,
  locale: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "unauthenticated" };

  const name = data.name?.trim();
  if (!name || name.length < 2) return { error: "nameRequired" };
  if (name.length > 100) return { error: "nameTooLong" };

  const bio = data.bio?.trim() || null;
  const expertise = data.expertise?.trim() || null;

  try {
    db.update(users)
      .set({ name, bio, expertise })
      .where(eq(users.id, session.user.id))
      .run();
  } catch {
    return { error: "generic" };
  }

  revalidatePath(`/${locale}/profile`);
  return {};
}
