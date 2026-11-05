// Build-time safety check (also the Vercel build command): every module loads and
// every page renders without throwing. A failure here stops a broken deploy.
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const dir = mkdtempSync(path.join(tmpdir(), 'dg-check-'));
delete process.env.BLOB_READ_WRITE_TOKEN;
delete process.env.VERCEL;
process.env.DATA_DIR = dir;

let failures = 0;
const fail = (msg) => { failures += 1; console.error(`✗ ${msg}`); };
const pass = (msg) => console.log(`✓ ${msg}`);

try {
  const { renderPath } = await import('../lib/router.js');
  const { DEFAULT_CONTENT } = await import('../lib/defaults.js');
  for (const m of ['../api/render.js', '../api/enquiries.js', '../api/track.js', '../api/admin.js', '../api/health.js']) {
    await import(m); pass(`loads ${m.replace('../', '')}`);
  }
  const paths = ['/', '/services', ...DEFAULT_CONTENT.services.map((s) => `/services/${s.slug}`), '/work',
    ...DEFAULT_CONTENT.projects.map((p) => `/work/${p.slug}`), '/about', '/contact', '/contact?service=Website%20Development&need=website',
    '/faq', '/track', '/privacy-policy', '/terms-and-conditions', '/refund-policy', '/sitemap.xml', '/admin/login'];
  for (const p of paths) {
    const url = new URL(p, 'https://devanshgulati.in');
    const res = await renderPath(new Request(url), url.pathname);
    const body = await res.text();
    if (res.status !== 200) fail(`${p} returned ${res.status}`);
    else if (p !== '/sitemap.xml' && (!body.includes('<title>') || body.includes('undefined') || body.includes('[object Object]'))) fail(`${p} rendered suspicious output`);
    else pass(`renders ${p} (${(body.length / 1024).toFixed(1)} KB)`);
  }
  const nf = await renderPath(new Request('https://devanshgulati.in/nope'), '/nope');
  if (nf.status !== 404) fail('unknown path should 404'); else pass('404 page');
  const adm = await renderPath(new Request('https://devanshgulati.in/admin/dashboard'), '/admin/dashboard');
  if (adm.status !== 303) fail('admin must redirect when signed out'); else pass('admin is protected');
  for (const f of ['public/assets/css/site.css', 'public/assets/css/admin.css', 'public/assets/js/site.js', 'public/assets/js/admin.js', 'public/assets/js/admin-login.js', 'public/assets/js/theme.js']) {
    if (!existsSync(f)) fail(`missing ${f}`);
    else if (f.endsWith('.js')) {
      try { new Function(readFileSync(f, 'utf8').replace(/^\s*(import|export)\s.*$/gm, '')); pass(`syntax ${f}`); } catch (err) { fail(`syntax ${f}: ${err.message}`); }
    } else pass(`exists ${f}`);
  }
} catch (err) {
  fail(err.stack || err.message);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
if (failures) { console.error(`\n${failures} check(s) failed`); process.exit(1); }
console.log('\nAll checks passed');
