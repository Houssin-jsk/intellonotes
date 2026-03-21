"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { lessons, quizzes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getProfessorCourseById } from "@/lib/db/queries";
import { AXIS5_PASSING_SCORE } from "@/lib/constants";
import type { QuizQuestion } from "@/types/quiz";

interface SaveAxisContentInput {
  courseId: string;
  axisNumber: number;
  lessonTitle: string;
  lessonContent: string;
  questions: QuizQuestion[];
}

export async function saveAxisContent(
  data: SaveAxisContentInput,
  locale: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "unauthenticated" };
  if (session.user.role !== "professor") return { error: "forbidden" };

  const course = getProfessorCourseById(data.courseId, session.user.id);
  if (!course) return { error: "notFound" };
  if (course.status !== "draft" && course.status !== "rejected") {
    return { error: "invalidStatus" };
  }

  // Validate axis number
  if (data.axisNumber < 1 || data.axisNumber > 5) {
    return { error: "invalidAxis" };
  }

  // Validate lesson
  const title = data.lessonTitle?.trim();
  const content = data.lessonContent?.trim();
  if (!title || title.length < 3) return { error: "lessonTitleTooShort" };
  if (!content || content.length < 10) return { error: "lessonContentTooShort" };

  // Validate questions
  if (!data.questions || data.questions.length === 0) {
    return { error: "quizRequired" };
  }

  const passingScore = data.axisNumber === 5 ? AXIS5_PASSING_SCORE : 0;

  try {
    // Check if lesson exists for this axis
    const existingLesson = db
      .select({ id: lessons.id })
      .from(lessons)
      .where(
        and(
          eq(lessons.course_id, data.courseId),
          eq(lessons.axis_number, data.axisNumber)
        )
      )
      .get();

    let lessonId: string;

    if (existingLesson) {
      // Update existing lesson
      lessonId = existingLesson.id;
      db.update(lessons)
        .set({ title, content })
        .where(eq(lessons.id, lessonId))
        .run();
    } else {
      // Insert new lesson
      lessonId = crypto.randomUUID();
      db.insert(lessons)
        .values({
          id: lessonId,
          course_id: data.courseId,
          axis_number: data.axisNumber,
          title,
          content,
          display_order: 0,
        })
        .run();
    }

    // Upsert quiz (lesson_id is unique)
    db.insert(quizzes)
      .values({
        lesson_id: lessonId,
        axis_number: data.axisNumber,
        questions: data.questions as unknown[],
        passing_score: passingScore,
      })
      .onConflictDoUpdate({
        target: [quizzes.lesson_id],
        set: {
          questions: data.questions as unknown[],
          passing_score: passingScore,
        },
      })
      .run();
  } catch {
    return { error: "generic" };
  }

  revalidatePath(`/${locale}/professor/courses/${data.courseId}`);
  return {};
}
