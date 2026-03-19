-- Migration: Create courses table and enums

-- 1. Enums
CREATE TYPE public.course_status   AS ENUM ('draft', 'pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.course_language AS ENUM ('python', 'javascript', 'c', 'java', 'html_css', 'sql');
CREATE TYPE public.course_level    AS ENUM ('beginner', 'intermediate');

-- 2. Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  language     public.course_language NOT NULL,
  level        public.course_level NOT NULL,
  price        NUMERIC(6,2) NOT NULL CHECK (price >= 49 AND price <= 78),
  status       public.course_status NOT NULL DEFAULT 'draft',
  pdf_url      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes for catalog filtering
CREATE INDEX idx_courses_status     ON public.courses(status);
CREATE INDEX idx_courses_language   ON public.courses(language);
CREATE INDEX idx_courses_level      ON public.courses(level);
CREATE INDEX idx_courses_professor  ON public.courses(professor_id);

-- 4. Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 5. Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
