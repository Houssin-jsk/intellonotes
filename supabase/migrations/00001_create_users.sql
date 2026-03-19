-- Migration: Create users table and enums
-- Depends on: auth.users (built-in Supabase)

-- 1. Enums
CREATE TYPE public.user_role AS ENUM ('student', 'professor', 'admin');

-- 2. Users table (mirrors auth.users with extra profile fields)
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          public.user_role NOT NULL DEFAULT 'student',
  bio           TEXT,
  expertise     TEXT,
  avatar_url    TEXT,
  charter_signed_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Index for role-based queries
CREATE INDEX idx_users_role ON public.users(role);

-- 4. Trigger: auto-create public.users row on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.user_role,
      'student'::public.user_role
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Enable RLS (policies defined in 00008)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
