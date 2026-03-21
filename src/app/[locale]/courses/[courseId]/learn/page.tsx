import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  LearningLayout,
  type LessonData,
  type QuizData,
} from "@/components/learning/LearningLayout";
import type { CourseLanguage, PurchaseStatus } from "@/types/database";
import type { QuizQuestion } from "@/types/quiz";

type CourseRow = {
  id: string;
  title: string;
  language: CourseLanguage;
  pdf_url: string | null;
};

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

  const supabase = await createClient();

  // ── Auth ──────────────────────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // ── Purchase validation ───────────────────────────────────────────────────
  const { data: purchase } = (await supabase
    .from("purchases")
    .select("status")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle()) as {
    data: { status: PurchaseStatus } | null;
    error: unknown;
  };

  if (!purchase || purchase.status !== "confirmed") {
    redirect(`/${locale}/courses/${courseId}`);
  }

  // ── Round 1: parallel fetches ─────────────────────────────────────────────
  const [{ data: rawCourse }, { data: lessonsData }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, title, language, pdf_url")
      .eq("id", courseId)
      .single(),
    supabase
      .from("lessons")
      .select("id, axis_number, title, content, display_order")
      .eq("course_id", courseId)
      .order("axis_number", { ascending: true })
      .order("display_order", { ascending: true }),
  ]);

  if (!rawCourse) {
    redirect(`/${locale}/courses/${courseId}`);
  }

  const course = rawCourse as unknown as CourseRow;
  const lessons = (lessonsData ?? []) as LessonData[];
  const lessonIds = lessons.map((l) => l.id);

  // ── Round 2: parallel fetches (depend on round 1) ─────────────────────────
  const quizzesPromise =
    lessonIds.length > 0
      ? supabase
          .from("quizzes")
          .select("id, axis_number, questions, passing_score")
          .in("lesson_id", lessonIds)
      : Promise.resolve({ data: [] as unknown[], error: null });

  const progressPromise = (async () => {
    // Upsert creates the row on first visit, updates last_accessed_at on return
    await (supabase
      .from("progress")
      .upsert(
        {
          student_id: user.id,
          course_id: courseId,
          last_accessed_at: new Date().toISOString(),
        } as never,
        { onConflict: "student_id,course_id" }
      ) as unknown as Promise<unknown>);

    return supabase
      .from("progress")
      .select("current_axis, quiz_scores, is_completed")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .single();
  })();

  const signedUrlPromise = course.pdf_url
    ? supabase.storage
        .from("course-pdfs")
        .createSignedUrl(course.pdf_url, 3600)
    : Promise.resolve({ data: null, error: null });

  const [quizzesResult, progressResult, signedUrlResult] = await Promise.all([
    quizzesPromise,
    progressPromise,
    signedUrlPromise,
  ]);

  // ── Shape the data ────────────────────────────────────────────────────────
  type RawQuiz = {
    id: string;
    axis_number: number;
    questions: unknown;
    passing_score: number;
  };

  const quizzesByAxis: Record<number, QuizData> = (
    (quizzesResult.data ?? []) as RawQuiz[]
  ).reduce(
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

  type ProgressRow = {
    current_axis: number;
    quiz_scores: QuizScoreRecord | null;
    is_completed: boolean;
  };

  const progress = progressResult.data as ProgressRow | null;
  const initialCurrentAxis = progress?.current_axis ?? 1;
  const initialQuizScores = (progress?.quiz_scores ?? {}) as QuizScoreRecord;
  const initialIsCompleted = progress?.is_completed ?? false;

  const pdfUrl =
    (signedUrlResult as { data: { signedUrl: string } | null; error: unknown })
      .data?.signedUrl ?? null;

  return (
    <LearningLayout
      courseId={courseId}
      courseTitle={course.title}
      language={course.language}
      lessons={lessons}
      quizzesByAxis={quizzesByAxis}
      initialCurrentAxis={initialCurrentAxis}
      initialQuizScores={initialQuizScores}
      initialIsCompleted={initialIsCompleted}
      pdfUrl={pdfUrl}
    />
  );
}
