// Health check: reports which integrations are configured (never their values).
import { json } from '../lib/http.js';
import { storageMode } from '../lib/storage.js';
import { emailProvider } from '../lib/email.js';

export function GET() {
  return json({
    ok: true,
    time: new Date().toISOString(),
    storage: storageMode(),
    email: emailProvider(),
    adminConfigured: Boolean(process.env.ADMIN_PASSWORD),
    secrets: Boolean(process.env.SESSION_SECRET && process.env.DATA_ENCRYPTION_KEY),
    commit: (process.env.VERCEL_GIT_COMMIT_SHA || 'local').slice(0, 7),
  });
}
