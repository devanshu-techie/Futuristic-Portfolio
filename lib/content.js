// Website content store with version history (every save is a new version).
import { DEFAULT_CONTENT } from './defaults.js';
import * as storage from './storage.js';

const PREFIX = 'content/v-';
const KEEP_VERSIONS = 25;
const CACHE_MS = 15_000;

let cache = { at: 0, value: null };

function isObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

/** Fill in any keys missing from stored content with defaults (arrays are kept as stored). */
export function withDefaults(stored, defaults = DEFAULT_CONTENT) {
  if (!isObject(stored)) return structuredClone(defaults);
  const out = {};
  for (const key of new Set([...Object.keys(defaults), ...Object.keys(stored)])) {
    const d = defaults[key];
    const s = stored[key];
    if (s === undefined) out[key] = structuredClone(d);
    else if (isObject(d) && isObject(s)) out[key] = withDefaults(s, d);
    else out[key] = s;
  }
  return out;
}

async function versions() {
  const items = await storage.list(PREFIX);
  return items.sort((a, b) => (a.pathname < b.pathname ? 1 : -1)); // newest first (timestamped names)
}

export async function getContent({ fresh = false } = {}) {
  if (!fresh && cache.value && Date.now() - cache.at < CACHE_MS) return cache.value;
  let value = structuredClone(DEFAULT_CONTENT);
  try {
    const [latest] = await versions();
    if (latest) value = withDefaults(JSON.parse((await storage.get(latest.url)).toString('utf8')));
  } catch (err) {
    console.error('content: falling back to defaults', err.message);
    if (cache.value) return cache.value;
  }
  cache = { at: Date.now(), value };
  return value;
}

export async function saveContent(next, meta = {}) {
  const value = withDefaults(next);
  value.updatedAt = new Date().toISOString();
  value.updatedBy = meta.by || 'admin';
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  await storage.put(`${PREFIX}${stamp}.json`, Buffer.from(JSON.stringify(value)), 'application/json');
  cache = { at: Date.now(), value };
  // Prune old versions (keep the most recent KEEP_VERSIONS as backups).
  try {
    const all = await versions();
    const old = all.slice(KEEP_VERSIONS).map((v) => v.url);
    if (old.length) await storage.del(old);
  } catch (err) {
    console.error('content: prune failed', err.message);
  }
  return value;
}

export async function listVersions() {
  return (await versions()).map((v) => ({ url: v.url, pathname: v.pathname, uploadedAt: v.uploadedAt }));
}

export async function readVersion(url) {
  const all = await versions();
  if (!all.some((v) => v.url === url)) throw new Error('Unknown version');
  return withDefaults(JSON.parse((await storage.get(url)).toString('utf8')));
}

export function clearContentCache() {
  cache = { at: 0, value: null };
}
