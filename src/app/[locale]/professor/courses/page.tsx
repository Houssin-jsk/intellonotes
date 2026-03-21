import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Link } from "@i18n/navigation";
import { Button } from "@/components/ui/Button";
import { ProfessorCourseList } from "@/components/professor/ProfessorCourseList";
import { EmptyCoursesState } from "@/components/professor/EmptyCoursesState";
import { getProfessorCourses } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "professor.meta" });
  return { title: t("title") };
}

export default async function ProfessorCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, session] = await Promise.all([
    getTranslations("professor.courses"),
    auth(),
  ]);

  const courses = getProfessorCourses(session!.user.id);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          {courses.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {t("courseCount", { count: courses.length })}
            </p>
          )}
        </div>
        <Link href="/professor/courses/new">
          <Button>+ {t("createCourse")}</Button>
        </Link>
      </div>

      {courses.length > 0 ? (
        <ProfessorCourseList courses={courses} />
      ) : (
        <EmptyCoursesState />
      )}
    </main>
  );
}
