-- Migration: Create lessons table

CREATE TABLE IF NOT EXISTS public.lessons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  axis_number   INTEGER NOT NULL CHECK (axis_number BETWEEN 1 AND 5),
  title         TEXT NOT NULL,
  content       TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite index for ordered axis fetching
CREATE INDEX idx_lessons_course_axis_order
  ON public.lessons(course_id, axis_number, display_order);

-- Enforce one lesson record per axis per course (main lesson)
-- Multiple display_order values allowed for sub-lessons within an axis
CREATE UNIQUE INDEX idx_lessons_course_axis_order_unique
  ON public.lessons(course_id, axis_number, display_order);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
