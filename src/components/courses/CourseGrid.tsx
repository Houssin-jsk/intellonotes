import { useTranslations } from "next-intl";
import { getApprovedCourses } from "@/lib/db/queries";
import { CourseCard, type CourseCardData } from "./CourseCard";

interface CourseGridProps {
  q?: string;
  language?: string;
  level?: string;
}

export async function CourseGrid({ q, language, level }: CourseGridProps) {
  const rows = await getApprovedCourses({ q, language, level });

  // Map Drizzle result shape to CourseCardData
  const courses: CourseCardData[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    language: row.language,
    level: row.level,
    price: row.price,
    professor: row.professor ?? null,
  }));

  if (courses.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

function EmptyState() {
  const t = useTranslations("catalog");
  return (
    <div className="text-center py-16">
      <p className="text-gray-500 font-medium">{t("noResults")}</p>
      <p className="text-sm text-gray-400 mt-1">{t("noResultsHint")}</p>
    </div>
  );
}
