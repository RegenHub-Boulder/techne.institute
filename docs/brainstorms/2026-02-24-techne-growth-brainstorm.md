# Techne Institute — Growth & Learning Experience Brainstorm

**Date:** 2026-02-24
**Status:** Decided — ready for planning

---

## Context

Techne is a cohort-based AI development program based in Boulder. The platform currently handles enrollment (Stripe), content delivery (session recordings + resources), and access control. The actual learning community lives in Discord, Zoom calls, and email.

**Three outcomes students should leave with:**
1. Something they shipped (a real project)
2. A changed way of working (AI-integrated practice)
3. A community they belong to

Community is the binding force — but right now the platform doesn't reflect it.

---

## The Core Problem

The platform is a **payment system + content library**. Discord/Zoom is where the energy lives. But Discord is ephemeral and noisy — nothing persists, nothing accumulates, nothing *shows* what this cohort built together.

The question isn't "how do we rebuild Circle?" It's: **what should the platform own that Discord can't?**

Answer: **the permanent, visible record of what people built.**

---

## What We're Building

### Phase 1: Project Showcase (Ship First)

A `Builds` tab on the cohort dashboard where students submit and see what everyone is building. A URL, a short description, an optional screenshot. Admin can feature standout projects.

**Why this works for all three goals:**
- *Ship something real* — the act of submitting is the moment of claiming "I built this"
- *Change how you work* — seeing peers ship normalizes it; creates accountability
- *Community* — shared pride, peer discovery, inspiration without needing Discord open

**What it is NOT:** a social feed, a forum, a discussion thread. Just a gallery of builds.

### Phase 2: Announcements Feed (Next)

Admin-only posts that appear on the cohort dashboard — replacing "hey everyone" emails and pinned Discord messages. Think Basecamp message board, not a forum. Students have a reason to check the platform between Zoom calls.

---

## What We're NOT Building

- Discussion threads / replies (Discord owns this)
- DMs or @mentions (Discord owns this)
- Live session scheduling (Zoom + calendar owns this)
- A full Circle/Mighty Networks replacement — that's the empty room problem

---

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Community hub | Keep in Discord | Where energy already is; don't fight it |
| Platform role | Showcase layer | Permanent record Discord can't provide |
| Phase 1 scope | Project submissions + gallery | Highest signal, lowest complexity |
| Phase 2 scope | Announcements feed | Pulls students back without rebuilding community |
| Phase 3 (future) | Discord bridge | Surface Discord highlights on-platform — later |

---

## Database Shape (Phase 1)

New table: `projects`
- `id`, `user_id`, `cohort_id`
- `title` — short name for the build
- `url` — live link
- `description` — 1-3 sentences
- `screenshot_url` — optional, stored in Supabase storage
- `featured` — boolean, admin-toggleable
- `created_at`

RLS: enrolled students can read all projects in their cohort; users can write their own; admins can update `featured`.

---

## Open Questions

- Should projects be visible across cohorts (public showcase) or only within the cohort? (Start: cohort-only. Expand later.)
- Is a screenshot required or optional? (Start: optional, link-only is fine.)
- Should there be a way to react or comment on projects? (No — that's Discord's job.)
- Does the student directory (`show_in_directory`) connect to projects? (Eventually yes — profile page shows their builds.)

---

## Success Looks Like

- Students submit their project *during* the cohort, not just at the end
- Prospective students can see a gallery of real builds from past cohorts (public, post-cohort)
- The operator stops sending "share what you built" emails manually
- 60%+ of students in a cohort have a submitted project by week 3

---

## Next Steps

1. `/workflows:plan` — implement the projects table + Builds tab
2. Phase 2: announcements feed (separate plan)
3. Phase 3 (later): public showcase page for past cohorts, linked to enrollment/programs page
