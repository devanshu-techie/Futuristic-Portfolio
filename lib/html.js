// HTML helpers and the shared public page layout.
import { icon } from './icons.js';

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
export const e = escapeHtml;

/** Tagged template that leaves nested arrays joined. Values must be escaped by the caller. */
export function html(strings, ...values) {
  let out = '';
  strings.forEach((s, i) => {
    out += s;
    if (i < values.length) {
      const v = values[i];
      out += Array.isArray(v) ? v.join('') : v === false || v === null || v === undefined ? '' : v;
    }
  });
  return out;
}

export function siteUrl() {
  return (process.env.SITE_URL || 'https://devanshugulati.in').replace(/\/$/, '');
}

export const ASSET_V = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || 'dev').slice(0, 10);

export function asset(path) {
  return `${path}?v=${ASSET_V}`;
}

export function waLink(settings, text = '') {
  const num = String(settings.whatsapp || '').replace(/\D/g, '');
  return `https://wa.me/${num}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function telLink(settings) {
  return `tel:${String(settings.phone || '').replace(/[^\d+]/g, '')}`;
}

let logoSeq = 0;
export function logoMark(size = 34) {
  logoSeq = (logoSeq + 1) % 1e6;
  const gid = `lg-${size}-${logoSeq}`;
  return `<svg class="logo-mark" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true">
<defs><linearGradient id="${gid}" x1="0" y1="40" x2="40" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#3B82F6"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs>
<rect width="40" height="40" rx="11" fill="url(#${gid})"/>
<path d="M11 27.5 18.5 20l4.5 4.5L30 17.5" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="30" cy="12" r="3.2" fill="#FFB547"/></svg>`;
}

function navLinks(content, path) {
  const services = content.services.filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const is = (p) => (p === '/' ? path === '/' : path === p || path.startsWith(`${p}/`));
  const cur = (p) => (is(p) ? ' aria-current="page"' : '');
  return html`
<ul class="nav-list" role="list">
  <li><a class="nav-link" href="/"${cur('/')}>Home</a></li>
  <li class="has-menu">
    <a class="nav-link" href="/services"${cur('/services')} aria-haspopup="true">Services ${icon('chevronDown', { size: 14, cls: 'nav-caret' })}</a>
    <div class="menu" role="menu">
      <div class="menu-grid">
        ${services.map((s) => html`<a role="menuitem" class="menu-item hue-${e(s.hue)}" href="/services/${e(s.slug)}">
          <span class="menu-ico">${icon(s.icon, { size: 18 })}</span>
          <span><strong>${e(s.shortTitle || s.title)}</strong><small>${e(s.summary.split('.')[0])}</small></span></a>`)}
      </div>
      <a class="menu-foot" href="/services">See every service and how they fit together ${icon('arrowRight', { size: 15 })}</a>
    </div>
  </li>
  <li><a class="nav-link" href="/#finder">Solutions</a></li>
  <li><a class="nav-link" href="/work"${cur('/work')}>Our Work</a></li>
  <li><a class="nav-link" href="/about"${cur('/about')}>About</a></li>
  <li><a class="nav-link" href="/contact"${cur('/contact')}>Contact</a></li>
</ul>`;
}

function header(content, path) {
  const { settings } = content;
  const ann = settings.announcement;
  return html`
${ann?.enabled && ann.text ? html`<div class="announce"><div class="wrap">${ann.link ? html`<a href="${e(ann.link)}">${e(ann.text)} ${icon('arrowRight', { size: 14 })}</a>` : e(ann.text)}</div></div>` : ''}
<header class="site-header" data-header>
  <div class="wrap header-row">
    <a class="brand" href="/" aria-label="${e(settings.brand)} — home">${logoMark()}<span class="brand-word">${e(settings.brand)}</span></a>
    <nav class="main-nav" aria-label="Main">${navLinks(content, path)}</nav>
    <div class="header-actions">
      <button class="icon-btn" type="button" data-palette-open aria-label="Search the site (Ctrl+K)" title="Search  Ctrl K">${icon('search', { size: 18 })}</button>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="Switch colour theme">${icon('moon', { size: 18, cls: 'only-dark' })}${icon('sun', { size: 18, cls: 'only-light' })}</button>
      <a class="btn btn-primary btn-sm hide-sm" href="/contact" data-track="cta_click" data-label="header_lets_talk">Let's Talk</a>
      <button class="icon-btn menu-btn" type="button" data-menu-open aria-controls="mobile-menu" aria-expanded="false" aria-label="Open menu">${icon('menu', { size: 22 })}</button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="mobile-menu" data-mobile-menu hidden>
  <div class="mobile-inner">
    <div class="mobile-top"><a class="brand" href="/">${logoMark(30)}<span class="brand-word">${e(settings.brand)}</span></a>
      <div class="mobile-top-actions"><button class="icon-btn" type="button" data-theme-toggle aria-label="Switch colour theme">${icon('moon', { size: 18, cls: 'only-dark' })}${icon('sun', { size: 18, cls: 'only-light' })}</button>
      <button class="icon-btn" type="button" data-menu-close aria-label="Close menu">${icon('x', { size: 22 })}</button></div></div>
    <nav aria-label="Mobile">
      <a href="/">Home</a>
      <a href="/services">Services</a>
      <div class="mobile-sub">${content.services.filter((s) => s.visible).sort((a, b) => a.order - b.order).map((s) => html`<a href="/services/${e(s.slug)}">${icon(s.icon, { size: 16 })} ${e(s.shortTitle || s.title)}</a>`)}</div>
      <a href="/#finder">Solutions</a>
      <a href="/work">Our Work</a>
      <a href="/about">About</a>
      <a href="/faq">FAQ</a>
      <a href="/track">Track an enquiry</a>
      <a href="/contact">Contact</a>
    </nav>
    <div class="mobile-cta">
      <a class="btn btn-primary" href="/contact">Start a Project</a>
      <a class="btn btn-ghost" href="${e(waLink(settings, 'Hi! I would like to discuss a project.'))}" target="_blank" rel="noopener" data-track="whatsapp_click">${icon('whatsapp', { size: 18 })} WhatsApp us</a>
    </div>
  </div>
</div>`;
}

function socialLinks(settings) {
  const map = [['linkedin', 'LinkedIn'], ['instagram', 'Instagram'], ['youtube', 'YouTube'], ['facebook', 'Facebook'], ['x', 'X'], ['github', 'GitHub']];
  return map.filter(([k]) => settings.socials?.[k]).map(([k, label]) => html`<a class="social" href="${e(settings.socials[k])}" target="_blank" rel="noopener" aria-label="${label}">${icon(k, { size: 18 })}</a>`).join('');
}

function footer(content) {
  const { settings } = content;
  const services = content.services.filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const year = new Date().getFullYear();
  return html`
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="/">${logoMark()}<span class="brand-word">${e(settings.brand)}</span></a>
        <p>${e(settings.description)}</p>
        <div class="socials">${socialLinks(settings)}</div>
      </div>
      <div><h2 class="f-title">Services</h2><ul role="list">${services.map((s) => html`<li><a href="/services/${e(s.slug)}">${e(s.shortTitle || s.title)}</a></li>`)}</ul></div>
      <div><h2 class="f-title">Company</h2><ul role="list">
        <li><a href="/work">Our Work</a></li><li><a href="/about">About</a></li><li><a href="/faq">FAQ</a></li>
        <li><a href="/track">Track an enquiry</a></li><li><a href="/contact">Contact</a></li></ul></div>
      <div><h2 class="f-title">Get in touch</h2><ul role="list" class="f-contact">
        <li><a href="mailto:${e(settings.email)}" data-track="email_click">${icon('mail', { size: 16 })} ${e(settings.email)}</a></li>
        <li><a href="${e(telLink(settings))}">${icon('phone', { size: 16 })} ${e(settings.phone)}</a></li>
        <li><a href="${e(waLink(settings, 'Hi! I would like to discuss a project.'))}" target="_blank" rel="noopener" data-track="whatsapp_click">${icon('whatsapp', { size: 16 })} WhatsApp</a></li>
        <li class="muted">${icon('clock', { size: 16 })} ${e(settings.workingHours)}</li></ul></div>
    </div>
    <div class="footer-bottom">
      <p>© ${year} ${e(settings.brand)}. All rights reserved.</p>
      <nav aria-label="Legal"><a href="/privacy-policy">Privacy Policy</a><a href="/terms-and-conditions">Terms and Conditions</a><a href="/refund-policy">Refund Policy</a></nav>
    </div>
  </div>
</footer>`;
}

function palette(content) {
  const items = [
    ['Home', '/', 'Page'], ['All services', '/services', 'Page'],
    ...content.services.filter((s) => s.visible).map((s) => [s.title, `/services/${s.slug}`, 'Service']),
    ['Our work', '/work', 'Page'],
    ...content.projects.filter((p) => p.published).map((p) => [p.title, `/work/${p.slug}`, 'Project']),
    ['About', '/about', 'Page'], ['FAQ', '/faq', 'Page'], ['Contact & start a project', '/contact', 'Action'],
    ['Track an enquiry', '/track', 'Action'], ['Chat on WhatsApp', waLink(content.settings, 'Hi!'), 'Action'],
    ['Privacy Policy', '/privacy-policy', 'Legal'], ['Terms and Conditions', '/terms-and-conditions', 'Legal'], ['Refund Policy', '/refund-policy', 'Legal'],
  ];
  return html`
<dialog class="palette" data-palette aria-label="Search the site">
  <div class="palette-box">
    <div class="palette-input">${icon('search', { size: 18 })}<input type="search" placeholder="Search pages, services and projects…" aria-label="Search" data-palette-input autocomplete="off"><kbd>Esc</kbd></div>
    <ul class="palette-list" role="listbox" data-palette-list>
      ${items.map(([label, href, kind]) => html`<li role="option"><a href="${e(href)}"${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}><span>${e(label)}</span><small>${e(kind)}</small></a></li>`)}
    </ul>
    <p class="palette-empty" data-palette-empty hidden>No matches. Try “website”, “Android” or “pricing”.</p>
  </div>
</dialog>`;
}

export function breadcrumbs(items) {
  return html`<nav class="crumbs" aria-label="Breadcrumb"><ol role="list">
${items.map(([label, href], i) => (i === items.length - 1
    ? html`<li aria-current="page">${e(label)}</li>`
    : html`<li><a href="${e(href)}">${e(label)}</a></li>`))}</ol></nav>`;
}

export function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${siteUrl()}${href}` })),
  };
}

function jsonLdTag(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}

export function layout({ content, path = '/', title, description, body, jsonLd = [], noindex = false, ogImage = '/assets/img/og.png', bodyClass = '' }) {
  const { settings } = content;
  const fullTitle = path === '/' ? `${settings.brand} — ${settings.tagline}` : `${title} | ${settings.brand}`;
  const desc = description || settings.description;
  const canonical = `${siteUrl()}${path === '/' ? '' : path}`;
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: settings.brand,
    url: siteUrl(),
    logo: `${siteUrl()}/assets/img/logo.png`,
    image: `${siteUrl()}/assets/img/og.png`,
    email: settings.email,
    telephone: settings.phone,
    slogan: settings.tagline,
    areaServed: settings.location || 'India',
    sameAs: Object.values(settings.socials || {}).filter(Boolean),
  };
  const siteLd = { '@context': 'https://schema.org', '@type': 'WebSite', name: settings.brand, url: siteUrl() };
  return `<!doctype html>
<html lang="en-IN" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${e(fullTitle)}</title>
<meta name="description" content="${e(desc)}">
<link rel="canonical" href="${e(canonical)}">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${e(settings.brand)}">
<meta property="og:title" content="${e(fullTitle)}">
<meta property="og:description" content="${e(desc)}">
<meta property="og:url" content="${e(canonical)}">
<meta property="og:image" content="${e(ogImage.startsWith('http') ? ogImage : siteUrl() + ogImage)}">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${e(fullTitle)}">
<meta name="twitter:description" content="${e(desc)}">
<meta name="twitter:image" content="${e(ogImage.startsWith('http') ? ogImage : siteUrl() + ogImage)}">
<meta name="theme-color" content="#0A0A12">
<meta name="color-scheme" content="dark light">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Manrope:wght@400..700&display=swap">
<link rel="stylesheet" href="${asset('/assets/css/site.css')}">
<script src="${asset('/assets/js/theme.js')}"></script>
<script src="${asset('/assets/js/site.js')}" defer></script>
${[orgLd, siteLd, ...jsonLd].map(jsonLdTag).join('\n')}
</head>
<body class="${e(bodyClass)}" data-ga="${e(settings.gaId || '')}">
<a class="skip" href="#main">Skip to content</a>
<div class="scroll-bar" aria-hidden="true"></div>
${header(content, path)}
<main id="main" tabindex="-1">${body}</main>
${footer(content)}
<a class="wa-float" href="${e(waLink(settings, 'Hi! I would like to discuss a project.'))}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp" data-track="whatsapp_click">${icon('whatsapp', { size: 26 })}<span>Chat with us</span></a>
${palette(content)}
${settings.gaId ? html`<div class="consent" data-consent hidden role="region" aria-label="Analytics consent"><p>We use Google Analytics to understand which pages help visitors. No ads, no selling data.</p><div><button class="btn btn-ghost btn-sm" type="button" data-consent-no>Decline</button><button class="btn btn-primary btn-sm" type="button" data-consent-yes>Allow analytics</button></div></div>` : ''}
<div class="toast" role="status" aria-live="polite" data-toast></div>
</body>
</html>`;
}
