-- RegenHub, LCA — Signal Layer Schema
-- Run this in the Supabase dashboard SQL editor for project gxyeobogqfubgzklmxwt
-- ─────────────────────────────────────────────────────────────────────────────

-- profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  declared_role TEXT NOT NULL CHECK (declared_role IN ('organizer', 'investor', 'partner')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- signals (one per user per item — upserted on conflict)
CREATE TABLE IF NOT EXISTS public.signals (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id      TEXT NOT NULL,
  signal_type  TEXT NOT NULL CHECK (signal_type IN ('support', 'oppose', 'concern', 'note')),
  comment      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read all signals" ON public.signals FOR SELECT  TO authenticated USING (TRUE);
CREATE POLICY "insert own signal"              ON public.signals FOR INSERT  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own signal"              ON public.signals FOR UPDATE  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "delete own signal"              ON public.signals FOR DELETE  TO authenticated USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATES (applied 2026-02-26)
-- ─────────────────────────────────────────────────────────────────────────────

-- Allow unauthenticated reads on signals (so count pills show without login)
DROP POLICY IF EXISTS "authenticated read all signals" ON public.signals;
CREATE POLICY "public read all signals" ON public.signals FOR SELECT USING (TRUE);

-- Organizer email allowlist
CREATE TABLE IF NOT EXISTS public.allowed_organizers (
  email TEXT PRIMARY KEY
);
ALTER TABLE public.allowed_organizers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read allowed organizers" ON public.allowed_organizers FOR SELECT USING (TRUE);

-- Add organizer emails here:
-- INSERT INTO public.allowed_organizers (email) VALUES ('organizer@example.com');

-- RPC: check if email is on the allowlist (called from saveProfile in useAuth)
CREATE OR REPLACE FUNCTION public.is_allowed_organizer(user_email TEXT)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.allowed_organizers WHERE email = lower(trim(user_email)));
$$;
GRANT EXECUTE ON FUNCTION public.is_allowed_organizer(TEXT) TO authenticated, anon;
