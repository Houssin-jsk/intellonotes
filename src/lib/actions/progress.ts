"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type QuizScoreRecord = Record<
  string,
  { score: number; total: number; passed: boolean }
>;

export async function saveQuizResult(
  courseId: string,
  axisNumber: number,
  score: number,
  total: number,
  passed: boolean,
  locale: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "unauthenticated" };

  // Fetch current progress
  const { data: progress } = (await supabase
    .from("progress")
    .select("current_axis, quiz_scores, is_completed")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .single()) as {
    data: {
      current_axis: number;
      quiz_scores: QuizScoreRecord | null;
      is_completed: boolean;
    } | null;
    error: unknown;
  };

  if (!progress) return { error: "progressNotFound" };

  const updatedScores: QuizScoreRecord = {
    ...(progress.quiz_scores ?? {}),
    [axisNumber]: { score, total, passed },
  };

  // Advance current_axis only when the quiz is passed
  const newCurrentAxis = passed
    ? Math.min(5, Math.max(progress.current_axis, axisNumber + 1))
    : progress.current_axis;

  const newIsCompleted =
    progress.is_completed || (passed && axisNumber === 5);

  const { error: updateError } = (await supabase
    .from("progress")
    .update({
      quiz_scores: updatedScores,
      current_axis: newCurrentAxis,
      is_completed: newIsCompleted,
      last_accessed_at: new Date().toISOString(),
    } as never)
    .eq("student_id", user.id)
    .eq("course_id", courseId)) as {
    data: unknown;
    error: { message: string } | null;
  };

  if (updateError) return { error: "saveFailed" };

  revalidatePath(`/${locale}/courses/${courseId}/learn`);
  return {};
}
