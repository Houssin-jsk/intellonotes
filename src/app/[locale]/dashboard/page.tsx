import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Link } from "@i18n/navigation";
import { BookOpen, Sparkles } from "lucide-react";
import { PurchasedCourseCard } from "@/components/dashboard/PurchasedCourseCard";
import type { PurchasedCourse } from "@/components/dashboard/PurchasedCourseCard";
import { getStudentPurchases, getStudentProgress } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("meta.title") };
}

type CourseWithAccess = PurchasedCourse & { lastAccessedAt: string };

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  const role = session.user.role;
  if (role !== "student") {
    redirect(`/${locale}`);
  }

  const userId = session.user.id;
  const userName = session.user.name ?? session.user.email ?? "";

  const t = await getTranslations({ locale, namespace: "dashboard" });

  // ── Parallel fetches ────────────────────────────────────────────────────────
  const [purchases, progressList] = await Promise.all([
    getStudentPurchases(userId),
    getStudentProgress(userId),
  ]);

  // ── Merge + sort ────────────────────────────────────────────────────────────
  const progressMap = new Map(progressList.map((p) => [p.course_id, p]));

  const courses: CourseWithAccess[] = purchases
    .filter((p) => p.course !== null)
    .map((p) => {
      const prog = progressMap.get(p.course_id);
      const rawDate = prog?.last_accessed_at;
      const isNeverAccessed = !rawDate;
      const lastAccessedLabel = isNeverAccessed
        ? undefined
        : t("lastAccessed", {
            date: new Intl.DateTimeFormat(locale, {
              day: "numeric",
              month: "short",
            }).format(new Date(rawDate)),
          });
      return {
        courseId: p.course_id,
        title: p.course!.title,
        language: p.course!.language,
        currentAxis: prog?.current_axis ?? 1,
        isCompleted: prog?.is_completed ?? false,
        lastAccessedLabel,
        lastAccessedAt: rawDate ?? new Date(0).toISOString(),
      };
    })
    .sort(
      (a, b) =>
        new Date(b.lastAccessedAt).getTime() -
        new Date(a.lastAccessedAt).getTime()
    );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[var(--background)] pb-24">
      {/* Premium Dashboard Header Shell */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-900)] to-[var(--color-primary-700)] pt-16 pb-32 mb-[-60px] z-0">
         <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[100px] rounded-full mix-blend-overlay -translate-y-1/2 translate-x-1/3" />
            <div className="absolute inset-0 bg-[url('/noise.png')] mix-blend-overlay opacity-20"></div>
         </div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-widest uppercase backdrop-blur-md shadow-sm">
                     <Sparkles className="w-3.5 h-3.5" />
                     {t("meta.title")}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm mb-2">
                     {t("welcomeBack", { name: userName })}
                  </h1>
                  <p className="text-lg text-[var(--color-primary-100)] font-medium max-w-2xl">{t("title")}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up delay-100">
         {courses.length === 0 ? (
           /* ── Empty state ── */
           <div className="glass-card rounded-[2.5rem] p-12 lg:p-16 text-center shadow-2xl border border-white/80 relative overflow-hidden backdrop-blur-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-200)] opacity-30 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
             <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-50 to-slate-100 rounded-[2rem] shadow-inner border border-white flex items-center justify-center mb-8 relative z-10">
               <BookOpen size={40} className="text-[var(--color-primary-400)]" />
             </div>
             <p className="text-slate-800 text-2xl font-extrabold mb-4 relative z-10 tracking-tight">{t("noCourses")}</p>
             <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Explore our catalog and find the perfect course to kickstart your journey.</p>
             <Link
               href="/courses"
               className="inline-flex items-center gap-2 relative z-10 font-bold bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-500)] text-white px-10 py-4 rounded-[1.25rem] transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] btn-3d border border-[var(--color-primary-400)]"
             >
               {t("browseCoursesLink")}
             </Link>
           </div>
         ) : (
           /* ── Course grid ── */
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {courses.map((course) => (
               <PurchasedCourseCard key={course.courseId} course={course} />
             ))}
           </div>
         )}
      </div>
    </main>
  );
}
