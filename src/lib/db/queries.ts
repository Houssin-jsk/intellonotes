import { eq, ne, and, like, inArray, asc, desc, sql } from "drizzle-orm";
import { db } from "./index";
import {
  users,
  courses,
  lessons,
  quizzes,
  purchases,
  progress,
  withdrawals,
} from "./schema";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CourseLanguage = typeof courses.language.enumValues[number];
export type CourseLevel = typeof courses.level.enumValues[number];
export type CourseStatus = typeof courses.status.enumValues[number];
export type PurchaseStatus = typeof purchases.status.enumValues[number];
export type UserRole = typeof users.role.enumValues[number];

// ── User queries ──────────────────────────────────────────────────────────────

export function getUserByEmail(email: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();
}

export function getUserById(id: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .get();
}

export function createUser(data: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password_hash: string;
}) {
  db.insert(users).values(data).run();
}

// ── Course queries ────────────────────────────────────────────────────────────

export function getApprovedCourses(filters: {
  q?: string;
  language?: string;
  level?: string;
}) {
  const conditions = [eq(courses.status, "approved")];

  if (filters.q?.trim()) {
    conditions.push(like(courses.title, `%${filters.q.trim()}%`));
  }
  if (filters.language) {
    conditions.push(eq(courses.language, filters.language as CourseLanguage));
  }
  if (filters.level) {
    conditions.push(eq(courses.level, filters.level as CourseLevel));
  }

  const rows = db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      language: courses.language,
      level: courses.level,
      price: courses.price,
      professor_name: users.name,
      professor_avatar_url: users.avatar_url,
    })
    .from(courses)
    .leftJoin(users, eq(courses.professor_id, users.id))
    .where(and(...conditions))
    .orderBy(desc(courses.created_at))
    .all();

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    language: r.language,
    level: r.level,
    price: r.price,
    professor: r.professor_name
      ? { name: r.professor_name, avatar_url: r.professor_avatar_url }
      : null,
  }));
}

export function getCourseDetail(courseId: string) {
  const row = db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      language: courses.language,
      level: courses.level,
      price: courses.price,
      status: courses.status,
      objectives: courses.objectives,
      prerequisites: courses.prerequisites,
      professor_name: users.name,
      professor_bio: users.bio,
      professor_expertise: users.expertise,
      professor_avatar_url: users.avatar_url,
    })
    .from(courses)
    .leftJoin(users, eq(courses.professor_id, users.id))
    .where(and(eq(courses.id, courseId), eq(courses.status, "approved")))
    .get();

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    language: row.language,
    level: row.level,
    price: row.price,
    objectives: row.objectives ?? [],
    prerequisites: row.prerequisites ?? [],
    professor: row.professor_name
      ? {
          name: row.professor_name,
          bio: row.professor_bio,
          expertise: row.professor_expertise,
          avatar_url: row.professor_avatar_url,
        }
      : null,
  };
}

export function getCourseLessons(courseId: string) {
  return db
    .select({
      id: lessons.id,
      title: lessons.title,
      axis_number: lessons.axis_number,
      display_order: lessons.display_order,
    })
    .from(lessons)
    .where(eq(lessons.course_id, courseId))
    .orderBy(asc(lessons.axis_number), asc(lessons.display_order))
    .all();
}

export function getCourseLessonsWithContent(courseId: string) {
  return db
    .select({
      id: lessons.id,
      title: lessons.title,
      axis_number: lessons.axis_number,
      content: lessons.content,
      display_order: lessons.display_order,
    })
    .from(lessons)
    .where(eq(lessons.course_id, courseId))
    .orderBy(asc(lessons.axis_number), asc(lessons.display_order))
    .all();
}

export function getCourseForLearn(courseId: string) {
  return db
    .select({
      id: courses.id,
      title: courses.title,
      language: courses.language,
      pdf_url: courses.pdf_url,
    })
    .from(courses)
    .where(eq(courses.id, courseId))
    .get();
}

export function getCoursePrice(courseId: string) {
  return db
    .select({ price: courses.price })
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.status, "approved")))
    .get();
}

// ── Quiz queries ──────────────────────────────────────────────────────────────

export function getQuizzesForLessons(lessonIds: string[]) {
  if (lessonIds.length === 0) return [];
  return db
    .select({
      id: quizzes.id,
      axis_number: quizzes.axis_number,
      questions: quizzes.questions,
      passing_score: quizzes.passing_score,
    })
    .from(quizzes)
    .where(inArray(quizzes.lesson_id, lessonIds))
    .all();
}

// ── Purchase queries ──────────────────────────────────────────────────────────

export function getPurchaseStatus(studentId: string, courseId: string) {
  return db
    .select({ status: purchases.status })
    .from(purchases)
    .where(
      and(
        eq(purchases.student_id, studentId),
        eq(purchases.course_id, courseId)
      )
    )
    .get();
}

export function getStudentPurchases(studentId: string) {
  const rows = db
    .select({
      course_id: purchases.course_id,
      course_title: courses.title,
      course_language: courses.language,
    })
    .from(purchases)
    .leftJoin(courses, eq(purchases.course_id, courses.id))
    .where(
      and(
        eq(purchases.student_id, studentId),
        eq(purchases.status, "confirmed")
      )
    )
    .all();

  return rows.map((r) => ({
    course_id: r.course_id,
    course: r.course_title
      ? { id: r.course_id, title: r.course_title, language: r.course_language! }
      : null,
  }));
}

export function getPendingPurchases() {
  const rows = db
    .select({
      id: purchases.id,
      amount_paid: purchases.amount_paid,
      purchased_at: purchases.purchased_at,
      student_name: users.name,
      student_email: users.email,
      course_title: courses.title,
      course_language: courses.language,
    })
    .from(purchases)
    .leftJoin(users, eq(purchases.student_id, users.id))
    .leftJoin(courses, eq(purchases.course_id, courses.id))
    .where(eq(purchases.status, "pending"))
    .orderBy(asc(purchases.purchased_at))
    .all();

  return rows.map((r) => ({
    id: r.id,
    amount_paid: r.amount_paid,
    purchased_at: r.purchased_at,
    student: r.student_name ? { name: r.student_name, email: r.student_email } : null,
    course: r.course_title ? { title: r.course_title, language: r.course_language! } : null,
  }));
}

export function getPurchaseById(purchaseId: string) {
  return db
    .select({ status: purchases.status })
    .from(purchases)
    .where(eq(purchases.id, purchaseId))
    .get();
}

// ── Progress queries ──────────────────────────────────────────────────────────

export function getStudentProgress(studentId: string) {
  return db
    .select({
      course_id: progress.course_id,
      current_axis: progress.current_axis,
      is_completed: progress.is_completed,
      last_accessed_at: progress.last_accessed_at,
    })
    .from(progress)
    .where(eq(progress.student_id, studentId))
    .all();
}

export function getProgress(studentId: string, courseId: string) {
  return db
    .select({
      current_axis: progress.current_axis,
      quiz_scores: progress.quiz_scores,
      is_completed: progress.is_completed,
    })
    .from(progress)
    .where(
      and(
        eq(progress.student_id, studentId),
        eq(progress.course_id, courseId)
      )
    )
    .get();
}

export function upsertProgress(studentId: string, courseId: string) {
  db.insert(progress)
    .values({
      student_id: studentId,
      course_id: courseId,
      last_accessed_at: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: [progress.student_id, progress.course_id],
      set: { last_accessed_at: new Date().toISOString() },
    })
    .run();

  return db
    .select({
      current_axis: progress.current_axis,
      quiz_scores: progress.quiz_scores,
      is_completed: progress.is_completed,
    })
    .from(progress)
    .where(
      and(
        eq(progress.student_id, studentId),
        eq(progress.course_id, courseId)
      )
    )
    .get();
}

export function updateProgress(
  studentId: string,
  courseId: string,
  data: {
    quiz_scores: Record<string, { score: number; total: number; passed: boolean }>;
    current_axis: number;
    is_completed: boolean;
    last_accessed_at: string;
  }
) {
  db.update(progress)
    .set(data)
    .where(
      and(
        eq(progress.student_id, studentId),
        eq(progress.course_id, courseId)
      )
    )
    .run();
}

// ── Professor queries ─────────────────────────────────────────────────────────

export function getProfessorCourses(professorId: string) {
  return db
    .select({
      id: courses.id,
      title: courses.title,
      language: courses.language,
      level: courses.level,
      price: courses.price,
      status: courses.status,
      rejection_reason: courses.rejection_reason,
      updated_at: courses.updated_at,
    })
    .from(courses)
    .where(eq(courses.professor_id, professorId))
    .orderBy(desc(courses.updated_at))
    .all();
}

export function getProfessorCourseById(courseId: string, professorId: string) {
  return db
    .select()
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.professor_id, professorId)))
    .get();
}

export function getProfessorEarnings(professorId: string) {
  // Total confirmed earnings
  const earningsRow = db
    .select({
      total: sql<number>`coalesce(sum(${purchases.professor_commission}), 0)`,
    })
    .from(purchases)
    .innerJoin(courses, eq(purchases.course_id, courses.id))
    .where(
      and(
        eq(courses.professor_id, professorId),
        eq(purchases.status, "confirmed")
      )
    )
    .get();

  // Total withdrawn (processed)
  const withdrawnRow = db
    .select({
      total: sql<number>`coalesce(sum(${withdrawals.amount}), 0)`,
    })
    .from(withdrawals)
    .where(
      and(
        eq(withdrawals.professor_id, professorId),
        eq(withdrawals.status, "processed")
      )
    )
    .get();

  // Pending withdrawals
  const pendingWithdrawalsRow = db
    .select({
      total: sql<number>`coalesce(sum(${withdrawals.amount}), 0)`,
    })
    .from(withdrawals)
    .where(
      and(
        eq(withdrawals.professor_id, professorId),
        eq(withdrawals.status, "pending")
      )
    )
    .get();

  const totalEarned = earningsRow?.total ?? 0;
  const totalWithdrawn = withdrawnRow?.total ?? 0;
  const pendingWithdrawals = pendingWithdrawalsRow?.total ?? 0;
  const availableBalance = totalEarned - totalWithdrawn - pendingWithdrawals;

  return { totalEarned, totalWithdrawn, pendingWithdrawals, availableBalance };
}

export function getProfessorTransactions(professorId: string) {
  return db
    .select({
      id: purchases.id,
      amount_paid: purchases.amount_paid,
      professor_commission: purchases.professor_commission,
      purchased_at: purchases.purchased_at,
      course_title: courses.title,
      student_name: users.name,
    })
    .from(purchases)
    .innerJoin(courses, eq(purchases.course_id, courses.id))
    .leftJoin(users, eq(purchases.student_id, users.id))
    .where(
      and(
        eq(courses.professor_id, professorId),
        eq(purchases.status, "confirmed")
      )
    )
    .orderBy(desc(purchases.purchased_at))
    .all();
}

export function getProfessorWithdrawals(professorId: string) {
  return db
    .select({
      id: withdrawals.id,
      amount: withdrawals.amount,
      status: withdrawals.status,
      requested_at: withdrawals.requested_at,
      processed_at: withdrawals.processed_at,
    })
    .from(withdrawals)
    .where(eq(withdrawals.professor_id, professorId))
    .orderBy(desc(withdrawals.requested_at))
    .all();
}

// ── Course content for editor ─────────────────────────────────────────────────

export function getCourseContentForEditor(courseId: string) {
  const allLessons = db
    .select({
      id: lessons.id,
      title: lessons.title,
      axis_number: lessons.axis_number,
      content: lessons.content,
    })
    .from(lessons)
    .where(eq(lessons.course_id, courseId))
    .orderBy(asc(lessons.axis_number))
    .all();

  const lessonIds = allLessons.map((l) => l.id);
  const allQuizzes =
    lessonIds.length > 0
      ? db
          .select({
            id: quizzes.id,
            lesson_id: quizzes.lesson_id,
            axis_number: quizzes.axis_number,
            questions: quizzes.questions,
            passing_score: quizzes.passing_score,
          })
          .from(quizzes)
          .where(inArray(quizzes.lesson_id, lessonIds))
          .all()
      : [];

  return { lessons: allLessons, quizzes: allQuizzes };
}

export function getLessonForAxis(courseId: string, axisNumber: number) {
  return db
    .select({ id: lessons.id })
    .from(lessons)
    .where(
      and(
        eq(lessons.course_id, courseId),
        eq(lessons.axis_number, axisNumber)
      )
    )
    .get();
}

// ── Admin course queries ───────────────────────────────────────────────────────

export function getCoursesForAdmin() {
  const rows = db
    .select({
      id: courses.id,
      title: courses.title,
      language: courses.language,
      level: courses.level,
      price: courses.price,
      status: courses.status,
      rejection_reason: courses.rejection_reason,
      created_at: courses.created_at,
      updated_at: courses.updated_at,
      professor_name: users.name,
      professor_email: users.email,
    })
    .from(courses)
    .leftJoin(users, eq(courses.professor_id, users.id))
    .where(ne(courses.status, "draft"))
    .orderBy(desc(courses.updated_at))
    .all();

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    language: r.language,
    level: r.level,
    price: r.price,
    status: r.status,
    rejection_reason: r.rejection_reason,
    created_at: r.created_at,
    updated_at: r.updated_at,
    professor_name: r.professor_name ?? "",
    professor_email: r.professor_email ?? "",
  }));
}

export function getAdminCourseDetail(courseId: string) {
  const row = db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      language: courses.language,
      level: courses.level,
      price: courses.price,
      status: courses.status,
      rejection_reason: courses.rejection_reason,
      pdf_url: courses.pdf_url,
      objectives: courses.objectives,
      prerequisites: courses.prerequisites,
      created_at: courses.created_at,
      updated_at: courses.updated_at,
      professor_name: users.name,
      professor_email: users.email,
      professor_bio: users.bio,
    })
    .from(courses)
    .leftJoin(users, eq(courses.professor_id, users.id))
    .where(eq(courses.id, courseId))
    .get();

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    language: row.language,
    level: row.level,
    price: row.price,
    status: row.status,
    rejection_reason: row.rejection_reason,
    pdf_url: row.pdf_url,
    objectives: row.objectives ?? [],
    prerequisites: row.prerequisites ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    professor: row.professor_name
      ? { name: row.professor_name, email: row.professor_email, bio: row.professor_bio }
      : null,
  };
}

export function updateCourseStatus(
  courseId: string,
  status: CourseStatus,
  rejectionReason?: string | null
) {
  db.update(courses)
    .set({
      status,
      rejection_reason: status === "approved" ? null : (rejectionReason ?? null),
      updated_at: new Date().toISOString(),
    })
    .where(eq(courses.id, courseId))
    .run();
}

// ── Admin purchase mutations ───────────────────────────────────────────────────

export function updatePurchaseStatus(
  purchaseId: string,
  status: "confirmed" | "rejected"
) {
  db.update(purchases)
    .set({ status })
    .where(eq(purchases.id, purchaseId))
    .run();
}
