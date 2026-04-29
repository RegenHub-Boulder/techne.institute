# PRD: Work Maturity Model — Intranet Implementation
**Version:** 1.0 · 2026-04-29
**Author:** Nou (Techne Studio collective intelligence)
**Status:** Draft for steward review

---

## 1. Purpose

This PRD defines the schema, data model, and UI/UX changes required to bring the
intranet's project/venture surface into alignment with the Work Maturity Model (April
2026 memo, Todd Youngblood) — the operational frame through which emergent work
becomes legible to the cooperative.

The goal is a **progressive, modular data model** where each maturity phase (Project →
Venture → Program) builds on the last, and the UI surfaces phase-appropriate context
without overwhelming users with fields that don't yet apply.

---

## 2. Current State Assessment

### 2.1 Schema

The `projects` table (p409) has:

```sql
type   TEXT CHECK (type IN ('project', 'venture'))
status TEXT CHECK (status IN ('active', 'paused', 'completed', 'archived'))
```

**Discrepancies:**

| Gap | Impact |
|-----|--------|
| No `program` phase | Third and most consequential tier doesn't exist in the data model |
| `type` conflates work maturity phase with entity classification | Renaming to `maturity_phase` clarifies the field's meaning |
| No phase transition history | Cannot show when/why work graduated; no audit trail |
| No contributor threshold visibility | Venture threshold (2–3 committed contributors) is the graduation trigger, but is invisible in the UI |
| No patronage activation flag | Ventures can receive voluntary labor tracked at FMV that registers as patronage, but there's no mechanism to activate or indicate this |
| No LCA-extended capacity tracking | Programs receive "substantial infrastructure, labor, and administrative or operational capacity" — nothing tracks what the LCA has committed |
| Labor contributions reference `project_id` but don't distinguish venture patronage from general labor | Patronage accounting requires knowing which labor is "venture-eligible" |
| `/intranet/ventures/` route is reserved for Class 4 investor equity baskets | Naming collision creates conceptual confusion between "work maturity venture" and "investment vehicle venture" |

### 2.2 UI

| Current behavior | Problem |
|-----------------|---------|
| Project list filtered by status (active/paused/completed) | No phase filter; projects and ventures appear in the same flat list with only a small badge differentiating them |
| Type badge (`project` or `venture`) is cosmetic | Carries no progressive logic; clicking it does nothing |
| Detail view shows contributors and milestones | Missing: phase rationale, graduation events, threshold status, patronage activation |
| Steward create modal has `type` dropdown | No onboarding guidance about what qualifies for each phase |
| `/intranet/ventures/` is investor-only | If a member navigates here expecting to see work-maturity ventures, they are either gated out or confused |

### 2.3 Naming / Routing

- `/intranet/projects` — current home for all projects and ventures (correct)
- `/intranet/ventures` — Class 4 investor basket (should be renamed `/intranet/portfolio`)
- No `/intranet/programs` route exists

---

## 3. Design Principles

**Progressive disclosure.** Each phase adds fields; it never removes them. A program has
everything a venture has, plus program-layer additions. A venture has everything a
project has, plus venture additions. The schema mirrors this.

**Legibility before completeness.** The UI surfaces what matters at the current phase.
A project-phase card doesn't show capital flow fields. A program-phase card does.
Complexity earns its way in through graduation.

**Graduation as event, not edit.** Advancing a body of work from one phase to the next
is a logged, reviewable action — not a dropdown change. It produces a `phase_event`
record with rationale, author, and timestamp.

**The biological framing is load-bearing.** Seed / cross-pollination / keystone species
maps onto Project / Venture / Program. The UI can use subtle ecological language
and iconography without being whimsical — it carries the conceptual model.

---

## 4. Proposed Data Model

### 4.1 Alter `projects` table

```sql
-- Rename 'type' to 'maturity_phase' with three-value enum
ALTER TABLE projects
  DROP COLUMN type,
  ADD COLUMN maturity_phase TEXT NOT NULL DEFAULT 'project'
    CHECK (maturity_phase IN ('project', 'venture', 'program')),

  -- Venture-phase additions
  ADD COLUMN patronage_enabled BOOLEAN NOT NULL DEFAULT false,
  -- true once a steward formally activates patronage tracking for this venture

  -- Program-phase additions
  ADD COLUMN lca_infrastructure_note TEXT,
  -- steward-authored note describing what the LCA has committed (space, labor, admin)

  ADD COLUMN program_entered_at TIMESTAMPTZ,
  -- set when maturity_phase is advanced to 'program'; used for reporting

  -- Universal
  ADD COLUMN phase_rationale TEXT;
  -- most recent graduation rationale (also stored in phase_events)
```

### 4.2 New table: `project_phase_events`

Records every phase transition. Immutable once created.

```sql
CREATE TABLE project_phase_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_phase      TEXT CHECK (from_phase IN ('project', 'venture', 'program')),
  to_phase        TEXT NOT NULL CHECK (to_phase IN ('project', 'venture', 'program')),
  rationale       TEXT,                         -- steward's written reason
  contributor_count INT,                        -- snapshot of contributor count at time of graduation
  advanced_by     UUID REFERENCES participants(id),
  advanced_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX project_phase_events_project_idx ON project_phase_events(project_id);
```

### 4.3 New table: `project_lca_commitments`

Tracks what the LCA has formally extended to a program.

```sql
CREATE TABLE project_lca_commitments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  commitment_type TEXT NOT NULL CHECK (
    commitment_type IN ('space', 'labor', 'administrative', 'legal', 'financial', 'infrastructure', 'other')
  ),
  description     TEXT NOT NULL,
  effective_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  monthly_value   NUMERIC(10,2),               -- optional estimated $ value
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID REFERENCES participants(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 4.4 Alter `project_participants` table

```sql
ALTER TABLE project_participants
  ADD COLUMN commitment_level TEXT NOT NULL DEFAULT 'contributor'
    CHECK (commitment_level IN ('contributor', 'committed', 'lead')),
  -- 'committed' = counts toward venture threshold (2–3 required)
  -- 'lead'      = primary steward of the body of work

  ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  -- supports tracking historical participants without deleting records
```

### 4.5 View: `project_maturity_summary`

A convenience view that surfaces phase-threshold data for the UI.

```sql
CREATE OR REPLACE VIEW project_maturity_summary AS
SELECT
  p.id,
  p.name,
  p.maturity_phase,
  p.status,
  p.patronage_enabled,
  p.program_entered_at,
  COUNT(pp.id) FILTER (WHERE pp.is_active AND pp.commitment_level IN ('committed', 'lead'))
    AS committed_contributor_count,
  -- venture threshold: 2+ committed contributors
  (COUNT(pp.id) FILTER (WHERE pp.is_active AND pp.commitment_level IN ('committed', 'lead')) >= 2)
    AS meets_venture_threshold,
  MAX(pe.advanced_at) AS last_phase_transition_at
FROM projects p
LEFT JOIN project_participants pp ON pp.project_id = p.id
LEFT JOIN project_phase_events pe ON pe.project_id = p.id
GROUP BY p.id;
```

### 4.6 RLS additions

```sql
-- Phase events: members read, stewards write
ALTER TABLE project_phase_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_read_phase_events" ON project_phase_events
  FOR SELECT USING (current_participant_id() IS NOT NULL);
CREATE POLICY "stewards_write_phase_events" ON project_phase_events
  FOR ALL USING (is_steward());

-- LCA commitments: members read, stewards write
ALTER TABLE project_lca_commitments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_read_lca_commitments" ON project_lca_commitments
  FOR SELECT USING (current_participant_id() IS NOT NULL);
CREATE POLICY "stewards_write_lca_commitments" ON project_lca_commitments
  FOR ALL USING (is_steward());
```

---

## 5. UI/UX Pattern

### 5.1 Phase as primary visual axis

The list view groups or filters by `maturity_phase`, not just status. A phase pill sits
prominently on each card — not as a small secondary badge, but as the first signal:

```
○ SEED · project          ← muted, gray-green
◎ POLLINATING · venture   ← active, gold
● KEYSTONE · program      ← prominent, teal/mint
```

The biological metaphors are present but optional labels — the underlying filter
terminology remains "project / venture / program" to match the memo and financial
reporting language.

### 5.2 Progressive card anatomy

**Project card** (seed phase):
- Name, description, status
- Contributors (showing commitment level)
- Milestones
- "Venture threshold: N/2 committed contributors" progress indicator (if < 2)
- Phase history (if transitions exist)

**Venture card** (cross-pollination phase) adds:
- Patronage activation status (enabled/not yet enabled)
- Total FMV labor contributed (summed from `labor_contributions`)
- Cap table eligibility notice
- LCA operational capacity received (if any commitments recorded)

**Program card** (keystone phase) adds:
- LCA commitments panel (space, labor, admin, financial — from `project_lca_commitments`)
- Capital flows linked (transactions referencing this project)
- `program_entered_at` date
- Financial reporting integration notice

### 5.3 Phase advancement flow (steward only)

Replacing the current type dropdown with a deliberate two-step action:

1. **Threshold check** — UI shows whether the body of work meets the graduation
   criteria (e.g., 2+ committed contributors for venture graduation). Not a hard gate
   for stewards, but an honest signal.

2. **Graduation modal** — fields:
   - From phase / To phase (read-only, showing the transition)
   - Rationale (required text field)
   - Contributor count at time of graduation (auto-populated, editable)
   - For venture→program: LCA commitment type(s) being extended

3. **Logged event** — writes to `project_phase_events`, updates `projects.maturity_phase`,
   sets `patronage_enabled = true` (venture), sets `program_entered_at` (program).

### 5.4 Routing

| Route | Content |
|-------|---------|
| `/intranet/projects` | All bodies of work, filterable by phase and status |
| `/intranet/projects/:id` | Detail view for a specific body of work (phase-appropriate layout) |
| `/intranet/portfolio` | Rename of current `/ventures` — Class 4 investor equity baskets |
| `/intranet/programs` | Optional: programs-only view, optimized for financial reporting context |

Rationale for `/intranet/portfolio`: the current `/ventures` route causes conceptual
collision between the work-maturity "venture" phase and the investment vehicle sense of
the word. Class 4 investor equity baskets are a financial instrument; renaming the
route clarifies that distinction.

### 5.5 Ecosystem home integration

The home (`/intranet/`) can surface a compact maturity summary:

```
Projects   3   (seed)
Ventures   2   (cross-pollination) — 1 with patronage active
Programs   5   (keystone)
```

Clicking any row navigates to `/intranet/projects` pre-filtered by that phase.

---

## 6. Migration Path

### Phase 1: Schema (no UI changes, no breaking changes)
1. Add nullable columns to `projects`: `maturity_phase`, `patronage_enabled`,
   `lca_infrastructure_note`, `program_entered_at`, `phase_rationale`
2. Backfill: set `maturity_phase = type` for existing rows (project → project,
   venture → venture)
3. Create `project_phase_events`, `project_lca_commitments` tables
4. Add `commitment_level`, `is_active` to `project_participants`; backfill defaults
5. Create `project_maturity_summary` view
6. Apply RLS policies

### Phase 2: UI update — list and detail views
1. Update `CooperativeGroup.jsx` ProjectsTab:
   - Add phase filter (Project / Venture / Program / All)
   - Replace type badge with phase pill (seed / pollinating / keystone)
   - Show committed_contributor_count and venture threshold bar on project cards
2. Update project detail view:
   - Phase-appropriate section rendering (venture additions, program additions)
   - Phase history timeline (from `project_phase_events`)

### Phase 3: Graduation workflow (steward)
1. Add "Advance phase" button to detail view (steward only)
2. Implement graduation modal with threshold check, rationale, and commit action
3. Write to `project_phase_events` and update `projects` row

### Phase 4: Program depth
1. LCA commitments panel in program detail view
2. Capital flow panel linking `transactions.project_id` to program
3. `/intranet/portfolio` rename for Class 4 investor page
4. Optional `/intranet/programs` dedicated view

---

## 7. Out of Scope

- Automatic graduation (graduation is always a deliberate steward action with rationale)
- Participant-initiated phase advancement (participants can flag readiness; stewards decide)
- Merging with the Workshop's `coordination_requests` sprint system (those are
  sprint-level, not body-of-work level; but a future bridge is worth considering)
- Public-facing program pages (that belongs in cooperation.games or techne.institute)

---

## 8. Open Questions for Steward Review

1. **Patronage activation** — should `patronage_enabled` be set automatically at venture
   graduation, or remain a separate steward action (e.g., when the cap table is created)?

2. **Contributor threshold** — is 2 committed contributors sufficient for venture
   graduation, or should this be configurable per cooperative decision?

3. **`/intranet/portfolio` rename** — the Class 4 investor page rename requires a
   navigation update and a redirect. Confirm before implementing.

4. **`/intranet/programs`** — worth building a dedicated programs view now, or defer
   until there are enough programs to warrant it?

5. **Labor patronage attribution** — once `patronage_enabled = true` for a venture,
   should all labor on that project be tagged as patronage-eligible, or only labor
   submitted after activation?
