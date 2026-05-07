# Member Portal UI — Builder's Manual
P368 · R2-C · TIO 2.0 Anchor Module

---

## What this is

The React pages that members see when they log in: home, capital account dashboard, and patronage history. Anchor is the home page and account dashboard. Patronage history is the extension.

---

## Component architecture

```
intranet-src/src/
  App.jsx             — Router: resolves path, dispatches to page components
  pages/
    Home.jsx          — /intranet/ — greeting, nav cards, membership class
    Account.jsx       — /intranet/account/ — balance cards, mini-chart, formula
    Patronage.jsx     — /intranet/patronage/ — table, year filter, CSV export
    Login.jsx         — /intranet/login/ (also /intranet/ when not auth'd)
    NotLinked.jsx     — shown when auth user has no participant record
  hooks/useAuth.jsx   — AuthProvider, session, participant, signOut
  lib/supabase.js     — Supabase client (anon key)
```

The router in `App.jsx` handles routing client-side by reading `window.location.pathname`. It also handles the GitHub Pages SPA routing shim (reads `?p=` param injected by 404.html on direct navigation to a sub-path).

---

## How to add a new intranet page

1. Create `src/pages/NewPage.jsx` — include `IntranetHeader` at top, breadcrumb nav
2. Import and add the route to `App.jsx`: `if (path === 'new-route') return <NewPage />`
3. Add a NavCard to `Home.jsx` with `available={true}` and `href="/intranet/new-route/"`
4. Update this manual with the new page's purpose

---

## Design system

All pages use:
- `var(--color-void, #0a0a0f)` — page background
- `var(--color-surface, #141418)` — card/header background
- `var(--color-border, #2a2a35)` — borders
- `var(--color-copper, #c87533)` — primary accent
- `var(--color-text, #e8e8e8)` — body text
- `var(--color-text-muted, #888)` — secondary text

These variables are defined in `/assets/tokens.css` (P363). If tokens.css changes, verify the intranet pages still render correctly.

---

## Data display when backfill is empty

Both Account.jsx and Patronage.jsx show explicit empty states when there are no allocation records. Account shows $0.00 balances with a note; Patronage shows a plain-language notice about pending data backfill.

Do not remove or hide these empty states. Members should understand why they see $0 rather than think the system is broken.

---

## SPA routing on GitHub Pages

The `/intranet/` directory is served as a static site on GitHub Pages. Direct navigation to `/intranet/account/` hits the 404.html in that directory, which encodes the path as `?p=/account/` and redirects to `/intranet/`. The App.jsx router reads this param and pushes the correct route via `history.replaceState`.

This means all intranet pages can be bookmarked and navigated directly without losing state.

---

## CSV export (Patronage.jsx)

The CSV export constructs a blob in the browser — no server call needed. Columns: Quarter, Labor, Revenue, Capital, Community, Total, Book Balance, Tax Balance, Notes. The filename includes the member's name (slugified).

---

## Maintainer

WE + ESE own this module post-deploy.

**Monthly check:**
- Verify account dashboard loads for a test member
- Confirm balance figures match what's in capital_accounts (spot check)
- Check mobile layout at 375px

**Quarterly check:**
- After each allocation cycle, verify new events appear correctly in Patronage view
- QATE accessibility re-check after any design system updates

**Deferred maintenance (logged):**
- Balance trend chart (Phase 3)
- PDF export (Phase 3)
- Self-service profile editing (Phase 4)
