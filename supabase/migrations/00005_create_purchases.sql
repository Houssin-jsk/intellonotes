-- Migration: Create purchases table and enum

CREATE TYPE public.purchase_status AS ENUM ('pending', 'confirmed', 'rejected');

CREATE TABLE IF NOT EXISTS public.purchases (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id            UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  amount_paid          NUMERIC(6,2) NOT NULL,
  professor_commission NUMERIC(6,2) NOT NULL,
  platform_commission  NUMERIC(6,2) NOT NULL,
  status               public.purchase_status NOT NULL DEFAULT 'pending',
  purchased_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One purchase per student per course
CREATE UNIQUE INDEX idx_purchases_student_course
  ON public.purchases(student_id, course_id);

CREATE INDEX idx_purchases_status     ON public.purchases(status);
CREATE INDEX idx_purchases_student    ON public.purchases(student_id);
CREATE INDEX idx_purchases_course     ON public.purchases(course_id);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
