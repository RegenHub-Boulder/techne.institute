# Techne Institute

A Next.js web application for Techne Institute — an AI/technology learning center in Boulder, CO.
Students enroll in cohorts, pay via Stripe, and access session recordings in a protected members area.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Supabase** — Postgres database + auth (magic link, no passwords)
- **Stripe** — one-time payments, promo codes for sliding scale
- **Vercel** — hosting + CI/CD

## Design Tokens

```css
--void: #08080a;      /* deepest dark */
--ink: #0f0f12;       /* hero background */
--charcoal: #1a1a1f;  /* body text */
--graphite: #2a2a30;  /* secondary text */
--parchment: #f7f5f0; /* body background */
--cream: #ebe7df;     /* card backgrounds */
--bone: #d8d3c8;      /* borders */
--stone: #9a958a;     /* muted text, labels */
--ember: #c2512a;     /* primary accent */
--ember-dim: #8a3a1f; /* ember hover state */
--font-display: Cormorant, serif
--font-body: Source Serif 4, serif
--font-mono: IBM Plex Mono, monospace
```

All fonts loaded via `next/font/google` as CSS variables in `app/layout.tsx`.

## Routes

| Route | Type | Auth |
|---|---|---|
| `/` | Static | Public |
| `/programs` | Server component (DB query) | Public |
| `/enroll/[cohort]` | Server component | Public |
| `/enroll/[cohort]/success` | Server component | Public |
| `/signin` | Client component | Public |
| `/auth/callback` | API route | Public |
| `/cohort` | Server component | Protected |
| `/cohort/profile` | Client component | Protected |
| `/admin` | Server component | Protected (admin only) |
| `/writing` | Static | Public |
| `/api/checkout` | API route | Public |
| `/api/webhooks/stripe` | API route | Stripe signature |

## Environment Variables

See `.env.local.example`. Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only — never expose to client)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Database

Migrations in `supabase/migrations/`. Run in Supabase SQL Editor in order:
1. `001_initial_schema.sql` — tables
2. `002_rls_policies.sql` — row-level security
3. `003_triggers.sql` — auto-create profile on signup

Seed data in `supabase/seed.sql` — creates Cohort 2 record.

## Critical Patterns

### Post-Payment Auth Flow
After Stripe checkout, the student has no Supabase session. Never redirect to `/cohort` directly from Stripe.
Always redirect to `/enroll/[cohort]/success?session_id=...` which:
1. Retrieves the Stripe session to get the student's email
2. Sends a magic link to that email
3. Shows "Check your email" message

### Stripe Webhook Idempotency
The webhook handler (`/api/webhooks/stripe`) checks for an existing `stripe_session_id` before inserting.
Listens to `checkout.session.completed` (not `payment_intent.succeeded`) to cover 100% promo codes.

### Admin Role
Set `profiles.is_admin = true` via Supabase SQL editor:
```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'ag@unforced.org');
```

### Supabase Clients
- `lib/supabase/client.ts` — browser client (use in `'use client'` components)
- `lib/supabase/server.ts` → `createClient()` — server client with cookie handling
- `lib/supabase/server.ts` → `createAdminClient()` — service role client (webhook + post-payment only)

## Local Development

```bash
npm install
cp .env.local.example .env.local
# Fill in .env.local with Supabase + Stripe keys
npm run dev
```

For Stripe webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Key Files

- `middleware.ts` — protects `/cohort` and `/admin` routes
- `app/globals.css` — all styles (no Tailwind)
- `app/layout.tsx` — fonts + Nav + Footer
- `app/api/webhooks/stripe/route.ts` — enrollment on payment
- `app/enroll/[cohort]/success/page.tsx` — post-payment magic link send
