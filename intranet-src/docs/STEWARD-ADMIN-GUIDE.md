# Steward Admin Guide — Allocation Entry, Document Upload, Launch Checklist

---

## Getting to the admin panel

Go to https://techne.institute/intranet/ and sign in with your steward email. The Home page will show an "Admin" card (marked "Steward") that links to /intranet/admin/.

If you don't see the Admin card, your account is not flagged as a steward. Contact another steward or update your participant_type via the Supabase dashboard.

---

## Tab 1: Member List

Shows all cooperative participants with:
- Name and email
- Membership class (Labor / Patron / Community / Investor)
- Auth link status (green "linked" or red "NOT LINKED")
- Book balance (their current capital account total)

**What "NOT LINKED" means**: This member has a participant record but hasn't been connected to a login account yet. They cannot log in to the portal until you link them. See "Linking a member to their login" below.

**Use this tab to**: audit who has balances, spot-check that allocation entries are landing correctly, identify members who need auth linking before launch.

---

## Tab 2: Allocation Entry

Use this tab to record a quarterly allocation for a specific member.

### Step by step

1. Select the member from the dropdown.
2. Set the year and quarter (e.g., 2025 Q4).
3. Enter amounts for each component **in cents** (dollars × 100). Examples:
   - $1,000.00 = 100000
   - $250.50 = 25050
   - $0 = 0 (leave blank)
4. Check the live percentage breakdown below the fields. It should approximate 40/30/20/10 for labor/revenue/capital/community unless MA has authorized a different distribution.
5. Add a note: e.g., "S25 Q4 patronage — per MA sign-off 2026-01-15".
6. Click "Record allocation".

On success, you'll see the allocation period and total. The member's capital account balance updates immediately.

### What to check before submitting

- Confirm the total matches MA's spreadsheet for that member and period.
- Confirm the quarter/year are correct. There is no undo through the UI (see below).
- Confirm the note includes a reference to MA sign-off. This is your audit trail.

### If you entered a wrong amount

There is no "edit" button. To correct an entry:
1. Note the Event ID from the success message.
2. Use the Supabase dashboard SQL editor to call the delete_allocation API endpoint, or contact the backend engineer.
3. Re-enter the correct amounts.

The `delete_allocation` action in the edge function reverses the balance and removes the event row. It does not leave an audit record — note the correction in your own records.

### MA sign-off is required before any allocation entry

Do not enter allocations until the Management Accountant has confirmed the figures in writing. The portal has no enforcement of this — it is a steward discipline requirement.

---

## Tab 3: K-1 Upload

Use this tab to upload a K-1 PDF to a specific member's document vault.

### Step by step

1. Select the member from the dropdown.
2. Set document type: K-1 for tax documents, or Bylaws/Formation/Other for cooperative documents.
3. For K-1s: set the tax year (the year the income was earned, e.g., 2025 for a 2025 K-1 issued in early 2026).
4. Click "Choose file" and select the PDF. Max 10 MB.
5. Add a note: e.g., "2025 K-1, reviewed by TA 2026-02-20".
6. Click "Upload document".

On success, the file is live in the member's Documents vault. They can download it immediately.

### If you uploaded to the wrong member

There is no "delete" or "move" button in the admin UI. To correct:
1. Go to the Supabase dashboard → Storage → member-documents bucket.
2. Navigate to the member's folder (named with their participant UUID).
3. Delete the incorrectly uploaded file.
4. Delete the corresponding row from the `member_documents` table (match by storage_path or filename).
5. Re-upload to the correct member using this tab.

### File naming

The portal stores files at: `{participant_id}/{document_type}_{tax_year}_{original_filename}`

Non-alphanumeric characters in the original filename are replaced with underscores. Keep original filenames simple.

---

## Linking a member to their login

Before a member can use the portal, their participant record must be linked to their Supabase auth account.

When the member first clicks a magic link and signs in:
- If their `auth_user_id` is already set, they land on the Home page.
- If `auth_user_id` is null, they see the "Not Linked" page with a steward contact prompt.

**To link a member:**

1. Have the member sign in via magic link at least once (this creates their auth.users record).
2. In the Supabase dashboard → Authentication → Users, find their email. Copy their User UID.
3. In the Supabase dashboard → SQL editor, run:
   ```sql
   UPDATE participants
   SET auth_user_id = '<paste_uid_here>'
   WHERE email = '<member_email>';
   ```
4. The member can now log in and see their data.

---

## Launch checklist

Before sending the launch email to all members:

- [ ] MA has signed off on all member balances in writing
- [ ] Every member who will receive the launch email has their `auth_user_id` linked (check Member List tab — no "NOT LINKED" for active members)
- [ ] At least one test member has logged in end-to-end (magic link → portal → capital account → documents)
- [ ] K-1s are uploaded for the most recent tax year (or a notice is prepared if K-1s are not yet ready)
- [ ] The FAQ page is live at /intranet/faq/ (or the link in the launch email is updated to an alternative)
- [ ] SL has reviewed the launch email copy (especially any language about Class 4 investor interests)

**Do not send the launch email until all items above are checked.**

---

## The launch email

Send from the cooperative's official email. Subject and body template:

---

**Subject**: Your Techne cooperative account is now online

**Body**:

Hi [first name],

Your capital account on the Techne cooperative portal is now live.

You can sign in at: https://techne.institute/intranet/

Sign-in uses a magic link — enter your email, click the link we send, and you're in. No password needed.

Once you're in, you'll find:
- Your capital account balance (book and tax basis)
- Quarterly patronage history with CSV export
- Your K-1 documents (when available)

If you have questions, reply to this email or see the FAQ at https://techne.institute/intranet/faq/

— The Techne steward team

---

For Class 4 investors, add this paragraph before the sign-off:

*As a Class 4 investor, you also have access to the Venture Basket — your portfolio composition, position status, and returns — at /intranet/ventures/.*

---

## If a member reports a wrong balance

1. Have them take a screenshot of the Account page showing the balance.
2. Cross-reference against the allocation_events table for their participant_id.
3. If an entry was made in error: use delete_allocation to reverse it, then re-enter correctly.
4. If the error is in the source figures (MA's spreadsheet): correct with MA first, then adjust the database entry.
5. Notify the member once corrected.

---

## If a member can't log in

Common causes:
- Their auth_user_id is not linked (check Member List tab)
- Their email changed (check participants.email vs auth.users.email)
- The magic link expired (links expire after 1 hour; they need to request a new one at /intranet/)
- They're checking the wrong inbox (confirm they're using the email on file)

For persistent issues: check Supabase Auth logs (dashboard → Authentication → Logs).
