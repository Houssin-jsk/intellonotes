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
    <header className="sticky top-0 z-50 glass border-b border-white/50 bg-white/50 backdrop-blur-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-[96px] gap-8 sm:gap-12">
          <Link href="/" className="shrink-0 flex items-center group">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary-400)] to-[var(--color-primary-600)] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full scale-[1.5]"></div>
              <Image
                src="/logo.png"
                alt="IntelloNotes Logo"
                width={220}
                height={220}
                className="h-24 sm:h-28 w-auto object-contain relative z-10 transition-transform duration-500 group-hover:scale-[1.03] drop-shadow-2xl"
                priority
              />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link href="/" className="text-[15px] font-bold text-slate-600 hover:text-[var(--color-primary-600)] px-5 py-2.5 rounded-2xl hover:bg-white/60 hover:glass hover:shadow-sm transition-all">{t("home")}</Link>
            <Link href="/courses" className="text-[15px] font-bold text-slate-600 hover:text-[var(--color-primary-600)] px-5 py-2.5 rounded-2xl hover:bg-white/60 hover:glass hover:shadow-sm transition-all">{t("courses")}</Link>
          </nav>

          <div className="flex items-center gap-4 ms-auto">
            <Link href={pathname} locale={otherLocale as "fr" | "ar"} className="text-xs font-bold text-slate-500 hover:text-[var(--color-primary-600)] px-3 py-2 rounded-xl border border-slate-200 hover:border-[var(--color-primary-300)] hover:bg-slate-50/50 transition-all shadow-sm">
              {otherLocale === "ar" ? "عربي" : "FR"}
            </Link>

            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    {role === "admin" && (
                      <Link href="/admin/payments" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:block px-3 py-2 rounded-xl hover:glass transition-all">{t("admin")}</Link>
                    )}
                    {role === "professor" && (
                      <>
                        <Link href="/professor/courses" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:block px-3 py-2 rounded-xl hover:glass transition-all">{t("myCourses")}</Link>
                        <Link href="/professor/earnings" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:block px-3 py-2 rounded-xl hover:glass transition-all">{t("earnings")}</Link>
                      </>
                    )}
                    {role === "student" && (
                      <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:block px-3 py-2 rounded-xl hover:glass transition-all">{t("dashboard")}</Link>
                    )}
                    <Link href="/profile" className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:glass transition-all">{t("profile")}</Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:inline-flex ml-2">{t("logout")}</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/auth/login"><Button variant="ghost" size="sm" className="font-semibold">{t("login")}</Button></Link>
                    <Link href="/auth/register"><Button size="sm" className="font-semibold shadow-md">{t("register")}</Button></Link>
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