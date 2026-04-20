import { getTranslations } from "next-intl/server";
import { Link } from "@i18n/navigation";
import { getApprovedCourses } from "@/lib/db/queries";
import { CourseCard } from "@/components/courses/CourseCard";
import type { CourseCardData } from "@/components/courses/CourseCard";
import { ArrowRight } from "lucide-react";

export async function FeaturedCourses() {
  const t = await getTranslations("landing.featured");

  // Fetch up to 6 approved courses — no filters, sorted by newest
  const rows = await getApprovedCourses({});
  const featured: CourseCardData[] = rows.slice(0, 6).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    language: row.language,
    level: row.level,
    price: row.price,
    professor: row.professor ?? null,
  }));

  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[var(--color-primary-200)] to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 animate-fade-in-up">
          <div className="max-w-2xl">
             <span className="inline-block py-1.5 px-4 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-bold text-sm tracking-wide mb-4 border border-[var(--color-primary-100)] shadow-sm">
              Discover
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">{t("title")}</h2>
            <p className="text-lg text-slate-500 font-medium">{t("subtitle")}</p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary-50)] text-[var(--color-primary-700)] rounded-xl font-bold hover:bg-[var(--color-primary-100)] transition-all shrink-0 hover:shadow-md hover:-translate-y-0.5 border border-[var(--color-primary-100)] group"
          >
            {t("viewAll")}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Course grid or empty state */}
        {featured.length === 0 ? (
          <div className="text-center py-24 glass rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <p className="text-slate-600 font-bold text-lg">{t("empty")}</p>
            <p className="text-sm text-slate-400 mt-2">{t("emptyHint")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {featured.map((course, i) => (
              <div key={course.id} style={{ animationDelay: `${i * 100}ms` }} className="animate-fade-in-up">
                 <CourseCard course={course} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
