// Best-effort in-memory rate limiting (per function instance) plus duplicate detection.
const buckets = new Map();

export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
  }
  return { ok: true, remaining: limit - hits.length };
}

const recent = new Map(); // fingerprint -> { at, ref }

export function findDuplicate(fingerprint, windowMs = 10 * 60_000) {
  const hit = recent.get(fingerprint);
  if (hit && Date.now() - hit.at < windowMs) return hit.ref;
  return null;
}

export function rememberSubmission(fingerprint, ref) {
  recent.set(fingerprint, { at: Date.now(), ref });
  if (recent.size > 2000) recent.clear();
}

export function clientIp(request) {
  const fwd = request.headers.get('x-forwarded-for') || '';
  return (fwd.split(',')[0] || request.headers.get('x-real-ip') || 'local').trim();
}

export function resetRateLimits() {
  buckets.clear();
  recent.clear();
}
