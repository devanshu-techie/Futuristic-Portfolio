// Enquiry records: encrypted at rest, versioned on every change.
import { randomUUID, randomInt } from 'node:crypto';
import * as storage from './storage.js';
import { encryptJson, decryptJson, encrypt, decrypt } from './crypto.js';
import { ENQUIRY_STATUSES } from './defaults.js';

const PREFIX = 'enq/';
const ATT_PREFIX = 'att/';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function makeReference(now = new Date()) {
  const date = new Date(now.getTime() + 330 * 60_000); // IST calendar date
  const y = String(date.getUTCFullYear()).slice(2);
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  let tail = '';
  for (let i = 0; i < 5; i += 1) tail += ALPHABET[randomInt(ALPHABET.length)];
  return `DG-${y}${m}${d}-${tail}`;
}

export function isReference(value) {
  return /^DG-\d{6}-[A-Z2-9]{5}$/.test(String(value || ''));
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function refFromPath(pathname) {
  return pathname.slice(PREFIX.length).split('/')[0];
}

async function groupVersions() {
  const items = await storage.list(PREFIX);
  const groups = new Map();
  for (const it of items) {
    const ref = refFromPath(it.pathname);
    if (!groups.has(ref)) groups.set(ref, []);
    groups.get(ref).push(it);
  }
  for (const list of groups.values()) list.sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
  return groups;
}

async function writeVersion(record) {
  await storage.put(`${PREFIX}${record.ref}/${stamp()}.bin`, encryptJson(record), 'application/octet-stream');
}

async function readLatest(versions) {
  return decryptJson(await storage.get(versions[0].url));
}

export async function createEnquiry(data, attachment, meta = {}) {
  const now = new Date().toISOString();
  let ref = makeReference();
  const existing = await groupVersions();
  while (existing.has(ref)) ref = makeReference();

  let att = null;
  if (attachment) {
    const stored = await storage.put(
      `${ATT_PREFIX}${ref}/${stamp()}.bin`,
      encrypt(attachment.bytes),
      'application/octet-stream',
    );
    att = { name: attachment.name, type: attachment.type, size: attachment.size, url: stored.url };
  }

  const record = {
    id: randomUUID(),
    ref,
    ...data,
    attachment: att,
    status: 'New',
    archived: false,
    read: false,
    assignedTo: '',
    notes: [],
    history: [{ status: 'New', at: now, by: 'Website form' }],
    source: meta.source || 'website',
    page: meta.page || '',
    createdAt: now,
    updatedAt: now,
  };
  await writeVersion(record);
  return record;
}

export async function listEnquiries() {
  const groups = await groupVersions();
  const records = await Promise.all(
    [...groups.values()].map((versions) => readLatest(versions).catch(() => null)),
  );
  return records.filter(Boolean).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getEnquiry(ref) {
  const versions = (await groupVersions()).get(ref);
  if (!versions) return null;
  return readLatest(versions);
}

export async function updateEnquiry(ref, patch, by = 'Admin') {
  const groups = await groupVersions();
  const versions = groups.get(ref);
  if (!versions) return null;
  const record = await readLatest(versions);
  const now = new Date().toISOString();

  if (patch.status && ENQUIRY_STATUSES.includes(patch.status) && patch.status !== record.status) {
    record.history.push({ status: patch.status, from: record.status, at: now, by });
    record.status = patch.status;
  }
  if (typeof patch.archived === 'boolean') record.archived = patch.archived;
  if (typeof patch.read === 'boolean') record.read = patch.read;
  if (typeof patch.assignedTo === 'string') record.assignedTo = patch.assignedTo.slice(0, 80);
  if (typeof patch.note === 'string' && patch.note.trim()) {
    record.notes.push({ id: randomUUID(), body: patch.note.trim().slice(0, 2000), at: now, by });
  }
  if (typeof patch.deleteNote === 'string') {
    record.notes = record.notes.filter((n) => n.id !== patch.deleteNote);
  }
  record.updatedAt = now;
  await writeVersion(record);

  // Keep the three most recent versions; history lives inside the record.
  const stale = versions.slice(2).map((v) => v.url);
  if (stale.length) storage.del(stale).catch(() => {});
  return record;
}

export async function deleteEnquiry(ref) {
  const versions = (await groupVersions()).get(ref) || [];
  const atts = await storage.list(`${ATT_PREFIX}${ref}/`);
  const urls = [...versions.map((v) => v.url), ...atts.map((a) => a.url)];
  if (urls.length) await storage.del(urls);
  return urls.length > 0;
}

export async function readAttachment(record) {
  if (!record?.attachment?.url) return null;
  return decrypt(await storage.get(record.attachment.url));
}

/** Public-safe view for the tracking page. */
export function publicView(record) {
  return {
    ref: record.ref,
    status: record.status,
    serviceCategory: record.serviceCategory,
    subject: record.subject,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    history: record.history.map((h) => ({ status: h.status, at: h.at })),
  };
}

export function toCsv(records) {
  const cols = [
    ['ref', 'Reference'], ['createdAt', 'Created'], ['status', 'Status'], ['fullName', 'Name'],
    ['email', 'Email'], ['phone', 'Phone'], ['company', 'Company'], ['serviceCategory', 'Service'],
    ['subject', 'Subject'], ['budget', 'Budget'], ['timeline', 'Timeline'], ['message', 'Message'],
    ['assignedTo', 'Assigned to'], ['archived', 'Archived'],
  ];
  const esc = (v) => {
    let s = v === undefined || v === null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // prevent spreadsheet formula injection
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [cols.map(([, h]) => esc(h)).join(',')];
  for (const r of records) lines.push(cols.map(([k]) => esc(r[k])).join(','));
  return `﻿${lines.join('\r\n')}`;
}
