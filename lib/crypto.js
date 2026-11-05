// Small crypto helpers built on Node's standard library (no third-party deps).
import {
  createCipheriv, createDecipheriv, createHmac, randomBytes,
  scryptSync, timingSafeEqual, createHash,
} from 'node:crypto';

const DEV_SECRET = 'dev-only-secret-change-me-in-production-0000000000';

export function secret(name) {
  const value = process.env[name];
  if (value && value.length >= 16) return value;
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    throw new Error(`${name} is not configured`);
  }
  return `${DEV_SECRET}:${name}`;
}

function keyFrom(name) {
  return createHash('sha256').update(secret(name)).digest();
}

/** AES-256-GCM encrypt. Output: [12-byte iv][16-byte tag][ciphertext]. */
export function encrypt(buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyFrom('DATA_ENCRYPTION_KEY'), iv);
  const body = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]);
}

export function decrypt(buffer) {
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const body = buffer.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', keyFrom('DATA_ENCRYPTION_KEY'), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]);
}

export function encryptJson(value) {
  return encrypt(Buffer.from(JSON.stringify(value), 'utf8'));
}

export function decryptJson(buffer) {
  return JSON.parse(decrypt(buffer).toString('utf8'));
}

export function hmac(value, name = 'SESSION_SECRET') {
  return createHmac('sha256', secret(name)).update(value).digest('base64url');
}

export function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** scrypt password hash, format: scrypt$<salt>$<hash> */
export function hashPassword(password) {
  const salt = randomBytes(16).toString('base64url');
  const hash = scryptSync(password, salt, 64).toString('base64url');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false;
  const [kind, salt, hash] = stored.split('$');
  if (kind !== 'scrypt' || !salt || !hash) return false;
  const candidate = scryptSync(String(password), salt, 64).toString('base64url');
  return safeEqual(candidate, hash);
}

export function randomToken(bytes = 18) {
  return randomBytes(bytes).toString('base64url');
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}
