# Document Vault + Investor Portal — Builder's Manual
P369 · R2-D · TIO 2.0 Anchor Module

---

## What this is

Two related extensions to the member portal:

1. **Document Vault** — /intranet/documents/ — K-1 tax documents and cooperative filings for all membership classes. Anchor module.
2. **Venture Basket** — /intranet/ventures/ — Class 4 investor portfolio view (positions, MOIC, distributions). Extension, restricted to membership_class = 4 and stewards.

---

## Component architecture

```
intranet-src/src/
  pages/
    Documents.jsx     — /intranet/documents/ — document list by type, download buttons
    Ventures.jsx      — /intranet/ventures/ — basket summary, position rows, disclosure
  App.jsx             — Routes: 'documents' → Documents, 'ventures' → Ventures
  pages/Home.jsx      — Documents card: available=true. Ventures card: available=true (Class 4 only)

supabase/
  functions/document-vault/   — Edge function: returns member's documents (all types)
  functions/venture-basket/   — Edge function: returns positions + basket summary (Class 4/steward only)

database tables:
  member_documents    — one row per document file
  venture_basket      — one row per Class 4 investor position
```

---

## Database schema

### member_documents

| Column | Type | Description |
|---|---|---|
| id | uuid PK | |
| participant_id | uuid FK → participants | owner |
| document_type | text | 'k1', 'bylaws', 'formation', 'other' |
| tax_year | integer | nullable, for K-1s |
| filename | text | original filename |
| storage_path | text | Supabase Storage object path |
| file_size_bytes | integer | nullable |
| uploaded_at | timestamptz | |
| uploaded_by | uuid FK → participants | steward who uploaded |
| notes | text | nullable |

RLS policies:
- member_select: participant can read own rows
- steward_select: stewards read all
- steward_insert: stewards insert
- service_all: service_role bypass

### venture_basket

| Column | Type | Description |
|---|---|---|
| id | uuid PK | |
| participant_id | uuid FK → participants | Class 4 investor |
| venture_name | text | |
| instrument | text | 'SAFE', 'equity', 'note', 'token', 'other' |
| vintage_year | integer | nullable |
| committed_cents | integer | total commitment in USD cents |
| deployed_cents | integer | amount deployed so far |
| current_value_cents | integer | steward-updated current fair value |
| distributions_cents | integer | total distributions received |
| status | text | 'active', 'exited', 'written_off', 'pending' |
| notes | text | nullable |
| last_updated | timestamptz | |

RLS policies:
- class4_select: membership_class = 4 reads own rows
- steward_select: stewards read all
- steward_insert/update: stewards manage positions
- service_all: service_role bypass

---

## Edge functions

### document-vault

Endpoint: `POST/GET /functions/v1/document-vault`

Auth: Bearer JWT (member's session token)

Logic:
1. Verify JWT, extract auth_user_id
2. Look up participant by auth_user_id
3. If steward: return all documents (no filter)
4. Else: return only participant's own documents
5. Returns signed download URLs (null until Storage bucket configured)

Response shape:
```json
{
  "ok": true,
  "documents": [
    {
      "id": "...",
      "document_type": "k1",
      "tax_year": 2025,
      "filename": "K1_2025_member.pdf",
      "file_size_bytes": 204800,
      "uploaded_at": "2026-03-01T...",
      "download_url": null
    }
  ]
}
```

download_url is null until Supabase Storage bucket `member-documents` is created and configured. See Storage Setup below.

### venture-basket

Endpoint: `POST/GET /functions/v1/venture-basket`

Auth: Bearer JWT

Logic:
1. Verify JWT, look up participant
2. If not Class 4 AND not steward: return 403 {"ok": false, "error": "Access restricted to Class 4 investors."}
3. If steward: return all positions with aggregated summary
4. If Class 4: return own positions with own summary

Response shape:
```json
{
  "ok": true,
  "positions": [...],
  "summary": {
    "total_committed_cents": 0,
    "total_deployed_cents": 0,
    "total_current_value_cents": 0,
    "total_distributions_cents": 0
  }
}
```

---

## Supabase Storage setup (required for downloads)

**This step was deferred to P370 / steward setup. Downloads show null until done.**

1. Create bucket `member-documents` in Supabase Storage (private bucket, no public access)
2. Set RLS on storage.objects so participants can only read their own files (by path prefix matching participant_id)
3. In document-vault edge function: uncomment the signed URL generation block:
   ```js
   const { data: { signedUrl } } = await serviceClient.storage
     .from('member-documents')
     .createSignedUrl(doc.storage_path, 3600)
   ```
4. Test with a real file upload via Supabase dashboard

Until this is done, download_url is null and DocRow shows "Contact steward" instead of a Download button.

---

## How to add a new document type

1. Add the new type string to the document_type check list in Documents.jsx (`docTypeLabel` object)
2. Decide if it should appear in the K-1 section or Other Documents section (filter in Documents.jsx)
3. Update the document-vault edge function if any type-specific logic is needed
4. Add the label to DocRow's `label` object

---

## Design notes

Documents.jsx:
- K-1 docs shown first, sorted descending by tax_year
- Other docs (bylaws, formation, other) in a separate section below
- PDF icon badge in copper-tinted box
- Download button: copper fill. If no URL: muted "Contact steward" placeholder.
- Empty state explains the upload workflow and expected timeline (Feb/Mar)
- Info box at bottom explains Schedule K-1 (Form 1065) in plain language

Ventures.jsx:
- Summary strip: 4 cards across (Committed / Deployed / Value / Distributions)
- Position rows: name + vintage + instrument left, amounts middle, status badge right
- MOIC shown when both committed and current_value are present
- Disclosure box at bottom (risk disclosure, non-transferability)
- Accessed only by Class 4 members — other classes see 403 from edge function

---

## Maintainer

WE + ESE own this module post-deploy.

**Monthly check:**
- Verify document list loads for a test Class 4 member and a regular member
- Confirm steward can see all documents (steward_select policy)
- Verify Ventures page renders correctly for Class 4 test account

**Quarterly check:**
- After K-1 upload cycle (Feb/Mar), verify new K-1s appear with correct tax_year
- Spot-check venture_basket figures match steward's records

**When Storage is configured:**
- Test signed URL generation: download a file end-to-end
- Verify signed URLs expire after 1 hour (default TTL)
- Verify non-members cannot access files by guessing storage_path

**Deferred maintenance:**
- Supabase Storage bucket setup + signed URL generation (P370/steward action)
- Admin upload UI for stewards (P370)
- Bulk K-1 upload workflow (Phase 3)
- Venture basket update history / changelog (Phase 3)
- PDF viewer inline (Phase 4)
