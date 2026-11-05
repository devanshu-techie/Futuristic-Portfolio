// Renders every HTML page (public website and admin shell).
import { renderPath } from '../lib/router.js';
import { htmlResponse } from '../lib/http.js';

async function handle(request) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get('__path') ?? url.pathname;
    return await renderPath(request, path);
  } catch (err) {
    console.error('[render]', err?.stack || err);
    return htmlResponse('<!doctype html><meta charset="utf-8"><title>Temporarily unavailable</title><body style="font-family:system-ui;background:#0a0a12;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0"><div style="text-align:center;max-width:420px;padding:24px"><h1>We will be right back</h1><p style="color:#a1a1aa">The page could not load. Please refresh in a moment, or WhatsApp us on +91 70566 97860.</p></div>', { status: 500, cache: 'no-store' });
  }
}

export function GET(request) { return handle(request); }
export function HEAD(request) { return handle(request); }
