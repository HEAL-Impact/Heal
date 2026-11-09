/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { NetworkOnly, Serwist } from 'serwist';

// Service worker for offline use. The build precaches the app's static assets
// plus the pages listed in next.config.js (guest mode and the screening pages),
// so a screening can be opened and completed with no connection.

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // Static export serves /anonymous as /anonymous.html; match either form.
  // ?tab= only picks the client-side tab, so it's the same cached page.
  precacheOptions: { cleanURLs: true, ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^tab$/] },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Never cache API responses: they hold personal health data and must be fresh.
    // Offline copies of screenings live in IndexedDB (lib/screening/offline-store.ts).
    { matcher: ({ url }) => url.pathname.startsWith('/api/'), handler: new NetworkOnly() },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/anonymous',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();
