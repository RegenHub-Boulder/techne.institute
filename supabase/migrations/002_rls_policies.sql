-- Techne Institute V1 — Row Level Security Policies
-- Run after 001_initial_schema.sql

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.cohorts enable row level security;
alter table public.enrollments enable row level security;
alter table public.sessions enable row level security;
alter table public.resources enable row level security;

-- ============ PROFILES ============

-- Users can read their own profile
create policy "profiles: users read own"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "profiles: users update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can read all profiles
create policy "profiles: admins read all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ============ COHORTS ============

-- Anyone can read cohorts (for /programs page — public enrollment info)
create policy "cohorts: public read"
  on public.cohorts for select
  using (true);

-- Only admins can insert/update/delete cohorts
create policy "cohorts: admins write"
  on public.cohorts for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ============ ENROLLMENTS ============

-- Users can see their own enrollments
create policy "enrollments: users read own"
  on public.enrollments for select
  using (auth.uid() = user_id);

-- Admins can read all enrollments
create policy "enrollments: admins read all"
  on public.enrollments for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Service role handles inserts (via webhook) — no user-facing insert policy
-- Users cannot insert their own enrollments (must go through Stripe)

-- ============ SESSIONS ============

-- Enrolled students can see published sessions for their cohort
create policy "sessions: enrolled students read published"
  on public.sessions for select
  using (
    published_at is not null
    and published_at <= now()
    and exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid()
        and e.cohort_id = sessions.cohort_id
    )
  );

-- Admins can see and manage all sessions (including drafts)
create policy "sessions: admins all"
  on public.sessions for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ============ RESOURCES ============

-- Enrolled students can see resources for their cohort
create policy "resources: enrolled students read"
  on public.resources for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid()
        and e.cohort_id = resources.cohort_id
    )
  );

-- Admins can manage all resources
create policy "resources: admins all"
  on public.resources for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );
