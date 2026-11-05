// Response helpers shared by all functions.
export const PUBLIC_CACHE = 'public, max-age=0, s-maxage=60, stale-while-revalidate=600';
export const NO_STORE = 'private, no-store, max-age=0';

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': NO_STORE, ...headers },
  });
}

export function htmlResponse(body, { status = 200, cache = PUBLIC_CACHE, headers = {} } = {}) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': cache, ...headers },
  });
}

export function redirect(location, status = 303, headers = {}) {
  return new Response(null, { status, headers: { location, 'cache-control': NO_STORE, ...headers } });
}

export async function readJson(request, maxBytes = 200_000) {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > maxBytes) throw Object.assign(new Error('Request too large'), { status: 413 });
  const text = await request.text();
  if (text.length > maxBytes) throw Object.assign(new Error('Request too large'), { status: 413 });
  try { return JSON.parse(text || '{}'); } catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}

/** Reject cross-site state-changing requests (CSRF defence in depth on top of SameSite cookies). */
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin) {
    const site = request.headers.get('sec-fetch-site');
    return !site || site === 'same-origin' || site === 'none';
  }
  try { return new URL(origin).host === host; } catch { return false; }
}

export function requestOrigin(request) {
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  return host ? `${proto}://${host}` : 'https://devanshugulati.in';
}

export function serverError(err, context = 'request') {
  console.error(`[${context}]`, err?.stack || err);
  return json({ ok: false, error: 'Something went wrong on our side. Please try again in a moment.' }, err?.status && err.status < 500 ? err.status : 500);
}
