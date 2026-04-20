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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {courses.map((course, i) => (
        <div key={course.id} style={{ animationDelay: `${i * 100}ms` }} className="animate-fade-in-up">
           <CourseCard course={course} />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  const t = useTranslations("catalog");
  return (
    <div className="text-center py-24 glass rounded-[2.5rem] border border-white/60 shadow-xl mt-6 animate-fade-in-scale">
      <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-50 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-200">
         <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
      <p className="text-slate-800 font-extrabold text-2xl mb-2">{t("noResults")}</p>
      <p className="text-lg text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">{t("noResultsHint")}</p>
    </div>
  );
}
