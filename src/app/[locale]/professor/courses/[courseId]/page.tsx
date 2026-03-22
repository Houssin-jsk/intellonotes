import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Link } from "@i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { CourseEditor } from "@/components/professor/CourseEditor";
import { getProfessorCourseById, getCourseContentForEditor } from "@/lib/db/queries";
import { AXIS_COUNT } from "@/lib/constants";
import type { QuizQuestion } from "@/types/quiz";

const AXIS_NAMES_FR: Record<number, string> = {
  1: "Axe 1 — Introduction",
  2: "Axe 2 — Théorie",
  3: "Axe 3 — Pratique",
  4: "Axe 4 — Synthèse",
  5: "Axe 5 — Évaluation finale",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "professor.meta" });
  return { title: t("editTitle") };
}

export default async function CourseEditorPage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const { locale, courseId } = await params;
  setRequestLocale(locale);

  const [tEditor, tCommon, tAxis, session] = await Promise.all([
    getTranslations("professor.courseEditor"),
    getTranslations("common"),
    getTranslations("course"),
    auth(),
  ]);

  const course = getProfessorCourseById(courseId, session!.user.id);

  if (!course) {
    redirect(`/${locale}/professor/courses`);
  }

  if (course.status !== "draft" && course.status !== "rejected") {
    redirect(`/${locale}/professor/courses`);
  }

  const { lessons, quizzes } = getCourseContentForEditor(courseId);

  // Build axis data array for all 5 axes
  const axisData = [];
  for (let axis = 1; axis <= AXIS_COUNT; axis++) {
    const lesson = lessons.find((l) => l.axis_number === axis) ?? null;
    const quiz = lesson
      ? quizzes.find((q) => q.lesson_id === lesson.id) ?? null
      : null;

    // Use i18n axis names if available, fallback to static
    let axisName: string;
    try {
      axisName = `${tAxis("axis", { number: axis })} — ${tAxis(`axisNames.${axis}`)}`;
    } catch {
      axisName = AXIS_NAMES_FR[axis] ?? `Axe ${axis}`;
    }

    axisData.push({
      axisNumber: axis,
      axisName,
      lesson: lesson
        ? { id: lesson.id, title: lesson.title, content: lesson.content }
        : null,
      quiz: quiz
        ? { questions: quiz.questions as QuizQuestion[] }
        : null,
    });
  }

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/professor/courses"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← {tCommon("back")}
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
        <Badge className={statusColors[course.status] ?? "bg-gray-100 text-gray-600"}>
          {tEditor("title")}
        </Badge>
      </div>

      {course.status === "rejected" && course.rejection_reason && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-700 mb-1">
            {tEditor("rejectionReasonLabel")}
          </p>
          <p className="text-sm text-red-600">{course.rejection_reason}</p>
          <p className="text-xs text-red-500 mt-2">{tEditor("rejectionFixHint")}</p>
        </div>
      )}

      <CourseEditor
        course={{
          id: course.id,
          title: course.title,
          status: course.status,
          pdf_url: course.pdf_url,
        }}
        initialAxisData={axisData}
      />
    </main>
  );
}
