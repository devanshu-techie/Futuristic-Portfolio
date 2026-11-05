// Maps a URL path to a rendered page.
import { getContent } from './content.js';
import { htmlResponse, redirect, NO_STORE } from './http.js';
import { siteUrl } from './html.js';
import { readSession } from './auth.js';
import { homePage } from './pages/home.js';
import { servicesIndexPage, servicePage } from './pages/services.js';
import { workPage, projectPage, aboutPage, contactPage, faqPage, trackPage, notFoundPage } from './pages/misc.js';
import { privacyPage, termsPage, refundPage } from './pages/legal.js';
import { loginPage, adminApp } from './pages/admin.js';

const STATIC_ROUTES = {
  '/': homePage,
  '/services': servicesIndexPage,
  '/work': workPage,
  '/about': aboutPage,
  '/faq': faqPage,
  '/privacy-policy': privacyPage,
  '/terms-and-conditions': termsPage,
  '/refund-policy': refundPage,
};

function normalise(path) {
  let p = decodeURIComponent(path || '/').replace(/\/{2,}/g, '/');
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p.toLowerCase() === p ? p : p; // keep case for slugs; slugs are lower-case anyway
}

export function sitemapXml(content) {
  const urls = [
    '/', '/services', ...content.services.filter((s) => s.visible).map((s) => `/services/${s.slug}`),
    '/work', ...content.projects.filter((p) => p.published).map((p) => `/work/${p.slug}`),
    '/about', '/contact', '/faq', '/privacy-policy', '/terms-and-conditions', '/refund-policy',
  ];
  const lastmod = (content.updatedAt || new Date().toISOString()).slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${siteUrl()}${u === '/' ? '/' : u}</loc><lastmod>${lastmod}</lastmod><changefreq>${u === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${u === '/' ? '1.0' : u.split('/').length > 2 ? '0.7' : '0.8'}</priority></url>`).join('\n')}
</urlset>`;
}

export async function renderPath(request, rawPath) {
  const url = new URL(request.url);
  const path = normalise(rawPath ?? url.pathname);

  // ---------- Admin ----------
  if (path === '/admin' || path.startsWith('/admin/')) {
    const session = await readSession(request);
    const headers = { 'x-robots-tag': 'noindex, nofollow' };
    if (path === '/admin/login') {
      if (session) return redirect('/admin/dashboard');
      return htmlResponse(loginPage({ notice: url.searchParams.get('notice') === 'reset' ? 'Password updated. Sign in with your new password.' : '' }), { cache: NO_STORE, headers });
    }
    if (path === '/admin/reset') {
      return htmlResponse(loginPage({ reset: (url.searchParams.get('token') || '').slice(0, 64) }), { cache: NO_STORE, headers });
    }
    if (!session) return redirect(`/admin/login`, 303, headers);
    if (path === '/admin') return redirect('/admin/dashboard', 303, headers);
    return htmlResponse(adminApp(session), { cache: NO_STORE, headers });
  }

  const content = await getContent();

  if (path === '/sitemap.xml') {
    return new Response(sitemapXml(content), { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
  }
  if (path === '/contact' || path === '/track') {
    // Rendered per request (query-dependent prefill); still edge-cacheable per URL.
    const page = path === '/contact' ? contactPage(content, url.searchParams) : trackPage(content, url.searchParams);
    return htmlResponse(page);
  }
  if (STATIC_ROUTES[path]) return htmlResponse(STATIC_ROUTES[path](content));

  const svc = path.match(/^\/services\/([a-z0-9-]+)$/);
  if (svc) {
    const page = servicePage(content, svc[1]);
    if (page) return htmlResponse(page);
  }
  const work = path.match(/^\/work\/([a-z0-9-]+)$/);
  if (work) {
    const page = projectPage(content, work[1]);
    if (page) return htmlResponse(page);
  }
  // Friendly aliases
  const aliases = { '/solutions': '/#finder', '/our-work': '/work', '/portfolio': '/work', '/start': '/contact', '/privacy': '/privacy-policy', '/terms': '/terms-and-conditions', '/refunds': '/refund-policy' };
  if (aliases[path]) return redirect(aliases[path], 308);

  return htmlResponse(notFoundPage(content), { status: 404, cache: 'public, max-age=0, s-maxage=60' });
}
