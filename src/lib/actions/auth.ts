"use server";

import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import type { UserRole } from "@/lib/db/queries";

type RegisterResult = { error?: string };

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<RegisterResult> {
  if (!name?.trim()) return { error: "nameRequired" };
  if (!email?.trim()) return { error: "emailRequired" };
  if (!password) return { error: "passwordRequired" };
  if (password.length < 8) return { error: "passwordTooShort" };
  if (!["student", "professor"].includes(role)) return { error: "invalidRole" };

  const password_hash = await bcrypt.hash(password, 12);

  try {
    db.insert(users)
      .values({
        id: uuidv4(),
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role,
        password_hash,
      })
      .run();
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (
      err?.code === "SQLITE_CONSTRAINT_UNIQUE" ||
      err?.message?.includes("UNIQUE constraint failed")
    ) {
      return { error: "emailAlreadyRegistered" };
    }
    return { error: "generic" };
  }

  return {};
}
