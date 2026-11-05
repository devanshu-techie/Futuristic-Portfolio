// Admin dashboard (vanilla ES module). Talks to /api/admin/*.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let view = $('[data-view]');
const titleEl = $('[data-title]');
const fmtDate = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const fmtDay = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>', trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>', download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  back: '<path d="m15 18-6-6 6-6"/>', mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  wa: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>', up: '<path d="m18 15-6-6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>', eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  clip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
};
const ic = (n, s = 16) => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

// ---------- Helpers ----------
let toastTimer;
function toast(msg, err = false) {
  const t = $('[data-toast]');
  t.textContent = msg; t.classList.toggle('is-err', err); t.classList.add('is-on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-on'), 3800);
}
async function api(path, { method = 'GET', body, raw = false, form } = {}) {
  const opts = { method, credentials: 'same-origin', headers: { accept: 'application/json' } };
  if (form) opts.body = form;
  else if (body !== undefined) { opts.body = JSON.stringify(body); opts.headers['content-type'] = 'application/json'; }
  const res = await fetch(`/api/admin/${path}`, opts);
  if (res.status === 401) { location.href = '/admin/login'; throw new Error('Signed out'); }
  if (raw) { if (!res.ok) throw new Error('Request failed'); return res; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
function confirmDialog(title, text, okLabel = 'Confirm') {
  const d = $('[data-dialog]');
  $('[data-dialog-title]', d).textContent = title;
  $('[data-dialog-text]', d).textContent = text;
  $('[data-dialog-ok]', d).textContent = okLabel;
  d.returnValue = '';
  d.showModal();
  return new Promise((resolve) => d.addEventListener('close', () => resolve(d.returnValue === 'ok'), { once: true }));
}
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const statusClass = (s) => `st-${String(s).toLowerCase().replace(/\s+/g, '-')}`;
const pill = (s) => `<span class="pill ${statusClass(s)}">${esc(s)}</span>`;
const waNum = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length === 10 ? `91${d}` : d; };

// ---------- State ----------
const state = { meta: null, content: null, working: null, dirty: false, enquiries: null, filters: { q: '', cat: '', status: '', from: '', to: '', archived: false }, selected: new Set() };
function setDirty(on) {
  state.dirty = on;
  const bar = $('[data-savebar]');
  if (bar) bar.classList.toggle('is-on', on);
}
window.addEventListener('beforeunload', (ev) => { if (state.dirty) { ev.preventDefault(); ev.returnValue = ''; } });

async function loadContent(force = false) {
  if (!state.content || force) {
    state.content = (await api('content')).content;
  }
  state.working = structuredClone(state.content);
  setDirty(false);
}
async function saveContent() {
  const btn = $('[data-save]');
  btn?.setAttribute('aria-busy', 'true');
  try {
    const { content } = await api('content', { method: 'PUT', body: { content: state.working } });
    state.content = content;
    state.working = structuredClone(content);
    setDirty(false);
    toast('Saved. The website updates within a minute.');
    route();
  } catch (err) { toast(err.message, true); } finally { btn?.removeAttribute('aria-busy'); }
}

// ---------- Router ----------
const TITLES = { dashboard: 'Dashboard', enquiries: 'Enquiries', services: 'Services', projects: 'Projects', testimonials: 'Testimonials', faqs: 'FAQs', content: 'Website content', settings: 'Settings' };
async function route() {
  const [, , section = 'dashboard', id] = location.pathname.split('/');
  $$('[data-nav]').forEach((a) => a.classList.toggle('is-on', a.dataset.nav === section));
  titleEl.textContent = id ? id : TITLES[section] || 'Admin';
  document.title = `${titleEl.textContent} | Admin`;
  $('.adm')?.classList.remove('side-open');
  const fresh = view.cloneNode(false); // drop listeners from the previous view
  view.replaceWith(fresh);
  view = fresh;
  view.innerHTML = '<div class="adm-loading"><span class="spinner"></span> Loading…</div>';
  try {
    if (section === 'dashboard') await renderDashboard();
    else if (section === 'enquiries' && id) await renderEnquiry(id);
    else if (section === 'enquiries') await renderEnquiries();
    else if (['services', 'projects', 'testimonials', 'faqs'].includes(section)) await renderList(section);
    else if (section === 'content') await renderContent();
    else if (section === 'settings') await renderSettings();
    else view.innerHTML = '<p class="muted">Page not found.</p>';
  } catch (err) {
    if (err.message !== 'Signed out') view.innerHTML = `<div class="adm-empty"><p>${esc(err.message)}</p><button class="btn btn-ghost" data-retry>${ic('refresh')} Try again</button></div>`;
    $('[data-retry]')?.addEventListener('click', route);
  }
  view.focus?.({ preventScroll: true });
}
async function navigate(href) {
  if (state.dirty && !(await confirmDialog('Discard unsaved changes?', 'You have changes that are not saved yet.', 'Discard'))) return;
  setDirty(false);
  const go = () => { history.pushState({}, '', href); return route(); };
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(go); else go();
}
document.addEventListener('click', (ev) => {
  const a = ev.target.closest('a[href^="/admin/"]');
  if (!a || a.target === '_blank' || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
  ev.preventDefault();
  navigate(a.getAttribute('href'));
});
window.addEventListener('popstate', route);

// ---------- Dashboard ----------
function barChart(points) {
  const max = Math.max(1, ...points.map((p) => p.count));
  const w = 600; const h = 160; const bw = w / points.length;
  const bars = points.map((p, i) => {
    const bh = Math.max(p.count ? 4 : 1, (p.count / max) * (h - 24));
    return `<g><rect x="${i * bw + 2}" y="${h - bh}" width="${bw - 4}" height="${bh}" rx="3" class="${p.count ? 'bar' : 'bar-0'}"><title>${esc(fmtDay(p.date))}: ${p.count}</title></rect></g>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h + 20}" class="chart" role="img" aria-label="Enquiries per day, last 30 days">${bars}
    <text x="0" y="${h + 16}" class="axis">${esc(fmtDay(points[0].date))}</text><text x="${w}" y="${h + 16}" class="axis" text-anchor="end">Today</text></svg>`;
}
function hbars(obj) {
  const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return '<p class="muted">No data yet.</p>';
  const max = Math.max(...entries.map(([, v]) => v));
  return `<ul class="hbars">${entries.map(([k, v]) => `<li><span>${esc(k)}</span><b style="--w:${(v / max) * 100}%"></b><em>${v}</em></li>`).join('')}</ul>`;
}
function integrationCards(meta) {
  const storage = { blob: ['ok', 'Storage connected', 'Enquiries and content are saved in Vercel Blob, encrypted.'], fs: ['ok', 'Local storage', 'Development mode: data is saved on this computer.'], none: ['warn', 'Storage not connected', 'Enquiries are emailed but not saved, and content edits cannot be saved. Connect a Vercel Blob store to this project.'] }[meta.storage];
  const email = { resend: ['ok', 'Email via Resend', 'Admin notifications and customer confirmations are sent from your domain.'], smtp: ['ok', 'Email via SMTP', 'Notifications and confirmations are sent from your mailbox.'], formsubmit: ['warn', 'Email via FormSubmit', 'Works without setup, but the first email needs a one-time activation click in your inbox. For branded emails add RESEND_API_KEY or a Gmail app password.'], none: ['bad', 'Email not configured', 'No email will be sent. Configure an email provider.'] }[meta.email];
  return [storage, email].map(([lvl, t, b]) => `<div class="intg intg-${lvl}"><span class="intg-dot"></span><div><strong>${esc(t)}</strong><p>${esc(b)}</p></div></div>`).join('');
}
async function renderDashboard() {
  const s = await api('stats');
  const tiles = [['Total enquiries', s.total, ''], ['New', s.new, 'st-new'], ['Unread', s.unread, 'st-unread'], ['In progress', s.inProgress, 'st-in-progress'], ['Completed', s.completed, 'st-completed']];
  view.innerHTML = `
  <div class="tiles">${tiles.map(([l, v, c]) => `<a class="tile ${c}" href="/admin/enquiries"><span>${esc(l)}</span><strong>${v}</strong></a>`).join('')}</div>
  <div class="adm-grid">
    <section class="panel span-2"><header><h2>Enquiries, last 30 days</h2></header>${barChart(s.trend)}</section>
    <section class="panel"><header><h2>By service</h2></header>${hbars(s.byService)}</section>
    <section class="panel span-2"><header><h2>Recent enquiries</h2><a class="btn btn-text btn-sm" href="/admin/enquiries">View all</a></header>
      ${s.recent.length ? `<ul class="recent">${s.recent.map((e) => `<li><a href="/admin/enquiries/${esc(e.ref)}">${e.read ? '' : '<i class="unread" title="Unread"></i>'}<span><strong>${esc(e.fullName)}</strong><small>${esc(e.serviceCategory)} — ${esc(e.subject)}</small></span>${pill(e.status)}<time>${esc(fmtDay(e.createdAt))}</time></a></li>`).join('')}</ul>`
        : '<div class="adm-empty"><p>No enquiries yet. They will appear here the moment someone submits the contact form.</p><a class="btn btn-ghost btn-sm" href="/contact" target="_blank">Open the contact form</a></div>'}
    </section>
    <section class="panel"><header><h2>By status</h2></header>${hbars(s.byStatus)}</section>
    <section class="panel span-3"><header><h2>Integrations</h2><a class="btn btn-text btn-sm" href="/admin/settings">Settings</a></header><div class="intgs">${integrationCards(state.meta)}</div></section>
  </div>`;
  updateBadge(s.new);
}
function updateBadge(n) {
  const b = $('[data-new-badge]');
  if (!b) return;
  b.textContent = n; b.hidden = !n;
}

// ---------- Enquiries list ----------
async function renderEnquiries() {
  state.enquiries = (await api('enquiries')).enquiries;
  state.selected.clear();
  const f = state.filters;
  view.innerHTML = `
  <div class="toolbar">
    <label class="tb-search"><span class="sr-only">Search</span><input type="search" placeholder="Search name, email, reference, message…" value="${esc(f.q)}" data-f="q"></label>
    <select data-f="cat" aria-label="Service"><option value="">All services</option>${state.meta.serviceCategories.map((c) => `<option${f.cat === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>
    <select data-f="status" aria-label="Status"><option value="">All statuses</option>${state.meta.statuses.map((c) => `<option${f.status === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>
    <label class="tb-date">From <input type="date" value="${esc(f.from)}" data-f="from"></label>
    <label class="tb-date">To <input type="date" value="${esc(f.to)}" data-f="to"></label>
    <label class="tb-check"><input type="checkbox" data-f="archived"${f.archived ? ' checked' : ''}> Show archived</label>
  </div>
  <div class="bulk" data-bulk>
    <span data-count></span>
    <button class="btn btn-ghost btn-sm" data-act="read">${ic('check')} Mark read</button>
    <button class="btn btn-ghost btn-sm" data-act="archive">${ic('archive')} Archive</button>
    <button class="btn btn-ghost btn-sm" data-act="export">${ic('download')} Export CSV</button>
  </div>
  <div class="table-wrap"><table class="tbl"><thead><tr>
    <th class="c-check"><input type="checkbox" data-all aria-label="Select all"></th><th>Enquiry</th><th>Service</th><th>Status</th><th>Received</th></tr></thead>
    <tbody data-rows></tbody></table></div>
  <p class="adm-empty" data-none hidden>No enquiries match these filters.</p>`;
  const rows = $('[data-rows]');
  const filtered = () => state.enquiries.filter((e) => {
    if (!f.archived && e.archived) return false;
    if (f.cat && e.serviceCategory !== f.cat) return false;
    if (f.status && e.status !== f.status) return false;
    const day = e.createdAt.slice(0, 10);
    if (f.from && day < f.from) return false;
    if (f.to && day > f.to) return false;
    if (f.q) {
      const hay = `${e.ref} ${e.fullName} ${e.email} ${e.phone} ${e.company} ${e.subject} ${e.message}`.toLowerCase();
      if (!hay.includes(f.q.toLowerCase())) return false;
    }
    return true;
  });
  const paint = () => {
    const list = filtered();
    rows.innerHTML = list.map((e) => `<tr class="${e.read ? '' : 'is-unread'}${e.archived ? ' is-archived' : ''}" data-ref="${esc(e.ref)}">
      <td class="c-check"><input type="checkbox" data-sel="${esc(e.ref)}"${state.selected.has(e.ref) ? ' checked' : ''} aria-label="Select ${esc(e.ref)}"></td>
      <td><a href="/admin/enquiries/${esc(e.ref)}" class="row-link"><strong>${e.read ? '' : '<i class="unread"></i>'}${esc(e.fullName)}</strong><small>${esc(e.subject)}</small><small class="mono">${esc(e.ref)}${e.attachment ? ` ${ic('clip', 12)}` : ''}</small></a></td>
      <td>${esc(e.serviceCategory)}</td><td>${pill(e.status)}${e.archived ? ' <span class="pill">Archived</span>' : ''}</td><td><time>${esc(fmtDate(e.createdAt))}</time></td></tr>`).join('');
    $('[data-none]').hidden = list.length > 0;
    const n = state.selected.size;
    $('[data-bulk]').classList.toggle('is-on', n > 0);
    $('[data-count]').textContent = n ? `${n} selected` : '';
    $('[data-all]').checked = list.length > 0 && list.every((e) => state.selected.has(e.ref));
  };
  view.addEventListener('input', (ev) => {
    const k = ev.target.dataset.f;
    if (!k) return;
    f[k] = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
    paint();
  });
  rows.addEventListener('change', (ev) => {
    const r = ev.target.dataset.sel;
    if (!r) return;
    if (ev.target.checked) state.selected.add(r); else state.selected.delete(r);
    paint();
  });
  $('[data-all]').addEventListener('change', (ev) => {
    filtered().forEach((e) => (ev.target.checked ? state.selected.add(e.ref) : state.selected.delete(e.ref)));
    paint();
  });
  rows.addEventListener('click', (ev) => {
    if (ev.target.closest('input, a')) return;
    const tr = ev.target.closest('tr[data-ref]');
    if (tr) navigate(`/admin/enquiries/${tr.dataset.ref}`);
  });
  $('[data-bulk]').addEventListener('click', async (ev) => {
    const act = ev.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    const refs = [...state.selected];
    try {
      if (act === 'export') {
        const res = await api('enquiries/export', { method: 'POST', body: { refs }, raw: true });
        download(await res.blob(), `enquiries-${new Date().toISOString().slice(0, 10)}.csv`);
        return;
      }
      const patch = act === 'read' ? { read: true } : { archived: true };
      await Promise.all(refs.map((r) => api(`enquiries/${r}`, { method: 'PATCH', body: patch })));
      toast(act === 'read' ? 'Marked as read.' : 'Archived.'); route(); return;
    } catch (err) { toast(err.message, true); }
  });
  paint();
}

// ---------- Enquiry detail ----------
async function renderEnquiry(ref) {
  let { enquiry: e } = await api(`enquiries/${encodeURIComponent(ref)}`);
  if (!e.read) { api(`enquiries/${ref}`, { method: 'PATCH', body: { read: true } }).then((r) => { e = r.enquiry; }).catch(() => {}); }
  const draw = () => {
    const extras = Object.entries(e.extra || {});
    view.innerHTML = `
    <a class="back" href="/admin/enquiries">${ic('back')} All enquiries</a>
    <div class="enq-head">
      <div><h2>${esc(e.subject)}</h2><p class="muted">${esc(e.serviceCategory)} — received ${esc(fmtDate(e.createdAt))}${e.page ? ` from ${esc(e.page)}` : ''}</p></div>
      <label class="status-select">Status <select data-status>${state.meta.statuses.map((s) => `<option${s === e.status ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
    </div>
    <div class="quick">
      <a class="btn btn-primary btn-sm" href="mailto:${esc(e.email)}?subject=${encodeURIComponent(`Re: ${e.subject} (${e.ref})`)}">${ic('mail')} Reply by email</a>
      ${e.phone ? `<a class="btn btn-ghost btn-sm" href="https://wa.me/${waNum(e.phone)}?text=${encodeURIComponent(`Hi ${e.fullName.split(' ')[0]}, thank you for your enquiry (${e.ref}) about "${e.subject}".`)}" target="_blank" rel="noopener">${ic('wa')} WhatsApp</a><a class="btn btn-ghost btn-sm" href="tel:${esc(e.phone)}">${ic('phone')} Call</a>` : ''}
      ${e.attachment ? `<button class="btn btn-ghost btn-sm" data-att>${ic('download')} ${esc(e.attachment.name)} (${(e.attachment.size / 1024).toFixed(0)} KB)</button>` : ''}
    </div>
    <div class="adm-grid">
      <section class="panel span-2">
        <header><h2>Requirement</h2></header>
        <p class="pre">${esc(e.message)}</p>
        ${extras.length ? `<dl class="kv">${extras.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
      </section>
      <section class="panel">
        <header><h2>Contact</h2></header>
        <dl class="kv kv-1">
          <div><dt>Name</dt><dd>${esc(e.fullName)}</dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${esc(e.email)}">${esc(e.email)}</a></dd></div>
          <div><dt>Phone</dt><dd>${e.phone ? esc(e.phone) : '—'}</dd></div>
          <div><dt>Company</dt><dd>${esc(e.company || '—')}</dd></div>
          <div><dt>Budget</dt><dd>${esc(e.budget || '—')}</dd></div>
          <div><dt>Timeline</dt><dd>${esc(e.timeline || '—')}</dd></div>
          <div><dt>Prefers</dt><dd>${esc(e.preferredContact || '—')}</dd></div>
          <div><dt>Reference</dt><dd class="mono">${esc(e.ref)}</dd></div>
        </dl>
        <label class="field"><span>Assigned to</span><input data-assign value="${esc(e.assignedTo || '')}" placeholder="Team member name"></label>
      </section>
      <section class="panel span-2">
        <header><h2>Internal notes</h2></header>
        <form class="note-form" data-note><label class="sr-only" for="note">Add a note</label><textarea id="note" rows="3" placeholder="Call summary, quote sent, next step… (only visible to admins)"></textarea><button class="btn btn-ghost btn-sm" type="submit">${ic('plus')} Add note</button></form>
        ${e.notes.length ? `<ul class="notes">${[...e.notes].reverse().map((n) => `<li><p class="pre">${esc(n.body)}</p><small>${esc(n.by)} — ${esc(fmtDate(n.at))}</small><button class="icon-btn sm" data-del-note="${esc(n.id)}" aria-label="Delete note">${ic('trash', 14)}</button></li>`).join('')}</ul>` : '<p class="muted">No notes yet.</p>'}
      </section>
      <section class="panel">
        <header><h2>History</h2></header>
        <ol class="hist">${[...e.history].reverse().map((h) => `<li>${pill(h.status)}<small>${esc(fmtDate(h.at))} — ${esc(h.by)}</small></li>`).join('')}</ol>
      </section>
    </div>
    <div class="danger-row">
      <button class="btn btn-ghost btn-sm" data-unread>${ic('eye')} Mark as unread</button>
      <button class="btn btn-ghost btn-sm" data-archive>${ic('archive')} ${e.archived ? 'Unarchive' : 'Archive'}</button>
      <button class="btn btn-ghost btn-sm" data-export>${ic('download')} Export CSV</button>
      <button class="btn btn-danger btn-sm" data-delete>${ic('trash')} Delete permanently</button>
    </div>`;
    bind();
  };
  const patch = async (body, msg) => {
    try { e = (await api(`enquiries/${e.ref}`, { method: 'PATCH', body })).enquiry; if (msg) toast(msg); draw(); } catch (err) { toast(err.message, true); }
  };
  const bind = () => {
    $('[data-status]').addEventListener('change', (ev) => patch({ status: ev.target.value }, `Status changed to ${ev.target.value}.`));
    $('[data-assign]').addEventListener('change', (ev) => patch({ assignedTo: ev.target.value }, 'Assignment saved.'));
    $('[data-note]').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const v = ev.target.querySelector('textarea').value.trim();
      if (v) patch({ note: v }, 'Note added.');
    });
    $$('[data-del-note]').forEach((b) => b.addEventListener('click', async () => {
      if (await confirmDialog('Delete this note?', 'This cannot be undone.', 'Delete')) patch({ deleteNote: b.dataset.delNote }, 'Note deleted.');
    }));
    $('[data-unread]').addEventListener('click', () => patch({ read: false }, 'Marked as unread.'));
    $('[data-archive]').addEventListener('click', () => patch({ archived: !e.archived }, e.archived ? 'Moved back to inbox.' : 'Archived.'));
    $('[data-export]').addEventListener('click', async () => {
      const res = await api('enquiries/export', { method: 'POST', body: { refs: [e.ref] }, raw: true });
      download(await res.blob(), `${e.ref}.csv`);
    });
    $('[data-att]')?.addEventListener('click', async () => {
      try { const res = await api(`enquiries/${e.ref}/attachment`, { raw: true }); download(await res.blob(), e.attachment.name); } catch (err) { toast(err.message, true); }
    });
    $('[data-delete]').addEventListener('click', async () => {
      if (!(await confirmDialog(`Delete ${e.ref}?`, 'The enquiry, its notes and its attachment will be permanently deleted. This cannot be undone.', 'Delete permanently'))) return;
      try { await api(`enquiries/${e.ref}`, { method: 'DELETE' }); toast('Enquiry deleted.'); navigate('/admin/enquiries'); } catch (err) { toast(err.message, true); }
    });
  };
  draw();
}

// ---------- Generic content editors ----------
const HUES = ['violet', 'blue', 'green', 'amber', 'rose'];
const SVC_ICONS = ['megaphone', 'globe', 'smartphone', 'briefcase', 'palette', 'sparkles'];
const SCHEMAS = {
  services: {
    title: (x) => x.title, sub: (x) => `/services/${x.slug}${x.visible ? '' : ' — hidden'}`, blank: () => ({ slug: '', title: 'New service', shortTitle: '', icon: 'sparkles', hue: 'violet', visible: false, order: 99, category: 'Other', summary: '', intro: '', features: [], cta: 'Learn more', sections: [] }),
    fields: [
      ['title', 'Title', 'text'], ['shortTitle', 'Short name (menus)', 'text'], ['slug', 'URL slug', 'text', 'Changing this changes the page address.'],
      ['summary', 'Summary (cards & search results)', 'textarea'], ['intro', 'Page introduction', 'textarea'],
      ['features', 'Features (one per line)', 'lines'], ['cta', 'Button text', 'text'],
      ['icon', 'Icon', 'select', SVC_ICONS], ['hue', 'Colour', 'select', HUES], ['order', 'Order', 'number'], ['visible', 'Show on website', 'toggle'],
      ['sections', 'Detailed sections', 'sections'],
    ],
  },
  projects: {
    title: (x) => x.title, sub: (x) => `${x.category} — ${x.published ? 'published' : 'draft'}`, blank: () => ({ id: '', slug: '', title: 'New project', client: '', category: state.meta.projectCategories[0], summary: '', challenge: '', solution: '', result: '', tech: [], image: '', imageAlt: '', gallery: [], url: '', status: 'Completed', published: false, featured: false, order: 99 }),
    fields: [
      ['title', 'Project title', 'text'], ['client', 'Client', 'text'], ['slug', 'URL slug', 'text', 'Leave blank to generate from the title.'],
      ['category', 'Category', 'select', () => state.meta.projectCategories], ['status', 'Status', 'select', ['Completed', 'Ongoing', 'Concept']],
      ['summary', 'Summary', 'textarea'], ['challenge', 'The challenge', 'textarea'], ['solution', 'What we did', 'textarea'], ['result', 'The outcome (only real, verifiable results)', 'textarea'],
      ['tech', 'Work included / technologies (one per line)', 'lines'], ['image', 'Cover image', 'image'], ['imageAlt', 'Image description (for accessibility)', 'text'],
      ['gallery', 'Gallery image URLs (one per line)', 'lines'], ['url', 'Live project link', 'text'], ['order', 'Order', 'number'],
      ['published', 'Published', 'toggle'], ['featured', 'Feature on homepage', 'toggle'],
    ],
  },
  testimonials: {
    title: (x) => x.name || 'New testimonial', sub: (x) => `${x.company || ''} — ${x.approved ? 'approved' : 'not approved'}`, blank: () => ({ id: '', name: '', company: '', feedback: '', category: '', image: '', approved: false, order: 99 }),
    note: 'Only add testimonials a real client has given you. Unapproved testimonials are never shown on the website.',
    fields: [['name', 'Client name', 'text'], ['company', 'Company or organisation', 'text'], ['feedback', 'Feedback', 'textarea'], ['category', 'Project category', 'text'], ['image', 'Client photo (optional)', 'image'], ['order', 'Order', 'number'], ['approved', 'Approved to publish', 'toggle']],
  },
  faqs: {
    title: (x) => x.q || 'New question', sub: (x) => x.category || '', blank: () => ({ id: '', category: 'General', q: '', a: '' }),
    fields: [['q', 'Question', 'text'], ['a', 'Answer', 'textarea'], ['category', 'Topic', 'text']],
  },
};

function fieldHtml(path, [key, label, type, extra, ], val) {
  const id = `f-${path}-${key}`.replace(/[^\w-]/g, '_');
  const name = `${path}.${key}`;
  const hint = typeof extra === 'string' ? `<small class="hint">${esc(extra)}</small>` : '';
  if (type === 'toggle') return `<label class="toggle"><input type="checkbox" data-bind="${esc(name)}"${val ? ' checked' : ''}><span></span>${esc(label)}</label>`;
  if (type === 'textarea') return `<label class="field" for="${id}"><span>${esc(label)}</span><textarea id="${id}" rows="4" data-bind="${esc(name)}">${esc(val)}</textarea>${hint}</label>`;
  if (type === 'lines') return `<label class="field" for="${id}"><span>${esc(label)}</span><textarea id="${id}" rows="4" data-bind="${esc(name)}" data-lines>${esc((val || []).join('\n'))}</textarea>${hint}</label>`;
  if (type === 'number') return `<label class="field sm" for="${id}"><span>${esc(label)}</span><input id="${id}" type="number" data-bind="${esc(name)}" value="${esc(val)}" data-num></label>`;
  if (type === 'select') {
    const opts = typeof extra === 'function' ? extra() : extra;
    return `<label class="field" for="${id}"><span>${esc(label)}</span><select id="${id}" data-bind="${esc(name)}">${opts.map((o) => `<option${o === val ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
  }
  if (type === 'image') {
    return `<div class="field img-field"><span>${esc(label)}</span><div class="img-row">${val ? `<img src="${esc(val)}" alt="">` : '<div class="img-ph">No image</div>'}
      <div><input type="text" id="${id}" data-bind="${esc(name)}" value="${esc(val)}" placeholder="/assets/… or https://…" aria-label="${esc(label)} URL">
      <label class="btn btn-ghost btn-sm upl">${ic('upload')} Upload image<input type="file" accept="image/png,image/jpeg,image/webp" data-upload="${esc(name)}" hidden></label></div></div></div>`;
  }
  return `<label class="field" for="${id}"><span>${esc(label)}</span><input id="${id}" type="text" data-bind="${esc(name)}" value="${esc(val)}">${hint}</label>`;
}

function getPath(obj, path) { return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj); }
function setPath(obj, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => o[k], obj);
  target[last] = value;
}
function bindInputs(root) {
  root.addEventListener('input', (ev) => {
    const el = ev.target.closest('[data-bind]');
    if (!el) return;
    let v = el.type === 'checkbox' ? el.checked : el.value;
    if (el.hasAttribute('data-lines')) v = el.value.split('\n').map((s) => s.trim()).filter(Boolean);
    if (el.hasAttribute('data-num')) v = Number(el.value || 0);
    setPath(state.working, el.dataset.bind, v);
    setDirty(true);
  });
  root.addEventListener('change', async (ev) => {
    const up = ev.target.closest('[data-upload]');
    if (!up || !up.files[0]) return;
    const fd = new FormData();
    fd.append('file', up.files[0]);
    up.closest('.upl').setAttribute('aria-busy', 'true');
    try {
      const { url } = await api('upload', { method: 'POST', form: fd });
      setPath(state.working, up.dataset.upload, url);
      setDirty(true);
      const row = up.closest('.img-row');
      const input = row.querySelector('input[type="text"]');
      input.value = url;
      const img = row.querySelector('img') || Object.assign(document.createElement('img'), { alt: '' });
      img.src = url;
      row.querySelector('.img-ph')?.replaceWith(img);
      toast('Image uploaded. Save to publish it.');
    } catch (err) { toast(err.message, true); } finally { up.closest('.upl').removeAttribute('aria-busy'); up.value = ''; }
  });
}
const saveBar = () => `<div class="savebar" data-savebar><span>You have unsaved changes</span><button class="btn btn-ghost btn-sm" data-discard>Discard</button><button class="btn btn-primary btn-sm" data-save>${ic('save')} Save changes</button></div>`;
function bindSave() {
  $('[data-save]')?.addEventListener('click', saveContent);
  $('[data-discard]')?.addEventListener('click', () => { state.working = structuredClone(state.content); setDirty(false); route(); });
}

function sectionsEditor(path, list) {
  return `<div class="field"><span>Detailed sections</span><div class="subitems">${(list || []).map((s, i) => `<div class="subitem">
    <input type="text" data-bind="${path}.sections.${i}.title" value="${esc(s.title)}" placeholder="Title" aria-label="Section title">
    <textarea rows="2" data-bind="${path}.sections.${i}.body" placeholder="What it includes" aria-label="Section text">${esc(s.body)}</textarea>
    <input type="text" data-bind="${path}.sections.${i}.idealFor" value="${esc(s.idealFor || '')}" placeholder="Ideal for (optional)" aria-label="Ideal for">
    <button type="button" class="icon-btn sm" data-sub-del="${path}.sections" data-i="${i}" aria-label="Remove section">${ic('trash', 14)}</button></div>`).join('')}</div>
    <button type="button" class="btn btn-text btn-sm" data-sub-add="${path}.sections">${ic('plus')} Add section</button></div>`;
}

async function renderList(kind) {
  await loadContent(!state.content);
  const schema = SCHEMAS[kind];
  const draw = (openIndex = -1) => {
    const items = state.working[kind];
    view.innerHTML = `
    ${schema.note ? `<p class="note-box">${esc(schema.note)}</p>` : ''}
    <div class="list-head"><p class="muted">${items.length} item${items.length === 1 ? '' : 's'}. Drag order with the arrows; changes go live after you save.</p>
      <button class="btn btn-primary btn-sm" data-add>${ic('plus')} Add ${esc(kind === 'faqs' ? 'question' : kind.slice(0, -1))}</button></div>
    ${items.length ? '' : `<div class="adm-empty"><p>Nothing here yet.</p></div>`}
    <div class="items">${items.map((it, i) => `<details class="item"${i === openIndex ? ' open' : ''}>
      <summary><span class="item-t"><strong>${esc(schema.title(it))}</strong><small>${esc(schema.sub(it))}</small></span>
        <span class="item-acts"><button type="button" class="icon-btn sm" data-move="-1" data-i="${i}" aria-label="Move up"${i === 0 ? ' disabled' : ''}>${ic('up', 14)}</button>
        <button type="button" class="icon-btn sm" data-move="1" data-i="${i}" aria-label="Move down"${i === items.length - 1 ? ' disabled' : ''}>${ic('down', 14)}</button>
        <button type="button" class="icon-btn sm danger" data-del="${i}" aria-label="Delete">${ic('trash', 14)}</button></span></summary>
      <div class="item-body">${schema.fields.map((f) => (f[2] === 'sections' ? sectionsEditor(`${kind}.${i}`, it.sections) : fieldHtml(`${kind}.${i}`, f, it[f[0]]))).join('')}
        ${kind === 'projects' && it.slug ? `<a class="btn btn-text btn-sm" href="/work/${esc(it.slug)}" target="_blank" rel="noopener">${ic('ext')} View page</a>` : ''}
        ${kind === 'services' && it.slug ? `<a class="btn btn-text btn-sm" href="/services/${esc(it.slug)}" target="_blank" rel="noopener">${ic('ext')} View page</a>` : ''}
      </div></details>`).join('')}</div>
    ${saveBar()}`;
    setDirty(state.dirty);
    bindSave();
    $('[data-add]').addEventListener('click', () => { state.working[kind].unshift(schema.blank()); setDirty(true); draw(0); });
    view.querySelector('.items').addEventListener('click', async (ev) => {
      const mv = ev.target.closest('[data-move]');
      const del = ev.target.closest('[data-del]');
      const sa = ev.target.closest('[data-sub-add]');
      const sd = ev.target.closest('[data-sub-del]');
      if (mv) {
        ev.preventDefault();
        const i = Number(mv.dataset.i); const j = i + Number(mv.dataset.move);
        const arr = state.working[kind];
        [arr[i], arr[j]] = [arr[j], arr[i]];
        arr.forEach((x, k) => { if ('order' in x) x.order = k + 1; });
        setDirty(true); draw(j);
      } else if (del) {
        ev.preventDefault();
        const i = Number(del.dataset.del);
        if (await confirmDialog('Delete this item?', 'It will be removed from the website when you save.', 'Delete')) { state.working[kind].splice(i, 1); setDirty(true); draw(); }
      } else if (sa) {
        const list = getPath(state.working, sa.dataset.subAdd);
        list.push({ title: '', body: '', idealFor: '' });
        setDirty(true); draw(Number(sa.dataset.subAdd.split('.')[1]));
      } else if (sd) {
        getPath(state.working, sd.dataset.subDel).splice(Number(sd.dataset.i), 1);
        setDirty(true); draw(Number(sd.dataset.subDel.split('.')[1]));
      }
    });
  };
  bindInputs(view);
  draw();
}

// ---------- Website content ----------
async function renderContent() {
  await loadContent(!state.content);
  const w = state.working;
  view.innerHTML = `
  <div class="adm-grid">
    <section class="panel span-3"><header><h2>Homepage hero</h2><a class="btn btn-text btn-sm" href="/" target="_blank">${ic('ext')} View</a></header>
      ${fieldHtml('hero', ['headline', 'Headline', 'text'], w.hero.headline)}${fieldHtml('hero', ['subhead', 'Supporting text', 'textarea'], w.hero.subhead)}
      <div class="cols-2">${fieldHtml('hero', ['primaryCta', 'Primary button', 'text'], w.hero.primaryCta)}${fieldHtml('hero', ['secondaryCta', 'Secondary button', 'text'], w.hero.secondaryCta)}</div></section>
    <section class="panel span-3"><header><h2>Final call to action</h2></header>
      ${fieldHtml('finalCta', ['headline', 'Headline', 'text'], w.finalCta.headline)}${fieldHtml('finalCta', ['text', 'Supporting text', 'textarea'], w.finalCta.text)}</section>
    <section class="panel span-3"><header><h2>About page</h2><a class="btn btn-text btn-sm" href="/about" target="_blank">${ic('ext')} View</a></header>
      ${fieldHtml('about', ['intro', 'Introduction', 'textarea'], w.about.intro)}${fieldHtml('about', ['founder', 'Who we are', 'textarea'], w.about.founder)}
      <div class="cols-3">${w.about.values.map((v, i) => `<div class="subitem">${fieldHtml(`about.values.${i}`, ['title', `Value ${i + 1}`, 'text'], v.title)}${fieldHtml(`about.values.${i}`, ['body', 'Text', 'textarea'], v.body)}</div>`).join('')}</div></section>
    <section class="panel span-3"><header><h2>Announcement bar</h2></header>
      ${fieldHtml('settings.announcement', ['enabled', 'Show announcement bar on every page', 'toggle'], w.settings.announcement.enabled)}
      <div class="cols-2">${fieldHtml('settings.announcement', ['text', 'Text', 'text'], w.settings.announcement.text)}${fieldHtml('settings.announcement', ['link', 'Link (optional)', 'text'], w.settings.announcement.link)}</div></section>
  </div>${saveBar()}`;
  bindInputs(view); bindSave();
}

// ---------- Settings ----------
async function renderSettings() {
  await loadContent(!state.content);
  const s = state.working.settings;
  const socials = [['linkedin', 'LinkedIn'], ['instagram', 'Instagram'], ['youtube', 'YouTube'], ['facebook', 'Facebook'], ['x', 'X'], ['github', 'GitHub']];
  view.innerHTML = `
  <div class="adm-grid">
    <section class="panel span-2"><header><h2>Business details</h2></header>
      <div class="cols-2">${fieldHtml('settings', ['brand', 'Brand name', 'text'], s.brand)}${fieldHtml('settings', ['tagline', 'Tagline', 'text'], s.tagline)}</div>
      ${fieldHtml('settings', ['description', 'Short description (footer & search results)', 'textarea'], s.description)}
      <div class="cols-2">${fieldHtml('settings', ['email', 'Public email', 'text'], s.email)}${fieldHtml('settings', ['notifyEmail', 'Send enquiry notifications to', 'text'], s.notifyEmail)}
      ${fieldHtml('settings', ['phone', 'Phone (displayed)', 'text'], s.phone)}${fieldHtml('settings', ['whatsapp', 'WhatsApp number with country code (digits only)', 'text'], s.whatsapp)}
      ${fieldHtml('settings', ['workingHours', 'Working hours', 'text'], s.workingHours)}${fieldHtml('settings', ['location', 'Location / service area', 'text'], s.location)}</div>
      ${fieldHtml('settings', ['responseTime', 'Response-time promise', 'text'], s.responseTime)}
    </section>
    <section class="panel"><header><h2>Integrations</h2></header><div class="intgs col">${integrationCards(state.meta)}</div>
      <button class="btn btn-ghost btn-sm" data-test-email>${ic('mail')} Send a test email</button>
      ${fieldHtml('settings', ['gaId', 'Google Analytics 4 ID (G-XXXXXXX)', 'text', 'Visitors see a consent banner; analytics load only after they allow it.'], s.gaId)}</section>
    <section class="panel span-2"><header><h2>Social links</h2></header>
      <div class="cols-2">${socials.map(([k, l]) => fieldHtml('settings.socials', [k, l, 'text'], s.socials[k])).join('')}</div>
      <small class="hint">Leave a field empty to hide that icon.</small></section>
    <section class="panel"><header><h2>Change password</h2></header>
      <form data-pw class="stack-form">
        <label class="field"><span>Current password</span><input type="password" name="current" autocomplete="current-password" required></label>
        <label class="field"><span>New password</span><input type="password" name="next" autocomplete="new-password" minlength="10" required></label>
        <label class="field"><span>Repeat new password</span><input type="password" name="next2" autocomplete="new-password" minlength="10" required></label>
        <button class="btn btn-ghost btn-sm" type="submit">Update password</button>
        <small class="hint">Changing the password signs out every other session.</small>
      </form></section>
    <section class="panel span-3"><header><h2>Backups & version history</h2><button class="btn btn-text btn-sm" data-versions>${ic('refresh')} Load versions</button></header>
      <p class="muted">Every save keeps a backup of the whole website content. Restore any of the last 25 versions.</p><ul class="versions" data-version-list></ul></section>
  </div>${saveBar()}`;
  bindInputs(view); bindSave();
  $('[data-test-email]').addEventListener('click', async (ev) => {
    ev.currentTarget.setAttribute('aria-busy', 'true');
    try { toast((await api('test-email', { method: 'POST', body: {} })).message); } catch (err) { toast(err.message, true); } finally { ev.currentTarget?.removeAttribute('aria-busy'); }
  });
  $('[data-pw]').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = ev.target;
    if (f.next.value !== f.next2.value) { toast('The new passwords do not match.', true); return; }
    try { await api('password', { method: 'POST', body: { current: f.current.value, next: f.next.value } }); f.reset(); toast('Password updated.'); } catch (err) { toast(err.message, true); }
  });
  $('[data-versions]').addEventListener('click', async () => {
    const list = $('[data-version-list]');
    try {
      const { versions } = await api('content/versions');
      list.innerHTML = versions.length ? versions.map((v, i) => `<li><span>${esc(fmtDate(v.uploadedAt))}${i === 0 ? ' <span class="pill st-completed">Current</span>' : ''}</span>${i ? `<button class="btn btn-ghost btn-sm" data-restore="${esc(v.url)}">${ic('refresh')} Restore</button>` : ''}</li>`).join('') : '<li class="muted">No saved versions yet — the site is using the built-in defaults.</li>';
      $$('[data-restore]', list).forEach((b) => b.addEventListener('click', async () => {
        if (!(await confirmDialog('Restore this version?', 'The current content will be replaced (it stays in the history, so you can switch back).', 'Restore'))) return;
        try { state.content = (await api('content/restore', { method: 'POST', body: { url: b.dataset.restore } })).content; state.working = structuredClone(state.content); setDirty(false); toast('Version restored.'); route(); } catch (err) { toast(err.message, true); }
      }));
    } catch (err) { toast(err.message, true); }
  });
}

// ---------- Shell ----------
$('[data-logout]').addEventListener('click', async () => {
  if (state.dirty && !(await confirmDialog('Sign out with unsaved changes?', 'Your unsaved changes will be lost.', 'Sign out'))) return;
  state.dirty = false;
  await api('logout', { method: 'POST', body: {} }).catch(() => {});
  location.href = '/admin/login';
});
$('[data-side-toggle]').addEventListener('click', () => $('.adm').classList.toggle('side-open'));
$$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('dg-theme', next); } catch { /* ignore */ }
}));
document.addEventListener('keydown', (ev) => {
  if ((ev.metaKey || ev.ctrlKey) && ev.key === 's' && state.dirty) { ev.preventDefault(); saveContent(); }
});

(async function init() {
  try {
    state.meta = await api('meta');
    const banner = $('[data-banner]');
    if (state.meta.storage === 'none') {
      banner.hidden = false;
      banner.textContent = 'Storage is not connected: new enquiries are emailed but not saved here, and content changes cannot be saved. Connect a Vercel Blob store to this project to enable everything.';
    }
    await route();
    api('stats').then((s) => updateBadge(s.new)).catch(() => {});
    setInterval(() => api('stats').then((s) => updateBadge(s.new)).catch(() => {}), 60_000);
  } catch (err) {
    if (err.message !== 'Signed out') view.innerHTML = `<div class="adm-empty"><p>${esc(err.message)}</p></div>`;
  }
}());
