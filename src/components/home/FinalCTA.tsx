"use client";

import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { useAuth } from "@/hooks/useAuth";

export function FinalCTA() {
  const t = useTranslations("landing.finalCta");
  const { user, role, isLoading } = useAuth();

  // Determine the primary link for logged-in users based on role
  function getLoggedInHref(r: string | null): string {
    if (r === "student") return "/dashboard";
    if (r === "professor") return "/professor/courses";
    if (r === "admin") return "/admin/payments";
    return "/courses";
  }

  return (
    <section className="py-20 bg-gradient-to-br from-[var(--color-primary-800)] to-[var(--color-primary-600)] text-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-20 -end-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-0 start-1/3 w-64 h-64 rounded-full bg-[var(--color-secondary-600)]/20 blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("title")}</h2>
        <p className="text-lg text-white/80 mb-10">{t("subtitle")}</p>

        {!isLoading && (
          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <>
                <Link
                  href={getLoggedInHref(role)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[var(--color-primary-700)] font-semibold text-sm hover:bg-[var(--color-primary-50)] transition-colors shadow-lg"
                >
                  {t("loggedInPrimary")}
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  {t("loggedInSecondary")}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[var(--color-primary-700)] font-semibold text-sm hover:bg-[var(--color-primary-50)] transition-colors shadow-lg"
                >
                  {t("guestPrimary")}
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  {t("guestSecondary")}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
