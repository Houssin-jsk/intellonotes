"use client";

import { useSession } from "next-auth/react";
import type { UserRole } from "@/types";

interface AuthState {
  user: { id: string; email?: string | null; name?: string | null } | null;
  role: UserRole | null;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return { user: null, role: null, isLoading: true };
  }

  if (!session?.user) {
    return { user: null, role: null, isLoading: false };
  }

  const role = session.user.role as UserRole | null;

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    role: role ?? null,
    isLoading: false,
  };
}
