import { e, html, layout, waLink } from '../html.js';
import { icon } from '../icons.js';
import { projectCard } from './shared.js';

function splitWords(text) {
  return text.split(/\s+/).map((w, i) => html`<span class="w" style="--i:${i}"><span>${e(w)}</span></span>`).join(' ');
}

function orbit(services) {
  const nodes = services.slice(0, 5);
  const rings = [
    { r: 120, dur: 46, nodes: nodes.slice(0, 2), offset: 20 },
    { r: 190, dur: 70, nodes: nodes.slice(2, 5), offset: 75 },
  ];
  return html`<div class="orbit" data-orbit aria-hidden="true">
  <svg viewBox="-260 -260 520 520" class="orbit-svg">
    <defs>
      <radialGradient id="core-glow"><stop offset="0" stop-color="#8B5CF6" stop-opacity=".55"/><stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/></radialGradient>
      <linearGradient id="core-grad" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#3B82F6"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient>
      <linearGradient id="ring-grad" x1="0" x2="1"><stop offset="0" stop-color="#8B5CF6" stop-opacity=".7"/><stop offset=".5" stop-color="#3B82F6" stop-opacity=".15"/><stop offset="1" stop-color="#FFB547" stop-opacity=".6"/></linearGradient>
    </defs>
    <circle r="250" class="ring ring-faint"/>
    ${rings.map((ring) => html`<circle r="${ring.r}" class="ring" stroke="url(#ring-grad)"/>`)}
    <circle r="110" fill="url(#core-glow)"/>
    <g class="pulse"><circle r="58" class="core-ring"/></g>
    <g class="core"><rect x="-38" y="-38" width="76" height="76" rx="22" class="core-box"/>
      <path d="M-17 11 -4 -2l7 7 14-14" class="core-line"/><circle cx="17" cy="-16" r="5" fill="#FFB547"/></g>
    ${rings.map((ring, ri) => html`<g class="spin" style="--dur:${ring.dur}s;--dir:${ri % 2 ? -1 : 1}">
      ${ring.nodes.map((s, i) => {
        const angle = ((360 / ring.nodes.length) * i + ring.offset) * (Math.PI / 180);
        const x = Math.round(Math.cos(angle) * ring.r);
        const y = Math.round(Math.sin(angle) * ring.r);
        return html`<g class="node hue-${e(s.hue)}" transform="translate(${x} ${y})" data-node="${e(s.slug)}">
          <line x1="0" y1="0" x2="${-x}" y2="${-y}" class="link"/>
          <g class="counter" style="--dur:${ring.dur}s;--dir:${ri % 2 ? -1 : 1}">
            <circle r="30" class="node-bg"/>
            <svg x="-12" y="-12" width="24" height="24" viewBox="0 0 24 24" class="node-ico" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon(s.icon, { size: 24 }).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>
          </g></g>`;
      })}</g>`)}
  </svg>
  <div class="float-card fc-1"><span class="dot dot-ok"></span><div><strong>Enquiry received</strong><small>Reference DG-261106-K7QXM</small></div></div>
  <div class="float-card fc-2">${icon('check', { size: 16 })}<div><strong>Website is live</strong><small>Mobile, fast, SEO-ready</small></div></div>
  <div class="float-card fc-3">${icon('clock', { size: 16 })}<div><strong>Reel scheduled</strong><small>Today, 7:30 PM</small></div></div>
</div>`;
}

const FINDER = [
  { key: 'social', label: 'I want to grow my social media.', icon: 'megaphone', category: 'Social Media Management', slug: 'social-media-marketing',
    title: 'Social media growth', text: 'We plan, create and publish content for your platforms, run ads when it makes sense, and report every month on what is working.',
    points: ['Content calendar and creative design', 'Reels, Shorts and video editing', 'Paid campaigns with budgets you control', 'Monthly plain-language report'] },
  { key: 'website', label: 'I need a business website.', icon: 'globe', category: 'Website Development', slug: 'website-development',
    title: 'A website that brings enquiries', text: 'A fast, mobile-first website that explains what you do in seconds and makes it easy to contact you — with domain, hosting and email handled.',
    points: ['Business site, landing page or online store', 'Built for phones first and search engines', 'Domain, hosting and business email set up', 'You can update content after launch'] },
  { key: 'android', label: 'I want an Android application.', icon: 'smartphone', category: 'Android App Development', slug: 'android-app-development',
    title: 'A native Android app', text: 'Kotlin and Jetpack Compose apps with Firebase or your own backend — scoped around the features you need first, then grown with your users.',
    points: ['UI/UX design and prototyping', 'Login, payments, notifications, chat', 'Testing across devices', 'Play Store publishing assistance'] },
  { key: 'business', label: 'I want to take my business online.', icon: 'briefcase', category: 'Digital Business Setup', slug: 'digital-business-setup',
    title: 'Your business, online in weeks', text: 'Google Business Profile, WhatsApp Business, business email, online payments and a simple way to track customers — set up and connected.',
    points: ['Show up on Google Maps and Search', 'WhatsApp catalogue and quick replies', 'UPI and payment gateway integration', 'Registration guidance with qualified professionals'] },
  { key: 'complete', label: 'I need complete digital solutions.', icon: 'layers', category: 'Complete Digital Solutions', slug: '',
    title: 'One partner for everything digital', text: 'Website, social media, app and business tools planned together, so everything looks consistent and works as one system.',
    points: ['One plan, one point of contact', 'Consistent brand across every channel', 'Monthly support and improvements', 'Phase the work to fit your budget'] },
  { key: 'unsure', label: 'I am not sure. I need guidance.', icon: 'compass', category: 'Other', slug: '',
    title: 'Let’s figure it out together', text: 'Tell us about your business and what you want to achieve. We will suggest where to start — honestly, even if it is a smaller first step.',
    points: ['Free first consultation', 'A clear recommendation in plain language', 'No obligation to continue', 'Reply within one working day'] },
];

export function homePage(content) {
  const services = content.services.filter((s) => s.visible).sort((a, b) => a.order - b.order);
  const main = services.slice(0, 4);
  const extra = services.slice(4);
  const projects = content.projects.filter((p) => p.published).sort((a, b) => a.order - b.order);
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const showcase = featured.length ? featured : projects.slice(0, 3);
  const testimonials = content.testimonials.filter((t) => t.approved).sort((a, b) => a.order - b.order);
  const faqs = content.faqs.slice(0, 6);
  const { hero, settings } = content;

  const body = html`
<section class="hero" aria-labelledby="hero-title">
  <div class="hero-bg" aria-hidden="true"><span class="orb orb-a"></span><span class="orb orb-b"></span><span class="grid-lines"></span></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="hero-kicker"><span class="live-dot"></span> ${e(settings.tagline)}</p>
      <h1 id="hero-title" class="display reveal-words">${splitWords(hero.headline)}</h1>
      <p class="lead fade-up" style="--d:.45s">${e(hero.subhead)}</p>
      <div class="hero-ctas fade-up" style="--d:.6s">
        <a class="btn btn-primary btn-lg magnetic" href="/services" data-track="cta_click" data-label="hero_services">${e(hero.primaryCta)} ${icon('arrowRight', { size: 18 })}</a>
        <a class="btn btn-ghost btn-lg" href="/contact" data-track="cta_click" data-label="hero_start">${e(hero.secondaryCta)}</a>
      </div>
      <ul class="hero-assure fade-up" style="--d:.75s" role="list">
        <li>${icon('check', { size: 16 })} Free first consultation</li>
        <li>${icon('check', { size: 16 })} ${e(settings.responseTime.replace(/\.$/, ''))}</li>
      </ul>
    </div>
    <div class="hero-visual">${orbit(services)}</div>
  </div>
</section>

<div class="ticker" aria-hidden="true"><div class="ticker-track">
  ${[0, 1].map(() => html`<span>${['Instagram growth', 'Business websites', 'Kotlin & Jetpack Compose', 'Google Business Profile', 'Reels & video', 'E-commerce', 'WhatsApp Business', 'SEO', 'Brand identity', 'Firebase apps', 'Paid ads', 'Automation'].map((t) => html`<b>${e(t)}</b><i></i>`)}</span>`)}
</div></div>

<section class="section" aria-labelledby="value-title">
  <div class="wrap">
    <div class="section-head reveal">
      <h2 id="value-title" class="h2">Your Entire Digital Journey, Simplified.</h2>
      <p class="lead">Most businesses juggle a designer, a developer, a social media freelancer and someone for Google listings. With us, it is one conversation, one plan and one team that keeps it all working together.</p>
    </div>
    <div class="value-grid">
      ${[
        ['layers', 'Everything Under One Roof', 'Marketing, websites, apps and business tools from a single partner — no hand-offs, no finger-pointing.'],
        ['target', 'Solutions Built Around Your Goals', 'We start with what you want to achieve — more calls, more orders, more followers — and build only what moves that number.'],
        ['headset', 'Support Beyond Delivery', 'Launch is the start. We maintain, update and improve what we build, and we are a WhatsApp message away.'],
      ].map(([ic, t, b], i) => html`<article class="value reveal" style="--d:${i * 0.08}s"><span class="value-ico">${icon(ic, { size: 22 })}</span><h3>${e(t)}</h3><p>${e(b)}</p></article>`)}
    </div>
  </div>
</section>

<section class="section section-alt" id="services" aria-labelledby="services-title">
  <div class="wrap">
    <div class="section-head split reveal">
      <h2 id="services-title" class="h2">What we do</h2>
      <p class="lead">Four core practices, designed to work on their own or together. Pick one to start — add the rest when you are ready.</p>
    </div>
    <div class="svc-grid">
      ${main.map((s, i) => html`<article class="svc-card hue-${e(s.hue)} reveal spotlight" style="--d:${i * 0.06}s">
        <div class="svc-top"><span class="svc-ico">${icon(s.icon, { size: 24 })}</span><span class="svc-tag">${e(s.shortTitle || '')}</span></div>
        <h3><a href="/services/${e(s.slug)}" class="stretch">${e(s.title)}</a></h3>
        <p>${e(s.summary)}</p>
        <ul class="chips" role="list">${s.features.map((f) => html`<li>${e(f)}</li>`)}</ul>
        <span class="svc-cta">${e(s.cta)} ${icon('arrowUpRight', { size: 18 })}</span>
      </article>`)}
    </div>
    ${extra.map((s) => html`<a class="svc-strip hue-${e(s.hue)} reveal" href="/services/${e(s.slug)}"><span class="svc-ico">${icon(s.icon, { size: 22 })}</span><span><strong>${e(s.title)}</strong> ${e(s.summary)}</span>${icon('arrowRight', { size: 20 })}</a>`)}
  </div>
</section>

<section class="section finder" id="finder" aria-labelledby="finder-title">
  <div class="wrap">
    <div class="section-head reveal"><h2 id="finder-title" class="h2">What Are You Looking to Build?</h2>
      <p class="lead">Choose the line that sounds most like you. We will show you where to start.</p></div>
    <div class="finder-grid reveal" data-finder>
      <div class="finder-options" role="tablist" aria-label="Choose what you need" aria-orientation="vertical">
        ${FINDER.map((f, i) => html`<button type="button" role="tab" id="ft-${f.key}" aria-controls="fp-${f.key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" class="finder-opt" data-key="${f.key}">
          <span class="fo-ico">${icon(f.icon, { size: 20 })}</span><span>${e(f.label)}</span></button>`)}
      </div>
      <div class="finder-panels">
        ${FINDER.map((f, i) => html`<div class="finder-panel" role="tabpanel" id="fp-${f.key}" aria-labelledby="ft-${f.key}"${i === 0 ? '' : ' hidden'}>
          <h3>${e(f.title)}</h3><p>${e(f.text)}</p>
          <ul class="ticks" role="list">${f.points.map((pt) => html`<li>${icon('check', { size: 16 })} ${e(pt)}</li>`)}</ul>
          <div class="panel-ctas">
            <a class="btn btn-primary" href="/contact?service=${encodeURIComponent(f.category)}&amp;need=${f.key}#form" data-track="cta_click" data-label="finder_${f.key}">Discuss My Requirement ${icon('arrowRight', { size: 18 })}</a>
            ${f.slug ? html`<a class="btn btn-ghost" href="/services/${f.slug}">Learn more</a>` : html`<a class="btn btn-ghost" href="/services">See all services</a>`}
          </div>
        </div>`)}
      </div>
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="process-title">
  <div class="wrap">
    <div class="section-head reveal"><h2 id="process-title" class="h2">How We Work</h2>
      <p class="lead">A simple, predictable process — you always know what is happening and what comes next.</p></div>
    <ol class="timeline" role="list" data-timeline>
      ${[
        ['Discover', "Understand the client's goals and requirements.", 'A short call or chat about your business, audience and what success looks like.'],
        ['Strategize', 'Create the right approach, scope and execution plan.', 'A written plan with scope, timeline and price — agreed before work begins.'],
        ['Build & Execute', 'Develop, design, manage and implement the solution.', 'Regular previews so you can give feedback early, not just at the end.'],
        ['Grow & Support', 'Provide maintenance, insights and ongoing support.', 'Launch, measure, improve. Ongoing updates and support when you need them.'],
      ].map(([t, a, b], i) => html`<li class="tl-step reveal" style="--d:${i * 0.1}s"><span class="tl-no">${String(i + 1).padStart(2, '0')}</span><h3>${e(t)}</h3><p class="tl-a">${e(a)}</p><p>${e(b)}</p></li>`)}
    </ol>
  </div>
</section>

<section class="section" aria-labelledby="work-title">
  <div class="wrap">
    <div class="section-head split reveal"><h2 id="work-title" class="h2">Featured work</h2>
      <a class="link-arrow" href="/work">All projects ${icon('arrowRight', { size: 18 })}</a></div>
    ${showcase.length
      ? html`<div class="work-grid">${showcase.map((p, i) => projectCard(p, i))}</div>`
      : html`<div class="empty reveal"><p>Our first case studies are being written up. In the meantime, <a href="/contact">ask us for examples</a> relevant to your project.</p></div>`}
  </div>
</section>

<section class="section section-alt" aria-labelledby="why-title">
  <div class="wrap why">
    <div class="section-head reveal"><h2 id="why-title" class="h2">Why choose us?</h2>
      <p class="lead">Practical reasons, not buzzwords.</p></div>
    <ul class="why-list" role="list">
      ${[
        ['layers', 'Integrated digital solutions', 'Your site, socials, app and tools are planned together, so they share one look and one goal.'],
        ['cpu', 'Modern technologies', 'Kotlin, Jetpack Compose, Firebase and today’s web platform — fast, secure and maintainable.'],
        ['trending', 'Business-oriented thinking', 'Every recommendation is tied to customers, enquiries or revenue — not trends.'],
        ['message', 'Clear communication', 'Plain language, regular updates and quick replies on WhatsApp and email.'],
        ['target', 'Customised strategies', 'No copy-paste packages. The plan fits your business, audience and budget.'],
        ['shield', 'Long-term technical support', 'Maintenance, security updates and improvements long after launch.'],
      ].map(([ic, t, b], i) => html`<li class="why-item reveal" style="--d:${(i % 3) * 0.06}s"><span>${icon(ic, { size: 20 })}</span><div><h3>${e(t)}</h3><p>${e(b)}</p></div></li>`)}
    </ul>
  </div>
</section>

${testimonials.length ? html`<section class="section" aria-labelledby="t-title">
  <div class="wrap"><div class="section-head reveal"><h2 id="t-title" class="h2">What clients say</h2></div>
  <div class="t-grid">${testimonials.slice(0, 6).map((t, i) => html`<figure class="t-card reveal" style="--d:${i * 0.06}s">${icon('quote', { size: 22, cls: 't-q' })}<blockquote>${e(t.feedback)}</blockquote>
    <figcaption>${t.image ? html`<img src="${e(t.image)}" alt="" width="40" height="40" loading="lazy">` : html`<span class="t-av">${e(t.name.slice(0, 1))}</span>`}<span><strong>${e(t.name)}</strong>${t.company ? html`<small>${e(t.company)}${t.category ? ` — ${e(t.category)}` : ''}</small>` : ''}</span></figcaption></figure>`)}</div></div>
</section>` : ''}

<section class="section ${testimonials.length ? 'section-alt' : ''}" aria-labelledby="faq-title">
  <div class="wrap faq-home">
    <div class="section-head reveal"><h2 id="faq-title" class="h2">Questions, answered</h2>
      <p class="lead">Can’t find what you’re looking for? <a href="/faq">See every FAQ</a> or <a href="${e(waLink(settings, 'Hi! I have a question.'))}" target="_blank" rel="noopener">ask us on WhatsApp</a>.</p></div>
    <div class="faq-list reveal">${faqs.map((f) => html`<details class="faq"><summary><span>${e(f.q)}</span>${icon('plus', { size: 18, cls: 'faq-ico' })}</summary><div class="faq-a"><p>${e(f.a)}</p></div></details>`)}</div>
  </div>
</section>

<section class="final-cta" aria-labelledby="cta-title">
  <div class="wrap final-inner reveal">
    <h2 id="cta-title" class="display-2">${e(content.finalCta.headline)}</h2>
    <p class="lead">${e(content.finalCta.text)}</p>
    <div class="hero-ctas center">
      <a class="btn btn-primary btn-lg magnetic" href="/contact#form" data-track="cta_click" data-label="final_start">Start Your Project ${icon('arrowRight', { size: 18 })}</a>
      <a class="btn btn-ghost btn-lg" href="/contact" data-track="cta_click" data-label="final_contact">Contact Us</a>
    </div>
  </div>
</section>`;

  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  return layout({ content, path: '/', body, jsonLd: [faqLd], bodyClass: 'page-home' });
}
