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
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t("title")}</h2>
            <p className="mt-2 text-gray-500">{t("subtitle")}</p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors shrink-0"
          >
            {t("viewAll")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Course grid or empty state */}
        {featured.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 font-medium">{t("empty")}</p>
            <p className="text-sm text-gray-400 mt-1">{t("emptyHint")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
