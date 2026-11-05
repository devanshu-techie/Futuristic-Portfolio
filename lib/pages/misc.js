import { e, html, layout, breadcrumbLd, waLink, telLink, siteUrl } from '../html.js';
import { icon } from '../icons.js';
import { pageHero, ctaBand, projectCard, projectCover, categoryIcon } from './shared.js';
import { enquiryForm } from './form.js';
import { PROJECT_CATEGORIES, SERVICE_CATEGORIES } from '../defaults.js';

export function workPage(content) {
  const projects = content.projects.filter((p) => p.published).sort((a, b) => a.order - b.order);
  const cats = PROJECT_CATEGORIES.filter((c) => projects.some((p) => p.category === c));
  const crumbs = [['Home', '/'], ['Our Work', '/work']];
  const body = html`
${pageHero({ title: 'Work we are proud of', lead: 'Real projects for real businesses — social media, websites, Android apps and digital business setup.', crumbs, kicker: 'Our Work' })}
<section class="section" aria-labelledby="projects-h"><div class="wrap">
  <h2 id="projects-h" class="sr-only">Projects</h2>
  ${projects.length ? html`
  <div class="filters reveal" role="group" aria-label="Filter projects" data-filters>
    <button type="button" class="filter is-on" aria-pressed="true" data-filter="all">All <span>${projects.length}</span></button>
    ${cats.map((c) => html`<button type="button" class="filter" aria-pressed="false" data-filter="${e(c)}">${icon(categoryIcon(c), { size: 15 })} ${e(c)} <span>${projects.filter((p) => p.category === c).length}</span></button>`)}
  </div>
  <div class="work-grid" data-filter-grid>${projects.map((p, i) => projectCard(p, i))}</div>
  <p class="empty" data-filter-empty hidden>No projects in this category yet.</p>`
    : html`<div class="empty"><p>Case studies are on their way. <a href="/contact">Ask us for examples</a> relevant to your project.</p></div>`}
</div></section>
${ctaBand({ title: 'Your project could be next', text: 'Tell us about it — we will reply within one working day.' })}`;
  return layout({ content, path: '/work', title: 'Our Work', description: 'Case studies and projects by Devansh Gulati: social media campaigns, websites, Android apps and digital business solutions.', body, jsonLd: [breadcrumbLd(crumbs)] });
}

export function projectPage(content, slug) {
  const p = content.projects.find((x) => x.slug === slug && x.published);
  if (!p) return null;
  const crumbs = [['Home', '/'], ['Our Work', '/work'], [p.title, `/work/${p.slug}`]];
  const others = content.projects.filter((x) => x.published && x.slug !== p.slug).sort((a, b) => a.order - b.order).slice(0, 3);
  const body = html`
${pageHero({ title: p.title, lead: p.summary, crumbs, kicker: p.category, iconName: categoryIcon(p.category) })}
<section class="section case"><div class="wrap case-grid">
  <div class="case-media reveal">${projectCover(p, { eager: true })}
    ${(p.gallery || []).length ? html`<div class="gallery">${p.gallery.map((g) => html`<img src="${e(g)}" alt="${e(p.title)} — project image" loading="lazy">`)}</div>` : ''}</div>
  <aside class="case-meta reveal" style="--d:.08s">
    <dl>
      <div><dt>Client</dt><dd>${e(p.client || p.title)}</dd></div>
      <div><dt>Category</dt><dd>${e(p.category)}</dd></div>
      <div><dt>Status</dt><dd><span class="work-status s-${e(p.status.toLowerCase())}">${e(p.status)}</span></dd></div>
      ${p.tech?.length ? html`<div><dt>Work included</dt><dd><ul class="chips chips-sm" role="list">${p.tech.map((t) => html`<li>${e(t)}</li>`)}</ul></dd></div>` : ''}
    </dl>
    ${p.url ? html`<a class="btn btn-ghost" href="${e(p.url)}" target="_blank" rel="noopener">View live project ${icon('external', { size: 16 })}</a>` : ''}
  </aside>
  <div class="case-story">
    ${p.challenge ? html`<article class="reveal"><h2 class="h3">The challenge</h2><p>${e(p.challenge)}</p></article>` : ''}
    ${p.solution ? html`<article class="reveal"><h2 class="h3">What we did</h2><p>${e(p.solution)}</p></article>` : ''}
    ${p.result ? html`<article class="reveal"><h2 class="h3">The outcome</h2><p>${e(p.result)}</p></article>` : ''}
  </div>
</div></section>
${others.length ? html`<section class="section section-alt"><div class="wrap"><h2 class="h3 reveal">More projects</h2><div class="work-grid">${others.map((o, i) => projectCard(o, i))}</div></div></section>` : ''}
${ctaBand({ title: 'Want results like this?', text: 'Tell us about your business and goals.' })}`;
  const ld = { '@context': 'https://schema.org', '@type': 'CreativeWork', name: p.title, about: p.category, description: p.summary, url: `${siteUrl()}/work/${p.slug}`, ...(p.image ? { image: p.image.startsWith('http') ? p.image : `${siteUrl()}${p.image}` } : {}) };
  return layout({ content, path: `/work/${p.slug}`, title: `${p.title} — ${p.category}`, description: p.summary, body, jsonLd: [ld, breadcrumbLd(crumbs)], ogImage: p.image || undefined });
}

export function aboutPage(content) {
  const { about } = content;
  const crumbs = [['Home', '/'], ['About', '/about']];
  const body = html`
${pageHero({ title: 'A studio for everything digital', lead: about.intro, crumbs, kicker: 'About' })}
<section class="section"><div class="wrap about-grid">
  <div class="reveal"><h2 class="h2">Who we are</h2><p class="lead">${e(about.founder)}</p>
    <p>We work with individuals, creators, local shops, startups and established businesses across India — and anyone, anywhere, who needs a reliable digital partner.</p></div>
  <div class="values">${about.values.map((v, i) => html`<article class="value reveal" style="--d:${i * 0.08}s"><h3>${e(v.title)}</h3><p>${e(v.body)}</p></article>`)}</div>
</div></section>
<section class="section section-alt"><div class="wrap">
  <h2 class="h2 reveal">What we work on</h2>
  <div class="related">${content.services.filter((s) => s.visible).sort((a, b) => a.order - b.order).map((s) => html`<a class="related-card hue-${e(s.hue)} reveal" href="/services/${e(s.slug)}"><span class="svc-ico">${icon(s.icon, { size: 20 })}</span><strong>${e(s.title)}</strong>${icon('arrowRight', { size: 18 })}</a>`)}</div>
</div></section>
${ctaBand({ title: 'Let’s talk about your project', text: 'A short conversation is the fastest way to know if we are a good fit.' })}`;
  return layout({ content, path: '/about', title: 'About', description: about.intro.slice(0, 160), body, jsonLd: [breadcrumbLd(crumbs)] });
}

export function contactPage(content, query) {
  const { settings } = content;
  const service = SERVICE_CATEGORIES.includes(query.get('service') || '') ? query.get('service') : '';
  const needText = {
    social: 'Grow my social media', website: 'A new business website', android: 'An Android application',
    business: 'Take my business online', complete: 'Complete digital solution', unsure: 'Guidance on where to start',
  }[query.get('need')] || '';
  const crumbs = [['Home', '/'], ['Contact', '/contact']];
  const body = html`
${pageHero({ title: 'Start a project', lead: 'Tell us what you are planning. Three short steps, about two minutes — and you get a reference number to track your enquiry.', crumbs, kicker: 'Contact' })}
<section class="section contact" id="form"><div class="wrap contact-grid">
  <div class="form-card reveal">${enquiryForm({ mode: 'steps', category: service, subject: needText, prefix: 'c', page: '/contact' })}</div>
  <aside class="contact-side reveal" style="--d:.08s">
    <h2 class="h3">Prefer to talk?</h2>
    <a class="contact-line" href="${e(waLink(settings, 'Hi! I would like to discuss a project.'))}" target="_blank" rel="noopener" data-track="whatsapp_click"><span class="cl-ico wa">${icon('whatsapp', { size: 20 })}</span><span><strong>WhatsApp</strong><small>Fastest reply</small></span></a>
    <a class="contact-line" href="${e(telLink(settings))}"><span class="cl-ico">${icon('phone', { size: 20 })}</span><span><strong>${e(settings.phone)}</strong><small>${e(settings.workingHours)}</small></span></a>
    <a class="contact-line" href="mailto:${e(settings.email)}" data-track="email_click"><span class="cl-ico">${icon('mail', { size: 20 })}</span><span><strong>${e(settings.email)}</strong><small>${e(settings.responseTime)}</small></span></a>
    <div class="next-steps">
      <h3>What happens next</h3>
      <ol role="list">
        <li><strong>Instant confirmation.</strong> You get a reference number by email.</li>
        <li><strong>We review your requirement</strong> and reply within one working day.</li>
        <li><strong>Free consultation</strong> by call or WhatsApp, if needed.</li>
        <li><strong>Written proposal</strong> with scope, timeline and price.</li>
      </ol>
      <a class="link-arrow" href="/track">Already sent an enquiry? Track it ${icon('arrowRight', { size: 16 })}</a>
    </div>
  </aside>
</div></section>`;
  return layout({ content, path: '/contact', title: 'Contact & Start a Project', description: 'Start a project with Devansh Gulati — digital marketing, websites, Android apps and business setup. Reply within one working day.', body, jsonLd: [breadcrumbLd(crumbs)] });
}

export function faqPage(content) {
  const cats = [...new Set(content.faqs.map((f) => f.category).filter(Boolean))];
  const crumbs = [['Home', '/'], ['FAQ', '/faq']];
  const body = html`
${pageHero({ title: 'Frequently asked questions', lead: 'Everything about our services, timelines, payments and support.', crumbs, kicker: 'FAQ' })}
<section class="section"><div class="wrap faq-page" data-faq>
  <div class="faq-tools reveal">
    <label class="search-box">${icon('search', { size: 18 })}<span class="sr-only">Search questions</span><input type="search" placeholder="Search questions…" data-faq-search></label>
    <div class="filters" role="group" aria-label="Filter by topic"><button type="button" class="filter is-on" aria-pressed="true" data-faq-cat="all">All</button>
      ${cats.map((c) => html`<button type="button" class="filter" aria-pressed="false" data-faq-cat="${e(c)}">${e(c)}</button>`)}</div>
  </div>
  <div class="faq-list">${content.faqs.map((f) => html`<details class="faq reveal" data-cat="${e(f.category)}"><summary><span>${e(f.q)}</span>${icon('plus', { size: 18, cls: 'faq-ico' })}</summary><div class="faq-a"><p>${e(f.a)}</p></div></details>`)}</div>
  <p class="empty" data-faq-empty hidden>No questions match. <a href="/contact">Ask us directly</a> — we reply within one working day.</p>
</div></section>
${ctaBand({ title: 'Still have a question?', text: 'Send it with your enquiry or message us on WhatsApp.' })}`;
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: content.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
  return layout({ content, path: '/faq', title: 'FAQ', description: 'Answers about our services, project timelines, payments, maintenance and support.', body, jsonLd: [ld, breadcrumbLd(crumbs)] });
}

export function trackPage(content, query) {
  const ref = (query.get('ref') || '').toUpperCase().slice(0, 20);
  const crumbs = [['Home', '/'], ['Track an enquiry', '/track']];
  const body = html`
${pageHero({ title: 'Track your enquiry', lead: 'Enter the reference number from your confirmation email and the email address you used.', crumbs, kicker: 'Enquiry status' })}
<section class="section"><div class="wrap track-wrap">
  <form class="form-card track-form reveal" data-track-form novalidate>
    <div class="grid-2">
      <div class="field"><label for="t-ref">Reference number</label><input id="t-ref" name="ref" required placeholder="DG-261106-ABCDE" value="${e(ref)}" autocapitalize="characters" spellcheck="false"></div>
      <div class="field"><label for="t-email">Email address</label><input id="t-email" name="email" type="email" required autocomplete="email"></div>
    </div>
    <div class="form-alert" role="alert" data-form-alert hidden></div>
    <button class="btn btn-primary" type="submit"><span class="btn-label">Check status</span> ${icon('arrowRight', { size: 18 })}</button>
  </form>
  <div class="track-result" data-track-result hidden tabindex="-1" aria-live="polite"></div>
</div></section>`;
  return layout({ content, path: '/track', title: 'Track your enquiry', description: 'Check the status of your project enquiry with your reference number.', body, noindex: true });
}

export function notFoundPage(content) {
  const body = html`<section class="page-hero nf"><div class="hero-bg" aria-hidden="true"><span class="orb orb-a"></span><span class="grid-lines"></span></div><div class="wrap">
  <p class="nf-code" aria-hidden="true">404</p>
  <h1 class="display-2">This page does not exist</h1>
  <p class="lead">The link may be old or mistyped. Try one of these instead.</p>
  <div class="hero-ctas"><a class="btn btn-primary" href="/">Go to the homepage</a><a class="btn btn-ghost" href="/services">Browse services</a><button class="btn btn-text" type="button" data-palette-open>Search the site</button></div>
</div></section>`;
  return layout({ content, path: '/404', title: 'Page not found', body, noindex: true });
}
