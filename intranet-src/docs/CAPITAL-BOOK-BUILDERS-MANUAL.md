# Capital Book Backend — Builder's Manual
P367 · R2-B · TIO 2.0 Anchor Module

---

## What this is

The data foundation for the Techne member portal. Three tables hold all patronage accounting data:
- **capital_accounts** — current book and tax balances per member
- **allocation_events** — the quarterly events that built those balances
- **distribution_history** — cash and retained earnings distributions made

Three read-only edge functions give the frontend access to this data.

---

## Why book balance and tax balance are separate columns

Under IRC 704(b) / Subchapter K, a cooperative must track two parallel balance systems:

**Book balance (GAAP):** The economic fair value of each member's account. This is what matters for understanding economic ownership and what a member would receive on liquidation or redemption.

**Tax capital balance:** The Subchapter K / IRC 704(b) tax capital account. This is what matters for tax reporting (K-1 line items) and determining qualified vs. non-qualified distributions.

The two track differently when there are unrealized gains, depreciation, or when allocations are partly qualified (IRC 1382) vs. non-qualified. Keeping them separate from the start is correct — merging them would require a migration and accountant correction later.

---

## How allocation events build balances

Each quarterly allocation cycle produces one `allocation_events` row per active member. The components are:

| Component | 40/30/20/10 formula | Proration rule |
|-----------|---------------------|----------------|
| labor | 40% | Days active / Days in quarter |
| revenue | 30% | Full quarter (no proration) |
| capital | 20% | Days deployed / Days in quarter |
| community | 10% | Full quarter (no proration) |

`total_allocation` = sum of components.
`book_capital_balance` and `tax_capital_balance` = running balances after this event.
`capital_accounts.book_balance` = the current (latest) book_capital_balance for each member.

The `qualified_vs_nonqualified` field tracks which portion of the allocation is a qualified written notice of allocation (meets IRC 1382 requirements) vs. non-qualified. This affects how the K-1 is prepared.

---

## How to run the backfill

**Prerequisites before backfill:**
1. The S25 patronage engine output (JSON or CSV) — approved by the management accountant
2. Participant IDs for all members to be backfilled — query `participants WHERE participant_type = 'member'`
3. Steward approval that the source data is correct

**Backfill procedure:**

1. Export S25 output for the relevant quarters
2. For each member + quarter:
   ```sql
   INSERT INTO allocation_events (
     participant_id, event_type, quarter,
     components, total_allocation,
     book_capital_balance, tax_capital_balance,
     qualified_vs_nonqualified, notes
   ) VALUES (
     '<participant_uuid>', 'allocation', '2026-Q1',
     '{"labor": 1000, "revenue": 750, "capital": 500, "community": 250}',
     2500,
     2500, -- running total (add previous balance if not first quarter)
     2500,
     '{"qualified": 2500, "nonqualified": 0}',
     'Q1 2026 allocation — patronage engine S25 run 2026-04-07'
   );
   ```
3. After all events are inserted, update capital_accounts:
   ```sql
   INSERT INTO capital_accounts (participant_id, book_balance, tax_balance)
   SELECT
     participant_id,
     book_capital_balance,
     tax_capital_balance
   FROM allocation_events
   WHERE id IN (
     SELECT DISTINCT ON (participant_id) id
     FROM allocation_events
     ORDER BY participant_id, created_at DESC
   )
   ON CONFLICT (participant_id) DO UPDATE
     SET book_balance = EXCLUDED.book_balance,
         tax_balance = EXCLUDED.tax_balance,
         last_updated = now();
   ```
4. Cross-check: for a random sample of 5 members, verify that `book_balance` matches the sum of their `total_allocation` events
5. **Steward sign-off required before P368 (member portal UI) goes live**

---

## How the read APIs work

Three edge functions deployed on `hvbdpgkdcdskhpbdeeim`:

| Function | Path | Auth required | Description |
|----------|------|--------------|-------------|
| `capital-account` | /functions/v1/capital-account | JWT | Current balances + participant info |
| `allocation-history` | /functions/v1/allocation-history | JWT | Paginated quarterly events |
| `distribution-history` | /functions/v1/distribution-history | JWT | Paginated distributions |

All functions verify the user JWT, look up the participant record by `auth_user_id`, then query the capital tables with an explicit `participant_id` filter using the service role. This is equivalent to RLS but more explicit.

Query params for `allocation-history`:
- `?year=2026` — filter to a specific year
- `?limit=20&offset=0` — pagination

---

## How to add a new allocation component

1. Add the new component name to the `components` JSONB schema (no migration needed — JSONB is flexible)
2. Update the backfill procedure to include the new component
3. Update the 40/30/20/10 formula reference in this manual if the weights change
4. Update the member-facing explanation in MEMBER-FAQ-PATRONAGE.md

---

## Maintainer

BE + ESEng jointly own this module post-deploy.

**Monthly check:**
- Cross-check `capital_accounts.book_balance` against sum of `allocation_events.total_allocation` for a random sample of 5 members
- Verify all three edge functions return 200 for a test member

**Quarterly check (before each allocation cycle):**
- Full reconciliation against accountant-approved books
- Confirm `qualified_vs_nonqualified` totals are correct before K-1 preparation

**Deferred maintenance (logged, scheduled separately):**
- Write APIs for allocation entry — covered in P370 admin sprint
- Automated K-1 generation from allocation_events — Phase 3
- Federation: capital accounts portable across hubs — Phase 4
