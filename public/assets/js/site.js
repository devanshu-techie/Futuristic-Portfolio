// Devansh Gulati — site interactions. No dependencies.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
  };

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg, isErr = false) {
    const t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg;
    t.classList.toggle('is-err', isErr);
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 4200);
  }

  // ---------- Analytics (GA4, only after consent) ----------
  const gaId = document.body.dataset.ga;
  let gaReady = false;
  function loadGa() {
    if (!gaId || gaReady) return;
    gaReady = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { anonymize_ip: true });
  }
  function track(event, params = {}) {
    if (gaReady && window.gtag) window.gtag('event', event, params);
  }
  if (gaId) {
    const choice = store.get('dg-consent');
    const banner = $('[data-consent]');
    if (choice === 'yes') loadGa();
    else if (!choice && banner) banner.hidden = false;
    $('[data-consent-yes]')?.addEventListener('click', () => { store.set('dg-consent', 'yes'); banner.hidden = true; loadGa(); });
    $('[data-consent-no]')?.addEventListener('click', () => { store.set('dg-consent', 'no'); banner.hidden = true; });
  }
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-track]');
    if (el) track(el.dataset.track, { label: el.dataset.label || el.textContent.trim().slice(0, 60), page: location.pathname });
  });
  if (location.pathname.startsWith('/services/')) track('service_view', { service: location.pathname.split('/')[2] });

  // ---------- Header ----------
  const header = $('[data-header]');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Theme ----------
  $$('[data-theme-toggle]').forEach((btn) => btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    const apply = () => { document.documentElement.dataset.theme = next; store.set('dg-theme', next); };
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply);
    else apply();
  }));

  // ---------- Mobile menu ----------
  const menu = $('[data-mobile-menu]');
  const openBtn = $('[data-menu-open]');
  let lastFocus = null;
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.classList.remove('is-open');
    menu.hidden = true;
    document.body.style.overflow = '';
    openBtn?.setAttribute('aria-expanded', 'false');
    lastFocus?.focus();
  }
  function openMenu() {
    lastFocus = document.activeElement;
    menu.hidden = false;
    $$('nav > *, .mobile-cta', menu).forEach((el, i) => el.style.setProperty('--n', i));
    requestAnimationFrame(() => menu.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    openBtn.setAttribute('aria-expanded', 'true');
    $('[data-menu-close]', menu)?.focus();
  }
  openBtn?.addEventListener('click', openMenu);
  $('[data-menu-close]')?.addEventListener('click', closeMenu);
  menu?.addEventListener('click', (ev) => { if (ev.target.closest('a')) closeMenu(); });
  menu?.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeMenu();
    if (ev.key !== 'Tab') return;
    const items = $$('a, button', menu).filter((el) => el.offsetParent !== null);
    const first = items[0]; const last = items[items.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  });
  window.matchMedia('(min-width: 1040px)').addEventListener?.('change', (m) => { if (m.matches) closeMenu(); });

  // Services dropdown: Escape closes and returns focus.
  $$('.has-menu').forEach((li) => {
    li.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') { li.querySelector('.nav-link')?.focus(); li.classList.remove('is-open'); document.activeElement.blur?.(); }
    });
  });

  // ---------- Scroll reveal ----------
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('in'));

  // ---------- Hero orbit: run only while visible, highlight nodes in turn ----------
  const orbit = $('[data-orbit]');
  if (orbit) {
    const nodes = $$('[data-node]', orbit);
    let i = 0; let timer = null;
    const tick = () => { nodes.forEach((n, k) => n.classList.toggle('is-hot', k === i)); i = (i + 1) % nodes.length; };
    const start = () => { orbit.classList.add('is-live'); if (!timer && !reduceMotion) { tick(); timer = setInterval(tick, 2600); } };
    const stop = () => { orbit.classList.remove('is-live'); clearInterval(timer); timer = null; };
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop())).observe(orbit);
    else start();
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  // ---------- Spotlight + magnetic ----------
  if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
    $$('.svc-card').forEach((card) => card.addEventListener('pointermove', (ev) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${ev.clientX - r.left}px`);
      card.style.setProperty('--my', `${ev.clientY - r.top}px`);
    }));
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (ev) => {
        const r = btn.getBoundingClientRect();
        const x = (ev.clientX - r.left - r.width / 2) * 0.18;
        const y = (ev.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  // ---------- Service finder (tabs) ----------
  const finder = $('[data-finder]');
  if (finder) {
    const tabs = $$('[role="tab"]', finder);
    const select = (tab, focus = false) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (!panel) return;
        panel.hidden = !on;
        if (on && !reduceMotion) { panel.classList.remove('is-entering'); void panel.offsetWidth; panel.classList.add('is-entering'); }
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, idx) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (ev) => {
        const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[ev.key];
        if (dir) { ev.preventDefault(); select(tabs[(idx + dir + tabs.length) % tabs.length], true); }
        if (ev.key === 'Home') { ev.preventDefault(); select(tabs[0], true); }
        if (ev.key === 'End') { ev.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
  }

  // ---------- FAQ ----------
  $$('details.faq').forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) { d.classList.remove('is-opening'); void d.offsetWidth; d.classList.add('is-opening'); }
  }));
  const faq = $('[data-faq]');
  if (faq) {
    const input = $('[data-faq-search]', faq);
    const items = $$('details.faq', faq);
    const empty = $('[data-faq-empty]', faq);
    let cat = 'all';
    const apply = () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      items.forEach((d) => {
        const ok = (cat === 'all' || d.dataset.cat === cat) && (!q || d.textContent.toLowerCase().includes(q));
        d.classList.toggle('is-hidden', !ok);
        if (ok) { shown += 1; d.classList.add('in'); }
        if (q && ok && shown <= 2) d.open = true;
      });
      empty.hidden = shown > 0;
    };
    input.addEventListener('input', apply);
    $$('[data-faq-cat]', faq).forEach((b) => b.addEventListener('click', () => {
      cat = b.dataset.faqCat;
      $$('[data-faq-cat]', faq).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      apply();
    }));
  }

  // ---------- Work filters ----------
  const filters = $('[data-filters]');
  if (filters) {
    const cards = $$('[data-filter-grid] .work-card');
    const empty = $('[data-filter-empty]');
    $$('[data-filter]', filters).forEach((b) => b.addEventListener('click', () => {
      const f = b.dataset.filter;
      $$('[data-filter]', filters).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      const run = () => {
        let shown = 0;
        cards.forEach((c) => { const ok = f === 'all' || c.dataset.cat === f; c.classList.toggle('is-hidden', !ok); if (ok) { shown += 1; c.classList.add('in'); } });
        empty.hidden = shown > 0;
      };
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(run); else run();
    }));
  }

  // ---------- Command palette ----------
  const pal = $('[data-palette]');
  if (pal && typeof pal.showModal === 'function') {
    const input = $('[data-palette-input]', pal);
    const items = $$('[data-palette-list] li', pal);
    const empty = $('[data-palette-empty]', pal);
    let active = 0;
    const visible = () => items.filter((li) => !li.hidden);
    const paint = () => { const v = visible(); v.forEach((li, k) => li.firstElementChild.classList.toggle('is-active', k === active)); v[active]?.scrollIntoView({ block: 'nearest' }); };
    const filter = () => {
      const q = input.value.trim().toLowerCase();
      items.forEach((li) => { li.hidden = q && !li.textContent.toLowerCase().includes(q); });
      active = 0; empty.hidden = visible().length > 0; paint();
    };
    const open = () => { if (pal.open) return; pal.showModal(); input.value = ''; filter(); input.focus(); };
    $$('[data-palette-open]').forEach((b) => b.addEventListener('click', open));
    document.addEventListener('keydown', (ev) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if ((ev.key === 'k' && (ev.metaKey || ev.ctrlKey)) || (ev.key === '/' && !typing)) { ev.preventDefault(); open(); }
    });
    input.addEventListener('input', filter);
    input.addEventListener('keydown', (ev) => {
      const v = visible();
      if (ev.key === 'ArrowDown') { ev.preventDefault(); active = Math.min(active + 1, v.length - 1); paint(); }
      if (ev.key === 'ArrowUp') { ev.preventDefault(); active = Math.max(active - 1, 0); paint(); }
      if (ev.key === 'Enter' && v[active]) { ev.preventDefault(); v[active].firstElementChild.click(); pal.close(); }
    });
    pal.addEventListener('click', (ev) => { if (ev.target === pal) pal.close(); });
  }

  // ---------- Enquiry forms ----------
  const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
  const TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'application/x-zip-compressed'];
  const waBase = ($('.wa-float')?.getAttribute('href') || '').split('?')[0];

  function fieldOf(form, name) {
    const el = form.querySelector(`[name="${CSS.escape(name)}"]`);
    return el?.closest('.field') || null;
  }
  function errOf(form, name) {
    return fieldOf(form, name)?.querySelector('.err') || form.querySelector(`[data-err-for="${CSS.escape(name)}"]`);
  }
  function setErr(form, name, msg) {
    const err = errOf(form, name);
    const field = fieldOf(form, name);
    const el = form.querySelector(`[name="${CSS.escape(name)}"]`);
    if (err) { err.textContent = msg || ''; err.hidden = !msg; }
    field?.classList.toggle('has-err', Boolean(msg));
    if (el && el.type !== 'radio') el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function value(form, name) {
    const el = form.querySelector(`[name="${CSS.escape(name)}"]:checked`) || form.querySelector(`[name="${CSS.escape(name)}"]:not([type="radio"])`);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked ? el.value : '';
    return (el.value || '').trim();
  }
  const RULES = {
    serviceCategory: (v) => (v ? '' : 'Choose the service you need.'),
    subject: (v) => (v.length >= 3 ? '' : 'Add a short subject for your project.'),
    message: (v) => (v.length >= 20 ? '' : `Describe your requirement in at least 20 characters (${v.length}/20).`),
    fullName: (v) => (v.length >= 2 ? '' : 'Enter your full name.'),
    email: (v) => (EMAIL.test(v) ? '' : 'Enter a valid email address, like name@example.com.'),
    phone: (v) => { const d = v.replace(/\D/g, ''); return !v || (d.length >= 10 && d.length <= 15) ? '' : 'Enter a phone number with 10 to 15 digits.'; },
    consent: (v) => (v ? '' : 'Please agree to be contacted about this enquiry.'),
    attachment: (_, form) => {
      const f = form.querySelector('[name="attachment"]')?.files?.[0];
      if (!f) return '';
      if (f.size > 4 * 1024 * 1024) return 'Attachments must be 4 MB or smaller.';
      if (f.type && !TYPES.includes(f.type)) return 'Attach a PDF, PNG, JPG, WEBP, DOCX, PPTX or ZIP file.';
      return '';
    },
  };
  const STEP_FIELDS = { 1: ['serviceCategory', 'subject'], 2: ['message', 'attachment'], 3: ['fullName', 'email', 'phone', 'consent'] };

  function validate(form, names) {
    let firstBad = null;
    names.forEach((n) => {
      if (!form.querySelector(`[name="${n}"]`)) return;
      const msg = RULES[n] ? RULES[n](value(form, n), form) : '';
      setErr(form, n, msg);
      if (msg && !firstBad) firstBad = n;
    });
    if (firstBad) {
      const el = form.querySelector(`[name="${firstBad}"]`);
      el?.focus({ preventScroll: true });
      el?.closest('.field, .consent-line')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
    return !firstBad;
  }

  $$('form[data-enquiry]').forEach((form) => {
    const steps = form.dataset.mode === 'steps';
    const success = form.nextElementSibling?.matches('[data-form-success]') ? form.nextElementSibling : null;
    const alertBox = $('[data-form-alert]', form);
    const submitBtn = $('[data-submit]', form);
    const draftKey = `dg-draft:${location.pathname}`;
    let started = false;
    let current = 1;

    // Extras follow the selected service.
    const syncExtras = () => {
      const cat = value(form, 'serviceCategory');
      $$('[data-extra-for]', form).forEach((fs) => { const on = fs.dataset.extraFor === cat; fs.hidden = !on; fs.disabled = !on; });
    };
    form.addEventListener('change', (ev) => {
      if (ev.target.name === 'serviceCategory') { syncExtras(); setErr(form, 'serviceCategory', ''); }
    });

    // Character counter
    const ta = $('[data-count]', form);
    const out = $('[data-count-out]', form);
    const count = () => { if (ta && out) out.textContent = `${ta.value.length} / ${ta.maxLength}`; };
    ta?.addEventListener('input', count);

    // File drop label
    const drop = $('[data-drop]', form);
    const fileInput = $('[name="attachment"]', form);
    fileInput?.addEventListener('change', () => {
      const f = fileInput.files[0];
      $('[data-drop-label]', drop).textContent = f ? `${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)` : 'Choose a file or drop it here';
      drop.classList.toggle('has-file', Boolean(f));
      setErr(form, 'attachment', RULES.attachment('', form));
    });
    ['dragenter', 'dragover'].forEach((t) => drop?.addEventListener(t, () => drop.classList.add('is-over')));
    ['dragleave', 'drop'].forEach((t) => drop?.addEventListener(t, () => drop.classList.remove('is-over')));

    // Live re-validation after first error
    form.addEventListener('input', (ev) => {
      const n = ev.target.name;
      if (!started) { started = true; track('contact_form_start', { page: location.pathname }); }
      if (RULES[n] && fieldOf(form, n)?.classList.contains('has-err')) setErr(form, n, RULES[n](value(form, n), form));
      if (steps) saveDraft();
    });

    // Draft autosave (contact page only, no files)
    function saveDraft() {
      const data = {};
      new FormData(form).forEach((v, k) => { if (typeof v === 'string' && !['formToken', 'website', 'page'].includes(k)) data[k] = v; });
      store.set(draftKey, JSON.stringify({ at: Date.now(), data }));
    }
    function restoreDraft() {
      const raw = store.get(draftKey);
      if (!raw) return;
      try {
        const { at, data } = JSON.parse(raw);
        if (Date.now() - at > 7 * 86400_000) { store.del(draftKey); return; }
        let restored = false;
        Object.entries(data).forEach(([k, v]) => {
          const els = form.querySelectorAll(`[name="${CSS.escape(k)}"]`);
          els.forEach((el) => {
            if (el.type === 'radio') { if (el.value === v && !form.querySelector(`[name="${CSS.escape(k)}"]:checked[data-preset]`)) { el.checked = true; } }
            else if (el.type === 'checkbox') el.checked = v === el.value;
            else if (!el.value && v) { el.value = v; restored = true; }
          });
        });
        if (restored) toast('We restored your unsent draft.');
      } catch { store.del(draftKey); }
    }

    // Steps
    const stepEls = $$('.step', form);
    const stepperItems = $$('[data-stepper] li', form);
    const bar = $('[data-progress]', form);
    const prev = $('[data-prev]', form);
    const next = $('[data-next]', form);
    function show(n, dir = 1) {
      current = n;
      stepEls.forEach((s) => {
        const on = Number(s.dataset.step) === n;
        s.classList.toggle('is-current', on);
        s.classList.toggle('from-right', on && dir > 0);
      });
      stepperItems.forEach((li, k) => { li.classList.toggle('is-active', k + 1 === n); li.classList.toggle('is-done', k + 1 < n); });
      if (bar) bar.style.width = `${(n / 3) * 100}%`;
      if (prev) prev.hidden = n === 1;
      if (next) next.hidden = n === 3;
      if (submitBtn) submitBtn.hidden = n !== 3;
    }
    if (steps) {
      restoreDraft();
      show(1);
      next?.addEventListener('click', () => {
        if (!validate(form, STEP_FIELDS[current])) return;
        show(current + 1, 1);
        stepEls[current - 1].querySelector('input, select, textarea')?.focus({ preventScroll: true });
        form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
      prev?.addEventListener('click', () => show(current - 1, -1));
      form.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' && ev.target.tagName === 'INPUT' && current < 3) { ev.preventDefault(); next.click(); }
      });
    }
    syncExtras();
    count();

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      alertBox.hidden = true;
      const all = [...STEP_FIELDS[1], ...STEP_FIELDS[2], ...STEP_FIELDS[3]];
      if (!validate(form, all)) {
        if (steps) {
          const bad = all.find((n) => fieldOf(form, n)?.classList.contains('has-err') || errOf(form, n)?.hidden === false);
          const stepNo = Number(Object.keys(STEP_FIELDS).find((k) => STEP_FIELDS[k].includes(bad)) || current);
          if (stepNo !== current) { show(stepNo, -1); validate(form, STEP_FIELDS[stepNo]); }
        }
        return;
      }
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.disabled = true;
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          if (data.fields) {
            Object.entries(data.fields).forEach(([k, m]) => setErr(form, k, m));
            if (steps) {
              const first = Object.keys(data.fields)[0];
              const stepNo = Number(Object.keys(STEP_FIELDS).find((k) => STEP_FIELDS[k].includes(first)) || 3);
              show(stepNo, -1);
            }
          }
          alertBox.textContent = data.error || 'The enquiry could not be sent. Check your connection and try again, or message us on WhatsApp.';
          alertBox.hidden = false;
          return;
        }
        if (data.notify && data.notify.url) {
          // Multipart body = "simple" CORS request (no preflight), which keepalive allows.
          const nf = new FormData();
          Object.entries(data.notify.body).forEach(([k, v]) => nf.append(k, String(v)));
          fetch(data.notify.url, { method: 'POST', headers: { accept: 'application/json' }, body: nf, keepalive: true }).catch(() => {});
        }
        track('contact_form_submit', { service: value(form, 'serviceCategory'), page: location.pathname });
        store.del(draftKey);
        if (success) {
          $('[data-ref]', success).textContent = data.ref;
          const subject = value(form, 'subject');
          $('[data-wa-followup]', success).href = `${waBase}?text=${encodeURIComponent(`Hi! I just sent an enquiry (${data.ref}) about "${subject}". Looking forward to hearing from you.`)}`;
          $('[data-track-link]', success).href = `/track?ref=${encodeURIComponent(data.ref)}`;
          const swap = () => { form.hidden = true; success.hidden = false; success.focus(); };
          if (document.startViewTransition && !reduceMotion) document.startViewTransition(swap); else swap();
          success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        }
      } catch {
        alertBox.textContent = 'You seem to be offline. Your answers are saved — try again when you are back online, or message us on WhatsApp.';
        alertBox.hidden = false;
      } finally {
        submitBtn.removeAttribute('aria-busy');
        submitBtn.disabled = false;
      }
    });
  });

  // ---------- Track enquiry ----------
  const tForm = $('[data-track-form]');
  if (tForm) {
    const result = $('[data-track-result]');
    const alertBox = $('[data-form-alert]', tForm);
    const params = new URLSearchParams(location.search);
    if (params.get('new') === '1') toast('Enquiry received. Your reference number is filled in below.');
    const FLOW = ['New', 'Contacted', 'Consultation Scheduled', 'Proposal Sent', 'In Progress', 'Completed'];
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    tForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      alertBox.hidden = true;
      const btn = $('button[type="submit"]', tForm);
      const ref = tForm.ref.value.trim().toUpperCase();
      const email = tForm.email.value.trim();
      if (!ref || !EMAIL.test(email)) { alertBox.textContent = 'Enter your reference number and a valid email address.'; alertBox.hidden = false; return; }
      btn.setAttribute('aria-busy', 'true');
      try {
        const res = await fetch('/api/track', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ ref, email }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) { alertBox.textContent = data.error || 'We could not check the status right now. Try again shortly.'; alertBox.hidden = false; result.hidden = true; return; }
        const enq = data.enquiry;
        const reached = Object.fromEntries(enq.history.map((h) => [h.status, h.at]));
        const cancelled = enq.status === 'Cancelled';
        const idx = FLOW.indexOf(enq.status);
        result.innerHTML = `<div class="track-head"><div><h2>${esc(enq.subject)}</h2><p>${esc(enq.serviceCategory)} — reference ${esc(enq.ref)}</p></div><span class="status-pill">${esc(enq.status)}</span></div>
          <ol class="track-steps" role="list">${(cancelled ? ['New', 'Cancelled'] : FLOW).map((s, k) => {
            const state = cancelled ? (s === 'Cancelled' ? 'current' : 'done') : k < idx ? 'done' : k === idx ? 'current' : 'todo';
            return `<li class="${state}"><span class="tdot">${state === 'done' ? '✓' : ''}</span><div><strong>${esc(s)}</strong><small>${reached[s] ? esc(fmt(reached[s])) : state === 'todo' ? 'Not yet' : ''}</small></div></li>`;
          }).join('')}</ol><p class="muted">Last updated ${esc(fmt(enq.updatedAt))}. Questions? Reply to your confirmation email or message us on WhatsApp.</p>`;
        result.hidden = false;
        result.focus();
      } catch {
        alertBox.textContent = 'You seem to be offline. Try again when you are back online.';
        alertBox.hidden = false;
      } finally { btn.removeAttribute('aria-busy'); }
    });
  }

  // Close dialogs/menus on bfcache restore to avoid stuck states.
  window.addEventListener('pageshow', (ev) => { if (ev.persisted) { closeMenu(); pal?.open && pal.close(); } });
})();
