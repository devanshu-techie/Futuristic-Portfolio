import { e, html, layout, breadcrumbLd } from '../html.js';
import { pageHero } from './shared.js';

function doc(content, { path, title, lead, sections }) {
  const { settings } = content;
  const crumbs = [['Home', '/'], [title, path]];
  const body = html`
${pageHero({ title, lead, crumbs })}
<section class="section"><div class="wrap legal">
  <p class="legal-updated">Last updated: ${e(new Date(content.legal?.updated || '2026-11-06').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }))}</p>
  ${sections.map(([h, paras]) => html`<h2>${e(h)}</h2>${paras.map((p) => html`<p>${p}</p>`)}`)}
  <h2>Contact</h2>
  <p>Questions about this page: <a href="mailto:${e(settings.email)}">${e(settings.email)}</a> or ${e(settings.phone)}.</p>
</div></section>`;
  return layout({ content, path, title, description: lead, body, jsonLd: [breadcrumbLd(crumbs)] });
}

export function privacyPage(content) {
  const b = e(content.settings.brand);
  return doc(content, {
    path: '/privacy-policy', title: 'Privacy Policy',
    lead: 'What we collect when you use this website, why, and how we protect it.',
    sections: [
      ['Information we collect', [
        'When you submit an enquiry we collect the details you enter: your name, email address, and — if you choose to provide them — phone number, company or brand name, budget, timeline, your project description and any file you attach.',
        'Our hosting provider records standard technical information such as IP address, browser type and pages requested, for security and to keep the service running.',
        'If you allow analytics in the consent banner, Google Analytics collects anonymous usage information such as which pages are visited. We do not send your enquiry details to analytics.',
      ]],
      ['How we use it', [
        `${b} uses your information only to respond to your enquiry, prepare proposals, deliver the services you request, and keep records of our communication.`,
        'We do not sell, rent or trade your personal information, and we do not use it for third-party advertising.',
      ]],
      ['How we protect it', [
        'Enquiries are transmitted over HTTPS and stored encrypted (AES-256). Access to the admin dashboard is protected by a password and secure, HttpOnly session cookies.',
      ]],
      ['Service providers', [
        'We use trusted providers to run this website: Vercel (hosting and storage), an email delivery provider to send notifications and confirmations, and Google Analytics only if you consent. They process data on our behalf for these purposes.',
      ]],
      ['How long we keep it', [
        'We keep enquiry records for as long as needed to respond and provide services, and for a reasonable period afterwards for accounting and legal purposes. You can ask us to delete your enquiry at any time.',
      ]],
      ['Your rights', [
        'You can ask to see, correct or delete the personal information we hold about you, or withdraw consent for us to contact you, by emailing us. We respond within a reasonable time, in line with the Digital Personal Data Protection Act, 2023 and other applicable Indian law.',
      ]],
      ['Cookies', [
        'This website uses a strictly necessary cookie for admin sign-in only. Analytics cookies are set only if you choose “Allow analytics”. Your theme preference and any unsent form draft are kept in your own browser’s local storage.',
      ]],
    ],
  });
}

export function termsPage(content) {
  const b = e(content.settings.brand);
  return doc(content, {
    path: '/terms-and-conditions', title: 'Terms and Conditions',
    lead: 'The terms that apply when you use this website or work with us.',
    sections: [
      ['About these terms', [`These terms apply to your use of this website and to services provided by ${b}. A written proposal or agreement for a specific project takes priority over these general terms where they differ.`]],
      ['Proposals and scope', ['Every project begins with a written proposal describing the scope, deliverables, timeline and price. Work outside the agreed scope is quoted separately before it starts.']],
      ['Payments', ['Unless the proposal says otherwise, projects require an advance payment before work begins and the balance on delivery. Monthly services are billed at the start of each month. Invoices are payable within 7 days.']],
      ['Your responsibilities', ['You agree to provide accurate information, timely feedback and the content, access and approvals we need. Delays in providing these may change the timeline.', 'You confirm that you have the right to use any content, logos or material you give us.']],
      ['Ownership', ['On full payment, you own the final deliverables created specifically for you. We may keep using general tools, code libraries and know-how we developed independently. Domains, hosting and accounts are registered in your name wherever possible.']],
      ['Portfolio', ['We may show completed work in our portfolio unless you ask us not to in writing.']],
      ['Third-party services', ['Some services depend on third parties such as Google, Meta, app stores, hosting and payment providers. We are not responsible for their decisions, policies, downtime or pricing changes. Advertising spend is paid by you and is separate from our fees.']],
      ['Registration and compliance guidance', ['Where we assist with business registration, tax or legal formalities, we provide guidance and coordination. Work that legally requires a qualified professional is carried out by, or in coordination with, such a professional.']],
      ['Results', ['We work hard to achieve your goals, but we cannot guarantee specific outcomes such as follower counts, search rankings, sales or app store approval, as these depend on many factors outside our control.']],
      ['Liability', [`To the extent permitted by law, ${b}’s total liability for any project is limited to the fees paid for that project.`]],
      ['Governing law', ['These terms are governed by the laws of India.']],
    ],
  });
}

export function refundPage(content) {
  return doc(content, {
    path: '/refund-policy', title: 'Refund Policy',
    lead: 'How cancellations and refunds work for our projects and monthly services.',
    sections: [
      ['Project work', ['Advance payments reserve time in our schedule and cover initial planning and design. If you cancel before work starts, the advance is refunded in full minus any third-party costs already paid. Once work has begun, the advance is non-refundable, but you receive everything completed up to that point.', 'If a project is cancelled midway, you pay only for the work completed to date, based on the milestones in the proposal.']],
      ['Monthly services', ['Monthly plans can be cancelled with 15 days’ written notice. The current month’s fee is not refunded, and services continue until the end of the paid period.']],
      ['Third-party costs', ['Domains, hosting, paid tools, app store fees and advertising spend are paid to third parties and are not refundable by us.']],
      ['If something is wrong', ['If a deliverable does not match the agreed scope, tell us within 14 days of delivery and we will fix it at no extra cost.']],
      ['How refunds are paid', ['Approved refunds are paid to the original payment method within 7–10 working days.']],
    ],
  });
}
