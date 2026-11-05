// End-to-end tests with Playwright (uses a globally installed `playwright` package).
// Usage: BASE_URL=http://localhost:3000 ADMIN_EMAIL=… ADMIN_PASSWORD=… node tests/e2e/run.mjs
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
let playwright;
for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright', '/usr/local/lib/node_modules/playwright']) {
  try { playwright = require(p); break; } catch { /* try next */ }
}
if (!playwright) { console.error('Install Playwright: npm i -g playwright && npx playwright install chromium'); process.exit(1); }

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const EMAIL = process.env.ADMIN_EMAIL || 'devanshugulati1322@gmail.com';
const PASSWORD = process.env.ADMIN_PASSWORD;
const SHOTS = 'tests/e2e/screens';
mkdirSync(SHOTS, { recursive: true });

const results = [];
async function step(name, fn) {
  const t = Date.now();
  try { await fn(); results.push([true, name, Date.now() - t]); console.log(`✓ ${name}`); }
  catch (err) { results.push([false, name, Date.now() - t]); console.error(`✗ ${name}\n   ${String(err.message || err).split('\n')[0]}`); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

const browser = await playwright.chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 860 } });
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_TUNNEL|net::ERR/.test(m.text())) pageErrors.push(m.text()); });

const PUBLIC = ['/', '/services', '/services/social-media-marketing', '/services/website-development', '/services/android-app-development',
  '/services/digital-business-setup', '/services/branding-and-content', '/work', '/about', '/contact', '/faq', '/track',
  '/privacy-policy', '/terms-and-conditions', '/refund-policy'];
let ref = '';
const customerEmail = `e2e.${Date.now()}@example.com`;

await step('every public page loads with a title, one h1 and no script errors', async () => {
  for (const p of PUBLIC) {
    const res = await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    assert(res.status() === 200, `${p} returned ${res.status()}`);
    assert((await page.title()).length > 5, `${p} has no title`);
    assert((await page.locator('h1').count()) === 1, `${p} should have exactly one h1`);
    assert(await page.locator('meta[name="description"]').getAttribute('content'), `${p} missing meta description`);
  }
  assert(!pageErrors.length, `script errors: ${pageErrors.join(' | ')}`);
});

await step('no horizontal overflow at 320 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920', async () => {
  try {
  for (const w of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const p of ['/', '/contact', '/services/android-app-development', '/work/nnis-sports']) {
      await page.goto(BASE + p, { waitUntil: 'load' });
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert(over <= 0, `${p} overflows by ${over}px at ${w}px`);
    }
  }
  } finally { await page.setViewportSize({ width: 1366, height: 860 }); }
});

await step('main navigation links work', async () => {
  await page.goto(`${BASE}/`);
  await page.locator('.main-nav a', { hasText: 'Our Work' }).click();
  await page.waitForURL(`${BASE}/work`);
  await page.locator('.main-nav a', { hasText: 'About' }).click();
  await page.waitForURL(`${BASE}/about`);
  await page.locator('.site-header a', { hasText: "Let's Talk" }).click();
  await page.waitForURL(`${BASE}/contact`);
});

await step('mobile menu opens, traps focus and closes', async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`);
  await page.click('[data-menu-open]');
  assert(await page.locator('[data-mobile-menu]').isVisible(), 'menu did not open');
  await page.keyboard.press('Escape');
  assert(!(await page.locator('[data-mobile-menu]').isVisible()), 'menu did not close');
  await page.click('[data-menu-open]');
  await page.locator('[data-mobile-menu] nav a', { hasText: 'FAQ' }).click();
  await page.waitForURL(`${BASE}/faq`);
  await page.setViewportSize({ width: 1366, height: 860 });
});

await step('service finder pre-fills the contact form', async () => {
  await page.goto(`${BASE}/`);
  await page.click('#ft-android');
  assert(await page.locator('#fp-android').isVisible(), 'panel did not switch');
  await page.locator('#fp-android a', { hasText: 'Discuss My Requirement' }).click();
  await page.waitForURL(/\/contact\?service=Android/);
  assert(await page.locator('input[name="serviceCategory"][value="Android App Development"]').isChecked(), 'service not pre-selected');
  assert(await page.locator('[data-extra-for="Android App Development"]').count(), 'android questions missing');
});

await step('command palette opens with Ctrl+K and navigates', async () => {
  await page.goto(`${BASE}/`);
  await page.keyboard.press('Control+k');
  assert(await page.locator('[data-palette]').isVisible(), 'palette not visible');
  await page.keyboard.type('refund');
  await page.keyboard.press('Enter');
  await page.waitForURL(`${BASE}/refund-policy`);
});

await step('contact form shows validation errors', async () => {
  await page.goto(`${BASE}/contact`);
  await page.click('[data-next]');
  assert(await page.locator('[data-err-for="serviceCategory"]').isVisible(), 'no service error');
  await page.locator('label.choice', { hasText: 'Website Development' }).click();
  await page.fill('[name="subject"]', 'ab');
  await page.click('[data-next]');
  assert(await page.locator('#c-subject-err').isVisible(), 'no subject error');
});

await step('a valid enquiry is submitted and gets a reference', async () => {
  await page.goto(`${BASE}/contact`);
  await page.locator('label.choice', { hasText: 'Website Development' }).click();
  await page.fill('[name="subject"]', 'E2E test — bakery website');
  await page.click('[data-next]');
  await page.selectOption('[name="extra[Website type]"]', 'Business website');
  await page.fill('[name="message"]', 'We need a five page website for our bakery with a menu, gallery and WhatsApp ordering.');
  await page.selectOption('[name="budget"]', { index: 2 });
  await page.click('[data-next]');
  await page.fill('[name="fullName"]', 'E2E Tester');
  await page.fill('[name="email"]', customerEmail);
  await page.fill('[name="phone"]', '9876543210');
  await page.check('[name="consent"]');
  await page.waitForTimeout(2600); // form token minimum age
  await page.click('[data-submit]');
  await page.locator('[data-form-success]').waitFor({ state: 'visible', timeout: 15000 });
  ref = (await page.locator('[data-ref]').textContent()).trim();
  assert(/^DG-\d{6}-[A-Z2-9]{5}$/.test(ref), `unexpected reference ${ref}`);
  await page.screenshot({ path: `${SHOTS}/enquiry-success.png` });
});

await step('an empty or forged submission is rejected', async () => {
  const res = await page.evaluate(async () => {
    const r = await fetch('/api/enquiries', { method: 'POST', headers: { accept: 'application/json' }, body: new FormData() });
    return r.status;
  });
  assert(res === 400, `empty submission should be rejected (got ${res})`);
});

await step('the customer can track the enquiry', async () => {
  await page.goto(`${BASE}/track?ref=${ref}`);
  await page.fill('#t-email', customerEmail);
  await page.click('[data-track-form] button[type="submit"]');
  await page.locator('[data-track-result] .status-pill').waitFor({ timeout: 8000 });
  assert((await page.locator('[data-track-result] .status-pill').textContent()).includes('New'), 'status should be New');
  await page.fill('#t-email', 'wrong@example.com');
  await page.click('[data-track-form] button[type="submit"]');
  await page.locator('[data-track-form] [data-form-alert]').waitFor({ state: 'visible' });
});

await step('signed-out visitors cannot reach admin pages or APIs', async () => {
  const fresh = await browser.newContext();
  const p = await fresh.newPage();
  for (const path of ['/admin', '/admin/dashboard', '/admin/enquiries', '/admin/settings']) {
    await p.goto(BASE + path);
    assert(p.url().endsWith('/admin/login'), `${path} did not redirect to login`);
  }
  const api = await p.evaluate(async () => (await fetch('/api/admin/enquiries')).status);
  assert(api === 401, `admin API should return 401, got ${api}`);
  await fresh.close();
});

if (!PASSWORD) {
  console.log('… skipping admin tests (set ADMIN_PASSWORD)');
} else {
  await step('admin login rejects a wrong password and accepts the right one', async () => {
    await page.goto(`${BASE}/admin/login`);
    await page.fill('#em', EMAIL);
    await page.fill('#pw', 'wrong-password-123');
    await page.click('[data-login-form] button[type="submit"]');
    await page.locator('[data-alert]').waitFor({ state: 'visible' });
    await page.fill('#pw', PASSWORD);
    await page.click('[data-login-form] button[type="submit"]');
    await page.waitForURL(`${BASE}/admin/dashboard`);
    await page.locator('.tiles').waitFor();
    await page.screenshot({ path: `${SHOTS}/admin-dashboard.png` });
  });

  await step('admin sees the enquiry, changes status and adds a note (persisted)', async () => {
    await page.click('a[data-nav="enquiries"]');
    await page.locator(`tr[data-ref="${ref}"]`).waitFor();
    await page.fill('[data-f="q"]', 'bakery');
    assert(await page.locator(`tr[data-ref="${ref}"]`).isVisible(), 'search did not find the enquiry');
    await page.locator(`tr[data-ref="${ref}"] .row-link`).click();
    await page.locator('[data-status]').waitFor();
    await page.selectOption('[data-status]', 'Contacted');
    await page.locator('.hist .st-contacted').waitFor();
    await page.fill('#note', 'Called the client, sending proposal tomorrow.');
    await page.click('[data-note] button');
    await page.locator('.notes li').first().waitFor();
    await page.reload();
    await page.locator('[data-status]').waitFor();
    assert((await page.locator('[data-status]').inputValue()) === 'Contacted', 'status not persisted');
    assert((await page.locator('.notes li').count()) === 1, 'note not persisted');
    await page.screenshot({ path: `${SHOTS}/admin-enquiry.png`, fullPage: true });
  });

  await step('status change shows on the public tracking page', async () => {
    const p = await ctx.newPage();
    await p.goto(`${BASE}/track?ref=${ref}`);
    await p.fill('#t-email', customerEmail);
    await p.click('[data-track-form] button[type="submit"]');
    await p.locator('[data-track-result] .status-pill', { hasText: 'Contacted' }).waitFor({ timeout: 8000 });
    await p.close();
  });

  await step('CSV export downloads', async () => {
    await page.goto(`${BASE}/admin/enquiries`);
    await page.locator(`[data-sel="${ref}"]`).check();
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act="export"]')]);
    assert(dl.suggestedFilename().endsWith('.csv'), 'not a csv');
  });

  await step('admin edits the homepage headline and it goes live', async () => {
    await page.goto(`${BASE}/admin/content`);
    const input = page.locator('[data-bind="hero.headline"]');
    await input.waitFor();
    const original = await input.inputValue();
    await input.fill('Grow Faster Online.');
    await page.locator('[data-savebar].is-on').waitFor();
    await page.click('[data-save]');
    await page.locator('[data-toast].is-on', { hasText: 'Saved' }).waitFor();
    const home = await ctx.newPage();
    await home.goto(`${BASE}/`);
    assert((await home.locator('h1').textContent()).replace(/\s+/g, ' ').includes('Grow Faster Online.'), 'headline not updated');
    await home.close();
    await page.locator('[data-bind="hero.headline"]').fill(original);
    await page.click('[data-save]');
    await page.locator('[data-toast].is-on', { hasText: 'Saved' }).waitFor();
  });

  await step('admin unpublishes and republishes a project', async () => {
    await page.goto(`${BASE}/admin/projects`);
    const item = page.locator('details.item', { hasText: 'ChatSpark' });
    await item.locator('summary').click();
    await item.locator('[data-bind$=".published"]').uncheck({ force: true });
    await page.click('[data-save]');
    await page.locator('[data-toast].is-on', { hasText: 'Saved' }).waitFor();
    const res = await page.request.get(`${BASE}/work/chatspark`);
    assert(res.status() === 404, `unpublished project should 404, got ${res.status()}`);
    await page.goto(`${BASE}/admin/projects`);
    const again = page.locator('details.item', { hasText: 'ChatSpark' });
    await again.locator('summary').click();
    await again.locator('[data-bind$=".published"]').check({ force: true });
    await page.click('[data-save]');
    await page.locator('[data-toast].is-on', { hasText: 'Saved' }).waitFor();
    assert((await page.request.get(`${BASE}/work/chatspark`)).status() === 200, 'republished project should load');
  });

  await step('admin deletes the test enquiry and signs out', async () => {
    await page.goto(`${BASE}/admin/enquiries/${ref}`);
    await page.click('[data-delete]');
    await page.click('[data-dialog-ok]');
    await page.waitForURL(`${BASE}/admin/enquiries`);
    await page.click('[data-logout]');
    await page.waitForURL(`${BASE}/admin/login`);
    const api = await page.evaluate(async () => (await fetch('/api/admin/stats')).status);
    assert(api === 401, 'session should be cleared');
  });
}

assert(true, '');
await browser.close();
const failed = results.filter((r) => !r[0]);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
