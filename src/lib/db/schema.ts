import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ── Users ─────────────────────────────────────────────────────────────────────

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    role: text("role", {
      enum: ["student", "professor", "admin"],
    })
      .notNull()
      .default("student"),
    password_hash: text("password_hash").notNull(),
    bio: text("bio"),
    expertise: text("expertise"),
    avatar_url: text("avatar_url"),
    charter_signed_at: text("charter_signed_at"),
    created_at: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (t) => [index("idx_users_role").on(t.role)]
);

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  purchases: many(purchases),
  progress: many(progress),
  withdrawals: many(withdrawals),
}));

// ── Courses ───────────────────────────────────────────────────────────────────

export const courses = sqliteTable(
  "courses",
  {
    id: text("id").primaryKey(),
    professor_id: text("professor_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    language: text("language", {
      enum: ["python", "javascript", "c", "java", "html_css", "sql"],
    }).notNull(),
    level: text("level", {
      enum: ["beginner", "intermediate"],
    }).notNull(),
    price: real("price").notNull(),
    status: text("status", {
      enum: ["draft", "pending", "approved", "rejected", "suspended"],
    })
      .notNull()
      .default("draft"),
    pdf_url: text("pdf_url"),
    // Stored as JSON string — parse/stringify automatically via mode: "json"
    objectives: text("objectives", { mode: "json" })
      .$type<string[]>()
      .default([]),
    prerequisites: text("prerequisites", { mode: "json" })
      .$type<string[]>()
      .default([]),
    created_at: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updated_at: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (t) => [
    index("idx_courses_status").on(t.status),
    index("idx_courses_language").on(t.language),
    index("idx_courses_level").on(t.level),
    index("idx_courses_professor").on(t.professor_id),
  ]
);

export const coursesRelations = relations(courses, ({ one, many }) => ({
  professor: one(users, {
    fields: [courses.professor_id],
    references: [users.id],
    relationName: "professor",
  }),
  lessons: many(lessons),
  purchases: many(purchases),
}));

// ── Lessons ───────────────────────────────────────────────────────────────────

export const lessons = sqliteTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    course_id: text("course_id")
      .notNull()
      .references(() => courses.id),
    axis_number: integer("axis_number").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    display_order: integer("display_order").notNull().default(0),
    created_at: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (t) => [
    uniqueIndex("idx_lessons_unique_axis").on(
      t.course_id,
      t.axis_number,
      t.display_order
    ),
  ]
);

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.course_id],
    references: [courses.id],
  }),
  quizzes: many(quizzes),
}));

// ── Quizzes ───────────────────────────────────────────────────────────────────

export const quizzes = sqliteTable("quizzes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  lesson_id: text("lesson_id")
    .notNull()
    .unique()
    .references(() => lessons.id),
  axis_number: integer("axis_number").notNull(),
  questions: text("questions", { mode: "json" }).$type<unknown[]>().default([]),
  passing_score: integer("passing_score").notNull().default(0),
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const quizzesRelations = relations(quizzes, ({ one }) => ({
  lesson: one(lessons, {
    fields: [quizzes.lesson_id],
    references: [lessons.id],
  }),
}));

// ── Purchases ─────────────────────────────────────────────────────────────────

export const purchases = sqliteTable(
  "purchases",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    student_id: text("student_id")
      .notNull()
      .references(() => users.id),
    course_id: text("course_id")
      .notNull()
      .references(() => courses.id),
    amount_paid: real("amount_paid").notNull(),
    professor_commission: real("professor_commission").notNull(),
    platform_commission: real("platform_commission").notNull(),
    status: text("status", {
      enum: ["pending", "confirmed", "rejected"],
    })
      .notNull()
      .default("pending"),
    purchased_at: text("purchased_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (t) => [
    uniqueIndex("idx_purchases_unique_student_course").on(
      t.student_id,
      t.course_id
    ),
    index("idx_purchases_status").on(t.status),
  ]
);

export const purchasesRelations = relations(purchases, ({ one }) => ({
  student: one(users, {
    fields: [purchases.student_id],
    references: [users.id],
    relationName: "student",
  }),
  course: one(courses, {
    fields: [purchases.course_id],
    references: [courses.id],
    relationName: "purchase_course",
  }),
}));

// ── Progress ──────────────────────────────────────────────────────────────────

export const progress = sqliteTable(
  "progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    student_id: text("student_id")
      .notNull()
      .references(() => users.id),
    course_id: text("course_id")
      .notNull()
      .references(() => courses.id),
    current_axis: integer("current_axis").notNull().default(1),
    quiz_scores: text("quiz_scores", { mode: "json" })
      .$type<Record<string, { score: number; total: number; passed: boolean }>>()
      .default({}),
    is_completed: integer("is_completed", { mode: "boolean" })
      .notNull()
      .default(false),
    last_accessed_at: text("last_accessed_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (t) => [
    uniqueIndex("idx_progress_unique_student_course").on(
      t.student_id,
      t.course_id
    ),
  ]
);

export const progressRelations = relations(progress, ({ one }) => ({
  student: one(users, {
    fields: [progress.student_id],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [progress.course_id],
    references: [courses.id],
  }),
}));

// ── Withdrawals ───────────────────────────────────────────────────────────────

export const withdrawals = sqliteTable(
  "withdrawals",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    professor_id: text("professor_id")
      .notNull()
      .references(() => users.id),
    amount: real("amount").notNull(),
    status: text("status", {
      enum: ["pending", "processed", "rejected"],
    })
      .notNull()
      .default("pending"),
    requested_at: text("requested_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    processed_at: text("processed_at"),
  },
  (t) => [index("idx_withdrawals_professor").on(t.professor_id)]
);

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  professor: one(users, {
    fields: [withdrawals.professor_id],
    references: [users.id],
  }),
}));
