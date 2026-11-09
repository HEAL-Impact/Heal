'use client';

import { useEffect } from 'react';

// Registers the offline service worker built from app/sw.ts. Registered here
// rather than by @serwist/next's auto-register, which doesn't run under the
// App Router. Production only: the worker isn't built in development.
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
      console.warn('Service worker registration failed; offline mode unavailable.', error);
    });
  }, []);

  return null;
}
