import { e, html, breadcrumbs } from '../html.js';
import { icon } from '../icons.js';

const CATEGORY_ICON = {
  'Social Media Campaigns': 'megaphone',
  'Website Development': 'globe',
  'Android Applications': 'smartphone',
  'Digital Business Solutions': 'briefcase',
  'Branding & Content': 'palette',
};

export function categoryIcon(cat) {
  return CATEGORY_ICON[cat] || 'sparkles';
}

export function projectCover(p, { eager = false } = {}) {
  if (p.image) {
    return html`<img src="${e(p.image)}" alt="${e(p.imageAlt || p.title)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
  }
  // Generated cover for projects without an image yet.
  return html`<div class="gen-cover" aria-hidden="true"><span>${icon(categoryIcon(p.category), { size: 40 })}</span><strong>${e(p.title)}</strong></div>`;
}

export function projectCard(p, i = 0) {
  return html`<article class="work-card reveal" style="--d:${(i % 3) * 0.07}s" data-cat="${e(p.category)}">
  <div class="work-media">${projectCover(p)}<span class="work-status s-${e(p.status.toLowerCase())}">${e(p.status)}</span></div>
  <div class="work-body">
    <p class="work-cat">${icon(categoryIcon(p.category), { size: 15 })} ${e(p.category)}</p>
    <h3><a class="stretch" href="/work/${e(p.slug)}" data-track="project_view" data-label="${e(p.slug)}">${e(p.title)}</a></h3>
    <p>${e(p.summary)}</p>
    ${p.tech?.length ? html`<ul class="chips chips-sm" role="list">${p.tech.slice(0, 4).map((t) => html`<li>${e(t)}</li>`)}</ul>` : ''}
  </div>
</article>`;
}

export function pageHero({ title, lead, crumbs, kicker = '', hue = 'violet', iconName = '', extra = '' }) {
  return html`<section class="page-hero hue-${e(hue)}">
  <div class="hero-bg" aria-hidden="true"><span class="orb orb-a"></span><span class="grid-lines"></span></div>
  <div class="wrap">
    ${crumbs ? breadcrumbs(crumbs) : ''}
    ${kicker ? html`<p class="hero-kicker">${iconName ? icon(iconName, { size: 16 }) : '<span class="live-dot"></span>'} ${e(kicker)}</p>` : ''}
    <h1 class="display-2 reveal-words">${title.split(/\s+/).map((w, i) => html`<span class="w" style="--i:${i}"><span>${e(w)}</span></span>`).join(' ')}</h1>
    ${lead ? html`<p class="lead fade-up" style="--d:.35s">${e(lead)}</p>` : ''}
    ${extra}
  </div>
</section>`;
}

export function ctaBand({ title = 'Ready when you are.', text = 'Tell us what you need — we reply within one working day.', category = '' } = {}) {
  const q = category ? `?service=${encodeURIComponent(category)}` : '';
  return html`<section class="cta-band"><div class="wrap cta-band-inner reveal">
  <div><h2 class="h2">${e(title)}</h2><p class="lead">${e(text)}</p></div>
  <div class="hero-ctas"><a class="btn btn-primary btn-lg magnetic" href="/contact${q}#form" data-track="cta_click" data-label="band_start">Start a Project ${icon('arrowRight', { size: 18 })}</a></div>
</div></section>`;
}
