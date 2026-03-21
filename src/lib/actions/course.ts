"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { courses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getProfessorCourseById, getCourseLessonsWithContent, getQuizzesForLessons } from "@/lib/db/queries";
import { SUPPORTED_LANGUAGES, COURSE_LEVELS, PRICE_OPTIONS, AXIS_COUNT } from "@/lib/constants";
import type { CourseLanguage, CourseLevel } from "@/lib/db/queries";

interface CreateCourseInput {
  title: string;
  description: string;
  language: string;
  level: string;
  price: number;
  objectives: string[];
  prerequisites: string[];
}

export async function createCourse(
  data: CreateCourseInput,
  locale: string
): Promise<{ error?: string; courseId?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "unauthenticated" };
  if (session.user.role !== "professor") return { error: "forbidden" };

  // Validate
  const title = data.title?.trim();
  const description = data.description?.trim();

  if (!title || title.length < 3) return { error: "titleTooShort" };
  if (title.length > 200) return { error: "titleRequired" };
  if (!description || description.length < 10) return { error: "descriptionTooShort" };
  if (description.length > 2000) return { error: "descriptionRequired" };

  if (!SUPPORTED_LANGUAGES.includes(data.language as (typeof SUPPORTED_LANGUAGES)[number])) {
    return { error: "languageRequired" };
  }
  if (!COURSE_LEVELS.includes(data.level as (typeof COURSE_LEVELS)[number])) {
    return { error: "levelRequired" };
  }
  if (!PRICE_OPTIONS.includes(data.price as (typeof PRICE_OPTIONS)[number])) {
    return { error: "priceRequired" };
  }

  const objectives = data.objectives.map((s) => s.trim()).filter(Boolean);
  const prerequisites = data.prerequisites.map((s) => s.trim()).filter(Boolean);

  const courseId = crypto.randomUUID();

  try {
    db.insert(courses)
      .values({
        id: courseId,
        professor_id: session.user.id,
        title,
        description,
        language: data.language as CourseLanguage,
        level: data.level as CourseLevel,
        price: data.price,
        status: "draft",
        objectives,
        prerequisites,
      })
      .run();
  } catch {
    return { error: "generic" };
  }

  revalidatePath(`/${locale}/professor/courses`);
  return { courseId };
}

export async function submitForReview(
  courseId: string,
  locale: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "unauthenticated" };
  if (session.user.role !== "professor") return { error: "forbidden" };

  const course = getProfessorCourseById(courseId, session.user.id);
  if (!course) return { error: "notFound" };
  if (course.status !== "draft" && course.status !== "rejected") {
    return { error: "invalidStatus" };
  }

  // Validate all 5 axes have lessons + quizzes
  const courseLessons = getCourseLessonsWithContent(courseId);
  const courseQuizzes = getQuizzesForLessons(courseLessons.map((l) => l.id));

  for (let axis = 1; axis <= AXIS_COUNT; axis++) {
    const lesson = courseLessons.find((l) => l.axis_number === axis);
    if (!lesson || !lesson.title?.trim() || !lesson.content?.trim()) {
      return { error: "incompleteContent" };
    }
    const quiz = courseQuizzes.find((q) => q.axis_number === axis);
    if (!quiz || !quiz.questions || (quiz.questions as unknown[]).length === 0) {
      return { error: "incompleteContent" };
    }
  }

  try {
    db.update(courses)
      .set({ status: "pending", updated_at: new Date().toISOString() })
      .where(eq(courses.id, courseId))
      .run();
  } catch {
    return { error: "generic" };
  }

  revalidatePath(`/${locale}/professor/courses`);
  return {};
}

export async function deleteDraftCourse(
  courseId: string,
  locale: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "unauthenticated" };
  if (session.user.role !== "professor") return { error: "forbidden" };

  const course = getProfessorCourseById(courseId, session.user.id);
  if (!course) return { error: "notFound" };
  if (course.status !== "draft") {
    return { error: "invalidStatus" };
  }

  try {
    db.delete(courses).where(eq(courses.id, courseId)).run();
  } catch {
    return { error: "generic" };
  }

  revalidatePath(`/${locale}/professor/courses`);
  return {};
}
