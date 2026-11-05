// /api/admin/* — protected admin API (routed via vercel.json rewrite with ?__route=).
import { json, readJson, sameOrigin, serverError, requestOrigin } from '../lib/http.js';
import {
  checkCredentials, createSessionToken, sessionCookie, clearCookie, readSession,
  changePassword, createResetToken, consumeResetToken, passwordProblem, adminEmail, getAuthRecord,
} from '../lib/auth.js';
import { listEnquiries, getEnquiry, updateEnquiry, deleteEnquiry, readAttachment, toCsv, isReference } from '../lib/enquiries.js';
import { getContent, saveContent, listVersions, readVersion } from '../lib/content.js';
import { sanitizeContent, checkAttachment } from '../lib/validate.js';
import { rateLimit, clientIp } from '../lib/ratelimit.js';
import { storageMode, put, publicUrl } from '../lib/storage.js';
import { emailProvider, sendPlainEmail, canSendFromServer, formsubmitNotify } from '../lib/email.js';
import { ENQUIRY_STATUSES, SERVICE_CATEGORIES, PROJECT_CATEGORIES } from '../lib/defaults.js';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function routeOf(request) {
  const url = new URL(request.url);
  const r = url.searchParams.get('__route') ?? url.pathname.replace(/^\/api\/admin\/?/, '');
  return r.replace(/^\/+|\/+$/g, '');
}

function strip(record) {
  const { attachment, ...rest } = record;
  return { ...rest, attachment: attachment ? { name: attachment.name, type: attachment.type, size: attachment.size } : null };
}

function stats(list) {
  const active = list.filter((e) => !e.archived);
  const by = (k) => active.reduce((acc, e) => { acc[e[k]] = (acc[e[k]] || 0) + 1; return acc; }, {});
  const days = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
    days.push({ date: d, count: active.filter((e) => e.createdAt.slice(0, 10) === d).length });
  }
  return {
    total: active.length,
    new: active.filter((e) => e.status === 'New').length,
    inProgress: active.filter((e) => e.status === 'In Progress').length,
    completed: active.filter((e) => e.status === 'Completed').length,
    unread: active.filter((e) => !e.read).length,
    archived: list.length - active.length,
    byStatus: by('status'),
    byService: by('serviceCategory'),
    trend: days,
    recent: active.slice(0, 6).map(strip),
  };
}

async function publicHandlers(route, request) {
  const ip = clientIp(request);
  if (route === 'login' && request.method === 'POST') {
    const limit = rateLimit(`login:${ip}`, { limit: 8, windowMs: 15 * 60_000 });
    if (!limit.ok) return json({ ok: false, error: `Too many sign-in attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.` }, 429);
    const body = await readJson(request, 2000);
    const result = await checkCredentials(body.email, body.password);
    if (result.notConfigured) return json({ ok: false, error: 'Admin password is not configured yet. Set ADMIN_PASSWORD in the hosting environment.' }, 503);
    if (!result.ok) return json({ ok: false, error: 'That email and password do not match.' }, 401);
    const token = createSessionToken(result.record);
    return json({ ok: true }, 200, { 'set-cookie': sessionCookie(token) });
  }
  if (route === 'logout' && request.method === 'POST') {
    return json({ ok: true }, 200, { 'set-cookie': clearCookie() });
  }
  if (route === 'forgot' && request.method === 'POST') {
    const limit = rateLimit(`forgot:${ip}`, { limit: 3, windowMs: 60 * 60_000 });
    const message = 'If that account exists, a reset link has been sent to the admin email.';
    if (!limit.ok) return json({ ok: true, message });
    if (!canSendFromServer()) {
      return json({ ok: true, message: 'Password reset emails need Resend or Gmail set up. To reset now, change ADMIN_PASSWORD in Vercel → Settings → Environment Variables and redeploy; the new value replaces the old password.' });
    }
    try {
      const content = await getContent();
      const token = await createResetToken();
      const to = adminEmail(await getAuthRecord({ fresh: true }));
      const link = `${requestOrigin(request)}/admin/reset?token=${token}`;
      await sendPlainEmail(to, 'Reset your admin password', `Someone asked to reset the admin password for ${content.settings.brand}.\n\nUse this link within 30 minutes:\n${link}\n\nIf this was not you, ignore this email — your password stays the same.`, content.settings);
    } catch (err) {
      console.error('[forgot]', err.message);
    }
    return json({ ok: true, message });
  }
  if (route === 'reset' && request.method === 'POST') {
    const limit = rateLimit(`reset:${ip}`, { limit: 6, windowMs: 30 * 60_000 });
    if (!limit.ok) return json({ ok: false, error: 'Too many attempts. Request a new link later.' }, 429);
    const body = await readJson(request, 2000);
    if (!(await consumeResetToken(body.token))) return json({ ok: false, error: 'This reset link is invalid or has expired. Request a new one.' }, 400);
    const problem = passwordProblem(body.password);
    if (problem) return json({ ok: false, error: problem }, 422);
    await changePassword(body.password);
    return json({ ok: true });
  }
  return null;
}

async function handle(request) {
  const route = routeOf(request);
  const method = request.method;
  if (method !== 'GET' && !sameOrigin(request)) return json({ ok: false, error: 'Cross-site request blocked.' }, 403);

  const pub = await publicHandlers(route, request);
  if (pub) return pub;

  const session = await readSession(request);
  if (!session) return json({ ok: false, error: 'Your session has ended. Sign in again.' }, 401);

  const parts = route.split('/');

  if (route === 'me') return json({ ok: true, email: session.email, exp: session.exp });

  if (route === 'meta') {
    return json({
      ok: true,
      statuses: ENQUIRY_STATUSES,
      serviceCategories: SERVICE_CATEGORIES,
      projectCategories: PROJECT_CATEGORIES,
      storage: storageMode(),
      email: emailProvider(),
      envPassword: Boolean(process.env.ADMIN_PASSWORD),
    });
  }

  if (route === 'stats') return json({ ok: true, ...stats(await listEnquiries()) });

  if (parts[0] === 'enquiries') {
    if (parts.length === 1 && method === 'GET') {
      return json({ ok: true, enquiries: (await listEnquiries()).map(strip) });
    }
    if (parts[1] === 'export' && method === 'POST') {
      const body = await readJson(request, 100_000);
      const all = await listEnquiries();
      const pick = Array.isArray(body.refs) && body.refs.length ? all.filter((e) => body.refs.includes(e.ref)) : all;
      return new Response(toCsv(pick), {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
          'cache-control': 'no-store',
        },
      });
    }
    const ref = parts[1];
    if (!isReference(ref)) return json({ ok: false, error: 'Unknown enquiry.' }, 404);
    if (parts[2] === 'attachment' && method === 'GET') {
      const record = await getEnquiry(ref);
      const bytes = record && (await readAttachment(record));
      if (!bytes) return json({ ok: false, error: 'No attachment.' }, 404);
      return new Response(bytes, {
        headers: {
          'content-type': record.attachment.type || 'application/octet-stream',
          'content-disposition': `attachment; filename="${record.attachment.name.replace(/"/g, '')}"`,
          'x-content-type-options': 'nosniff',
          'cache-control': 'no-store',
        },
      });
    }
    if (method === 'GET') {
      const record = await getEnquiry(ref);
      if (!record) return json({ ok: false, error: 'Unknown enquiry.' }, 404);
      return json({ ok: true, enquiry: strip(record) });
    }
    if (method === 'PATCH') {
      const body = await readJson(request, 10_000);
      if (body.status && !ENQUIRY_STATUSES.includes(body.status)) return json({ ok: false, error: 'Unknown status.' }, 422);
      const record = await updateEnquiry(ref, body, session.email);
      if (!record) return json({ ok: false, error: 'Unknown enquiry.' }, 404);
      return json({ ok: true, enquiry: strip(record) });
    }
    if (method === 'DELETE') {
      const done = await deleteEnquiry(ref);
      return json({ ok: done }, done ? 200 : 404);
    }
  }

  if (route === 'content' && method === 'GET') return json({ ok: true, content: await getContent({ fresh: true }) });
  if (route === 'content' && method === 'PUT') {
    const body = await readJson(request, 600_000);
    const base = await getContent({ fresh: true });
    const next = sanitizeContent(body.content || {}, base);
    const saved = await saveContent(next, { by: session.email });
    return json({ ok: true, content: saved });
  }
  if (route === 'content/versions' && method === 'GET') return json({ ok: true, versions: await listVersions() });
  if (route === 'content/restore' && method === 'POST') {
    const body = await readJson(request, 2000);
    const version = await readVersion(String(body.url || ''));
    const saved = await saveContent(version, { by: `${session.email} (restore)` });
    return json({ ok: true, content: saved });
  }

  if (route === 'upload' && method === 'POST') {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file !== 'object' || !file.size) return json({ ok: false, error: 'Choose an image to upload.' }, 400);
    if (!IMAGE_TYPES.includes(file.type)) return json({ ok: false, error: 'Upload a PNG, JPG or WEBP image.' }, 422);
    const bytes = Buffer.from(await file.arrayBuffer());
    const check = checkAttachment(bytes, file.type, bytes.length);
    if (!check.ok) return json({ ok: false, error: check.error }, 422);
    const safe = String(file.name || 'image').toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9-]+/g, '-').slice(0, 40) || 'image';
    const stored = await put(`uploads/${safe}.${check.ext}`, bytes, file.type);
    return json({ ok: true, url: publicUrl(stored) });
  }

  if (route === 'password' && method === 'POST') {
    const body = await readJson(request, 2000);
    const current = await checkCredentials(session.email, body.current);
    if (!current.ok) return json({ ok: false, error: 'Your current password is not correct.' }, 401);
    const problem = passwordProblem(body.next);
    if (problem) return json({ ok: false, error: problem }, 422);
    const record = await changePassword(body.next, session.email);
    return json({ ok: true }, 200, { 'set-cookie': sessionCookie(createSessionToken(record)) });
  }

  if (route === 'test-email' && method === 'POST') {
    const content = await getContent();
    const to = content.settings.notifyEmail || content.settings.email;
    if (!canSendFromServer()) {
      return json({ ok: true, message: `Test email sent to ${to} via FormSubmit. The first time, FormSubmit sends an "Activate" email instead — click it once.`, notify: formsubmitNotify(to, { _subject: `Test email — ${content.settings.brand}`, _captcha: 'false', _template: 'box', message: `This is a test from your website admin panel.\nSent: ${new Date().toISOString()}` }) });
    }
    try {
      await sendPlainEmail(to, `Test email — ${content.settings.brand}`, `This is a test from your website admin panel.\n\nEmail provider: ${emailProvider()}\nSent: ${new Date().toISOString()}`, content.settings);
      return json({ ok: true, message: `Test email sent to ${to}. Check the inbox (and spam folder).` });
    } catch (err) {
      return json({ ok: false, error: `The test email could not be sent: ${err.message}` }, 502);
    }
  }

  return json({ ok: false, error: 'Not found.' }, 404);
}

async function wrapped(request) {
  try { return await handle(request); } catch (err) { return serverError(err, 'admin'); }
}

export const GET = wrapped;
export const POST = wrapped;
export const PUT = wrapped;
export const PATCH = wrapped;
export const DELETE = wrapped;
