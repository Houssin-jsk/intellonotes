"use client";

import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("landing.hero");
  const { user, role, isLoading } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-900)] via-[var(--color-primary-700)] to-[var(--color-primary-600)] text-white">
      {/* Decorative background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -start-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 end-0 w-80 h-80 rounded-full bg-[var(--color-secondary-600)]/20 blur-3xl" />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-primary-500)]/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-3xl">
          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            {t("title")}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-primary-100 mb-10 leading-relaxed max-w-2xl opacity-90">
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-12">
            {/* Primary CTA: always browse courses */}
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[var(--color-primary-700)] font-semibold text-sm hover:bg-[var(--color-primary-50)] transition-colors shadow-lg"
            >
              {t("browseCourses")}
            </Link>

            {/* Secondary CTA: role-dependent */}
            {!isLoading && (
              <>
                {!user && (
                  <>
                    <Link
                      href="/auth/register"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary-500)]/40 text-white font-semibold text-sm hover:bg-[var(--color-primary-500)]/60 border border-white/20 transition-colors"
                    >
                      {t("registerCTA")}
                    </Link>
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white/80 font-semibold text-sm hover:text-white hover:bg-white/10 border border-white/20 transition-colors"
                    >
                      {t("loginCTA")}
                    </Link>
                  </>
                )}
                {user && role === "student" && (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary-500)]/40 text-white font-semibold text-sm hover:bg-[var(--color-primary-500)]/60 border border-white/20 transition-colors"
                  >
                    {t("dashboardCTA")}
                  </Link>
                )}
                {user && role === "professor" && (
                  <Link
                    href="/professor/courses"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary-500)]/40 text-white font-semibold text-sm hover:bg-[var(--color-primary-500)]/60 border border-white/20 transition-colors"
                  >
                    {t("professorCTA")}
                  </Link>
                )}
                {user && role === "admin" && (
                  <Link
                    href="/admin/payments"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary-500)]/40 text-white font-semibold text-sm hover:bg-[var(--color-primary-500)]/60 border border-white/20 transition-colors"
                  >
                    {t("adminCTA")}
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {([t("trust1"), t("trust2"), t("trust3")] as string[]).map((point) => (
              <div key={point} className="flex items-center gap-2 text-sm text-white/80">
                <CheckCircle className="w-4 h-4 text-[var(--color-secondary-500)] shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
