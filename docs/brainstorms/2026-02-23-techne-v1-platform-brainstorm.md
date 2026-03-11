# Techne V1 Platform — Brainstorm

**Date:** 2026-02-23
**Status:** Complete → ready for planning

---

## What We're Building

A Next.js web application that lets someone discover Techne, enroll in a cohort, pay, and immediately access their learning materials. The site replaces the current single `index.html` with a proper multi-page experience.

The goal is simple: **before Cohort 2 opens, a student can go from landing on the site to enrolled and inside the members area without any manual intervention from Aaron.**

---

## Constraints

- **Timeline: 2-3 weeks** — scope must be ruthlessly minimal
- Needs to be live before Cohort 2 enrollment opens
- Built to be handed off to / extended by Cohort 2 students as a class project

---

## Key Decisions

### Stack
- **Next.js (App Router)** — static generation for public pages, server components for authenticated areas
- **Supabase** — auth (magic link), Postgres database, no custom backend needed for v1
- **Stripe** — payments, with promo codes for sliding scale / scholarship spots
- **Vercel** — hosting (natural fit for Next.js, handles env vars cleanly)

### Auth
**Magic link via email** — students enter their email, Supabase sends a link. No password to forget. Simple, Supabase handles it natively.

### Recordings
**YouTube unlisted embeds** — upload to YouTube, store the URL in the database. Zero storage cost, no Supabase video infrastructure needed, familiar playback UX.

### Admin
**Simple `/admin` page** — a protected route (admin role in Supabase) where Aaron can add a session recording by pasting a YouTube URL, title, week number, and optional notes. No external CMS, no Supabase dashboard required for day-to-day use.

### Pricing
**$225 flat + Stripe promo codes** — one price for everyone, with discount/scholarship codes created in the Stripe dashboard and applied at checkout. No extra complexity in the app.

### Design
Carry forward the existing Techne aesthetic — dark ink hero, warm parchment body, Cormorant + IBM Plex Mono typography, ember red accent. No time to redesign on a 2-3 week timeline.

---

## Routes

| Route | Type | Description |
|---|---|---|
| `/` | Static | Homepage — migrate current Techne HTML |
| `/programs` | Static | Programs including LVB Cohort 2 listing |
| `/enroll/[cohort]` | Dynamic | Stripe checkout for a specific cohort |
| `/cohort` | Protected | Members area — recordings, materials, cohort directory |
| `/admin` | Protected (admin) | Add/edit sessions and resources |
| `/writing` | Static | Blog layer — can ship empty, populate later |

---

## Database Schema (Supabase)

```sql
-- Managed by Supabase Auth
-- auth.users (id, email, ...)

cohorts (
  id uuid primary key,
  name text,                    -- "Cohort 2"
  description text,
  price_cents int,              -- 22500
  stripe_price_id text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean default false
)

enrollments (
  id uuid primary key,
  user_id uuid references auth.users,
  cohort_id uuid references cohorts,
  stripe_session_id text,
  enrolled_at timestamptz default now()
)

sessions (
  id uuid primary key,
  cohort_id uuid references cohorts,
  week_number int,
  title text,
  youtube_url text,
  notes text,                   -- markdown
  published_at timestamptz
)

resources (
  id uuid primary key,
  cohort_id uuid references cohorts,
  title text,
  url text,
  resource_type text,           -- 'link' | 'document' | 'tool'
  created_at timestamptz default now()
)
```

Row-level security in Supabase ensures enrolled students only see sessions for their cohort.

---

## User Flows

### Enrolling student
1. Lands on `/programs` → reads about LVB Cohort 2 → clicks "Enroll"
2. `/enroll/cohort-2` → Stripe checkout page ($225, optional promo code)
3. Stripe webhook fires on success → enrollment row created in Supabase
4. Student redirected to `/cohort` → sees their cohort's sessions and resources

### Returning student
1. Visits site → clicks "Sign in" → enters email → clicks magic link
2. Lands on `/cohort` → sees recordings, materials, cohort members

### Aaron adding a recording
1. Goes to `/admin` → "Add Session"
2. Pastes YouTube URL, adds title, week number, optional notes
3. Saves → immediately visible to enrolled students in `/cohort`

---

## Out of Scope for V1

- MCP / Parachute integration (needs FastAPI layer — v2)
- Observations / evidence profiles / collective memory
- Multiple simultaneous cohorts (just Cohort 2)
- Full community profiles / portfolio pages
- Mobile app

---

## Open Questions

- Does `/writing` need to ship with v1 or can it be a placeholder?
- Should the cohort directory show student names + what they're building, or just names?
- Is there a separate admin account or does Aaron's regular account get an admin flag?

---

## What Comes After V1

The FastAPI MCP server sits on top of this Supabase database. When a student opens Parachute, it queries the MCP server for their enrollment, sessions attended, and what they've been building. That personalized context flows into Parachute's extended mind. V1 builds the database that makes this possible. Cohort 2 students help build the MCP layer.
