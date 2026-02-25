-- Techne Institute V1 — Project Showcase
-- Adds the projects table so enrolled students can share what they're building.

create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  cohort_id   uuid not null references public.cohorts on delete cascade,
  user_id     uuid not null references auth.users on delete cascade,
  title       text not null,
  description text,
  url         text,
  featured    boolean not null default false,
  created_at  timestamptz not null default now(),
  -- One project per student per cohort (students iterate on one thing)
  unique (cohort_id, user_id)
);

alter table public.projects enable row level security;

-- Enrolled students can read all projects in their cohort
create policy "projects: enrolled students read"
  on public.projects for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid()
        and e.cohort_id = projects.cohort_id
    )
  );

-- Students can insert their own project
create policy "projects: students insert own"
  on public.projects for insert
  with check (auth.uid() = user_id);

-- Students can update their own project but cannot change the featured flag
create policy "projects: students update own"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and featured = (select featured from public.projects where id = projects.id)
  );

-- Students can delete their own project
create policy "projects: students delete own"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Admins can do everything (including toggling featured)
create policy "projects: admins all"
  on public.projects for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Indexes
create index idx_projects_cohort_id on public.projects (cohort_id);
create index idx_projects_user_id   on public.projects (user_id);
-- Supports the ordered query: featured desc, then newest first
create index idx_projects_cohort_featured on public.projects (cohort_id, featured desc, created_at desc);
