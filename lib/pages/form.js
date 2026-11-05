// The enquiry form used on /contact (multi-step) and on service pages (single step).
import { e, html } from '../html.js';
import { icon } from '../icons.js';
import { SERVICE_CATEGORIES, BUDGETS, TIMELINES } from '../defaults.js';
import { hmac } from '../crypto.js';

export function formToken() {
  const ts = String(Date.now());
  return `${ts}.${hmac(ts, 'FORM_SECRET')}`;
}

export const EXTRA_QUESTIONS = {
  'Android App Development': [
    { name: 'App type', type: 'select', options: ['New app from scratch', 'Improve an existing app', 'Convert a website to an app', 'Not sure yet'] },
    { name: 'Key features', type: 'text', placeholder: 'Login, payments, chat, maps, notifications…' },
    { name: 'Backend', type: 'select', options: ['I need one built', 'I already have an API/backend', 'Firebase is fine', 'Not sure'] },
    { name: 'Play Store account', type: 'select', options: ['I have a developer account', 'I need help creating one', 'Not sure'] },
  ],
  'Website Development': [
    { name: 'Website type', type: 'select', options: ['Business website', 'Landing page', 'E-commerce store', 'Portfolio', 'Redesign of an existing site', 'Other'] },
    { name: 'Approximate pages', type: 'select', options: ['1 page', '2–5 pages', '6–10 pages', 'More than 10'] },
    { name: 'Domain', type: 'select', options: ['I already have a domain', 'I need a new domain', 'Not sure'] },
    { name: 'Current website', type: 'text', placeholder: 'https://… (if you have one)' },
  ],
  'Social Media Management': [
    { name: 'Platforms', type: 'text', placeholder: 'Instagram, Facebook, YouTube, X…' },
    { name: 'Profile link', type: 'text', placeholder: '@yourbrand or a link' },
    { name: 'Main goal', type: 'select', options: ['More followers & reach', 'More enquiries & sales', 'Consistent posting', 'Launch a new brand'] },
  ],
  'Digital Marketing': [
    { name: 'Channels', type: 'text', placeholder: 'Meta ads, Google ads, SEO…' },
    { name: 'Main goal', type: 'select', options: ['Leads & enquiries', 'Online sales', 'Brand awareness', 'App installs'] },
  ],
  'Digital Business Setup': [
    { name: 'Set up needed', type: 'text', placeholder: 'Google Business Profile, WhatsApp Business, email, payments…' },
    { name: 'Business stage', type: 'select', options: ['Just starting', 'Running offline, going online', 'Already online, need better systems'] },
  ],
  'Branding and Content Creation': [
    { name: 'Needed', type: 'text', placeholder: 'Logo, brand kit, product shoot, videos…' },
    { name: 'Existing brand', type: 'select', options: ['Starting from scratch', 'Refreshing an existing brand'] },
  ],
};

function field({ id, label, required = false, hint = '', control }) {
  return html`<div class="field" data-field="${e(id)}">
  <label for="${e(id)}">${e(label)}${required ? '' : ' <span class="opt">(optional)</span>'}</label>
  ${control}
  ${hint ? html`<p class="hint" id="${e(id)}-hint">${e(hint)}</p>` : ''}
  <p class="err" id="${e(id)}-err" data-err-for="${e(id)}" hidden></p>
</div>`;
}

function select(name, id, options, { required = false, value = '', placeholder = 'Choose…' } = {}) {
  return html`<select id="${e(id)}" name="${e(name)}"${required ? ' required' : ''} aria-describedby="${e(id)}-err">
<option value="">${e(placeholder)}</option>
${options.map((o) => html`<option${o === value ? ' selected' : ''}>${e(o)}</option>`)}</select>`;
}

function extrasBlock(prefix, category) {
  return html`<div class="extras" data-extras>
${Object.entries(EXTRA_QUESTIONS).map(([cat, qs]) => html`<fieldset class="extra-set" data-extra-for="${e(cat)}"${cat === category ? '' : ' hidden'}${cat === category ? '' : ' disabled'}>
  <legend>A few questions about your ${e(cat.toLowerCase())} project</legend>
  <div class="grid-2">${qs.map((q, i) => {
    const id = `${prefix}-x-${cat.replace(/\W+/g, '').toLowerCase()}-${i}`;
    const name = `extra[${q.name}]`;
    const control = q.type === 'select'
      ? select(name, id, q.options)
      : html`<input id="${e(id)}" name="${e(name)}" type="text" maxlength="300" placeholder="${e(q.placeholder || '')}">`;
    return field({ id, label: q.name, control });
  })}</div>
</fieldset>`)}
</div>`;
}

/**
 * @param {object} opts
 * @param {'steps'|'single'} opts.mode
 * @param {string} opts.category preset service category
 * @param {string} opts.subject preset subject
 * @param {string} opts.prefix unique id prefix
 */
export function enquiryForm({ mode = 'steps', category = '', subject = '', message = '', prefix = 'f', page = '/contact' } = {}) {
  const cat = SERVICE_CATEGORIES.includes(category) ? category : '';
  const steps = mode === 'steps';
  const p = (n) => `${prefix}-${n}`;

  const s1 = html`
<fieldset class="step${steps ? ' is-current' : ''}" data-step="1">
  <legend class="step-title"><span class="step-no">1</span> What do you need?</legend>
  <div class="field" data-field="${p('serviceCategory')}">
    <span class="label" id="${p('cat-label')}">Service</span>
    <div class="choice-grid" role="radiogroup" aria-labelledby="${p('cat-label')}">
      ${SERVICE_CATEGORIES.map((c, i) => html`<label class="choice"><input type="radio" name="serviceCategory" value="${e(c)}"${c === cat ? ' checked data-preset' : ''}${i === 0 ? ` id="${p('serviceCategory')}" required` : ''}><span>${e(c)}</span></label>`)}
    </div>
    <p class="err" data-err-for="serviceCategory" hidden></p>
  </div>
  ${field({ id: p('subject'), label: 'Project subject', required: true, hint: 'One line, e.g. “New website for my bakery”.', control: html`<input id="${p('subject')}" name="subject" type="text" required minlength="3" maxlength="140" value="${e(subject)}" aria-describedby="${p('subject')}-hint ${p('subject')}-err">` })}
</fieldset>`;

  const s2 = html`
<fieldset class="step" data-step="2">
  <legend class="step-title"><span class="step-no">2</span> Tell us about the project</legend>
  ${extrasBlock(prefix, cat)}
  ${field({ id: p('message'), label: 'Detailed requirement', required: true, hint: 'What you want to build, who it is for, and anything you already have. At least 20 characters.', control: html`<textarea id="${p('message')}" name="message" rows="6" required minlength="20" maxlength="4000" aria-describedby="${p('message')}-hint ${p('message')}-err" data-count>${e(message)}</textarea><span class="count" aria-hidden="true" data-count-out>0 / 4000</span>` })}
  <div class="grid-2">
    ${field({ id: p('budget'), label: 'Estimated budget', control: select('budget', p('budget'), BUDGETS) })}
    ${field({ id: p('timeline'), label: 'Project timeline', control: select('timeline', p('timeline'), TIMELINES) })}
  </div>
  ${field({ id: p('attachment'), label: 'Attachment', hint: 'A brief, reference images or a document. PDF, PNG, JPG, WEBP, DOCX, PPTX or ZIP up to 4 MB.', control: html`<label class="drop" data-drop><input id="${p('attachment')}" name="attachment" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.pptx,.zip" aria-describedby="${p('attachment')}-hint ${p('attachment')}-err">${icon('paperclip', { size: 18 })}<span data-drop-label>Choose a file or drop it here</span></label>` })}
</fieldset>`;

  const s3 = html`
<fieldset class="step" data-step="3">
  <legend class="step-title"><span class="step-no">3</span> How can we reach you?</legend>
  <div class="grid-2">
    ${field({ id: p('fullName'), label: 'Full name', required: true, control: html`<input id="${p('fullName')}" name="fullName" type="text" required minlength="2" maxlength="80" autocomplete="name" aria-describedby="${p('fullName')}-err">` })}
    ${field({ id: p('email'), label: 'Email address', required: true, control: html`<input id="${p('email')}" name="email" type="email" required maxlength="120" autocomplete="email" inputmode="email" aria-describedby="${p('email')}-err">` })}
    ${field({ id: p('phone'), label: 'Phone number', hint: 'Include the country code if you are outside India.', control: html`<input id="${p('phone')}" name="phone" type="tel" maxlength="20" autocomplete="tel" inputmode="tel" placeholder="+91" aria-describedby="${p('phone')}-hint ${p('phone')}-err">` })}
    ${field({ id: p('company'), label: 'Company or brand name', control: html`<input id="${p('company')}" name="company" type="text" maxlength="100" autocomplete="organization">` })}
  </div>
  <div class="field">
    <span class="label" id="${p('pref-label')}">Best way to reach you</span>
    <div class="seg" role="radiogroup" aria-labelledby="${p('pref-label')}">
      ${['Email', 'Phone', 'WhatsApp'].map((v, i) => html`<label><input type="radio" name="preferredContact" value="${v}"${i === 0 ? ' checked' : ''}><span>${v}</span></label>`)}
    </div>
  </div>
  <label class="consent-line"><input type="checkbox" name="consent" value="yes" required> <span>I agree to be contacted about this enquiry, as described in the <a href="/privacy-policy" target="_blank">Privacy Policy</a>.</span></label>
  <p class="err" data-err-for="consent" hidden></p>
</fieldset>`;

  return html`
<form class="enquiry ${steps ? 'is-steps' : 'is-single'}" method="post" action="/api/enquiries" enctype="multipart/form-data" novalidate data-enquiry data-mode="${mode}">
  <input type="hidden" name="formToken" value="${e(formToken())}">
  <input type="hidden" name="page" value="${e(page)}">
  <div class="hp" aria-hidden="true"><label>Leave this field empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
  ${steps ? html`<ol class="stepper" role="list" aria-label="Form progress" data-stepper>
    <li class="is-active"><span>1</span> Service</li><li><span>2</span> Details</li><li><span>3</span> Contact</li></ol>
    <div class="progress" aria-hidden="true"><span data-progress></span></div>` : ''}
  ${s1}${s2}${s3}
  <div class="form-alert" role="alert" data-form-alert hidden></div>
  <div class="form-nav">
    ${steps ? html`<button class="btn btn-ghost" type="button" data-prev hidden>Back</button>` : ''}
    ${steps ? html`<button class="btn btn-primary" type="button" data-next>Continue ${icon('arrowRight', { size: 18 })}</button>` : ''}
    <button class="btn btn-primary" type="submit" data-submit${steps ? ' hidden' : ''}><span class="btn-label">Send enquiry</span> ${icon('arrowRight', { size: 18 })}</button>
  </div>
  <p class="form-note">${icon('lock', { size: 14 })} Your details are encrypted and only used to reply to this enquiry.</p>
</form>
<div class="form-success" data-form-success hidden tabindex="-1">
  <div class="success-burst" aria-hidden="true">${icon('check', { size: 34 })}</div>
  <h2 class="h3">Enquiry received</h2>
  <p>Your reference is <strong class="ref" data-ref></strong>. We've emailed you a confirmation and will reply within one working day.</p>
  <div class="success-actions">
    <a class="btn btn-primary" data-wa-followup href="#" target="_blank" rel="noopener" data-track="whatsapp_click">${icon('whatsapp', { size: 18 })} Also message us on WhatsApp</a>
    <a class="btn btn-ghost" data-track-link href="/track">Track this enquiry</a>
  </div>
</div>`;
}
