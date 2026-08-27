/**
 * InsForge SDK client singleton.
 *
 * Extracted into its own module so that services depending on the SDK
 * (auth.service.js, assessment service, etc.) do not need to import from
 * services/api.js — which would create a circular import, because api.js
 * itself re-exports those services. Splitting the client out keeps the
 * dependency graph a clean tree.
 */
import { createClient } from '@insforge/sdk';

// Initialize the InsForge Client
// CRITICAL: never silently fall back to api.insforge.dev or a placeholder key
// when env vars are missing — that produces a generic "Network error" on every
// auth call. We fail loud at startup so the misconfiguration is visible.
const INSFORGE_URL = import.meta.env.VITE_INSFORGE_URL;
const INSFORGE_ANON_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY;

if (!INSFORGE_URL) {
  // eslint-disable-next-line no-console
  console.error('[InsForge] VITE_INSFORGE_URL is not set. Add it to frontend/.env.local.');
}
if (!INSFORGE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.error('[InsForge] VITE_INSFORGE_ANON_KEY is not set. Add it to frontend/.env.local.');
}

export const insforge = createClient({
  baseUrl: INSFORGE_URL || 'https://api.insforge.dev',
  anonKey: INSFORGE_ANON_KEY || 'public-anon-key-placeholder'
});

export const INSFORGE_CONFIG = {
  url: INSFORGE_URL,
  hasAnonKey: !!INSFORGE_ANON_KEY,
};
