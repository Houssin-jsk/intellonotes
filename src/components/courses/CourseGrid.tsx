import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/server";
import { CourseCard, type CourseCardData } from "./CourseCard";
import type { CourseLanguage, CourseLevel } from "@/types/database";

interface CourseGridProps {
  q?: string;
  language?: string;
  level?: string;
}

export async function CourseGrid({ q, language, level }: CourseGridProps) {
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select("id, title, description, language, level, price, professor:users!professor_id(name, avatar_url)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (q?.trim()) {
    query = query.ilike("title", `%${q.trim()}%`);
  }
  if (language) {
    query = query.eq("language", language as CourseLanguage);
  }
  if (level) {
    query = query.eq("level", level as CourseLevel);
  }

  const { data } = await query;
  const courses = (data ?? []) as unknown as CourseCardData[];

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
