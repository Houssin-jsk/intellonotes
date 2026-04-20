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
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[var(--background)] -z-10" />
      
      <div className="relative max-w-6xl mx-auto rounded-[3rem] overflow-hidden bg-gradient-to-br from-[var(--color-primary-800)] via-[var(--color-primary-600)] to-[var(--color-primary-900)] shadow-[0_40px_80px_-20px_rgba(37,99,235,0.4)] neumorph border-4 border-white/20 hover:border-white/30 transition-colors duration-500 animate-fade-in-up">
        {/* Cinematic Decorative Backgrounds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/20 blur-[80px] opacity-60 animate-pulse" />
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-[var(--color-accent-400)]/30 blur-[80px] opacity-60" />
          <div className="absolute inset-0 bg-[url('/noise.png')] mix-blend-overlay opacity-10"></div>
          <div className="absolute inset-0 mix-blend-overlay opacity-40 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-24 sm:p-28 text-center">
           <span className="inline-block py-1.5 px-6 rounded-full bg-white/10 text-white font-bold text-sm tracking-widest uppercase mb-8 border border-white/20 shadow-inner backdrop-blur-md">
            Get Started
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight text-white drop-shadow-md">{t("title")}</h2>
          <p className="text-lg md:text-xl text-blue-50 mb-14 max-w-2xl text-center leading-relaxed font-medium">{t("subtitle")}</p>

          {!isLoading && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
              {user ? (
                <>
                  <Link
                    href={getLoggedInHref(role)}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-10 py-5 rounded-2xl bg-white text-[var(--color-primary-800)] font-extrabold text-lg hover:bg-slate-50 transition-transform active:scale-95 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] btn-3d border border-white"
                  >
                    {t("loggedInPrimary")}
                  </Link>
                  <Link
                    href="/courses"
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-10 py-5 rounded-2xl border-2 border-white/40 text-white font-bold text-lg hover:bg-white/10 transition-all active:scale-95 glass backdrop-blur-xl"
                  >
                    {t("loggedInSecondary")}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-10 py-5 rounded-2xl bg-white text-[var(--color-primary-800)] font-extrabold text-lg hover:bg-slate-50 transition-transform active:scale-95 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] btn-3d border border-white"
                  >
                    {t("guestPrimary")}
                  </Link>
                  <Link
                    href="/courses"
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-10 py-5 rounded-2xl border-2 border-white/30 text-white font-bold text-lg hover:bg-white/10 hover:border-white/50 transition-all active:scale-95 glass backdrop-blur-xl"
                  >
                    {t("guestSecondary")}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
