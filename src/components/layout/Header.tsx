"use client";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@i18n/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

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
    <header className="fixed top-4 left-0 right-0 z-50 transition-all flex justify-center px-4">
      <div className="w-full max-w-5xl glass rounded-full border border-white/40 bg-white/40 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05),inset_0_2px_12px_rgba(255,255,255,0.8)] px-4 sm:px-8 py-2 md:py-3">
        <div className="flex items-center justify-between gap-4 md:gap-8 min-h-[64px]">
          <Link href="/" className="shrink-0 flex items-center group relative z-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary-400)] to-[var(--color-primary-600)] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full scale-[1.2]"></div>
            <Image
              src="/logo.png"
              alt="IntelloNotes Logo"
              width={160}
              height={160}
              className="h-16 sm:h-20 w-auto object-contain relative z-20 transition-transform duration-500 group-hover:scale-[1.03] drop-shadow-xl"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1 md:gap-2">
            <Link href="/" className="text-[14px] font-bold text-slate-600 hover:text-[var(--color-primary-600)] px-4 py-2 rounded-full hover:bg-white/60 hover:shadow-sm transition-all">{t("home")}</Link>
            <Link href="/courses" className="text-[14px] font-bold text-slate-600 hover:text-[var(--color-primary-600)] px-4 py-2 rounded-full hover:bg-white/60 hover:shadow-sm transition-all">{t("courses")}</Link>
          </nav>

          <div className="flex items-center gap-3 ms-auto">
            <Link href={pathname} locale={otherLocale as "fr" | "ar"} className="text-xs font-bold text-slate-500 hover:text-[var(--color-primary-600)] px-3 py-1.5 rounded-full border border-white/50 bg-white/30 hover:bg-white/70 hover:border-white shadow-sm transition-all">
              {otherLocale === "ar" ? "عربي" : "FR"}
            </Link>

            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-1.5">
                    {role === "admin" && (
                      <Link href="/admin/payments" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:block px-3 py-1.5 rounded-full hover:bg-white/60 transition-all">{t("admin")}</Link>
                    )}
                    {role === "professor" && (
                      <>
                        <Link href="/professor/courses" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:block px-3 py-1.5 rounded-full hover:bg-white/60 transition-all">{t("myCourses")}</Link>
                        <Link href="/professor/earnings" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:block px-3 py-1.5 rounded-full hover:bg-white/60 transition-all">{t("earnings")}</Link>
                      </>
                    )}
                    {role === "student" && (
                      <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:block px-3 py-1.5 rounded-full hover:bg-white/60 transition-all">{t("dashboard")}</Link>
                    )}
                    <Link href="/profile" className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-white/60 transition-all">{t("profile")}</Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:inline-flex rounded-full px-4 font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50/50">{t("logout")}</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/login"><Button variant="ghost" size="sm" className="font-semibold rounded-full px-4 hidden sm:inline-flex">{t("login")}</Button></Link>
                    <Link href="/auth/register"><Button size="sm" className="font-semibold shadow-md rounded-full px-5 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] hover:shadow-lg hover:shadow-[var(--color-primary-500)]/20 transition-all">{t("register")}</Button></Link>
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