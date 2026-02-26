---
title: "feat: Techne V1 Enrollment Platform"
type: feat
date: 2026-02-23
status: ready-to-implement
brainstorm: docs/brainstorms/2026-02-23-techne-v1-platform-brainstorm.md
---

# feat: Techne V1 Enrollment Platform

## Overview

Replace the current single `index.html` with a full Next.js web application. Before Cohort 2 opens, a student should be able to go from landing on the site → enrolled → inside the members area **without any manual intervention from Aaron.**

**Stack:** Next.js (App Router) + Supabase (auth + Postgres) + Stripe (payments) + Vercel (hosting)

**Timeline:** 2–3 weeks, scope is ruthlessly minimal. Built to be extended by Cohort 2 students.

---

## Problem Statement

The current site is a static `index.html`. There is no way to:
- Browse cohorts and enroll online
- Pay for a spot without Aaron manually processing it
- Access session recordings after class
- Sign in as a returning student

Everything is manual. Aaron is the bottleneck. V1 removes that bottleneck for Cohort 2.

---

## Critical Architecture Decision — Post-Payment Auth Gap

> **This must be resolved before building the enrollment flow.**

Stripe Checkout runs entirely outside Supabase Auth. After a student pays, they are redirected back to the app — but they have **no Supabase session**. If `/cohort` is a protected route, they just paid $225 and immediately hit an auth wall.

**Resolution:** Do not redirect to `/cohort` after payment. Instead:

1. Stripe `success_url` → `/enroll/cohort-2/success?session_id={CHECKOUT_SESSION_ID}`
2. Server component on that page calls Stripe to retrieve the session → gets the student's email
3. Server calls Supabase Admin API to find-or-create the user
4. Server triggers a Supabase magic link email to that address
5. Page renders: **"You're in. Check your email — your access link is on the way."**
6. Student clicks magic link → `/cohort` loads with full session

This is the simplest bridge that uses existing magic link infrastructure and avoids custom token exchange. No state stored in the URL.

---

## Decisions Made (from brainstorm)

| Decision | Choice |
|---|---|
| Auth | Magic link via Supabase (no passwords) |
| Recordings | YouTube unlisted embeds, URL in DB |
| Admin UI | Simple `/admin` protected route, paste YouTube URL + metadata |
| Pricing | $225 flat + Stripe promo codes |
| Design | Carry forward existing Techne aesthetic (dark ink hero, parchment body, Cormorant + IBM Plex Mono, ember red) |
| Hosting | Vercel (migrate from GitHub Pages) |

---

## Decisions Resolved by SpecFlow Analysis

| Decision | Choice |
|---|---|
| Post-payment auth | Success URL → `/enroll/[cohort]/success`, triggers magic link send |
| Stripe webhook event | `checkout.session.completed` (covers 100% promo codes too) |
| Webhook idempotency | Check `stripe_session_id` before inserting enrollment row |
| Admin role | `is_admin` boolean on `profiles` table (Aaron's account gets it manually) |
| Edit/delete sessions | Yes — admin UI has edit and delete for sessions |
| Resources admin UI | In scope — add/edit/delete resources (simple form, same page as sessions) |
| Unauthenticated redirect | → `/signin` page |
| `published_at` on sessions | Controls visibility (null = draft, set = published immediately) |
| Cohort directory | Names only for V1, no emails. Opt-in at enrollment time. |
| Double-enrollment guard | Unique constraint on `(user_id, cohort_id)` + UI check |

---

## Routes

| Route | Type | Description |
|---|---|---|
| `/` | Static | Homepage — migrate current Techne HTML |
| `/programs` | Server Component | Cohort listing — queries DB for active cohorts |
| `/enroll/[cohort]` | Server Component | Stripe checkout initiation |
| `/enroll/[cohort]/success` | Server Component | Post-payment page, triggers magic link |
| `/signin` | Static | Email input for magic link |
| `/cohort` | Protected | Members area — recordings, resources, directory |
| `/admin` | Protected (admin) | Manage sessions and resources |
| `/writing` | Static | Blog — ships empty |
| `/auth/callback` | API Route | Supabase auth callback (magic link redirect) |
| `/api/webhooks/stripe` | API Route | Stripe webhook handler |

---

## Database Schema

```sql
-- Managed by Supabase Auth
-- auth.users (id, email, created_at, ...)

-- Public profiles (auto-created on auth.users insert via trigger)
profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  show_in_directory boolean default true,
  is_admin boolean default false,
  created_at timestamptz default now()
)

cohorts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,             -- 'cohort-2'
  name text not null,                    -- 'LVB Cohort 2'
  description text,
  price_cents int not null,              -- 22500
  stripe_price_id text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean default false,
  enrollment_open boolean default false  -- separate from is_active
)

enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  cohort_id uuid not null references cohorts on delete restrict,
  stripe_session_id text unique,         -- idempotency key
  enrolled_at timestamptz default now(),
  unique(user_id, cohort_id)             -- prevents double-enrollment
)

sessions (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references cohorts on delete cascade,
  week_number int not null,
  title text not null,
  youtube_url text,
  notes text,                            -- markdown
  published_at timestamptz,              -- null = draft, set = published
  created_at timestamptz default now()
)

resources (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references cohorts on delete cascade,
  title text not null,
  url text not null,
  resource_type text not null check (resource_type in ('link', 'document', 'tool')),
  created_at timestamptz default now()
)
```

**Trigger:** Auto-create `profiles` row on `auth.users` insert (same pattern as Schelling Point).

**RLS Policies:**
- `profiles` — users can read/update their own row; admins can read all
- `cohorts` — public read; admin write
- `enrollments` — users see only their own; admin reads all
- `sessions` — enrolled users see published sessions for their cohort; admin sees all
- `resources` — enrolled users see resources for their cohort; admin sees all

---

## Implementation Phases

### Phase 1: Foundation (Days 1–3)

**Goal:** Deployable skeleton on Vercel with Supabase connected.

#### Tasks

- [ ] Scaffold Next.js app: `npx create-next-app@latest . --app --typescript --eslint` (no Tailwind — we're using hand-crafted CSS matching existing tokens)
- [ ] Create `app/globals.css` — extract all CSS custom properties from `index.html` `:root {}` block
- [ ] Install dependencies: `@supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js`
- [ ] Create `supabase/migrations/001_initial_schema.sql` with full schema above
- [ ] Create `supabase/migrations/002_rls_policies.sql` with all RLS policies
- [ ] Create `supabase/migrations/003_triggers.sql` — auto-create profile on signup
- [ ] Create `.env.local.example` documenting all required vars
- [ ] Create Supabase cloud project (production) + configure Auth URLs
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Create Vercel project, link repo, add env vars
- [ ] DNS cutover: point `techne.institute` from GitHub Pages to Vercel
- [ ] Create `CLAUDE.md` at repo root documenting stack, design tokens, route structure

#### Files

```
techne.institute/
├── CLAUDE.md
├── .env.local.example
├── package.json
├── next.config.ts
├── tsconfig.json
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_triggers.sql
└── app/
    ├── globals.css          ← design tokens + base styles
    ├── layout.tsx           ← root layout with nav + footer
    └── page.tsx             ← placeholder (replaces with real homepage in Phase 2)
```

---

### Phase 2: Design System + Static Pages (Days 4–6)

**Goal:** Homepage and /programs look and feel like the current Techne site.

#### Tasks

- [ ] Build `app/_components/Nav.tsx` — sticky nav matching existing: logo left, mono links right
- [ ] Build `app/_components/Footer.tsx` — void background, mono text
- [ ] Build `app/_components/SectionMark.tsx` — mono label + horizontal rule pattern
- [ ] Port homepage from `index.html` to `app/page.tsx` — hero, program sections, CTA
- [ ] Build `app/programs/page.tsx` — server component, queries `cohorts` table for `enrollment_open = true`
- [ ] Build `app/writing/page.tsx` — static placeholder: "Essays and notes — coming soon"
- [ ] Responsive CSS for nav (mobile hamburger or collapsed links)

#### Key Design Tokens to preserve from `index.html`

```css
/* Carry forward verbatim from index.html lines 11-35 */
--void: #08080a;
--ink: #0f0f12;
--charcoal: #1a1a1f;
--parchment: #f7f5f0;
--cream: #ebe7df;
--ember: #c2512a;
--ember-dim: #8a3a1f;
--font-display: 'Cormorant', serif;
--font-body: 'Source Serif 4', serif;
--font-mono: 'IBM Plex Mono', monospace;
```

Paper texture overlay (SVG fractalNoise, `opacity: 0.15`) is preserved in root layout.

---

### Phase 3: Auth (Days 7–8)

**Goal:** Magic link sign-in works end-to-end. Protected routes redirect correctly.

#### Tasks

- [ ] Build `app/signin/page.tsx` — email input form, calls Supabase `signInWithOtp()`
- [ ] Build `app/auth/callback/route.ts` — Supabase PKCE callback handler (exchanges code for session)
- [ ] Create `lib/supabase/client.ts` — browser Supabase client (singleton)
- [ ] Create `lib/supabase/server.ts` — server Supabase client (cookies)
- [ ] Create `middleware.ts` — protect `/cohort` and `/admin` routes, redirect to `/signin`
- [ ] Build `app/_components/AuthProvider.tsx` — React context exposing `user`, `signOut`
- [ ] Test full magic link flow: enter email → receive email (check Supabase dashboard) → click link → session active → `/cohort` loads

#### Supabase Auth Configuration

- Site URL: `https://techne.institute`
- Redirect URLs: `https://techne.institute/auth/callback`, `http://localhost:3000/auth/callback`
- Email provider: Supabase's built-in for now (upgrade to Resend before launch if needed)

---

### Phase 4: Stripe Enrollment (Days 9–11)

**Goal:** A student can pay and receive their magic link access email.

#### Tasks

- [ ] Create Stripe Product and Price for Cohort 2 ($225), save `stripe_price_id` to DB
- [ ] Build `app/enroll/[cohort]/page.tsx` — shows cohort details + "Enroll Now" button
- [ ] Build `app/api/checkout/route.ts` — creates Stripe Checkout Session
  - `success_url`: `/enroll/{cohort}/success?session_id={CHECKOUT_SESSION_ID}`
  - `cancel_url`: `/enroll/{cohort}`
  - `payment_method_types: ['card']`
  - `allow_promotion_codes: true` (enables Stripe dashboard promo codes)
- [ ] Build `app/enroll/[cohort]/success/page.tsx` — server component
  - Retrieves Stripe session by `session_id`
  - Calls `supabase.auth.admin.generateLink()` to create magic link for student's email
  - Sends magic link email
  - Shows: "You're in. Check your email — your access link is on the way."
- [ ] Build `app/api/webhooks/stripe/route.ts` — webhook handler
  - Listens to `checkout.session.completed`
  - Verifies signature with `stripe.webhooks.constructEvent()`
  - Checks for existing enrollment by `stripe_session_id` (idempotency)
  - If not found: creates enrollment row via service role client
  - Returns 200 immediately (async processing to avoid timeout)
- [ ] Configure Stripe webhook endpoint in dashboard: `https://techne.institute/api/webhooks/stripe`
- [ ] Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Test promo code at 100% discount — confirm `checkout.session.completed` fires and enrollment is created

#### Webhook Idempotency Pattern

```typescript
// app/api/webhooks/stripe/route.ts
const existing = await supabase
  .from('enrollments')
  .select('id')
  .eq('stripe_session_id', session.id)
  .single()

if (existing.data) {
  return NextResponse.json({ received: true }) // already processed
}

await supabase.from('enrollments').insert({
  user_id: user.id,
  cohort_id: cohort.id,
  stripe_session_id: session.id,
})
```

---

### Phase 5: Members Area (Days 12–14)

**Goal:** Enrolled students can see and watch their cohort's session recordings.

#### Tasks

- [ ] Build `app/cohort/page.tsx` — protected server component
  - Fetches enrolled student's cohort via `enrollments` join
  - Fetches published sessions ordered by `week_number`, then `published_at`
  - Fetches resources for cohort
  - Fetches directory members (where `show_in_directory = true`)
- [ ] Build `app/cohort/_components/SessionCard.tsx` — shows week #, title, YouTube embed, notes (markdown rendered)
- [ ] Build `app/cohort/_components/ResourceList.tsx` — links grouped by `resource_type`
- [ ] Build `app/cohort/_components/CohortDirectory.tsx` — enrolled students' `display_name` list
- [ ] Empty state: "Cohort 2 starts [date]. Sessions will appear here as they're published."
- [ ] Build `app/cohort/profile/page.tsx` — student can update their `display_name` and `show_in_directory`
- [ ] YouTube embed: extract video ID from URL, render `<iframe src="https://www.youtube.com/embed/{id}" />`

#### Sessions Layout

```
/cohort
  ├── Header: "LVB Cohort 2" + cohort dates
  ├── Sessions (tab or section)
  │     ├── Week 1 — Session Title
  │     │     └── YouTube embed + notes
  │     └── Week 2 — ...
  ├── Resources (tab or section)
  │     ├── Tools: [link list]
  │     ├── Documents: [link list]
  │     └── Links: [link list]
  └── Directory (tab or section)
        └── [display_name list, opt-in only]
```

---

### Phase 6: Admin (Days 15–16)

**Goal:** Aaron can add/edit/delete sessions and resources from `/admin` without touching the database.

#### Tasks

- [ ] Update `middleware.ts` — check `profiles.is_admin` for `/admin` routes (use service role or server-side check)
- [ ] Build `app/admin/page.tsx` — admin dashboard: Sessions tab + Resources tab
- [ ] Build `app/admin/_components/SessionForm.tsx` — add/edit session
  - Fields: `title` (text), `week_number` (number), `youtube_url` (text with validation), `notes` (textarea), `published_at` (toggle or datetime picker)
  - YouTube URL validation: must match `youtube.com/watch?v=` or `youtu.be/` pattern
  - Preview: show YouTube embed inline before saving
- [ ] Build `app/admin/_components/ResourceForm.tsx` — add/edit resource
  - Fields: `title`, `url`, `resource_type` (select: link / document / tool)
- [ ] Build `app/admin/sessions/[id]/edit/page.tsx` — edit existing session
- [ ] Delete buttons with confirmation dialog on sessions and resources
- [ ] Manually seed Aaron's account: set `profiles.is_admin = true` via Supabase SQL editor

#### Admin UI Layout

```
/admin
  ├── Sessions
  │     ├── [Add Session] button
  │     └── Table: week | title | published | [Edit] [Delete]
  └── Resources
        ├── [Add Resource] button
        └── Table: type | title | url | [Edit] [Delete]
```

---

### Phase 7: Polish + Launch (Days 17–21)

**Goal:** Production-ready. DNS live. Cohort 2 enrollment opens.

#### Tasks

- [ ] Mobile responsiveness audit — nav, hero, session cards, enrollment form
- [ ] Loading states on all async operations (skeleton loaders or spinners)
- [ ] Error boundaries and user-facing error messages
- [ ] 404 page (`app/not-found.tsx`) in Techne style
- [ ] Verify email deliverability: test magic link emails from production Supabase
- [ ] Stripe webhook production endpoint verified (check signature)
- [ ] Create Stripe promo codes for scholarship spots in Stripe dashboard
- [ ] Seed database: create Cohort 2 record with correct `slug`, dates, `stripe_price_id`
- [ ] Set `cohorts.enrollment_open = true` when ready to accept students
- [ ] Lighthouse audit: performance, accessibility, SEO basics
- [ ] Add `<meta>` tags for OG/social sharing on homepage and /programs
- [ ] Announce on Woven Web newsletter + LVB landing page

#### Pre-Launch Checklist

- [ ] All env vars set in Vercel production environment
- [ ] Stripe webhook endpoint registered and verified in Stripe dashboard
- [ ] Supabase Auth redirect URLs include `https://techne.institute/auth/callback`
- [ ] Supabase email templates customized with Techne branding
- [ ] RLS policies tested with a non-admin test user account
- [ ] Webhook idempotency tested (re-send event manually)
- [ ] 100% promo code enrollment tested end-to-end
- [ ] Aaron's admin account seeded and tested
- [ ] Stripe test mode → live mode switched (new API keys in Vercel)

---

## Environment Variables

```bash
# .env.local.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # never expose to client

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=https://techne.institute
```

---

## File Structure (Full App)

```
techne.institute/
├── CLAUDE.md
├── CNAME                              ← keep for fallback (Vercel handles domain)
├── .env.local.example
├── package.json
├── next.config.ts
├── middleware.ts                      ← protect /cohort, /admin
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_triggers.sql
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  ← browser client
│   │   └── server.ts                  ← server client (cookies)
│   └── stripe.ts                      ← Stripe instance
└── app/
    ├── globals.css                    ← design tokens + base
    ├── layout.tsx                     ← Nav + Footer + AuthProvider
    ├── page.tsx                       ← Homepage (migrated from index.html)
    ├── not-found.tsx
    ├── writing/
    │   └── page.tsx                   ← placeholder
    ├── programs/
    │   └── page.tsx                   ← cohort listing (server)
    ├── signin/
    │   └── page.tsx                   ← magic link entry
    ├── auth/
    │   └── callback/
    │       └── route.ts               ← PKCE callback
    ├── enroll/
    │   └── [cohort]/
    │       ├── page.tsx               ← cohort detail + enroll CTA
    │       └── success/
    │           └── page.tsx           ← post-payment, triggers magic link
    ├── cohort/
    │   ├── page.tsx                   ← protected members area
    │   ├── profile/
    │   │   └── page.tsx               ← student profile edit
    │   └── _components/
    │       ├── SessionCard.tsx
    │       ├── ResourceList.tsx
    │       └── CohortDirectory.tsx
    ├── admin/
    │   ├── page.tsx                   ← sessions + resources tabs
    │   ├── sessions/
    │   │   └── [id]/
    │   │       └── edit/
    │   │           └── page.tsx
    │   └── _components/
    │       ├── SessionForm.tsx
    │       └── ResourceForm.tsx
    └── api/
        ├── checkout/
        │   └── route.ts               ← create Stripe session
        └── webhooks/
            └── stripe/
                └── route.ts           ← enrollment on payment
```

---

## Reference Implementations

- **Schelling Point app** (identical Next.js + Supabase stack):
  - Schema + triggers: `/Volumes/ExternalSSD/Parachute/Projects/schellingpointapp-new/supabase/schema.sql`
  - Setup guide: `/Volumes/ExternalSSD/Parachute/Projects/schellingpointapp-new/supabase/SETUP.md`
  - Auth context: `/Volumes/ExternalSSD/Parachute/Projects/schellingpointapp/src/contexts/AuthContext.tsx`
  - Architecture: `/Volumes/ExternalSSD/Parachute/Projects/schellingpointapp-new/CLAUDE.md`

---

## Out of Scope for V1

- MCP / Parachute integration (needs FastAPI layer — v2)
- Observations / evidence profiles / collective memory
- Multiple simultaneous cohorts (just Cohort 2)
- Full community profiles / portfolio pages
- Mobile app
- Stripe subscription / recurring billing (flat one-time payment only)

---

## What Comes After V1

The FastAPI MCP server sits on top of this Supabase database. When a student opens Parachute, it queries the MCP server for their enrollment, sessions attended, and what they've been building. That personalized context flows into Parachute's extended mind. V1 builds the database that makes this possible. Cohort 2 students help build the MCP layer.

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Post-payment auth gap (student pays, can't get in) | High without fix | Critical | Success URL triggers magic link send — spec above |
| Webhook fires twice, duplicate enrollment | Low | Medium | Unique constraint + `stripe_session_id` idempotency check |
| 100% promo code enrollments missed | Medium | High | Listen to `checkout.session.completed`, not payment events |
| DNS cutover causes downtime | Low | High | Add Vercel domain before removing GitHub Pages, test with staging |
| RLS policy misconfiguration leaks sessions | Low | High | Test with a non-admin account before launch |
| Email deliverability (magic links go to spam) | Medium | High | Test from production Supabase, consider Resend if issues |
| Stripe test → live mode switch missed | Low | High | Pre-launch checklist item with env var verification |

---

## Success Metrics

- A new student can complete the full enrollment flow (landing → /cohort) in under 5 minutes
- Zero manual steps required from Aaron for a standard enrollment
- Aaron can add a session recording in under 2 minutes from `/admin`
- All enrolled students can watch session recordings without a Supabase dashboard visit from Aaron
- The site loads in under 3 seconds on mobile (Lighthouse performance > 85)
