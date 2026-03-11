-- Techne Institute — Seed Data
-- Run after migrations to set up Cohort 2

insert into public.cohorts (slug, name, description, price_cents, enrollment_open, is_active, starts_at, ends_at)
values (
  'cohort-2',
  'LVB Cohort 2',
  'A four-week intensive on building with AI. Learn to ship real software using Claude, Cursor, and modern tooling — in community with others doing the same.',
  22500,  -- $225.00
  false,  -- flip to true when enrollment opens
  false,
  '2026-03-15 09:00:00-07',  -- update with real date
  '2026-04-12 17:00:00-07'   -- update with real date
);

-- After creating your Stripe price, update stripe_price_id:
-- update public.cohorts set stripe_price_id = 'price_xxx' where slug = 'cohort-2';

-- To make Aaron an admin (run after he signs up):
-- update public.profiles set is_admin = true where id = (
--   select id from auth.users where email = 'ag@unforced.org'
-- );
