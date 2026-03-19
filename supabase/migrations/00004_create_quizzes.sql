-- Migration: Create quizzes table

CREATE TABLE IF NOT EXISTS public.quizzes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  axis_number   INTEGER NOT NULL CHECK (axis_number BETWEEN 1 AND 5),
  questions     JSONB NOT NULL DEFAULT '[]'::jsonb,
  passing_score INTEGER NOT NULL DEFAULT 0 CHECK (passing_score BETWEEN 0 AND 100),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One quiz per lesson
CREATE UNIQUE INDEX idx_quizzes_lesson ON public.quizzes(lesson_id);

-- Index for fetching quizzes by course axis
CREATE INDEX idx_quizzes_axis ON public.quizzes(axis_number);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
