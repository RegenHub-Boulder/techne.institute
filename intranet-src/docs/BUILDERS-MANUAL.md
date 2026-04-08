# Auth Foundation — Builder's Manual
P366 · R2-A · TIO 2.0 Anchor Module

---

## What this is

The authentication foundation for the Techne member intranet. It establishes how members get in, what they can see, and how that access is enforced at the database level.

---

## Why magic link, not password

Magic links eliminate the password surface: no credential storage, no reset flows, no brute-force exposure. For a member portal with ~10 active users (current co-op scale), the tradeoff is clearly in favor of simplicity and security over the minor friction of checking email.

If the co-op grows to hundreds of members and the email dependency becomes a usability problem, switching to passkeys or SSO is the natural next step — both are supported by Supabase without a schema change.

Google OAuth is in the sprint spec but not enabled in this deployment. It requires a Google Cloud project, OAuth credentials, and mapping logic that adds infrastructure for marginal benefit at current scale. It's logged as a deferred maintenance item for when a member actually requests it.

---

## How identity linking works

Supabase auth is separate from the co-op.us application database. The link between them is `participants.auth_user_id` (uuid):

```
auth.users.id  →  participants.auth_user_id  →  participant record
```

When a member receives a magic link and clicks it:
1. Supabase validates the OTP token
2. Creates or updates an `auth.users` session
3. The frontend reads the session user's `id` (UUID)
4. Calls `useAuth.loadParticipant(authUserId)` which queries `participants WHERE auth_user_id = $1`
5. If found: participant state is set, user sees the home page
6. If not found: user sees the "not linked" error page with a steward contact prompt

**The auth_user_id link must be set by a steward** before a member can access the portal. The flow is:
1. Steward creates or confirms the participant record
2. Member requests access by emailing their Supabase-registered email
3. Steward links the auth user to the participant record via admin panel

For new co-op formations, this linking happens during member onboarding.

---

## How RLS works (and will work)

Row-Level Security is enforced at the PostgreSQL layer — the frontend cannot bypass it. The anon key (used by the React SPA) is subject to all RLS policies.

**Participants table** (existing RLS):
- `participants_read_public`: public can SELECT all participants (for profiles)
- `participants_read_own`: authenticated users can SELECT their own row

**Intranet-specific tables** (added in P367, P368, P369):
- `capital_accounts`: `auth.uid() = participant_id` (members see own)
- `allocation_events`: `auth.uid() = participant_id` (members see own)
- `documents`: members see own; stewards see all (`participant_type = 'steward'`)
- `venture_basket`: Class 4 only (requires `membership_class` column on participants, added in P367)

RLS policies for these tables are created in the migrations that create the tables themselves. The auth foundation (this sprint) provides the auth mechanism; subsequent sprints define the access rules for their own tables.

---

## How JWT claims work

A custom hook function (`public.custom_access_token_hook`) is registered with Supabase Auth. It fires on every token issue and adds:

```json
{
  "participant_id": "<uuid>",
  "participant_type": "member | steward | guest"
}
```

These claims are available in RLS policies via `(current_setting('request.jwt.claims', true)::jsonb ->> 'participant_type')`.

JWT expiry is set to 7 days with refresh token rotation enabled. The original 1-hour default was too aggressive for a member portal — members won't log in daily.

---

## How to add a new protected table

1. Create the table with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
2. Add a SELECT policy: `USING (auth.uid() = <link_column>)` for member-scoped data
3. Add an INSERT/UPDATE policy for the write paths you need
4. Test with anon key (should be denied) and authenticated member key (should return own rows only)
5. Update this builder's manual with the new table and its access logic

---

## Intranet SPA architecture

```
intranet-src/
  src/
    lib/supabase.js     — Supabase client (anon key, PKCE flow)
    hooks/useAuth.jsx   — AuthProvider + useAuth hook
    pages/
      Login.jsx         — Magic link form
      Home.jsx          — Authenticated home page (P368 adds account pages)
      NotLinked.jsx     — Error state: auth user has no participant record
    App.jsx             — Router: loading → login → notLinked → home
    main.jsx            — React root mount
```

The SPA is built from `intranet-src/` with Vite, base `/intranet/`, output to `../intranet/`. Deployed via GitHub Pages on the techne.institute repo.

**SPA routing on GitHub Pages**: All paths under /intranet/ resolve to the same index.html in the deployed SPA. Direct navigation to /intranet/account/ will 404 until a 404.html redirect shim is added. This is acceptable for P366 (no sub-paths exist yet). When P368 adds sub-pages, a GitHub Pages SPA routing shim should be added.

---

## Maintainer

IE (Infrastructure Engineer) owns this module post-deploy.

**Monthly check:**
- Verify token refresh is functioning (attempt login as a test member)
- Confirm the custom JWT hook is enabled in Supabase auth settings
- Confirm RLS policies have not been altered by any schema migration

**Deferred maintenance (logged, scheduled separately):**
- Google OAuth integration — not blocking launch, log as Phase 2 sprint if requested
- Email change approval workflow — covered in P370 admin sprint
- SPA routing shim for direct sub-path navigation — add with P368
