# devanshugulati.in — digital agency platform

Website, enquiry system and admin CMS for **Devansh Gulati — Everything Digital. One Trusted Partner.**

- **Public website**: home, services (+5 service pages), work & case studies, about, contact, FAQ, enquiry tracking, legal pages
- **Enquiry system**: multi-step form with per-service questions and attachments, encrypted storage, reference numbers, admin + customer emails, WhatsApp follow-up, public status tracking
- **Admin panel** (`/admin`): password sign-in, dashboard, enquiry management, and editors for services, projects, testimonials, FAQs, website text, contact details and social links — with version history

## Why this stack

The site runs on **Vercel Functions + static files with zero npm dependencies**:

- Pages are rendered on the server and cached at Vercel's edge (`s-maxage=60, stale-while-revalidate`), so they load instantly and admin edits appear within about a minute.
- Animated page changes use the browser-native **View Transitions API**; scroll reveals use `IntersectionObserver`; everything respects `prefers-reduced-motion`.
- No framework runtime is shipped to the browser (≈26 KB of JS for the whole public site).
- No dependencies means nothing to install, nothing to update, and nothing that breaks on a version bump.

Data lives in **Vercel Blob** (encrypted with AES-256-GCM for anything private). Each change writes a new immutable version, which doubles as a backup history.

## Project structure

```
api/                 Vercel Functions (Web-standard Request → Response)
  render.js          renders every HTML page (public + admin shell)
  enquiries.js       POST enquiry submissions
  track.js           POST public status lookup
  admin.js           /api/admin/* protected admin API
  health.js          GET integration status
lib/                 server code
  pages/             page templates (home, services, misc, legal, form, admin)
  router.js          URL → page
  content.js         editable website content + version history
  enquiries.js       enquiry records (encrypted, versioned)
  auth.js            sessions, password hashing, reset tokens
  email.js, smtp.js  Resend / SMTP / FormSubmit email
  storage.js         Vercel Blob (prod) or local files (dev)
  validate.js        all input validation and content sanitising
  defaults.js        default content (edit it from the admin panel instead)
public/              static assets (CSS, JS, images, favicon, robots.txt)
scripts/             dev server and build check
tests/unit           node:test unit + integration tests
tests/e2e            Playwright end-to-end tests
vercel.json          routing, security headers, caching
```

## Local development

Requires Node.js 20+.

```bash
cp .env.example .env.local     # fill ADMIN_PASSWORD and the three secrets
npm run dev                    # http://localhost:3000
npm test                       # unit + integration tests
npm run check                  # renders every page (also the Vercel build step)
npm run test:e2e               # browser end-to-end (needs: npm i -g playwright && npx playwright install chromium)
BASE_URL=https://devanshugulati.in ADMIN_EMAIL=… ADMIN_PASSWORD=… node tests/e2e/live-api.mjs   # live checks
```

Locally, data is stored in `.data/` (git-ignored). Uploaded images are served from `/uploads/`.

## Deploying to Vercel

1. **Import the GitHub repository** in Vercel (or push to the repo already connected to the project). Framework preset: **Other**. No build settings needed — `vercel.json` sets them.
2. **Storage**: Vercel → Project → Storage → Create → **Blob** → connect to the project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
3. **Environment variables** (Settings → Environment Variables, Production + Preview):
   `SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `DATA_ENCRYPTION_KEY`, `FORM_SECRET`, plus one email option (see below).
4. **Domain**: Settings → Domains → add `devanshugulati.in` and `www.devanshugulati.in` (redirect www → apex). If the domain is on another project, remove it there first.
5. Redeploy, then open `https://devanshugulati.in/api/health` — it should report `"storage":"blob"` and your email provider.

> Keep `DATA_ENCRYPTION_KEY` safe. If it changes, existing enquiries can no longer be decrypted.

### Email options

| Option | Setup | Sends |
| --- | --- | --- |
| **Resend** (recommended) | Create an account, verify `devanshugulati.in`, set `RESEND_API_KEY` and `EMAIL_FROM` | Branded admin + customer emails |
| **Gmail SMTP** | Google Account → Security → 2-Step Verification → App passwords. Set `SMTP_USER` (your Gmail) and `SMTP_PASS` (the 16-character app password) | Admin + customer emails from your Gmail |
| **FormSubmit** (default fallback) | Nothing — the first enquiry triggers an activation email to the notification address; click **Activate** once. Sent from the visitor's browser after the enquiry is saved (FormSubmit blocks server requests) | Admin notification + customer auto-response |

Use **Admin → Settings → Send a test email** to confirm.

## Admin

- Sign in at `/admin/login` with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Change the password in **Settings** — it is stored as a scrypt hash and replaces the environment password; all other sessions are signed out.
- **Forgot password** emails a 30-minute reset link to the admin email (needs Resend or Gmail SMTP).
- **Locked out?** Change `ADMIN_PASSWORD` in Vercel → Settings → Environment Variables and redeploy. A new value there always replaces a password saved in the admin panel.
- Every content save keeps a backup; **Settings → Backups & version history** restores any of the last 25 versions.

## Security

- HttpOnly, Secure, `SameSite=Strict` session cookies signed with HMAC-SHA256; 8-hour sessions
- Origin checks on every state-changing request; strict Content-Security-Policy and HSTS
- Enquiries and attachments encrypted at rest; attachments are downloadable only through the admin API
- Server-side validation of every field, attachment type checks by magic bytes, honeypot, signed form token with minimum fill time, rate limits for enquiries, tracking and login
- CSV export neutralises spreadsheet formulas
- No secrets in client code; `/api/health` reports only whether integrations are configured

## Backups & recovery

- Content: automatic version history (last 25 saves) — restore from the admin panel.
- Enquiries: export to CSV from **Enquiries** at any time. The Blob store can also be copied with the Vercel CLI (`vercel blob list` / `vercel blob copy`).

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Admin banner says storage is not connected | Connect a Blob store to the project and redeploy |
| "Admin password is not configured" on sign-in | Set `ADMIN_PASSWORD` and redeploy |
| No enquiry emails | Check `/api/health`, then the email option table; with FormSubmit, look for the activation email (and spam) |
| Content edits don't show | Wait up to a minute (edge cache), then refresh |
| Form says "expired or sent too quickly" | Refresh the page; the form must be open for at least 3 seconds |
