# Steward Guide — Capital Book
P367 · R2-B · User's Manual (Steward Audience)

---

## How to read the allocation_events table

Each row represents one quarterly allocation event for one member.

Key columns:
- **quarter** — format `2026-Q1`. Use this to find all events for a specific quarter.
- **components** — JSON breakdown `{labor, revenue, capital, community}`. These are the four patronage components that sum to `total_allocation`.
- **book_capital_balance** and **tax_capital_balance** — the running balance *after* this event. The most recent row for a member is their current balance.
- **notes** — free text. Always fill this in on manual corrections.

---

## How to verify a member's balance

**Quick check:**
```sql
SELECT p.name, ca.book_balance, ca.tax_balance, ca.last_updated
FROM capital_accounts ca
JOIN participants p ON p.id = ca.participant_id
WHERE p.name = 'Member Name';
```

**Full history:**
```sql
SELECT quarter, total_allocation, book_capital_balance, tax_capital_balance, notes
FROM allocation_events
WHERE participant_id = '<uuid>'
ORDER BY quarter DESC;
```

**Verify the latest balance equals running sum:**
```sql
SELECT participant_id, SUM(total_allocation) as sum_of_allocations,
  MAX(book_capital_balance) as current_balance
FROM allocation_events
GROUP BY participant_id;
-- These should match. If they don't, there's a data error.
```

---

## What to do if a member disputes their balance

1. Pull their full `allocation_events` history (query above)
2. Cross-reference against the S25 patronage engine output for the disputed quarter
3. If there's a discrepancy: insert a correction event with `event_type = 'correction'` and a clear `notes` entry explaining what changed and why
4. Update `capital_accounts` to reflect the corrected balance
5. Notify the member with the corrected figure and a plain-language explanation

---

## How to set a member's membership class

```sql
UPDATE participants
SET membership_class = 1  -- 1=Labor, 2=Patron, 3=Community, 4=Investor
WHERE id = '<participant_uuid>';
```

Membership class must be set correctly before the portal launch. Class 4 members will see the venture basket (P369). Other classes will not.

---

## Before P368 goes live — steward sign-off checklist

- [ ] All current members have a capital_accounts row
- [ ] Each member's book_balance matches the sum of their allocation_events
- [ ] Each member's membership_class is set correctly on participants
- [ ] At least one test member has auth_user_id set and can log in to verify the portal
- [ ] The S25 source data for the backfill is confirmed by the management accountant
