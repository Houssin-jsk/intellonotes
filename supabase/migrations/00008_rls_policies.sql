-- Migration: Row Level Security policies for all tables
-- Roles: student, professor, admin

-- ============================================================
-- Helper function: get current user's role
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- USERS
-- ============================================================

-- Anyone authenticated can read basic profiles
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_select_public_profiles"
  ON public.users FOR SELECT
  USING (true);  -- Public profiles (name, avatar) visible to all

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any user (e.g., suspend accounts)
CREATE POLICY "users_admin_update"
  ON public.users FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- COURSES
-- ============================================================

-- Public: anyone can read approved courses
CREATE POLICY "courses_select_approved"
  ON public.courses FOR SELECT
  USING (status = 'approved');

-- Professors: can read all their own courses (any status)
CREATE POLICY "courses_select_own"
  ON public.courses FOR SELECT
  USING (auth.uid() = professor_id);

-- Admins: can read all courses
CREATE POLICY "courses_admin_select"
  ON public.courses FOR SELECT
  USING (public.get_user_role() = 'admin');

-- Professors: can insert their own courses
CREATE POLICY "courses_insert_own"
  ON public.courses FOR INSERT
  WITH CHECK (
    auth.uid() = professor_id
    AND public.get_user_role() = 'professor'
  );

-- Professors: can update their own draft or rejected courses
CREATE POLICY "courses_update_own"
  ON public.courses FOR UPDATE
  USING (
    auth.uid() = professor_id
    AND status IN ('draft', 'rejected')
  );

-- Admins: can update any course (approve, reject, suspend)
CREATE POLICY "courses_admin_update"
  ON public.courses FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- Professors: can delete their own draft courses only
CREATE POLICY "courses_delete_own_draft"
  ON public.courses FOR DELETE
  USING (
    auth.uid() = professor_id
    AND status = 'draft'
  );

-- ============================================================
-- LESSONS
-- ============================================================

-- Public: axis 1 lessons visible for approved courses (free teaser)
CREATE POLICY "lessons_select_axis1_approved"
  ON public.lessons FOR SELECT
  USING (
    axis_number = 1
    AND EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = lessons.course_id AND status = 'approved'
    )
  );

-- Students: can read lessons for courses they purchased
CREATE POLICY "lessons_select_purchased"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE student_id = auth.uid()
        AND course_id = lessons.course_id
        AND status = 'confirmed'
    )
  );

-- Professors: can read and manage their own course lessons
CREATE POLICY "lessons_select_own_course"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = lessons.course_id AND professor_id = auth.uid()
    )
  );

CREATE POLICY "lessons_insert_own_course"
  ON public.lessons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = lessons.course_id AND professor_id = auth.uid()
    )
  );

CREATE POLICY "lessons_update_own_course"
  ON public.lessons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = lessons.course_id AND professor_id = auth.uid()
    )
  );

CREATE POLICY "lessons_delete_own_course"
  ON public.lessons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = lessons.course_id AND professor_id = auth.uid()
    )
  );

-- Admins: full access
CREATE POLICY "lessons_admin_all"
  ON public.lessons FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- QUIZZES
-- ============================================================

-- Same visibility as lessons (axis 1 free, rest need purchase)
CREATE POLICY "quizzes_select_axis1_approved"
  ON public.quizzes FOR SELECT
  USING (
    axis_number = 1
    AND EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON c.id = l.course_id
      WHERE l.id = quizzes.lesson_id AND c.status = 'approved'
    )
  );

CREATE POLICY "quizzes_select_purchased"
  ON public.quizzes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.purchases p ON p.course_id = l.course_id
      WHERE l.id = quizzes.lesson_id
        AND p.student_id = auth.uid()
        AND p.status = 'confirmed'
    )
  );

CREATE POLICY "quizzes_select_own_course"
  ON public.quizzes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON c.id = l.course_id
      WHERE l.id = quizzes.lesson_id AND c.professor_id = auth.uid()
    )
  );

CREATE POLICY "quizzes_insert_own_course"
  ON public.quizzes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON c.id = l.course_id
      WHERE l.id = quizzes.lesson_id AND c.professor_id = auth.uid()
    )
  );

CREATE POLICY "quizzes_update_own_course"
  ON public.quizzes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON c.id = l.course_id
      WHERE l.id = quizzes.lesson_id AND c.professor_id = auth.uid()
    )
  );

CREATE POLICY "quizzes_admin_all"
  ON public.quizzes FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- PURCHASES
-- ============================================================

-- Students: can read their own purchases
CREATE POLICY "purchases_select_own"
  ON public.purchases FOR SELECT
  USING (auth.uid() = student_id);

-- Students: can create a purchase for themselves
CREATE POLICY "purchases_insert_own"
  ON public.purchases FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    AND public.get_user_role() = 'student'
  );

-- Professors: can read purchases for their courses (to see earnings)
CREATE POLICY "purchases_select_professor_courses"
  ON public.purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = purchases.course_id AND professor_id = auth.uid()
    )
  );

-- Admins: full access (needed to confirm/reject payments)
CREATE POLICY "purchases_admin_all"
  ON public.purchases FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- PROGRESS
-- ============================================================

-- Students: full access to their own progress
CREATE POLICY "progress_select_own"
  ON public.progress FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "progress_insert_own"
  ON public.progress FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    AND public.get_user_role() = 'student'
  );

CREATE POLICY "progress_update_own"
  ON public.progress FOR UPDATE
  USING (auth.uid() = student_id);

-- Admins: read-only access
CREATE POLICY "progress_admin_select"
  ON public.progress FOR SELECT
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- WITHDRAWALS
-- ============================================================

-- Professors: can read and create their own withdrawal requests
CREATE POLICY "withdrawals_select_own"
  ON public.withdrawals FOR SELECT
  USING (auth.uid() = professor_id);

CREATE POLICY "withdrawals_insert_own"
  ON public.withdrawals FOR INSERT
  WITH CHECK (
    auth.uid() = professor_id
    AND public.get_user_role() = 'professor'
  );

-- Admins: full access (needed to process withdrawals)
CREATE POLICY "withdrawals_admin_all"
  ON public.withdrawals FOR ALL
  USING (public.get_user_role() = 'admin');
