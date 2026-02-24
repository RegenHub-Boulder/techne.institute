-- Techne Institute — Security fixes and performance indexes
-- Run after 003_triggers.sql

-- ============ FIX: is_admin privilege escalation ============
-- The original update policy allowed users to set is_admin = true on their own row.
-- This replacement enforces that is_admin cannot be changed by the row's owner.
drop policy if exists "profiles: users update own" on public.profiles;

create policy "profiles: users update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- is_admin must remain unchanged — only service role can modify it
    and is_admin = (select is_admin from public.profiles where id = auth.uid())
  );

-- ============ Helper: look up auth.users by email ============
-- Used by the webhook handler to find existing users without loading all users.
-- security definer allows this function to query the auth schema.
create or replace function public.get_auth_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = auth, public
as $$
  select id from auth.users where email = p_email limit 1
$$;

-- Revoke public execute; only service role (webhook) should call this
revoke execute on function public.get_auth_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.get_auth_user_id_by_email(text) to service_role;

-- ============ Performance indexes ============

-- Enrollments: user and cohort lookups (used on every /cohort page load)
create index if not exists idx_enrollments_user_id
  on public.enrollments (user_id);

create index if not exists idx_enrollments_cohort_id
  on public.enrollments (cohort_id);

-- Replace implicit unique index with a partial unique index (excludes NULLs cleanly)
-- The unique column constraint already creates an index, so this is for documentation clarity.
-- stripe_session_id is already unique via the column definition; no additional index needed.

-- Sessions: cohort + published filter (used on every /cohort page load)
create index if not exists idx_sessions_cohort_id
  on public.sessions (cohort_id);

create index if not exists idx_sessions_cohort_published
  on public.sessions (cohort_id, published_at)
  where published_at is not null;

-- Resources: cohort filter
create index if not exists idx_resources_cohort_id
  on public.resources (cohort_id);

-- Profiles: admin flag lookup in middleware (every /admin request)
create index if not exists idx_profiles_id_is_admin
  on public.profiles (id, is_admin);
