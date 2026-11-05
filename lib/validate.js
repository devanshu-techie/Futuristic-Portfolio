// Input validation shared by the server and unit tests.
import { SERVICE_CATEGORIES, BUDGETS, TIMELINES, ENQUIRY_STATUSES, PROJECT_CATEGORIES } from './defaults.js';

export const LIMITS = {
  name: 80, email: 120, phone: 20, company: 100, subject: 140, message: 4000,
  attachmentBytes: 4 * 1024 * 1024,
};

export const ATTACHMENT_TYPES = {
  'application/pdf': { ext: 'pdf', magic: [[0x25, 0x50, 0x44, 0x46]] },
  'image/png': { ext: 'png', magic: [[0x89, 0x50, 0x4e, 0x47]] },
  'image/jpeg': { ext: 'jpg', magic: [[0xff, 0xd8, 0xff]] },
  'image/webp': { ext: 'webp', magic: [[0x52, 0x49, 0x46, 0x46]] },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', magic: [[0x50, 0x4b, 0x03, 0x04]] },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: 'pptx', magic: [[0x50, 0x4b, 0x03, 0x04]] },
  'application/zip': { ext: 'zip', magic: [[0x50, 0x4b, 0x03, 0x04]] },
};

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

export function clean(value, max = 500) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, max);
}

export function isEmail(value) {
  return EMAIL_RE.test(value) && value.length <= LIMITS.email;
}

/** Accepts Indian and international numbers; returns normalised digits with optional leading + */
export function normalisePhone(value) {
  const raw = clean(value, 30);
  if (!raw) return '';
  const plus = raw.startsWith('+');
  const digits = raw.replace(/\D/g, '');
  return plus ? `+${digits}` : digits;
}

export function isPhone(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function validateEnquiry(input) {
  const data = {
    fullName: clean(input.fullName, LIMITS.name),
    email: clean(input.email, LIMITS.email).toLowerCase(),
    phone: normalisePhone(input.phone),
    company: clean(input.company, LIMITS.company),
    serviceCategory: clean(input.serviceCategory, 60),
    subject: clean(input.subject, LIMITS.subject),
    budget: clean(input.budget, 60),
    timeline: clean(input.timeline, 60),
    message: clean(input.message, LIMITS.message),
    preferredContact: clean(input.preferredContact, 20),
    extra: {},
  };
  const errors = {};
  if (data.fullName.length < 2) errors.fullName = 'Enter your full name.';
  if (!isEmail(data.email)) errors.email = 'Enter a valid email address, like name@example.com.';
  if (data.phone && !isPhone(data.phone)) errors.phone = 'Enter a phone number with 10 to 15 digits.';
  if (!SERVICE_CATEGORIES.includes(data.serviceCategory)) errors.serviceCategory = 'Choose the service you need.';
  if (data.subject.length < 3) errors.subject = 'Add a short subject for your project.';
  if (data.budget && !BUDGETS.includes(data.budget)) errors.budget = 'Choose a budget from the list.';
  if (data.timeline && !TIMELINES.includes(data.timeline)) errors.timeline = 'Choose a timeline from the list.';
  if (data.message.length < 20) errors.message = 'Describe your requirement in at least 20 characters.';
  if (data.preferredContact && !['Email', 'Phone', 'WhatsApp'].includes(data.preferredContact)) data.preferredContact = '';
  // Optional project-specific answers (e.g. Android or website questions).
  if (input.extra && typeof input.extra === 'object') {
    for (const [k, v] of Object.entries(input.extra).slice(0, 12)) {
      const key = clean(k, 60);
      const val = clean(v, 400);
      if (key && val) data.extra[key] = val;
    }
  }
  return { data, errors, ok: Object.keys(errors).length === 0 };
}

export function checkAttachment(bytes, type, size) {
  if (!size) return { ok: true, none: true };
  if (size > LIMITS.attachmentBytes) return { ok: false, error: 'Attachments must be 4 MB or smaller.' };
  const spec = ATTACHMENT_TYPES[type];
  if (!spec) return { ok: false, error: 'Attach a PDF, PNG, JPG, WEBP, DOCX, PPTX or ZIP file.' };
  const head = bytes.subarray(0, 8);
  const match = spec.magic.some((sig) => sig.every((b, i) => head[i] === b));
  if (!match) return { ok: false, error: 'That file does not look like the type it claims to be.' };
  return { ok: true, ext: spec.ext };
}

export function isStatus(value) {
  return ENQUIRY_STATUSES.includes(value);
}

// ---------- Content validation for the admin editor ----------
const str = (v, max = 400) => clean(v, max);
const bool = (v) => v === true || v === 'true';
const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const slug = (v) => clean(v, 80).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
const url = (v) => {
  const s = clean(v, 500);
  if (!s) return '';
  if (s.startsWith('/') && !s.startsWith('//')) return s;
  try {
    const u = new URL(s);
    return ['http:', 'https:'].includes(u.protocol) ? u.toString() : '';
  } catch { return ''; }
};
const strList = (v, max = 30, len = 160) => (Array.isArray(v) ? v : String(v || '').split('\n')).map((x) => str(x, len)).filter(Boolean).slice(0, max);
const id = (v) => slug(v) || Math.random().toString(36).slice(2, 10);

export function sanitizeContent(input, base) {
  const c = structuredClone(base);
  const s = input.settings;
  if (s) c.settings = {
    ...c.settings,
    brand: str(s.brand, 60) || c.settings.brand,
    tagline: str(s.tagline, 120),
    description: str(s.description, 300),
    email: isEmail(str(s.email, 120)) ? str(s.email, 120) : c.settings.email,
    notifyEmail: isEmail(str(s.notifyEmail, 120)) ? str(s.notifyEmail, 120) : c.settings.notifyEmail,
    phone: str(s.phone, 30),
    whatsapp: String(s.whatsapp || '').replace(/\D/g, '').slice(0, 15),
    location: str(s.location, 120),
    workingHours: str(s.workingHours, 120),
    responseTime: str(s.responseTime, 200),
    gaId: /^G-[A-Z0-9]{4,15}$/.test(str(s.gaId, 20)) ? str(s.gaId, 20) : '',
    socials: Object.fromEntries(['linkedin', 'instagram', 'youtube', 'facebook', 'x', 'github'].map((k) => [k, url(s.socials?.[k])])),
    announcement: {
      enabled: bool(s.announcement?.enabled),
      text: str(s.announcement?.text, 160),
      link: url(s.announcement?.link),
    },
  };
  if (input.hero) {
    c.hero = {
      headline: str(input.hero.headline, 120) || c.hero.headline,
      subhead: str(input.hero.subhead, 400),
      primaryCta: str(input.hero.primaryCta, 40) || c.hero.primaryCta,
      secondaryCta: str(input.hero.secondaryCta, 40) || c.hero.secondaryCta,
    };
  }
  if (input.finalCta) {
    c.finalCta = { headline: str(input.finalCta.headline, 120), text: str(input.finalCta.text, 300) };
  }
  if (input.about) {
    c.about = {
      intro: str(input.about.intro, 1200),
      founder: str(input.about.founder, 1200),
      values: (input.about.values || []).slice(0, 6).map((v) => ({ title: str(v.title, 80), body: str(v.body, 400) })).filter((v) => v.title),
    };
  }
  if (Array.isArray(input.services)) {
    const bySlug = Object.fromEntries(base.services.map((x) => [x.slug, x]));
    c.services = input.services.slice(0, 20).map((x) => {
      const prev = bySlug[x.slug] || {};
      return {
        ...prev,
        slug: slug(x.slug) || prev.slug,
        title: str(x.title, 100),
        shortTitle: str(x.shortTitle, 40),
        icon: ['megaphone', 'globe', 'smartphone', 'briefcase', 'palette', 'sparkles'].includes(x.icon) ? x.icon : prev.icon || 'sparkles',
        hue: ['violet', 'blue', 'green', 'amber', 'rose'].includes(x.hue) ? x.hue : prev.hue || 'violet',
        visible: bool(x.visible),
        order: num(x.order, 99),
        summary: str(x.summary, 400),
        intro: str(x.intro, 800),
        features: strList(x.features, 20, 80),
        cta: str(x.cta, 40),
        image: url(x.image),
        sections: Array.isArray(x.sections)
          ? x.sections.slice(0, 16).map((sec) => ({ title: str(sec.title, 80), body: str(sec.body, 500), idealFor: str(sec.idealFor, 160) })).filter((sec) => sec.title)
          : prev.sections || [],
      };
    }).filter((x) => x.slug && x.title);
  }
  if (Array.isArray(input.projects)) {
    c.projects = input.projects.slice(0, 60).map((p) => ({
      id: id(p.id || p.slug || p.title),
      slug: slug(p.slug || p.title),
      title: str(p.title, 100),
      client: str(p.client, 100),
      category: PROJECT_CATEGORIES.includes(p.category) ? p.category : PROJECT_CATEGORIES[0],
      summary: str(p.summary, 400),
      challenge: str(p.challenge, 1200),
      solution: str(p.solution, 1200),
      result: str(p.result, 800),
      tech: strList(p.tech, 15, 40),
      image: url(p.image),
      imageAlt: str(p.imageAlt, 200),
      gallery: strList(p.gallery, 12, 500).map(url).filter(Boolean),
      url: url(p.url),
      status: ['Completed', 'Ongoing', 'Concept'].includes(p.status) ? p.status : 'Completed',
      published: bool(p.published),
      featured: bool(p.featured),
      order: num(p.order, 99),
    })).filter((p) => p.title && p.slug);
  }
  if (Array.isArray(input.testimonials)) {
    c.testimonials = input.testimonials.slice(0, 60).map((t) => ({
      id: id(t.id || t.name),
      name: str(t.name, 80),
      company: str(t.company, 100),
      feedback: str(t.feedback, 800),
      category: str(t.category, 60),
      image: url(t.image),
      approved: bool(t.approved),
      order: num(t.order, 99),
    })).filter((t) => t.name && t.feedback);
  }
  if (Array.isArray(input.faqs)) {
    c.faqs = input.faqs.slice(0, 80).map((f) => ({
      id: id(f.id || f.q),
      category: str(f.category, 40),
      q: str(f.q, 200),
      a: str(f.a, 1500),
    })).filter((f) => f.q && f.a);
  }
  return c;
}
