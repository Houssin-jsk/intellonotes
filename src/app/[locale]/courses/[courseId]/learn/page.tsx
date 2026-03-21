import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import {
  LearningLayout,
  type LessonData,
  type QuizData,
} from "@/components/learning/LearningLayout";
import type { QuizQuestion } from "@/types/quiz";
import {
  getPurchaseStatus,
  getCourseForLearn,
  getCourseLessonsWithContent,
  getQuizzesForLessons,
  upsertProgress,
} from "@/lib/db/queries";

type QuizScoreRecord = Record<
  string,
  { score: number; total: number; passed: boolean }
>;

export default async function LearnPage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const { locale, courseId } = await params;
  setRequestLocale(locale);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  const userId = session.user.id;

  // ── Purchase validation ───────────────────────────────────────────────────
  const purchase = getPurchaseStatus(userId, courseId);
  if (!purchase || purchase.status !== "confirmed") {
    redirect(`/${locale}/courses/${courseId}`);
  }

  // ── Parallel fetches ─────────────────────────────────────────────────────
  const [course, lessons] = await Promise.all([
    getCourseForLearn(courseId),
    getCourseLessonsWithContent(courseId),
  ]);

  if (!course) {
    redirect(`/${locale}/courses/${courseId}`);
  }

  const lessonIds = lessons.map((l) => l.id);

  // ── Round 2: quizzes + progress upsert (depend on lessons) ────────────────
  const quizzes = getQuizzesForLessons(lessonIds);
  const progressData = upsertProgress(userId, courseId);

  // ── Shape the data ────────────────────────────────────────────────────────
  const quizzesByAxis: Record<number, QuizData> = quizzes.reduce(
    (acc, q) => {
      acc[q.axis_number] = {
        id: q.id,
        axis_number: q.axis_number,
        questions: (q.questions as QuizQuestion[]) ?? [],
        passing_score: q.passing_score,
      };
      return acc;
    },
    {} as Record<number, QuizData>
  );

  const initialCurrentAxis = progressData?.current_axis ?? 1;
  const initialQuizScores = (progressData?.quiz_scores ?? {}) as QuizScoreRecord;
  const initialIsCompleted = progressData?.is_completed ?? false;

  // PDF served via local API route — no signed URL needed
  const pdfUrl = course.pdf_url ? `/api/pdf/${course.pdf_url}` : null;

  return (
    <LearningLayout
      courseId={courseId}
      courseTitle={course.title}
      language={course.language}
      lessons={lessons as LessonData[]}
      quizzesByAxis={quizzesByAxis}
      initialCurrentAxis={initialCurrentAxis}
      initialQuizScores={initialQuizScores}
      initialIsCompleted={initialIsCompleted}
      pdfUrl={pdfUrl}
    />
  );
}
