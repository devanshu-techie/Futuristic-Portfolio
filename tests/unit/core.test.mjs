// Unit + integration tests (node:test, no dependencies). Run: npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const dir = mkdtempSync(path.join(tmpdir(), 'dg-test-'));
process.env.DATA_DIR = dir;
delete process.env.BLOB_READ_WRITE_TOKEN;
delete process.env.VERCEL;
process.env.SESSION_SECRET = 'test-session-secret-1234567890';
process.env.DATA_ENCRYPTION_KEY = 'test-data-key-1234567890abcdef';
process.env.FORM_SECRET = 'test-form-secret-1234567890';
process.env.ADMIN_EMAIL = 'owner@example.com';
process.env.ADMIN_PASSWORD = 'Correct-Horse-42';
process.env.EMAIL_FALLBACK = 'off';

const v = await import('../../lib/validate.js');
const c = await import('../../lib/crypto.js');
const enq = await import('../../lib/enquiries.js');
const content = await import('../../lib/content.js');
const auth = await import('../../lib/auth.js');
const rl = await import('../../lib/ratelimit.js');
const email = await import('../../lib/email.js');
const { DEFAULT_CONTENT } = await import('../../lib/defaults.js');
const { sitemapXml } = await import('../../lib/router.js');
const { escapeHtml } = await import('../../lib/html.js');

after(() => rmSync(dir, { recursive: true, force: true }));
before(() => rl.resetRateLimits());

const good = {
  fullName: 'Asha Verma', email: 'Asha@Example.com', phone: '+91 98765 43210', company: 'Asha Bakes',
  serviceCategory: 'Website Development', subject: 'Bakery website', budget: '₹10,000 – ₹25,000',
  timeline: 'Within a month', message: 'A five page site with menu, gallery and online ordering please.',
};

test('validateEnquiry accepts a good enquiry and normalises fields', () => {
  const { ok, data, errors } = v.validateEnquiry(good);
  assert.equal(ok, true, JSON.stringify(errors));
  assert.equal(data.email, 'asha@example.com');
  assert.equal(data.phone, '+919876543210');
});

test('validateEnquiry reports every invalid field', () => {
  const { ok, errors } = v.validateEnquiry({ fullName: 'A', email: 'nope', phone: '12', serviceCategory: 'Hacking', subject: '', message: 'short', budget: 'a lot' });
  assert.equal(ok, false);
  for (const k of ['fullName', 'email', 'phone', 'serviceCategory', 'subject', 'message', 'budget']) assert.ok(errors[k], `missing error for ${k}`);
});

test('clean strips control characters and enforces length', () => {
  assert.equal(v.clean('a\u0000b\u0007c', 10), 'abc');
  assert.equal(v.clean('x'.repeat(50), 10).length, 10);
  assert.equal(v.clean(undefined), '');
});

test('email and phone validators', () => {
  assert.ok(v.isEmail('name@domain.in'));
  assert.ok(!v.isEmail('name@domain'));
  assert.ok(!v.isEmail('a b@c.com'));
  assert.ok(v.isPhone('7056697860'));
  assert.ok(!v.isPhone('12345'));
});

test('checkAttachment enforces type, size and magic bytes', () => {
  const pdf = Buffer.from('%PDF-1.7 rest');
  assert.equal(v.checkAttachment(pdf, 'application/pdf', pdf.length).ok, true);
  assert.equal(v.checkAttachment(pdf, 'image/png', pdf.length).ok, false, 'spoofed type must fail');
  assert.equal(v.checkAttachment(pdf, 'application/x-msdownload', pdf.length).ok, false);
  assert.equal(v.checkAttachment(pdf, 'application/pdf', 5 * 1024 * 1024).ok, false);
});

test('encryption round-trips and detects tampering', () => {
  const box = c.encryptJson({ secret: 'value' });
  assert.deepEqual(c.decryptJson(box), { secret: 'value' });
  box[box.length - 1] ^= 1;
  assert.throws(() => c.decryptJson(box));
});

test('password hashing verifies only the right password', () => {
  const h = c.hashPassword('s3cret-password');
  assert.ok(c.verifyPassword('s3cret-password', h));
  assert.ok(!c.verifyPassword('wrong', h));
  assert.ok(!c.verifyPassword('x', 'garbage'));
});

test('references have the expected format and are unique', () => {
  const refs = new Set(Array.from({ length: 500 }, () => enq.makeReference()));
  assert.equal(refs.size, 500);
  for (const r of refs) assert.ok(enq.isReference(r), r);
  assert.ok(!enq.isReference('DG-123-ABC'));
});

test('enquiry lifecycle: create, list, update, attachment, delete', async () => {
  const { data } = v.validateEnquiry(good);
  const att = { bytes: Buffer.from('%PDF-1.4 brief'), type: 'application/pdf', size: 14, name: 'brief.pdf' };
  const rec = await enq.createEnquiry(data, att, { page: '/contact' });
  assert.equal(rec.status, 'New');
  assert.ok(enq.isReference(rec.ref));
  const list = await enq.listEnquiries();
  assert.equal(list.length, 1);
  assert.equal(list[0].email, 'asha@example.com');

  const u1 = await enq.updateEnquiry(rec.ref, { status: 'Contacted', note: 'Called' }, 'tester');
  assert.equal(u1.status, 'Contacted');
  assert.equal(u1.notes.length, 1);
  assert.equal(u1.history.at(-1).from, 'New');
  const u2 = await enq.updateEnquiry(rec.ref, { status: 'Not a status', archived: true }, 'tester');
  assert.equal(u2.status, 'Contacted', 'invalid status ignored');
  assert.equal(u2.archived, true);
  await enq.updateEnquiry(rec.ref, { read: true }, 'tester');
  await enq.updateEnquiry(rec.ref, { assignedTo: 'Ravi' }, 'tester');
  const latest = await enq.getEnquiry(rec.ref);
  assert.equal(latest.assignedTo, 'Ravi');
  assert.equal(latest.read, true);

  const bytes = await enq.readAttachment(latest);
  assert.equal(bytes.toString(), '%PDF-1.4 brief');
  const pub = enq.publicView(latest);
  assert.equal(pub.email, undefined, 'public view must not leak email');
  assert.equal(pub.message, undefined, 'public view must not leak message');

  assert.ok(await enq.deleteEnquiry(rec.ref));
  assert.equal(await enq.getEnquiry(rec.ref), null);
});

test('CSV export escapes quotes and neutralises formulas', () => {
  const csv = enq.toCsv([{ ref: 'DG-1', fullName: '=HYPERLINK("x")', message: 'He said "hi"' }]);
  assert.ok(csv.includes(`"'=HYPERLINK(""x"")"`));
  assert.ok(csv.includes('"He said ""hi"""'));
});

test('content store saves versions, restores and fills defaults', async () => {
  content.clearContentCache();
  const base = await content.getContent({ fresh: true });
  assert.equal(base.hero.headline, DEFAULT_CONTENT.hero.headline);
  const next = v.sanitizeContent({ ...base, hero: { ...base.hero, headline: 'New headline' } }, base);
  await content.saveContent(next, { by: 'test' });
  content.clearContentCache();
  assert.equal((await content.getContent({ fresh: true })).hero.headline, 'New headline');
  const versions = await content.listVersions();
  assert.ok(versions.length >= 1);
  const partial = content.withDefaults({ hero: { headline: 'x' } });
  assert.ok(partial.settings.email, 'missing sections are filled from defaults');
});

test('sanitizeContent rejects unsafe URLs, bad emails and junk', () => {
  const base = structuredClone(DEFAULT_CONTENT);
  const out = v.sanitizeContent({
    settings: { ...base.settings, email: 'not-an-email', socials: { linkedin: 'javascript:alert(1)', instagram: 'https://instagram.com/x' }, gaId: '<script>' },
    projects: [{ title: 'P', slug: 'My Project!!', image: 'javascript:alert(1)', url: 'https://ok.example', category: 'Nope', published: 'true' }],
  }, base);
  assert.equal(out.settings.email, base.settings.email);
  assert.equal(out.settings.socials.linkedin, '');
  assert.equal(out.settings.socials.instagram, 'https://instagram.com/x');
  assert.equal(out.settings.gaId, '');
  assert.equal(out.projects[0].slug, 'my-project');
  assert.equal(out.projects[0].image, '');
  assert.equal(out.projects[0].published, true);
  assert.ok(out.projects[0].category);
  const untouched = v.sanitizeContent({ hero: { headline: 'Only hero' } }, base);
  assert.equal(untouched.settings.email, base.settings.email, 'sections not sent are kept');
});

test('admin credentials, sessions and password change', async () => {
  assert.equal((await auth.checkCredentials('owner@example.com', 'Correct-Horse-42')).ok, true);
  assert.equal((await auth.checkCredentials('owner@example.com', 'wrong')).ok, false);
  assert.equal((await auth.checkCredentials('other@example.com', 'Correct-Horse-42')).ok, false);
  const { record } = await auth.checkCredentials('owner@example.com', 'Correct-Horse-42');
  const token = auth.createSessionToken(record);
  const req = (t) => new Request('https://x.test/', { headers: { cookie: `${auth.COOKIE}=${encodeURIComponent(t)}` } });
  assert.ok(await auth.readSession(req(token)));
  assert.equal(await auth.readSession(req(`${token}x`)), null, 'tampered token rejected');
  const forged = `${Buffer.from(JSON.stringify({ sub: 'owner@example.com', v: 0, exp: Date.now() + 1e6 })).toString('base64url')}.bad`;
  assert.equal(await auth.readSession(req(forged)), null, 'forged token rejected');

  await auth.changePassword('Brand-New-Pass-99');
  assert.equal(await auth.readSession(req(token)), null, 'old sessions end after a password change');
  assert.equal((await auth.checkCredentials('owner@example.com', 'Correct-Horse-42')).ok, false, 'env password no longer works');
  assert.equal((await auth.checkCredentials('owner@example.com', 'Brand-New-Pass-99')).ok, true);
  assert.equal(auth.passwordProblem('short'), 'Use at least 10 characters.');
  assert.equal(auth.passwordProblem('longenoughpassword'), 'Use both letters and numbers.');
  assert.equal(auth.passwordProblem('longenough123'), null);
});

test('password reset tokens work once and expire', async () => {
  const token = await auth.createResetToken();
  assert.ok(await auth.consumeResetToken(token));
  assert.ok(!(await auth.consumeResetToken('wrong-token')));
  await auth.changePassword('After-Reset-123');
  assert.ok(!(await auth.consumeResetToken(token)), 'token cleared after use');
});

test('rate limiter blocks after the limit', () => {
  rl.resetRateLimits();
  for (let i = 0; i < 3; i += 1) assert.ok(rl.rateLimit('k', { limit: 3, windowMs: 1000 }).ok);
  assert.equal(rl.rateLimit('k', { limit: 3, windowMs: 1000 }).ok, false);
  rl.rememberSubmission('fp', 'DG-1');
  assert.equal(rl.findDuplicate('fp'), 'DG-1');
});

test('email templates escape user input', () => {
  const evil = { ...good, ref: 'DG-261106-ABCDE', fullName: '<img src=x onerror=alert(1)>', message: '<script>x</script>', extra: { '<b>': '<i>' } };
  const a = email.adminEmailContent(evil, DEFAULT_CONTENT.settings, 'https://devanshgulati.in');
  const cst = email.customerEmailContent(evil, DEFAULT_CONTENT.settings, 'https://devanshgulati.in');
  for (const h of [a.html, cst.html]) {
    assert.ok(!h.includes('<script>'), 'script tag escaped');
    assert.ok(!h.includes('<img src=x'), 'img tag escaped');
  }
  assert.equal(a.subject, 'New Project Enquiry — Website Development');
  assert.equal(cst.subject, "We've Received Your Enquiry — Devansh Gulati");
  assert.ok(cst.text.includes('Your enquiry reference is: DG-261106-ABCDE.'));
});

test('sitemap lists public pages only', () => {
  const xml = sitemapXml(DEFAULT_CONTENT);
  assert.ok(xml.includes('/services/website-development'));
  assert.ok(xml.includes('/work/nnis-sports'));
  assert.ok(!xml.includes('/admin'));
  assert.ok(!xml.includes('/track'));
});

test('escapeHtml covers all special characters', () => {
  assert.equal(escapeHtml(`<a href="x" onclick='y'>&</a>`), '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
});
