// Storage adapter.
// Production: Vercel Blob (REST API, no SDK) when BLOB_READ_WRITE_TOKEN is set.
// Development / tests: local filesystem under .data/ (or DATA_DIR).
// Every stored object is immutable: updates write a new version, so blob URLs
// can be cached forever and stale CDN copies are never served.
import { mkdir, readFile, writeFile, readdir, stat, rm } from 'node:fs/promises';
import path from 'node:path';

const BLOB_API = process.env.VERCEL_BLOB_API_URL || 'https://blob.vercel-storage.com';
const BLOB_API_VERSION = process.env.BLOB_API_VERSION || '11';

export function storageMode() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return 'blob';
  if (process.env.VERCEL) return 'none';
  return 'fs';
}

export function isPersistent() {
  return storageMode() !== 'none';
}

// ---------- Vercel Blob ----------
function blobHeaders(extra = {}) {
  return {
    authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
    'x-api-version': BLOB_API_VERSION,
    ...extra,
  };
}

async function blobPut(pathname, body, contentType) {
  const res = await fetch(`${BLOB_API}/?pathname=${encodeURIComponent(pathname)}`, {
    method: 'PUT',
    headers: blobHeaders({
      'x-content-type': contentType,
      'x-add-random-suffix': '1',
      'x-allow-overwrite': '0',
      'x-cache-control-max-age': '31536000',
      'x-vercel-blob-access': 'public',
    }),
    body,
  });
  if (!res.ok) throw new Error(`Blob put failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return { url: data.url, pathname: data.pathname, uploadedAt: new Date().toISOString() };
}

async function blobList(prefix) {
  const out = [];
  let cursor;
  for (let page = 0; page < 50; page += 1) {
    const qs = new URLSearchParams({ prefix, limit: '1000' });
    if (cursor) qs.set('cursor', cursor);
    const res = await fetch(`${BLOB_API}?${qs}`, { headers: blobHeaders(), cache: 'no-store' });
    if (!res.ok) throw new Error(`Blob list failed (${res.status})`);
    const data = await res.json();
    for (const b of data.blobs || []) {
      out.push({ url: b.url, pathname: b.pathname, uploadedAt: b.uploadedAt, size: b.size });
    }
    if (!data.hasMore || !data.cursor) break;
    cursor = data.cursor;
  }
  return out;
}

async function blobGet(url) {
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Blob get failed (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

async function blobDel(urls) {
  if (!urls.length) return;
  const res = await fetch(`${BLOB_API}/delete`, {
    method: 'POST',
    headers: blobHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({ urls }),
  });
  if (!res.ok) throw new Error(`Blob delete failed (${res.status})`);
}

// ---------- Local filesystem ----------
function dataDir() {
  return process.env.DATA_DIR || path.join(process.cwd(), '.data');
}

function fsUrl(pathname) {
  return `fs://${pathname}`;
}

async function fsPut(pathname, body) {
  const suffix = Math.random().toString(36).slice(2, 10);
  const ext = path.extname(pathname);
  const finalPath = `${pathname.slice(0, pathname.length - ext.length)}-${suffix}${ext}`;
  const full = path.join(dataDir(), finalPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, body);
  return { url: fsUrl(finalPath), pathname: finalPath, uploadedAt: new Date().toISOString() };
}

async function walk(dir, base, out) {
  let entries = [];
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.posix.join(base, e.name);
    if (e.isDirectory()) await walk(full, rel, out);
    else {
      const s = await stat(full);
      out.push({ url: fsUrl(rel), pathname: rel, uploadedAt: s.mtime.toISOString(), size: s.size });
    }
  }
  return out;
}

async function fsList(prefix) {
  const all = await walk(dataDir(), '', []);
  return all.filter((b) => b.pathname.startsWith(prefix));
}

function fsPathFromUrl(url) {
  const rel = url.replace(/^fs:\/\//, '');
  const full = path.resolve(dataDir(), rel);
  if (!full.startsWith(path.resolve(dataDir()))) throw new Error('Invalid path');
  return full;
}

async function fsGet(url) {
  return readFile(fsPathFromUrl(url));
}

async function fsDel(urls) {
  await Promise.all(urls.map((u) => rm(fsPathFromUrl(u), { force: true })));
}

// ---------- Public interface ----------
const memoryCache = new Map(); // immutable url -> Buffer

export async function put(pathname, body, contentType = 'application/octet-stream') {
  const mode = storageMode();
  if (mode === 'blob') return blobPut(pathname, body, contentType);
  if (mode === 'fs') return fsPut(pathname, body);
  throw new Error('Storage is not configured');
}

export async function list(prefix) {
  const mode = storageMode();
  if (mode === 'blob') return blobList(prefix);
  if (mode === 'fs') return fsList(prefix);
  return [];
}

export async function get(url) {
  if (memoryCache.has(url)) return memoryCache.get(url);
  const buf = storageMode() === 'blob' ? await blobGet(url) : await fsGet(url);
  if (memoryCache.size > 2000) memoryCache.clear();
  memoryCache.set(url, buf);
  return buf;
}

export async function del(urls) {
  urls.forEach((u) => memoryCache.delete(u));
  const mode = storageMode();
  if (mode === 'blob') return blobDel(urls);
  if (mode === 'fs') return fsDel(urls);
  return undefined;
}

/** Public URL for an uploaded public asset (images). */
export function publicUrl(stored) {
  if (stored.url.startsWith('fs://')) return `/uploads/${stored.pathname}`;
  return stored.url;
}
