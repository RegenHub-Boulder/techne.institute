# Member FAQ — Logging In to the Techne Intranet

---

## How do I log in?

Go to **techne.institute/intranet/** and enter your cooperative email address. We'll send you a login link — click it and you're in. No password needed.

The login link goes to the email address we have on file for your membership.

---

## I didn't get the email. What do I do?

A few things to check:

1. **Spam or promotions folder.** Email clients sometimes sort automated messages there.
2. **Wrong email address.** The link goes to the email we have on file, which may differ from your usual address. If you're not sure which one that is, contact a steward.
3. **Wait a minute and try again.** The email usually arrives within 30 seconds, but can take up to a few minutes.

If none of those resolve it, email **steward@techne.studio** and we'll sort it out.

---

## The link expired. Can I get a new one?

Yes. Go back to the login page, enter your email, and request a new link. Each link is valid for **one hour** after it's sent.

---

## I clicked the link and it says "account not linked."

This means we recognize your email (you're in Supabase auth) but it's not connected to your cooperative member record. This sometimes happens when:

- You're using a different email address than the one on your membership application
- Your account was recently created and the link hasn't been set up yet

Email **steward@techne.studio** with your name and the email you're trying to use and we'll get it connected.

---

## Does my login expire?

Your session stays active for 7 days and refreshes automatically when you visit the portal. After 7 days without a visit, you'll need to request a new login link.

---

## Can I use Google to log in?

Not yet. Magic link is the only login method for the initial launch. If enough members request Google login, we'll add it.

---

## Is my data secure?

Yes. The intranet uses Supabase Row-Level Security — every member can only read their own records. Stewards can read all records. The database enforces this at the PostgreSQL layer, not just the application layer.

---

## Who do I contact if something looks wrong?

Email **steward@techne.studio** with a description of what you're seeing. For balance disputes, include your name, the quarter in question, and what you believe the correct figure should be.
