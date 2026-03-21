"use client";

import { useEffect } from "react";
import { useRouter } from "@i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import type { UserRole } from "@/types";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({
  allowedRoles,
  children,
  redirectTo = "/",
}: RoleGuardProps) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    // Redirect if role is null (fetch failed) or not in the allowed list
    if (!role || !allowedRoles.includes(role)) {
      router.push(redirectTo);
    }
  }, [user, role, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" className="text-[var(--color-primary-600)]" />
      </div>
    );
  }

  // Also block if role is null (DB fetch failed) — fail closed, not open
  if (!user || !role || !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
