-- Migration: Create withdrawals table and enum

CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processed', 'rejected');

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount       NUMERIC(8,2) NOT NULL CHECK (amount >= 100),
  status       public.withdrawal_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_withdrawals_professor ON public.withdrawals(professor_id);
CREATE INDEX idx_withdrawals_status    ON public.withdrawals(status);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
