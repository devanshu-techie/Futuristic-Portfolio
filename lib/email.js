// Transactional email: Resend API, SMTP (e.g. Gmail app password), or FormSubmit fallback.
import { sendSmtp } from './smtp.js';
import { escapeHtml } from './html.js';

export function emailProvider() {
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.SMTP_USER && process.env.SMTP_PASS) return 'smtp';
  if (process.env.EMAIL_FALLBACK !== 'off') return 'formsubmit';
  return 'none';
}

function fromAddress(settings) {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  if (emailProvider() === 'smtp') return `${settings.brand} <${process.env.SMTP_USER}>`;
  return `${settings.brand} <onboarding@resend.dev>`;
}

async function sendOne({ to, subject, html, text, replyTo, settings }) {
  const provider = emailProvider();
  if (provider === 'resend') {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: fromAddress(settings), to: [to], subject, html, text, reply_to: replyTo }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return true;
  }
  if (provider === 'smtp') {
    return sendSmtp({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: fromAddress(settings),
      to, replyTo, subject, html, text,
    });
  }
  throw new Error('No direct email provider configured');
}

// ---------- Templates ----------
function shell(settings, inner, preheader = '') {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f7;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#17171f">
<span style="display:none;opacity:0;max-height:0;overflow:hidden">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6e6ee">
<tr><td style="background:#0b0b14;padding:22px 28px;color:#fff;font-size:18px;font-weight:700;letter-spacing:.2px">
<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ffb547;margin-right:10px"></span>${escapeHtml(settings.brand)}</td></tr>
<tr><td style="padding:28px">${inner}</td></tr>
<tr><td style="padding:18px 28px;background:#fafafc;color:#6b6b7b;font-size:12px;line-height:1.6;border-top:1px solid #eeeef4">
${escapeHtml(settings.brand)} · ${escapeHtml(settings.tagline || '')}<br>
<a href="mailto:${escapeHtml(settings.email)}" style="color:#6d4ad8">${escapeHtml(settings.email)}</a> · ${escapeHtml(settings.phone || '')}
</td></tr></table></td></tr></table></body></html>`;
}

function row(label, value) {
  if (!value) return '';
  return `<tr><td style="padding:8px 0;color:#6b6b7b;font-size:13px;width:150px;vertical-align:top">${escapeHtml(label)}</td>
<td style="padding:8px 0;font-size:14px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`;
}

export function adminEmailContent(enq, settings, siteUrl) {
  const subject = `New Project Enquiry — ${enq.serviceCategory}`;
  const extras = Object.entries(enq.extra || {}).map(([k, v]) => row(k, v)).join('');
  const html = shell(settings, `
<h1 style="margin:0 0 6px;font-size:20px">New enquiry from ${escapeHtml(enq.fullName)}</h1>
<p style="margin:0 0 18px;color:#6b6b7b;font-size:14px">Reference <strong style="color:#17171f">${escapeHtml(enq.ref)}</strong></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row('Service', enq.serviceCategory)}${row('Subject', enq.subject)}${row('Name', enq.fullName)}
${row('Email', enq.email)}${row('Phone', enq.phone)}${row('Company / brand', enq.company)}
${row('Budget', enq.budget)}${row('Timeline', enq.timeline)}${row('Preferred contact', enq.preferredContact)}
${extras}${row('Requirement', enq.message)}${row('Attachment', enq.attachment ? `${enq.attachment.name} (open in admin)` : '')}
</table>
<p style="margin:22px 0 0"><a href="${escapeHtml(siteUrl)}/admin/enquiries/${escapeHtml(enq.ref)}" style="display:inline-block;background:#6d4ad8;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">Open in admin</a>
${enq.phone ? `&nbsp; <a href="https://wa.me/${escapeHtml(enq.phone.replace(/\D/g, '').replace(/^(\d{10})$/, '91$1'))}" style="color:#128c4a;font-weight:600">Reply on WhatsApp</a>` : ''}</p>`, `New ${enq.serviceCategory} enquiry`);
  const text = `New enquiry ${enq.ref}\n\nService: ${enq.serviceCategory}\nSubject: ${enq.subject}\nName: ${enq.fullName}\nEmail: ${enq.email}\nPhone: ${enq.phone || '-'}\nCompany: ${enq.company || '-'}\nBudget: ${enq.budget || '-'}\nTimeline: ${enq.timeline || '-'}\n\n${enq.message}\n\nAdmin: ${siteUrl}/admin/enquiries/${enq.ref}`;
  return { subject, html, text };
}

export function ackText(enq, settings) {
  return `Thank you for reaching out to ${settings.brand}.\n\nWe've successfully received your enquiry. Our team will review your requirements and connect with you regarding the next steps.\n\nYour enquiry reference is: ${enq.ref}.\n\nWe appreciate your interest in our digital solutions.`;
}

export function customerEmailContent(enq, settings, siteUrl) {
  const subject = `We've Received Your Enquiry — ${settings.brand}`;
  const html = shell(settings, `
<h1 style="margin:0 0 14px;font-size:20px">Hi ${escapeHtml(enq.fullName.split(' ')[0])},</h1>
<p style="font-size:15px;line-height:1.65;margin:0 0 12px">Thank you for reaching out to ${escapeHtml(settings.brand)}.</p>
<p style="font-size:15px;line-height:1.65;margin:0 0 12px">We've successfully received your enquiry. Our team will review your requirements and connect with you regarding the next steps.</p>
<div style="margin:20px 0;padding:16px 18px;border-radius:12px;background:#f5f1ff;border:1px solid #e3d9ff">
<div style="font-size:12px;color:#6b6b7b">Your enquiry reference is</div>
<div style="font-size:22px;font-weight:700;letter-spacing:1px;margin-top:4px">${escapeHtml(enq.ref)}</div></div>
<p style="font-size:15px;line-height:1.65;margin:0 0 18px">We appreciate your interest in our digital solutions.</p>
<p style="margin:0"><a href="${escapeHtml(siteUrl)}/track?ref=${escapeHtml(enq.ref)}" style="display:inline-block;background:#6d4ad8;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">Track your enquiry</a></p>
<p style="font-size:13px;color:#6b6b7b;margin:20px 0 0">Summary — ${escapeHtml(enq.serviceCategory)}: ${escapeHtml(enq.subject)}</p>`, `Reference ${enq.ref}`);
  return { subject, html, text: `${ackText(enq, settings)}\n\nTrack your enquiry: ${siteUrl}/track?ref=${enq.ref}` };
}

/** Sends the admin notification and customer acknowledgement. Never throws. */
export async function sendEnquiryEmails(enq, settings, siteUrl) {
  const provider = emailProvider();
  const result = { provider, admin: false, customer: false, errors: [] };
  const to = settings.notifyEmail || settings.email;

  if (provider === 'resend' || provider === 'smtp') {
    const a = adminEmailContent(enq, settings, siteUrl);
    const c = customerEmailContent(enq, settings, siteUrl);
    const [ra, rc] = await Promise.allSettled([
      sendOne({ to, replyTo: enq.email, settings, ...a }),
      sendOne({ to: enq.email, replyTo: settings.email, settings, ...c }),
    ]);
    result.admin = ra.status === 'fulfilled';
    result.customer = rc.status === 'fulfilled';
    if (ra.status === 'rejected') result.errors.push(`admin: ${ra.reason.message}`);
    if (rc.status === 'rejected') result.errors.push(`customer: ${rc.reason.message}`);
    return result;
  }

  if (provider === 'formsubmit') {
    // FormSubmit delivers to the inbox (one-time activation link on first use) and
    // sends the customer an auto-response with their reference number.
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          origin: siteUrl,
          referer: `${siteUrl}/contact`,
        },
        body: JSON.stringify({
          _subject: `New Project Enquiry — ${enq.serviceCategory} (${enq.ref})`,
          _template: 'table',
          _captcha: 'false',
          _replyto: enq.email,
          _autoresponse: ackText(enq, settings),
          name: enq.fullName,
          email: enq.email,
          Reference: enq.ref,
          Service: enq.serviceCategory,
          Subject: enq.subject,
          Phone: enq.phone || '-',
          Company: enq.company || '-',
          Budget: enq.budget || '-',
          Timeline: enq.timeline || '-',
          'Preferred contact': enq.preferredContact || '-',
          ...Object.fromEntries(Object.entries(enq.extra || {})),
          Requirement: enq.message,
          'Open in admin': `${siteUrl}/admin/enquiries/${enq.ref}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      result.admin = res.ok && String(data.success) !== 'false';
      result.customer = result.admin;
      if (!result.admin) result.errors.push(`formsubmit: ${data.message || res.status}`);
    } catch (err) {
      result.errors.push(`formsubmit: ${err.message}`);
    }
    return result;
  }
  result.errors.push('No email provider configured');
  return result;
}

export async function sendPlainEmail(to, subject, text, settings) {
  const provider = emailProvider();
  if (provider === 'resend' || provider === 'smtp') {
    const html = shell(settings, `<p style="font-size:15px;line-height:1.65;white-space:pre-wrap">${escapeHtml(text)}</p>`);
    return sendOne({ to, subject, html, text, settings });
  }
  if (provider === 'formsubmit') {
    const site = process.env.SITE_URL || 'https://devanshugulati.in';
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json', origin: site, referer: `${site}/admin` },
      body: JSON.stringify({ _subject: subject, _captcha: 'false', _template: 'box', message: text }),
    });
    if (!res.ok) throw new Error(`formsubmit ${res.status}`);
    return true;
  }
  throw new Error('No email provider configured');
}
