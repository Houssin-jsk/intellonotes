"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@i18n/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isLoading } = useAuth();

  const otherLocale = locale === "fr" ? "ar" : "fr";

  async function handleLogout() {
    await signOut({ redirect: false });
    router.refresh();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[var(--color-primary-600)]">
              IntelloNotes
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Locale switcher */}
            <Link
              href={pathname}
              locale={otherLocale as "fr" | "ar"}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              {otherLocale === "ar" ? "AR" : "FR"}
            </Link>

            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    {role === "admin" && (
                      <Link
                        href="/admin/payments"
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        {t("admin")}
                      </Link>
                    )}
                    {role === "professor" && (
                      <Link
                        href="/professor/courses"
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        {t("myCourses")}
                      </Link>
                    )}
                    {role === "student" && (
                      <Link
                        href="/dashboard"
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        {t("dashboard")}
                      </Link>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      {t("logout")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm">
                        {t("login")}
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="sm">{t("register")}</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
