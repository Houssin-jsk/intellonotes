"use client";

import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("landing.hero");
  const { user, role, isLoading } = useAuth();

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center bg-[var(--background)] text-slate-900 border-b border-gray-200/50 py-24">
      {/* Elegant Atmospheric Background Animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-gradient-to-bl from-[var(--color-primary-200)] to-purple-100 blur-[130px] opacity-60 translate-x-1/3 -translate-y-1/4 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 left-0 w-[900px] h-[900px] rounded-full bg-gradient-to-tr from-blue-100 to-[var(--color-primary-100)] blur-[150px] opacity-60 -translate-x-1/4 translate-y-1/4 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full bg-indigo-50 blur-[140px] opacity-50 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col items-center text-center">
        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold leading-[1.1] tracking-tight mb-8 text-slate-900 animate-fade-in-up delay-200 opacity-0 drop-shadow-sm max-w-4xl">
          {t("title")}
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-slate-600 mb-12 leading-relaxed font-medium animate-fade-in-up delay-300 opacity-0 max-w-3xl mx-auto">
          {t("subtitle")}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up delay-400 opacity-0 w-full sm:w-auto">
          {/* Primary CTA */}
          <Link
            href="/courses"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-500)] text-white font-bold text-lg hover:from-[var(--color-primary-700)] hover:to-[var(--color-primary-600)] btn-3d shadow-lg"
          >
            {t("browseCourses")}
          </Link>

          {/* Secondary CTA: role-dependent */}
          {!isLoading && (
            <>
              {!user && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                  <Link
                    href="/auth/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl neumorph text-slate-800 font-bold text-lg hover:text-[var(--color-primary-600)] transition-all active:neumorph-inner"
                  >
                    {t("registerCTA")}
                  </Link>
                  <Link
                    href="/auth/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-slate-600 font-bold text-lg hover:glass hover:text-slate-900 transition-all backdrop-blur-md bg-white/30"
                  >
                    {t("loginCTA")}
                  </Link>
                </div>
              )}
              {user && role === "student" && (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl neumorph text-slate-800 font-bold text-lg hover:text-[var(--color-primary-600)] transition-all active:neumorph-inner"
                >
                  {t("dashboardCTA")}
                </Link>
              )}
              {user && role === "professor" && (
                <Link
                  href="/professor/courses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl neumorph text-slate-800 font-bold text-lg hover:text-[var(--color-primary-600)] transition-all active:neumorph-inner"
                >
                  {t("professorCTA")}
                </Link>
              )}
              {user && role === "admin" && (
                <Link
                  href="/admin/payments"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl neumorph text-slate-800 font-bold text-lg hover:text-[var(--color-primary-600)] transition-all active:neumorph-inner"
                >
                  {t("adminCTA")}
                </Link>
              )}
            </>
          )}
        </div>

        {/* Trust points */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 animate-fade-in-up delay-500 opacity-0">
          {([t("trust1"), t("trust2"), t("trust3")] as string[]).map((point, i) => (
            <div key={point} className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 glass px-5 py-2.5 rounded-full border border-white/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-0.5">
              <CheckCircle className="w-5 h-5 text-[var(--color-primary-500)] shrink-0" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
