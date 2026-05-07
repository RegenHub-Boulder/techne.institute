# Admin Module — Builder's Manual
P370 · R2-E · TIO 2.0 Anchor Module

---

## What this is

The steward-only admin panel at /intranet/admin/ — the write path that P367 left open. Three tools in one UI:

1. **Member List** — overview of all participants, auth link status, capital account balances.
2. **Allocation Entry** — steward enters quarterly allocations per member using the 40/30/20/10 formula.
3. **Document Upload** — steward uploads K-1 PDFs to Supabase Storage, automatically linked to the member's document vault.

This panel is the operational backstage. Nothing in the member portal is useful until a steward has used these tools.

---

## Access control

Two layers:

1. **React layer**: `useAuth().isSteward` check. Non-stewards see an access denied screen immediately; they never reach the tabs.
2. **Edge function layer**: `admin-allocation-entry` verifies `participant_type = 'steward'` via service role lookup. Even if the React check is bypassed, the API refuses non-stewards.

`isSteward` is derived from `participant.participant_type === 'steward'` (set in `useAuth.jsx`).

---

## Component architecture

```
intranet-src/src/
  pages/Admin.jsx           — /intranet/admin/ — three tabs
    MemberList              — calls admin-allocation-entry { action: 'list_members' }
    AllocationEntry         — calls admin-allocation-entry { action: 'enter_allocation' }
    DocumentUpload          — uploads to Supabase Storage + inserts member_documents row

supabase/functions/
  admin-allocation-entry/   — Edge function: member list, allocation write, balance update

database:
  allocation_events         — receives new rows from AllocationEntry
  capital_accounts          — book_balance_cents + tax_balance_cents updated on each allocation
  member_documents          — receives new rows from DocumentUpload
  storage: member-documents — K-1 PDFs uploaded here
```

---

## admin-allocation-entry edge function

### Endpoint

`POST /functions/v1/admin-allocation-entry`

Auth: `Authorization: Bearer <session_access_token>`

### Actions

#### `list_members`

Returns all participants with their capital account balance (from capital_accounts table). Joins are done by participant_id.

Response:
```json
{
  "ok": true,
  "members": [
    {
      "id": "uuid",
      "name": "...",
      "email": "...",
      "participant_type": "member|steward|agent",
      "membership_class": 1,
      "auth_user_id": "uuid or null",
      "book_balance_cents": 0,
      "tax_balance_cents": 0,
      "last_allocation_date": "2025-12-31"
    }
  ]
}
```

`auth_user_id` being null means the member cannot log in yet. The steward must link their auth account before the portal is usable for that member.

#### `enter_allocation`

Creates an allocation_events row and updates capital_accounts balance.

Required fields: `participant_id`, `quarter` (1-4), `year`
Optional: `labor_cents`, `revenue_cents`, `capital_cents`, `community_cents`, `notes`

Formula enforcement is at the steward's discretion — the API accepts any distribution of cents across the four components. The formula note in the UI (40/30/20/10) is advisory. The live percentage breakdown shows the steward what they're entering.

Balance update logic:
- If capital_accounts row exists: add total_cents to both book_balance_cents and tax_balance_cents, update last_allocation_date.
- If no capital_accounts row: create one with the entered amounts.
- `entered_by` is set to the steward's participant id.

#### `delete_allocation`

Reverses a specific allocation_events row. Accepts `event_id`. Subtracts total_cents from the member's capital_accounts balances and deletes the event row.

Use this to correct a mis-entry. This is destructive — there is no soft-delete or audit trail beyond what MA keeps manually.

---

## Document Upload flow

1. Steward selects member, document type, tax year (for K-1), and PDF file.
2. Storage path constructed: `{participant_id}/{document_type}_{tax_year}_{filename}` (with safe filename sanitization).
3. File uploaded to `member-documents` Supabase Storage bucket (private, PDF only, max 10MB).
4. `member_documents` row inserted with: participant_id, document_type, tax_year, filename, storage_path, file_size_bytes, notes, uploaded_by (steward's participant id).

**Important**: `upsert: false` is passed to Storage upload. If the same file is uploaded twice, the second upload will fail with a "409 Duplicate" error. To replace a document, the steward must delete the old Storage object manually via the Supabase dashboard, then re-upload.

The signed URL for download is generated at read time by the document-vault edge function (1-hour TTL). It is never stored.

---

## Supabase Storage

Bucket name: `member-documents`
- Private (no public access)
- Allowed MIME types: `application/pdf`
- Max file size: 10 MB (10,485,760 bytes)

RLS on storage.objects:
- `member_read_own`: participant reads own files (path starts with their participant_id)
- `steward_insert`: stewards insert
- `steward_delete`: stewards delete (for corrections)

The document-vault edge function uses service_role to generate signed URLs, bypassing RLS for the URL generation step while still filtering by participant_id at the query level.

---

## Launch gate

The admin panel shows a persistent red Launch Gate banner at the top:

> MA sign-off on all member balances is required before the launch email is sent. Do not send the launch email until balances are confirmed accurate.

This is not enforced in code — it is a visible reminder. The launch email is a manual steward action documented in STEWARD-ADMIN-GUIDE.md.

---

## How to add a new allocation component

The 40/30/20/10 formula has four components (labor, revenue, capital, community). If the formula changes:

1. Add the new component column to the form in `AllocationEntry` (AllocationEntry in Admin.jsx)
2. Add the corresponding field to the `enter_allocation` API call body
3. Update the `admin-allocation-entry` edge function to pass the new field in the `components` JSONB
4. Update the formula display in the UI (`totalCents` calculation and the percentage breakdown)
5. Update both manuals

---

## Auth user linking

The Member List tab shows a red "NOT LINKED" indicator for any participant without an `auth_user_id`. These members cannot log in.

To link a member to their auth account:
1. Have the member click the magic link from their email (or send them one via Supabase Auth dashboard)
2. When they first log in, `loadParticipant(authUserId)` in useAuth.jsx queries `participants WHERE auth_user_id = $1`. If null, they see the NotLinked screen.
3. The steward must manually update `participants SET auth_user_id = '<auth.users.id>' WHERE email = '<member_email>'` via the Supabase SQL editor.

This is a manual step until an auth-linking UI is built (Phase 2).

---

## Maintainer

PE and WE (currently both: Nou) own this module post-deploy.

**After each quarterly allocation cycle:**
- Verify allocation_events table has rows for all members for the period
- Verify capital_accounts book_balance_cents and tax_balance_cents are correct
- Check entered_by is set on all new rows (should always be a steward participant_id)

**Monthly:**
- Verify admin panel loads without errors for a steward test account
- Spot-check one member's balance against MA's spreadsheet

**Annual (K-1 season, February–March):**
- Upload K-1s for all members via Document Upload tab
- Verify each K-1 appears in the member's Documents vault
- Test one download end-to-end (signed URL works)

---

## Preventative check schedule

- After each allocation: query `SELECT count(*) FROM allocation_events WHERE entered_by IS NULL` — should always be zero.
- Monthly: verify `webhook_failures` table is empty (P388 concern, not this sprint, but check during admin review).
- Annual: before K-1 upload season, confirm Supabase Storage bucket still exists and has not had quota issues.

---

## Deferred maintenance

- Auth-linking UI: currently manual SQL. Phase 2 admin feature.
- Allocation undo audit trail: `delete_allocation` is currently silent (no event log). Phase 3.
- Bulk allocation import (CSV from accountant): Phase 2 per sprint description.
- Admin audit log (who entered what, when): Phase 3.
- Email change approval queue: out of scope for this sprint; placeholder noted in sprint description but not built.
