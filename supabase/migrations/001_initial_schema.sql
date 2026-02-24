-- Techne Institute V1 — Initial Schema
-- Run in Supabase SQL Editor

-- Public profiles (auto-created on auth.users insert via trigger in 003_triggers.sql)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  show_in_directory boolean not null default true,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Cohorts (e.g. LVB Cohort 2)
create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,              -- 'cohort-2'
  name text not null,                     -- 'LVB Cohort 2'
  description text,
  price_cents int not null,               -- 22500 = $225.00
  stripe_price_id text,                   -- set after creating Stripe price
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default false,
  enrollment_open boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enrollments (one row per student per cohort)
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  cohort_id uuid not null references public.cohorts on delete restrict,
  stripe_session_id text unique,          -- idempotency key from Stripe
  enrolled_at timestamptz not null default now(),
  unique(user_id, cohort_id)              -- prevents double-enrollment
);

-- Sessions (class recordings)
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts on delete cascade,
  week_number int not null,
  title text not null,
  youtube_url text,
  notes text,                             -- markdown
  published_at timestamptz,              -- null = draft; set to now() to publish
  created_at timestamptz not null default now()
);

-- Resources (links, documents, tools for a cohort)
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts on delete cascade,
  title text not null,
  url text not null,
  resource_type text not null check (resource_type in ('link', 'document', 'tool')),
  created_at timestamptz not null default now()
);
