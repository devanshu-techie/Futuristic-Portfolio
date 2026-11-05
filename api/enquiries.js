// POST /api/enquiries — public enquiry submission.
import { json, redirect, sameOrigin, requestOrigin, serverError } from '../lib/http.js';
import { validateEnquiry, checkAttachment, LIMITS } from '../lib/validate.js';
import { createEnquiry, makeReference } from '../lib/enquiries.js';
import { sendEnquiryEmails } from '../lib/email.js';
import { getContent } from '../lib/content.js';
import { isPersistent } from '../lib/storage.js';
import { rateLimit, clientIp, findDuplicate, rememberSubmission } from '../lib/ratelimit.js';
import { hmac, safeEqual, sha256 } from '../lib/crypto.js';
import { escapeHtml } from '../lib/html.js';

const MIN_FILL_MS = 2500;
const MAX_TOKEN_AGE_MS = 48 * 3600_000;

function wantsHtml(request) {
  return !(request.headers.get('accept') || '').includes('application/json');
}

function tokenOk(token) {
  const [ts, sig] = String(token || '').split('.');
  if (!ts || !sig || !/^\d{13}$/.test(ts)) return false;
  if (!safeEqual(sig, hmac(ts, 'FORM_SECRET'))) return false;
  const age = Date.now() - Number(ts);
  return age >= MIN_FILL_MS && age <= MAX_TOKEN_AGE_MS;
}

function errorPage(errors) {
  const items = Object.values(errors).map((m) => `<li>${escapeHtml(m)}</li>`).join('');
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Check your enquiry</title>
<body style="font-family:system-ui;background:#0a0a12;color:#f5f5f7;margin:0;display:grid;place-items:center;min-height:100vh"><main style="max-width:520px;padding:24px">
<h1>Please check your enquiry</h1><ul style="line-height:1.7;color:#ffb4b4">${items}</ul><p><a style="color:#c4b5fd" href="javascript:history.back()">Go back and fix it</a></p></main>`, { status: 422, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

async function parse(request) {
  const type = request.headers.get('content-type') || '';
  const len = Number(request.headers.get('content-length') || 0);
  if (len > LIMITS.attachmentBytes + 200_000) throw Object.assign(new Error('too large'), { status: 413 });
  if (type.includes('application/json')) {
    return { fields: await request.json(), file: null };
  }
  const form = await request.formData();
  const fields = { extra: {} };
  let file = null;
  for (const [key, value] of form.entries()) {
    if (key === 'attachment') {
      if (value && typeof value === 'object' && value.size > 0) file = value;
      continue;
    }
    const m = key.match(/^extra\[(.+)\]$/);
    if (m) fields.extra[m[1]] = value;
    else fields[key] = value;
  }
  return { fields, file };
}

export async function POST(request) {
  const html = wantsHtml(request);
  try {
    if (!sameOrigin(request)) return json({ ok: false, error: 'This form can only be sent from our website.' }, 403);

    const ip = clientIp(request);
    const burst = rateLimit(`enq:${ip}`, { limit: 5, windowMs: 10 * 60_000 });
    const daily = rateLimit(`enq-day:${ip}`, { limit: 20, windowMs: 24 * 3600_000 });
    if (!burst.ok || !daily.ok) {
      return json({ ok: false, error: 'Too many enquiries from this connection. Please wait a few minutes, or message us on WhatsApp.' }, 429, { 'retry-after': String(burst.retryAfter || 600) });
    }

    let parsed;
    try { parsed = await parse(request); } catch (err) {
      if (err.status === 413) return json({ ok: false, error: 'Attachments must be 4 MB or smaller.', fields: { attachment: 'Attachments must be 4 MB or smaller.' } }, 413);
      return json({ ok: false, error: 'We could not read the form. Please refresh the page and try again.' }, 400);
    }
    const { fields, file } = parsed;

    // Honeypot: bots fill hidden fields. Respond as if accepted, store nothing.
    if (fields.website) {
      const ref = makeReference();
      return html ? redirect(`/track?ref=${ref}&new=1`) : json({ ok: true, ref });
    }
    if (!tokenOk(fields.formToken)) {
      return json({ ok: false, error: 'This form has expired or was sent too quickly. Please refresh the page and try again.' }, 400);
    }

    const { data, errors, ok } = validateEnquiry(fields);
    if (fields.consent !== 'yes' && fields.consent !== true) errors.consent = 'Please agree to be contacted about this enquiry.';

    let attachment = null;
    if (file) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const check = checkAttachment(bytes, file.type, bytes.length);
      if (!check.ok) errors.attachment = check.error;
      else attachment = { bytes, type: file.type, size: bytes.length, name: String(file.name || `attachment.${check.ext}`).replace(/[^\w.\- ]+/g, '_').slice(0, 100) };
    }
    if (!ok || Object.keys(errors).length) {
      if (html) return errorPage(errors);
      return json({ ok: false, error: 'Please check the highlighted fields.', fields: errors }, 422);
    }

    const fingerprint = sha256(`${data.email}|${data.subject}|${data.message}`);
    const dup = findDuplicate(fingerprint);
    if (dup) return html ? redirect(`/track?ref=${dup}&new=1`) : json({ ok: true, ref: dup, duplicate: true });

    const content = await getContent();
    const origin = requestOrigin(request);
    let record;
    if (isPersistent()) {
      record = await createEnquiry(data, attachment, { page: String(fields.page || '').slice(0, 120) });
    } else {
      // Storage not configured: still notify by email so no enquiry is lost.
      record = { ...data, ref: makeReference(), attachment: null, createdAt: new Date().toISOString() };
      console.warn('[enquiry] storage not configured; enquiry delivered by email only', record.ref);
    }
    rememberSubmission(fingerprint, record.ref);

    const mail = await Promise.race([
      sendEnquiryEmails(record, content.settings, origin),
      new Promise((resolve) => { setTimeout(() => resolve({ admin: false, customer: false, errors: ['timeout'] }), 9000); }),
    ]);
    if (mail.errors?.length) console.error('[enquiry] email issues', record.ref, mail.errors);

    if (html) return redirect(`/track?ref=${record.ref}&new=1`);
    return json({ ok: true, ref: record.ref, emailed: Boolean(mail.customer) }, 201);
  } catch (err) {
    return serverError(err, 'enquiries');
  }
}
