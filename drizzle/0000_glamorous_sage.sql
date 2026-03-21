CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`professor_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`language` text NOT NULL,
	`level` text NOT NULL,
	`price` real NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`pdf_url` text,
	`objectives` text DEFAULT '[]',
	`prerequisites` text DEFAULT '[]',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`professor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_courses_status` ON `courses` (`status`);--> statement-breakpoint
CREATE INDEX `idx_courses_language` ON `courses` (`language`);--> statement-breakpoint
CREATE INDEX `idx_courses_level` ON `courses` (`level`);--> statement-breakpoint
CREATE INDEX `idx_courses_professor` ON `courses` (`professor_id`);--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`axis_number` integer NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_lessons_unique_axis` ON `lessons` (`course_id`,`axis_number`,`display_order`);--> statement-breakpoint
CREATE TABLE `progress` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`course_id` text NOT NULL,
	`current_axis` integer DEFAULT 1 NOT NULL,
	`quiz_scores` text DEFAULT '{}',
	`is_completed` integer DEFAULT false NOT NULL,
	`last_accessed_at` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_progress_unique_student_course` ON `progress` (`student_id`,`course_id`);--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`course_id` text NOT NULL,
	`amount_paid` real NOT NULL,
	`professor_commission` real NOT NULL,
	`platform_commission` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`purchased_at` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_purchases_unique_student_course` ON `purchases` (`student_id`,`course_id`);--> statement-breakpoint
CREATE INDEX `idx_purchases_status` ON `purchases` (`status`);--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`axis_number` integer NOT NULL,
	`questions` text DEFAULT '[]',
	`passing_score` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quizzes_lesson_id_unique` ON `quizzes` (`lesson_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`password_hash` text NOT NULL,
	`bio` text,
	`expertise` text,
	`avatar_url` text,
	`charter_signed_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_role` ON `users` (`role`);--> statement-breakpoint
CREATE TABLE `withdrawals` (
	`id` text PRIMARY KEY NOT NULL,
	`professor_id` text NOT NULL,
	`amount` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`requested_at` text NOT NULL,
	`processed_at` text,
	FOREIGN KEY (`professor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_withdrawals_professor` ON `withdrawals` (`professor_id`);