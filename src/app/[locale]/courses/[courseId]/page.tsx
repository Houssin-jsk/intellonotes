import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Link } from "@i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { AxisTOC } from "@/components/courses/AxisTOC";
import { PurchaseButton } from "@/components/courses/PurchaseButton";
import { LANGUAGE_COLORS, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";
import {
  getCourseDetail,
  getCourseLessons,
  getPurchaseStatus,
} from "@/lib/db/queries";
import { Sparkles, ArrowLeft, Target, Lightbulb, FileText, User } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const course = getCourseDetail(courseId);
  if (!course) return { title: "IntelloNotes" };
  return {
    title: `${course.title} — IntelloNotes`,
    description: course.description?.slice(0, 160),
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const { locale, courseId } = await params;
  setRequestLocale(locale);

  const [t, tCatalog, tCommon, session] = await Promise.all([
    getTranslations("course"),
    getTranslations("catalog"),
    getTranslations("common"),
    auth(),
  ]);

  // Parallel: course + lessons (purchase depends on session)
  const [course, lessons] = await Promise.all([
    getCourseDetail(courseId),
    getCourseLessons(courseId),
  ]);

  if (!course) {
    notFound();
  }

  // Purchase status depends on session — professors and admins cannot purchase
  const userId = session?.user?.id ?? null;
  const userRole = session?.user?.role ?? null;
  const isStudent = userRole === "student" || userRole === null; // guests treated as potential students

  let purchaseStatus: "pending" | "confirmed" | "rejected" | null = null;
  if (userId && isStudent) {
    const purchase = getPurchaseStatus(userId, courseId);
    purchaseStatus = purchase?.status ?? null;
  }

  const isPurchased = purchaseStatus === "confirmed";
  const professor = course.professor ?? null;

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24">
      {/* Decorative Hero Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-900)] to-[var(--color-primary-800)] pt-12 pb-32 mb-[-80px] z-0 isolate">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-[var(--color-primary-600)] rounded-full blur-[100px] opacity-40 animate-pulse" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[var(--color-primary-400)] rounded-full blur-[120px] opacity-20" />
          <div className="absolute inset-0 bg-[url('/noise.png')] mix-blend-overlay opacity-10"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
           {/* Back link */}
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors mb-8 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 w-fit shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> {tCommon("back")}
          </Link>
          
          <div className="max-w-4xl">
             <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge className={`shadow-sm border-white/20 px-3 py-1 text-xs tracking-widest uppercase font-extrabold ${LANGUAGE_COLORS[course.language]}`}>
                  {LANGUAGE_DISPLAY_NAMES[course.language]}
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-sm px-3 py-1 text-xs tracking-widest uppercase font-extrabold">
                  {tCatalog(course.level)}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight drop-shadow-md">
                 {course.title}
              </h1>
              <p className="text-xl text-[var(--color-primary-100)] leading-relaxed font-medium max-w-3xl">
                 {course.description}
              </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* ── Main content ── */}
            <div className="lg:col-span-2 space-y-10 animate-fade-in-up delay-100">
              
              {/* Professor card */}
              {professor && (
                <div className="flex items-start gap-5 p-6 glass-card rounded-[2rem] border border-white/80 shadow-md">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-100)] to-white border-2 border-[var(--color-primary-200)] shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                    {professor.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={professor.avatar_url}
                        alt={professor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[var(--color-primary-700)] font-black text-2xl">
                        {professor.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 text-[var(--color-primary-600)]">
                       <User className="w-4 h-4" />
                       <p className="text-xs font-bold uppercase tracking-widest">{t("professor")}</p>
                    </div>
                    <p className="font-extrabold text-slate-900 text-xl tracking-tight">{professor.name}</p>
                    {professor.bio && (
                      <p className="text-sm text-slate-600 font-medium mt-2 leading-relaxed line-clamp-3">
                        {professor.bio}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Learning objectives */}
              {(course.objectives ?? []).length > 0 && (
                <section className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/60 shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                     <Target className="w-6 h-6 text-emerald-500" />
                     <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                       {t("objectives")}
                     </h2>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 relative z-10">
                    {(course.objectives ?? []).map((obj, i) => (
                      <li key={i} className="flex items-start gap-3 p-4 bg-white/50 rounded-2xl border border-emerald-100 hover:bg-white hover:shadow-sm transition-all text-sm text-slate-700 font-medium leading-relaxed">
                        <span className="mt-0.5 w-6 h-6 sm:shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                          ✓
                        </span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Prerequisites */}
              {(course.prerequisites ?? []).length > 0 && (
                <section className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/60 shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                     <Lightbulb className="w-6 h-6 text-amber-500" />
                     <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                       {t("prerequisites")}
                     </h2>
                  </div>
                  <ul className="space-y-3 relative z-10">
                    {(course.prerequisites ?? []).map((prereq, i) => (
                      <li key={i} className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl border border-amber-100 hover:bg-white hover:shadow-sm transition-all text-sm text-slate-700 font-medium leading-relaxed">
                        <span className="mt-0.5 w-6 h-6 sm:shrink-0 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                          !
                        </span>
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* 5-axis table of contents */}
              <section className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/60 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <FileText className="w-6 h-6 text-[var(--color-primary-500)]" />
                   <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                     {t("tableOfContents")}
                   </h2>
                </div>
                <AxisTOC lessons={lessons} isPurchased={isPurchased} />
              </section>
            </div>

            {/* ── Sticky sidebar ── */}
            <div className="lg:col-span-1 animate-fade-in-up delay-200">
              <div className="sticky top-28 glass-card rounded-[2.5rem] border border-white/80 p-8 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-[var(--color-primary-50)] rounded-full blur-[50px] opacity-40 pointer-events-none" />
                
                <div className="relative z-10">
                   <p className="text-5xl font-extrabold text-[var(--color-primary-600)] mb-8 text-center drop-shadow-sm tracking-tight">
                     {course.price > 0 ? course.price : "Gratuit"}{course.price > 0 && <span className="text-xl font-bold text-slate-400 ms-1">Dh</span>}
                   </p>

                   {isStudent ? (
                     <div className="mb-8">
                        <PurchaseButton
                          courseId={courseId}
                          price={course.price}
                          purchaseStatus={purchaseStatus}
                          userId={userId}
                        />
                     </div>
                   ) : null}

                   <div className="pt-6 border-t border-slate-200/60 space-y-5 text-sm font-medium">
                     <div className="flex items-center justify-between">
                       <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">{t("language")}</span>
                       <span className="text-slate-900 font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
                         {LANGUAGE_DISPLAY_NAMES[course.language]}
                       </span>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">{t("level")}</span>
                       <span className="text-slate-900 font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
                         {tCatalog(course.level)}
                       </span>
                     </div>
                     {professor && (
                       <div className="flex items-center justify-between">
                         <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">{t("professor")}</span>
                         <span className="text-[var(--color-primary-700)] font-extrabold truncate ms-2">
                           {professor.name}
                         </span>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </div>
         </div>
      </div>
    </main>
  );
}
