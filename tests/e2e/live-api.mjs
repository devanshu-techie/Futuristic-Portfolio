// Live smoke + integration test against a deployed URL using only fetch.
// Usage: BASE_URL=https://devanshugulati.in ADMIN_EMAIL=… ADMIN_PASSWORD=… node tests/e2e/live-api.mjs
// Optional: SHARE_URL=<vercel share link> to pass Vercel Authentication on preview deployments.
const BASE = (process.env.BASE_URL || 'https://devanshugulati.in').replace(/\/$/, '');
const ORIGIN = new URL(BASE).origin;
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const jar = new Map();
const results = [];

function cookieHeader() { return [...jar].map(([k, v]) => `${k}=${v}`).join('; '); }
function storeCookies(res) {
  for (const c of res.headers.getSetCookie?.() || []) {
    const [pair] = c.split(';');
    const i = pair.indexOf('=');
    const k = pair.slice(0, i); const v = pair.slice(i + 1);
    if (/Max-Age=0/i.test(c) || v === '') jar.delete(k); else jar.set(k, v);
  }
}
async function req(path, opts = {}) {
  const headers = { cookie: cookieHeader(), ...(opts.headers || {}) };
  if (opts.method && opts.method !== 'GET') headers.origin = ORIGIN;
  const res = await fetch(path.startsWith('http') ? path : BASE + path, { redirect: 'manual', ...opts, headers });
  storeCookies(res);
  return res;
}
async function json(path, method = 'GET', body) {
  const res = await req(path, { method, headers: { accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}
async function step(name, fn) {
  const t = Date.now();
  try { await fn(); results.push(true); console.log(`✓ ${name} (${Date.now() - t}ms)`); }
  catch (err) { results.push(false); console.log(`✗ ${name}: ${err.message}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

if (process.env.SHARE_URL) {
  let url = process.env.SHARE_URL;
  for (let i = 0; i < 5; i += 1) {
    const r = await req(url);
    const loc = r.headers.get('location');
    if (!loc) break;
    url = new URL(loc, url).toString();
  }
}

let ref = '';
const customer = `live-test-${Date.now()}@example.com`;
const PAGES = ['/', '/services', '/services/social-media-marketing', '/services/website-development', '/services/android-app-development',
  '/services/digital-business-setup', '/services/branding-and-content', '/work', '/work/nnis-sports', '/work/vrindavan-shringar-mahal',
  '/work/chatspark', '/about', '/contact', '/faq', '/track', '/privacy-policy', '/terms-and-conditions', '/refund-policy'];

await step('health reports storage and secrets', async () => {
  const { data } = await json('/api/health');
  assert(data.ok && data.storage === 'blob' && data.secrets && data.adminConfigured, JSON.stringify(data));
});

await step(`all ${PAGES.length} public pages return 200 with content`, async () => {
  const bad = [];
  await Promise.all(PAGES.map(async (p) => {
    const r = await req(p);
    const t = await r.text();
    if (r.status !== 200 || !t.includes('<h1') || !t.includes('</html>')) bad.push(`${p}:${r.status}`);
  }));
  assert(!bad.length, bad.join(', '));
});

await step('static assets, sitemap, robots and 404', async () => {
  for (const [p, type] of [['/assets/css/site.css', 'css'], ['/assets/js/site.js', 'javascript'], ['/assets/img/work/nnis-sports.webp', 'webp'], ['/favicon.svg', 'svg'], ['/sitemap.xml', 'xml'], ['/robots.txt', 'text']]) {
    const r = await req(p);
    assert(r.status === 200 && (r.headers.get('content-type') || '').includes(type), `${p} ${r.status} ${r.headers.get('content-type')}`);
  }
  const nf = await req('/this-page-does-not-exist');
  assert(nf.status === 404, `404 page returned ${nf.status}`);
});

await step('admin pages and APIs are protected', async () => {
  const r = await req('/admin/dashboard');
  assert(r.status === 303 && r.headers.get('location') === '/admin/login', `admin redirect ${r.status}`);
  const a = await json('/api/admin/enquiries');
  assert(a.status === 401, `admin api ${a.status}`);
  const x = await fetch(`${BASE}/api/admin/login`, { method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json', cookie: cookieHeader() }, body: '{}' });
  assert(x.status === 403, `cross-site login should be 403, got ${x.status}`);
});

await step('enquiry with attachment is accepted and gets a reference', async () => {
  const html = await (await req('/contact')).text();
  const token = html.match(/name="formToken" value="([^"]+)"/)[1];
  await new Promise((r) => { setTimeout(r, 3000); });
  const fd = new FormData();
  Object.entries({
    formToken: token, page: '/contact', serviceCategory: 'Website Development', subject: 'LIVE TEST — please ignore',
    message: 'Automated deployment test. This enquiry is deleted automatically at the end of the test.',
    budget: 'Not sure yet', timeline: 'Flexible', fullName: 'Deployment Test', email: customer, phone: '9876543210',
    preferredContact: 'Email', consent: 'yes', 'extra[Website type]': 'Business website',
  }).forEach(([k, v]) => fd.append(k, v));
  fd.append('attachment', new Blob([Buffer.from('%PDF-1.4 live test brief')], { type: 'application/pdf' }), 'brief.pdf');
  const r = await req('/api/enquiries', { method: 'POST', headers: { accept: 'application/json' }, body: fd });
  const data = await r.json();
  assert(r.status === 201 && data.ok, `${r.status} ${JSON.stringify(data)}`);
  ref = data.ref;
  console.log(`   reference ${ref}, customer email sent: ${data.emailed}`);
});

await step('validation errors are returned for bad input', async () => {
  const html = await (await req('/contact')).text();
  const token = html.match(/name="formToken" value="([^"]+)"/)[1];
  await new Promise((r) => { setTimeout(r, 2700); });
  const fd = new FormData();
  Object.entries({ formToken: token, serviceCategory: 'Nope', subject: 'x', message: 'short', fullName: '', email: 'bad', consent: 'yes' }).forEach(([k, v]) => fd.append(k, v));
  const r = await req('/api/enquiries', { method: 'POST', headers: { accept: 'application/json' }, body: fd });
  const data = await r.json();
  assert(r.status === 422 && data.fields.email && data.fields.message && data.fields.serviceCategory, `${r.status} ${JSON.stringify(data)}`);
});

await step('customer can track the enquiry; wrong email is refused', async () => {
  const ok = await json('/api/track', 'POST', { ref, email: customer });
  assert(ok.status === 200 && ok.data.enquiry.status === 'New', JSON.stringify(ok));
  assert(ok.data.enquiry.email === undefined, 'tracking must not expose email');
  const bad = await json('/api/track', 'POST', { ref, email: 'someone@example.com' });
  assert(bad.status === 404, `wrong email gave ${bad.status}`);
});

if (EMAIL && PASSWORD) {
  await step('admin login: wrong password refused, right password accepted', async () => {
    const bad = await json('/api/admin/login', 'POST', { email: EMAIL, password: 'definitely-wrong-1' });
    assert(bad.status === 401, `wrong password gave ${bad.status}`);
    const good = await json('/api/admin/login', 'POST', { email: EMAIL, password: PASSWORD });
    assert(good.status === 200 && jar.has('dg_admin'), `login ${good.status} ${JSON.stringify(good.data)}`);
    const page = await req('/admin/dashboard');
    assert(page.status === 200, `dashboard ${page.status}`);
  });

  await step('dashboard stats include the new enquiry', async () => {
    const { status, data } = await json('/api/admin/stats');
    assert(status === 200 && data.total >= 1 && data.recent.some((e) => e.ref === ref), JSON.stringify(data).slice(0, 200));
  });

  await step('status change, note, assignment and read flag persist', async () => {
    let r = await json(`/api/admin/enquiries/${ref}`, 'PATCH', { status: 'Contacted', note: 'Live test note', assignedTo: 'Devansh', read: true });
    assert(r.status === 200 && r.data.enquiry.status === 'Contacted', JSON.stringify(r.data));
    r = await json(`/api/admin/enquiries/${ref}`);
    const e = r.data.enquiry;
    assert(e.status === 'Contacted' && e.notes.length === 1 && e.assignedTo === 'Devansh' && e.read && e.history.length === 2, JSON.stringify(e).slice(0, 300));
    const t = await json('/api/track', 'POST', { ref, email: customer });
    assert(t.data.enquiry.status === 'Contacted', 'tracking page does not show the new status');
  });

  await step('attachment downloads intact and CSV export works', async () => {
    const a = await req(`/api/admin/enquiries/${ref}/attachment`);
    const text = Buffer.from(await a.arrayBuffer()).toString();
    assert(a.status === 200 && text === '%PDF-1.4 live test brief', `attachment ${a.status} ${text.slice(0, 40)}`);
    const csv = await req('/api/admin/enquiries/export', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ refs: [ref] }) });
    const body = await csv.text();
    assert(csv.status === 200 && body.includes(ref), `csv ${csv.status}`);
  });

  await step('content edit goes live, then is restored', async () => {
    const { data } = await json('/api/admin/content');
    const original = structuredClone(data.content);
    const marker = `Live check ${Date.now()}`;
    const next = structuredClone(original);
    next.finalCta.text = marker;
    const saved = await json('/api/admin/content', 'PUT', { content: next });
    assert(saved.status === 200 && saved.data.content.finalCta.text === marker, `save ${saved.status} ${JSON.stringify(saved.data).slice(0, 200)}`);
    const back = await json('/api/admin/content', 'GET');
    assert(back.data.content.finalCta.text === marker, 'content did not persist');
    const v = await json('/api/admin/content/versions');
    assert(v.data.versions.length >= 1, 'no version history');
    const restore = await json('/api/admin/content', 'PUT', { content: original });
    assert(restore.status === 200 && restore.data.content.finalCta.text === original.finalCta.text, 'restore failed');
  });

  await step('image upload stores a public image', async () => {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    const fd = new FormData();
    fd.append('file', new Blob([png], { type: 'image/png' }), 'live-test.png');
    const r = await req('/api/admin/upload', { method: 'POST', headers: { accept: 'application/json' }, body: fd });
    const data = await r.json();
    assert(r.status === 200 && data.url, `${r.status} ${JSON.stringify(data)}`);
    const img = await fetch(data.url);
    assert(img.status === 200, `uploaded image not reachable (${img.status})`);
    console.log(`   uploaded to ${new URL(data.url).host}`);
  });

  await step('enquiry is deleted and session ends on logout', async () => {
    const d = await json(`/api/admin/enquiries/${ref}`, 'DELETE');
    assert(d.status === 200, `delete ${d.status}`);
    const g = await json(`/api/admin/enquiries/${ref}`);
    assert(g.status === 404, `deleted enquiry still readable (${g.status})`);
    await json('/api/admin/logout', 'POST', {});
    const after = await json('/api/admin/stats');
    assert(after.status === 401, `still signed in after logout (${after.status})`);
  });
}

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
