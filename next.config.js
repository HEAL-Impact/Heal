const withSerwist = require('@serwist/next').default({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  // Pages that must open offline. Revision changes on every build so updates reach devices.
  additionalPrecacheEntries: ['/anonymous', '/dashboard/screenings', '/dashboard/screenings/new'].map((url) => ({
    url,
    revision: `${Date.now()}`,
  })),
  disable: process.env.NODE_ENV === 'development',
  // Registered by components/ServiceWorkerRegistration.tsx; auto-register doesn't run under the App Router.
  register: false,
  // Reconnecting must not reload the page mid-screening; lib/screening/sync.ts listens for 'online' instead.
  reloadOnOnline: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = withSerwist(nextConfig);
