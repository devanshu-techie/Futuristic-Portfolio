// Admin authentication: signed, HttpOnly session cookies; scrypt password hashes.
import * as storage from './storage.js';
import { hmac, safeEqual, hashPassword, verifyPassword, encryptJson, decryptJson, randomToken, sha256 } from './crypto.js';

export const COOKIE = 'dg_admin';
const SESSION_HOURS = 8;
const AUTH_PREFIX = 'auth/v-';

let authCache = { at: 0, value: null };

/** Stored auth record: { email, hash, sessionVersion, reset: { tokenHash, exp } } */
export async function getAuthRecord({ fresh = false } = {}) {
  if (!fresh && authCache.value && Date.now() - authCache.at < 10_000) return authCache.value;
  let record = null;
  try {
    const items = (await storage.list(AUTH_PREFIX)).sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
    if (items[0]) record = decryptJson(await storage.get(items[0].url));
  } catch (err) {
    console.error('auth: could not read stored credentials', err.message);
  }
  authCache = { at: Date.now(), value: record };
  return record;
}

export async function saveAuthRecord(record) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  await storage.put(`${AUTH_PREFIX}${stamp}.bin`, encryptJson(record), 'application/octet-stream');
  authCache = { at: Date.now(), value: record };
  const items = (await storage.list(AUTH_PREFIX)).sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
  const old = items.slice(3).map((i) => i.url);
  if (old.length) await storage.del(old).catch(() => {});
}

export function adminEmail(record) {
  return (record?.email || process.env.ADMIN_EMAIL || 'devanshugulati1322@gmail.com').toLowerCase();
}

/** Verify credentials. A password saved from the admin panel takes priority over ADMIN_PASSWORD. */
export async function checkCredentials(email, password) {
  const record = await getAuthRecord({ fresh: true });
  if (String(email || '').trim().toLowerCase() !== adminEmail(record)) {
    verifyPassword('timing-padding', hashPassword('x')); // keep timing similar
    return { ok: false, record };
  }
  if (record?.hash) return { ok: verifyPassword(password, record.hash), record };
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) return { ok: false, record, notConfigured: true };
  return { ok: safeEqual(sha256(String(password)), sha256(envPassword)), record };
}

export function createSessionToken(record) {
  const payload = {
    sub: adminEmail(record),
    v: record?.sessionVersion || 0,
    exp: Date.now() + SESSION_HOURS * 3600_000,
    n: randomToken(8),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${hmac(body)}`;
}

export async function readSession(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  if (!match) return null;
  const token = decodeURIComponent(match.slice(COOKIE.length + 1));
  const [body, sig] = token.split('.');
  if (!body || !sig || !safeEqual(sig, hmac(body))) return null;
  let payload;
  try { payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch { return null; }
  if (!payload || payload.exp < Date.now()) return null;
  const record = await getAuthRecord();
  if ((record?.sessionVersion || 0) !== payload.v) return null;
  if (payload.sub !== adminEmail(record)) return null;
  return { email: payload.sub, exp: payload.exp };
}

function secureFlag() {
  return process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : '';
}

export function sessionCookie(token) {
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${secureFlag()}`;
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureFlag()}`;
}

export async function changePassword(newPassword, email) {
  const record = (await getAuthRecord({ fresh: true })) || {};
  const next = {
    ...record,
    email: (email || adminEmail(record)).toLowerCase(),
    hash: hashPassword(newPassword),
    sessionVersion: (record.sessionVersion || 0) + 1,
    reset: null,
    changedAt: new Date().toISOString(),
  };
  await saveAuthRecord(next);
  return next;
}

export async function createResetToken() {
  const record = (await getAuthRecord({ fresh: true })) || {};
  const token = randomToken(24);
  await saveAuthRecord({ ...record, reset: { tokenHash: sha256(token), exp: Date.now() + 30 * 60_000 } });
  return token;
}

export async function consumeResetToken(token) {
  const record = await getAuthRecord({ fresh: true });
  const reset = record?.reset;
  if (!reset || reset.exp < Date.now()) return false;
  return safeEqual(sha256(String(token)), reset.tokenHash);
}

export function passwordProblem(pw) {
  const s = String(pw || '');
  if (s.length < 10) return 'Use at least 10 characters.';
  if (!/[a-z]/i.test(s) || !/\d/.test(s)) return 'Use both letters and numbers.';
  return null;
}
