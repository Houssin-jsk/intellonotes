-- Migration: Create progress table

CREATE TABLE IF NOT EXISTS public.progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id        UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  current_axis     INTEGER NOT NULL DEFAULT 1 CHECK (current_axis BETWEEN 1 AND 5),
  quiz_scores      JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_completed     BOOLEAN NOT NULL DEFAULT false,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One progress record per student per course
CREATE UNIQUE INDEX idx_progress_student_course
  ON public.progress(student_id, course_id);

CREATE INDEX idx_progress_student ON public.progress(student_id);
CREATE INDEX idx_progress_last_accessed ON public.progress(last_accessed_at DESC);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
