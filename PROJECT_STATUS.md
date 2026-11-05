# Project status — devanshgulati.in

_Last updated: 6 November 2026_

## Done
- [x] Architecture: zero-dependency Vercel Functions + static assets, View Transitions page animations
- [x] Design system (dark-first + light theme), responsive 320 → 1920 px, reduced-motion support
- [x] Public pages: home, services index + 5 service pages, work + case studies, about, contact, FAQ, track enquiry, privacy, terms, refund, 404
- [x] Homepage: hero orbit, ticker, value props, services, interactive service finder, process timeline, featured work, why us, testimonials (approved only), FAQ, final CTA
- [x] Client work: NNIS Sports, Vrindavan Shringar Mahal, ChatSpark
- [x] Enquiry system: 3-step form, per-service questions, attachments (4 MB, type + magic-byte checks), draft autosave, honeypot, signed form token, rate limits, duplicate detection
- [x] Encrypted enquiry storage (AES-256-GCM) with versioning; reference numbers `DG-YYMMDD-XXXXX`
- [x] Emails: admin notification + customer acknowledgement (Resend, SMTP or FormSubmit fallback)
- [x] Public enquiry tracking (reference + email)
- [x] Admin: password login, sessions, forgot/reset password, change password
- [x] Admin: dashboard stats + 30-day chart, enquiries (search, filters, status, notes, assign, archive, delete, CSV), services, projects, testimonials, FAQs, website content, settings, image uploads, version history & restore
- [x] SEO: titles, descriptions, canonical, Open Graph, sitemap.xml, robots.txt, JSON-LD (ProfessionalService, WebSite, Service, BreadcrumbList, FAQPage, CreativeWork)
- [x] Security headers (CSP, HSTS, frame-ancestors, etc.), same-origin checks, HttpOnly SameSite=Strict cookies
- [x] GA4 with consent banner (loads only after consent, when an ID is set)
- [x] Tests: 18 unit/integration tests (`npm test`), 18 end-to-end tests (`npm run test:e2e`), build check (`npm run check`)

## Needs the owner
- [ ] Approve Vercel team access and install the Claude GitHub app (for automated deploys)
- [ ] Connect a Vercel Blob store to the project (saves enquiries + content)
- [ ] Choose an email provider (Resend or Gmail app password) — or click FormSubmit's activation email
- [ ] Replace project images with high-resolution versions and add real case-study details
- [ ] Add real testimonials when clients provide them
- [ ] Add Instagram / YouTube / Facebook / X links in Admin → Settings
- [ ] Optional: GA4 measurement ID, Google Search Console verification

## Ideas for later
- Client portal (only once there are clients who need it)
- Online payments for fixed-price packages
- Blog / insights section for SEO
