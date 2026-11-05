import { e, html, asset, logoMark } from '../html.js';
import { icon } from '../icons.js';

function shell(title, body, bodyClass) {
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)} | Admin</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Manrope:wght@400..700&display=swap">
<link rel="stylesheet" href="${asset('/assets/css/site.css')}">
<link rel="stylesheet" href="${asset('/assets/css/admin.css')}">
<script src="${asset('/assets/js/theme.js')}"></script>
</head>
<body class="${bodyClass}">${body}</body></html>`;
}

export function loginPage({ notice = '', reset = '' } = {}) {
  return shell('Sign in', html`
<main class="login">
  <div class="login-bg" aria-hidden="true"><span class="orb orb-a"></span><span class="orb orb-b"></span></div>
  <div class="login-card">
    <a class="brand" href="/">${logoMark()}<span class="brand-word">Devansh Gulati</span></a>
    ${reset ? html`
    <h1>Set a new password</h1>
    <p class="muted">Use at least 10 characters with letters and numbers.</p>
    <form data-reset-form novalidate>
      <input type="hidden" name="token" value="${e(reset)}">
      <div class="field"><label for="np">New password</label><input id="np" name="password" type="password" autocomplete="new-password" required minlength="10"></div>
      <div class="field"><label for="np2">Repeat new password</label><input id="np2" name="password2" type="password" autocomplete="new-password" required minlength="10"></div>
      <div class="form-alert" role="alert" data-alert hidden></div>
      <button class="btn btn-primary btn-block" type="submit">Save password and sign in</button>
    </form>` : html`
    <h1>Admin sign in</h1>
    <p class="muted">Manage enquiries and every part of the website.</p>
    ${notice ? html`<div class="form-alert ok" role="status">${e(notice)}</div>` : ''}
    <form data-login-form novalidate>
      <div class="field"><label for="em">Email</label><input id="em" name="email" type="email" autocomplete="username" required></div>
      <div class="field"><label for="pw">Password</label>
        <div class="pw-wrap"><input id="pw" name="password" type="password" autocomplete="current-password" required>
        <button type="button" class="icon-btn" data-pw-toggle aria-label="Show password">${icon('eye', { size: 18 })}</button></div></div>
      <div class="form-alert" role="alert" data-alert hidden></div>
      <button class="btn btn-primary btn-block" type="submit">${icon('lock', { size: 16 })} Sign in</button>
    </form>
    <button class="btn btn-text btn-block" type="button" data-forgot>Forgot password?</button>`}
    <a class="back-link" href="/">${icon('arrowRight', { size: 14 })} Back to website</a>
  </div>
</main>
<script src="${asset('/assets/js/admin-login.js')}" defer></script>`, 'admin-login');
}

export function adminApp(session) {
  const nav = [
    ['dashboard', 'Dashboard', 'dashboard'], ['enquiries', 'Enquiries', 'inbox'], ['services', 'Services', 'layers'],
    ['projects', 'Projects', 'image'], ['testimonials', 'Testimonials', 'quote'], ['faqs', 'FAQs', 'help'],
    ['content', 'Website content', 'edit'], ['settings', 'Settings', 'sliders'],
  ];
  return shell('Dashboard', html`
<div class="adm" data-admin data-user="${e(session.email)}">
  <aside class="adm-side" data-side>
    <a class="brand" href="/admin/dashboard">${logoMark(30)}<span class="brand-word">Admin</span></a>
    <nav aria-label="Admin">${nav.map(([k, label, ic]) => html`<a href="/admin/${k}" data-nav="${k}">${icon(ic, { size: 18 })}<span>${label}</span>${k === 'enquiries' ? '<b class="badge" data-new-badge hidden></b>' : ''}</a>`)}</nav>
    <div class="adm-side-foot">
      <a href="/" target="_blank" rel="noopener">${icon('external', { size: 16 })} View website</a>
      <button type="button" data-logout>${icon('logout', { size: 16 })} Sign out</button>
    </div>
  </aside>
  <div class="adm-main">
    <header class="adm-top">
      <button class="icon-btn adm-menu" type="button" data-side-toggle aria-label="Open navigation">${icon('menu', { size: 20 })}</button>
      <h1 data-title>Dashboard</h1>
      <div class="adm-top-actions">
        <button class="icon-btn" type="button" data-theme-toggle aria-label="Switch colour theme">${icon('moon', { size: 18, cls: 'only-dark' })}${icon('sun', { size: 18, cls: 'only-light' })}</button>
        <span class="adm-user" title="${e(session.email)}">${e(session.email.slice(0, 1).toUpperCase())}</span>
      </div>
    </header>
    <div class="adm-banner" data-banner hidden></div>
    <section class="adm-view" data-view aria-live="polite"><div class="adm-loading"><span class="spinner"></span> Loading…</div></section>
  </div>
</div>
<dialog class="adm-dialog" data-dialog><form method="dialog" class="adm-dialog-box"><h2 data-dialog-title></h2><p data-dialog-text></p>
<div class="adm-dialog-actions"><button class="btn btn-ghost" value="cancel">Cancel</button><button class="btn btn-danger" value="ok" data-dialog-ok>Confirm</button></div></form></dialog>
<div class="toast" role="status" aria-live="polite" data-toast></div>
<script src="${asset('/assets/js/admin.js')}" type="module"></script>`, 'admin-app');
}
