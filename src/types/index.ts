import type { InferSelectModel } from "drizzle-orm";
import {
  users,
  courses,
  lessons,
  quizzes,
  purchases,
  progress,
  withdrawals,
} from "@/lib/db/schema";

// ── Base row types ─────────────────────────────────────────────────────────────

export type User = InferSelectModel<typeof users>;
export type Course = InferSelectModel<typeof courses>;
export type Lesson = InferSelectModel<typeof lessons>;
export type Quiz = InferSelectModel<typeof quizzes>;
export type Purchase = InferSelectModel<typeof purchases>;
export type Progress = InferSelectModel<typeof progress>;
export type Withdrawal = InferSelectModel<typeof withdrawals>;

// ── Enum types (derived from schema) ─────────────────────────────────────────

export type UserRole = User["role"];
export type CourseStatus = Course["status"];
export type CourseLanguage = Course["language"];
export type CourseLevel = Course["level"];
export type PurchaseStatus = Purchase["status"];
export type WithdrawalStatus = Withdrawal["status"];

// ── Joined convenience types ──────────────────────────────────────────────────

export type CourseWithProfessor = Course & {
  professor: Pick<User, "name" | "avatar_url" | "bio" | "expertise"> | null;
};

export type PurchaseWithCourse = Purchase & {
  course: Course | null;
};

export type ProgressWithCourse = Progress & {
  course: Course | null;
};

// ── Quiz types ────────────────────────────────────────────────────────────────

export type { QuizQuestion, MCQQuestion, TrueFalseQuestion, FillBlankQuestion } from "./quiz";
