import { e, html, layout, breadcrumbLd, siteUrl } from '../html.js';
import { icon } from '../icons.js';
import { pageHero, ctaBand } from './shared.js';
import { enquiryForm } from './form.js';

function serviceLd(s) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title,
    description: s.summary,
    serviceType: s.title,
    provider: { '@type': 'ProfessionalService', name: 'Devansh Gulati', url: siteUrl() },
    areaServed: 'India',
    url: `${siteUrl()}/services/${s.slug}`,
  };
}

export function servicesIndexPage(content) {
  const services = content.services.filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const crumbs = [['Home', '/'], ['Services', '/services']];
  const body = html`
${pageHero({ title: 'Every digital service, one partner', lead: 'Start with one service or combine several. Everything we build is designed to work together — your website, your socials, your app and the tools behind them.', crumbs, kicker: 'Services' })}
<section class="section"><div class="wrap">
  <div class="svc-rows">
    ${services.map((s, i) => html`<article class="svc-row hue-${e(s.hue)} reveal" style="--d:${i * 0.05}s">
      <div class="svc-row-head"><span class="svc-ico">${icon(s.icon, { size: 26 })}</span>
        <div><h2 class="h3"><a href="/services/${e(s.slug)}" data-track="service_view" data-label="${e(s.slug)}">${e(s.title)}</a></h2><p>${e(s.summary)}</p></div></div>
      <ul class="chips" role="list">${s.features.map((f) => html`<li>${e(f)}</li>`)}</ul>
      <div class="svc-row-cta"><a class="btn btn-ghost" href="/services/${e(s.slug)}">${e(s.cta)} ${icon('arrowRight', { size: 16 })}</a>
        <a class="btn btn-text" href="/contact?service=${encodeURIComponent(s.category)}#form">Enquire</a></div>
    </article>`)}
  </div>
</div></section>
<section class="section section-alt"><div class="wrap combo reveal">
  <h2 class="h2">Common combinations</h2>
  <div class="combo-grid">
    ${[
      ['Launch a new business', 'Brand identity, website, Google Business Profile, WhatsApp Business and launch posts.', ['palette', 'globe', 'briefcase', 'megaphone']],
      ['Grow an existing brand', 'Social media management, paid campaigns, SEO and a monthly report.', ['megaphone', 'trending', 'search']],
      ['Turn an idea into a product', 'UX design, an Android app, a landing page and Play Store publishing.', ['smartphone', 'globe', 'rocket']],
    ].map(([t, b, ics]) => html`<div class="combo-card"><div class="combo-ics">${ics.map((ic) => icon(ic, { size: 18 })).join('')}</div><h3>${e(t)}</h3><p>${e(b)}</p></div>`)}
  </div>
</div></section>
${ctaBand({ title: 'Not sure which service fits?', text: 'Describe what you want to achieve. We will recommend the right starting point — for free.' })}`;
  return layout({ content, path: '/services', title: 'Services', description: 'Social media marketing, website development, Android app development, branding and digital business setup — from one trusted partner.', body, jsonLd: [breadcrumbLd(crumbs)] });
}

function sectionCards(s) {
  return html`<div class="feature-grid">${s.sections.map((sec, i) => html`<article class="feature reveal" style="--d:${(i % 3) * 0.06}s">
    <h3>${e(sec.title)}</h3><p>${e(sec.body)}</p>${sec.idealFor ? html`<p class="ideal">${icon('users', { size: 15 })} <span>Ideal for: ${e(sec.idealFor)}</span></p>` : ''}</article>`)}</div>`;
}

function formSection(s, title, lead) {
  return html`<section class="section section-alt" id="form"><div class="wrap form-wrap">
  <div class="form-intro reveal"><h2 class="h2">${e(title)}</h2><p class="lead">${e(lead)}</p>
    <ul class="ticks" role="list"><li>${icon('check', { size: 16 })} Reply within one working day</li><li>${icon('check', { size: 16 })} Free first consultation</li><li>${icon('check', { size: 16 })} Clear scope and price before we start</li></ul></div>
  <div class="form-card reveal">${enquiryForm({ mode: 'single', category: s.category, prefix: `svc-${s.slug.slice(0, 6)}`, page: `/services/${s.slug}` })}</div>
</div></section>`;
}

function related(content, s) {
  const others = content.services.filter((x) => x.visible && x.slug !== s.slug).sort((a, b) => a.order - b.order).slice(0, 3);
  return html`<section class="section"><div class="wrap"><h2 class="h3 reveal">Works well with</h2>
  <div class="related">${others.map((o) => html`<a class="related-card hue-${e(o.hue)} reveal" href="/services/${e(o.slug)}"><span class="svc-ico">${icon(o.icon, { size: 20 })}</span><strong>${e(o.title)}</strong>${icon('arrowRight', { size: 18 })}</a>`)}</div></div></section>`;
}

const BODIES = {
  'social-media-marketing': (s) => html`
<section class="section"><div class="wrap">
  <div class="section-head reveal"><h2 class="h2">What’s included</h2><p class="lead">Choose the platforms and services you need. Every plan comes with a content calendar, one point of contact and a monthly report.</p></div>
  ${sectionCards(s)}
</div></section>
<section class="section section-alt"><div class="wrap month reveal">
  <h2 class="h2">A month with us</h2>
  <ol class="month-steps" role="list">
    ${[['Week 1', 'Plan', 'Content calendar, themes and campaign ideas agreed with you.'], ['Week 2', 'Create', 'Designs, Reels and captions produced and shared for approval.'], ['Weeks 2–4', 'Publish & engage', 'Scheduled posting, replies to comments and messages, ads optimisation.'], ['Month end', 'Report', 'What worked, what did not, and next month’s plan.']]
      .map(([w, t, b]) => html`<li><span class="ms-when">${e(w)}</span><h3>${e(t)}</h3><p>${e(b)}</p></li>`)}
  </ol>
</div></section>
${formSection(s, 'Grow your social media', 'Share your profiles and goals. We will review them and suggest a plan.')}`,

  'website-development': (s) => html`
<section class="section"><div class="wrap">
  <div class="section-head reveal"><h2 class="h2">What we build</h2></div>
  ${sectionCards(s)}
</div></section>
<section class="section section-alt"><div class="wrap includes reveal">
  <div><h2 class="h2">Every website includes</h2><p class="lead">The essentials are not add-ons.</p></div>
  <ul class="include-list" role="list">
    ${['Mobile-first, responsive design', 'Fast loading and Core Web Vitals checks', 'SEO metadata, sitemap and structured data', 'Free SSL (https) and security headers', 'Contact form with email notifications', 'WhatsApp chat button', 'Google Analytics setup', 'Training on how to update content']
      .map((x) => html`<li>${icon('check', { size: 18 })} ${e(x)}</li>`)}
  </ul>
</div></section>
${formSection(s, 'Plan your website', 'Answer a few questions about the site you need. It takes about two minutes.')}`,

  'android-app-development': (s) => html`
<section class="section"><div class="wrap">
  <div class="stack reveal" aria-label="Technology stack">
    ${['Kotlin', 'Jetpack Compose', 'Material 3', 'Firebase', 'Room', 'Retrofit', 'Hilt', 'Coroutines & Flow', 'Google Play']
      .map((t) => html`<span>${e(t)}</span>`)}
  </div>
  <div class="section-head reveal"><h2 class="h2">What we deliver</h2><p class="lead">Native Android apps built the way Google recommends — so they are fast today and easy to extend tomorrow.</p></div>
  ${sectionCards(s)}
</div></section>
<section class="section section-alt"><div class="wrap">
  <h2 class="h2 reveal">From idea to Play Store</h2>
  <ol class="timeline timeline-5" role="list">
    ${[['Scope', 'Features, users and priorities written down.'], ['Design', 'Screens and flows you can click through.'], ['Build', 'Weekly builds you can install and test.'], ['Test', 'Devices, Android versions and edge cases.'], ['Publish', 'Store listing, review and launch.']]
      .map(([t, b], i) => html`<li class="tl-step reveal" style="--d:${i * 0.08}s"><span class="tl-no">${String(i + 1).padStart(2, '0')}</span><h3>${e(t)}</h3><p>${e(b)}</p></li>`)}
  </ol>
</div></section>
${formSection(s, 'Tell us about your app', 'A few project-specific questions help us give you an accurate estimate.')}`,

  'digital-business-setup': (s) => html`
<section class="section"><div class="wrap">
  <div class="setup-split">
    <article class="setup-col reveal"><h2 class="h3">${icon('check', { size: 20 })} What we set up directly</h2>
      <p>Technical services we deliver ourselves.</p>
      <ul class="include-list" role="list">${(s.direct || []).map((x) => html`<li>${icon('check', { size: 18 })} ${e(x)}</li>`)}</ul></article>
    <article class="setup-col guided reveal" style="--d:.08s"><h2 class="h3">${icon('compass', { size: 20 })} What we guide you through</h2>
      <p>${e(s.guidedNote || '')}</p>
      <ul class="include-list" role="list">${(s.guided || []).map((x) => html`<li>${icon('arrowRight', { size: 18 })} ${e(x)}</li>`)}</ul></article>
  </div>
</div></section>
${formSection(s, 'Take your business online', 'Tell us what you have today and what you want customers to be able to do.')}`,

  'branding-and-content': (s) => html`
<section class="section"><div class="wrap">
  <div class="section-head reveal"><h2 class="h2">Deliverables</h2><p class="lead">Everything comes as editable source files, organised and handed over to you.</p></div>
  <div class="feature-grid">${(s.deliverables || s.sections || []).map((d, i) => html`<article class="feature reveal" style="--d:${(i % 3) * 0.06}s"><h3>${e(d.title)}</h3><p>${e(d.body)}</p></article>`)}</div>
</div></section>
${ctaBand({ title: 'Build a brand people remember', text: 'Share your business, your audience and a few brands you admire.', category: s.category })}`,
};

export function servicePage(content, slug) {
  const s = content.services.find((x) => x.slug === slug && x.visible);
  if (!s) return null;
  const crumbs = [['Home', '/'], ['Services', '/services'], [s.shortTitle || s.title, `/services/${s.slug}`]];
  const generic = (svc) => html`<section class="section"><div class="wrap">${sectionCards(svc)}</div></section>${formSection(svc, 'Start your project', 'Tell us what you need.')}`;
  const bodyFn = BODIES[s.slug] || generic;
  const body = html`
${pageHero({ title: s.title, lead: s.intro || s.summary, crumbs, kicker: s.shortTitle, hue: s.hue, iconName: s.icon,
    extra: html`<div class="hero-ctas fade-up" style="--d:.5s"><a class="btn btn-primary btn-lg" href="#form" data-track="cta_click" data-label="svc_${e(s.slug)}">Get a free consultation ${icon('arrowRight', { size: 18 })}</a></div>
    <ul class="chips hero-chips fade-up" style="--d:.6s" role="list">${s.features.map((f) => html`<li>${e(f)}</li>`)}</ul>` })}
${bodyFn(s)}
${related(content, s)}`;
  // Branding page has no inline form: point #form at contact.
  const finalBody = s.slug === 'branding-and-content' ? body.replace('href="#form"', `href="/contact?service=${encodeURIComponent(s.category)}#form"`) : body;
  return layout({ content, path: `/services/${s.slug}`, title: s.title, description: s.summary, body: finalBody, jsonLd: [serviceLd(s), breadcrumbLd(crumbs)] });
}
