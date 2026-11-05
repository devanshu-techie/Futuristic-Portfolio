// Local development server that mimics Vercel's routing for this project:
// static files from /public, vercel.json rewrites, and /api/*.js Web-standard handlers.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8'));
const PORT = Number(process.env.PORT || 3000);

// Load .env.local if present (KEY=VALUE lines).
try {
  const env = await readFile(path.join(root, '.env.local'), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch { /* optional */ }

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2',
};

function headerRules(pathname) {
  const out = {};
  for (const rule of config.headers || []) {
    const re = new RegExp(`^${rule.source.replace('(.*)', '(.*)')}$`);
    if (re.test(pathname)) for (const h of rule.headers) out[h.key.toLowerCase()] = h.value;
  }
  return out;
}

async function tryStatic(pathname) {
  const candidates = [pathname, `${pathname}.html`];
  for (const c of candidates) {
    const full = path.join(root, config.outputDirectory || 'public', c);
    if (!full.startsWith(path.join(root, 'public'))) return null;
    try {
      const s = await stat(full);
      if (s.isFile()) return { full, type: MIME[path.extname(full)] || 'application/octet-stream' };
    } catch { /* next */ }
  }
  return null;
}

function rewrite(pathname, search) {
  for (const r of config.rewrites || []) {
    const re = new RegExp(`^${r.source}$`);
    const m = pathname.match(re);
    if (!m) continue;
    let dest = r.destination.replace(/\$(\d)/g, (_, i) => m[Number(i)] ?? '');
    const [destPath, destQuery = ''] = dest.split('?');
    const params = new URLSearchParams(search);
    for (const [k, v] of new URLSearchParams(destQuery)) params.set(k, decodeURIComponent(v));
    dest = `${destPath}?${params}`;
    return dest;
  }
  return null;
}

async function toRequest(req, url) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
  headers.set('x-forwarded-for', req.socket.remoteAddress || '127.0.0.1');
  headers.set('x-forwarded-proto', 'http');
  return new Request(url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body });
}

async function send(res, response, extraHeaders) {
  const headers = { ...extraHeaders };
  response.headers.forEach((v, k) => { headers[k] = v; });
  const setCookie = response.headers.getSetCookie?.() || [];
  if (setCookie.length) headers['set-cookie'] = setCookie;
  res.writeHead(response.status, headers);
  if (response.body) res.end(Buffer.from(await response.arrayBuffer()));
  else res.end();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
  const started = Date.now();
  try {
    const baseHeaders = headerRules(url.pathname);
    if (process.env.DEV_NO_HSTS !== '0') delete baseHeaders['strict-transport-security'];
    delete baseHeaders['content-security-policy']; // re-added below without upgrade-insecure-requests
    const csp = (config.headers[0].headers.find((h) => h.key === 'Content-Security-Policy') || {}).value || '';
    baseHeaders['content-security-policy'] = csp.replace('; upgrade-insecure-requests', '');

    // Local uploads (production uses Vercel Blob URLs).
    if (url.pathname.startsWith('/uploads/')) {
      const full = path.join(root, '.data', url.pathname);
      try {
        const buf = await readFile(full);
        res.writeHead(200, { 'content-type': MIME[path.extname(full)] || 'application/octet-stream' });
        res.end(buf);
      } catch { res.writeHead(404); res.end('Not found'); }
      return;
    }

    if (!url.pathname.startsWith('/api/')) {
      const file = await tryStatic(url.pathname);
      if (file) {
        res.writeHead(200, { ...baseHeaders, 'content-type': file.type });
        res.end(await readFile(file.full));
        return;
      }
    }

    let target = url.pathname + url.search;
    const rewritten = rewrite(url.pathname, url.search);
    if (rewritten) target = rewritten;
    const targetUrl = new URL(target, url.origin);
    const fn = targetUrl.pathname.match(/^\/api\/([a-z0-9-]+)$/);
    if (!fn) { res.writeHead(404); res.end('Not found'); return; }
    const mod = await import(pathToFileURL(path.join(root, 'api', `${fn[1]}.js`)).href);
    const handler = mod[req.method];
    if (!handler) { res.writeHead(405); res.end('Method not allowed'); return; }
    // Functions see the original URL with rewrite params merged in (like Vercel).
    const fnUrl = new URL(url.pathname, url.origin);
    targetUrl.searchParams.forEach((v, k) => fnUrl.searchParams.set(k, v));
    const response = await handler(await toRequest(req, fnUrl));
    await send(res, response, baseHeaders);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('Dev server error');
  } finally {
    if (process.env.DEV_LOG !== '0') console.log(`${req.method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`);
  }
});

server.listen(PORT, () => console.log(`Dev server on http://localhost:${PORT}`));
