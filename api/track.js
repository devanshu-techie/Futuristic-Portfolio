// POST /api/track — public enquiry status lookup (reference + email must match).
import { json, readJson, sameOrigin, serverError } from '../lib/http.js';
import { getEnquiry, isReference, publicView } from '../lib/enquiries.js';
import { rateLimit, clientIp } from '../lib/ratelimit.js';
import { clean } from '../lib/validate.js';
import { safeEqual } from '../lib/crypto.js';

const NOT_FOUND = 'We could not find an enquiry with that reference and email. Check both and try again.';

export async function POST(request) {
  try {
    if (!sameOrigin(request)) return json({ ok: false, error: 'Not allowed.' }, 403);
    const limit = rateLimit(`track:${clientIp(request)}`, { limit: 15, windowMs: 10 * 60_000 });
    if (!limit.ok) return json({ ok: false, error: 'Too many attempts. Please wait a few minutes.' }, 429);
    const body = await readJson(request, 2000);
    const ref = clean(body.ref, 20).toUpperCase();
    const email = clean(body.email, 120).toLowerCase();
    if (!isReference(ref) || !email) return json({ ok: false, error: NOT_FOUND }, 404);
    const record = await getEnquiry(ref);
    if (!record || !safeEqual(record.email, email)) return json({ ok: false, error: NOT_FOUND }, 404);
    return json({ ok: true, enquiry: publicView(record) });
  } catch (err) {
    return serverError(err, 'track');
  }
}
