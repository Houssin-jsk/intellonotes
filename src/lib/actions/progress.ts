"use server";

import { auth } from "@/lib/auth";
import { getProgress, updateProgress } from "@/lib/db/queries";
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
  const session = await auth();
  if (!session?.user) return { error: "unauthenticated" };

  const userId = session.user.id;

  const currentProgress = getProgress(userId, courseId);
  if (!currentProgress) return { error: "progressNotFound" };

  const updatedScores: QuizScoreRecord = {
    ...(currentProgress.quiz_scores ?? {}),
    [axisNumber]: { score, total, passed },
  };

  const newCurrentAxis = passed
    ? Math.min(5, Math.max(currentProgress.current_axis, axisNumber + 1))
    : currentProgress.current_axis;

  const newIsCompleted =
    currentProgress.is_completed || (passed && axisNumber === 5);

  updateProgress(userId, courseId, {
    quiz_scores: updatedScores,
    current_axis: newCurrentAxis,
    is_completed: newIsCompleted,
    last_accessed_at: new Date().toISOString(),
  });

  revalidatePath(`/${locale}/courses/${courseId}/learn`);
  return {};
}
