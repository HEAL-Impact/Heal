import './globals.css';
import type { Metadata } from 'next';
import { Inter, Acme } from 'next/font/google';
import DailyClientProvider from '@/components/DailyClientProvider';
import { FloatingBoltLogo } from '@/components/FloatingBoltLogo';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const acme = Acme({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-acme',
});

export const metadata: Metadata = {
  title: 'Heal - Mental Health Support Platform',
  description: 'Professional mental health support with AI-powered assistance, crisis management, and personalized care plans.',
  keywords: 'mental health, therapy, counseling, crisis support, AI therapy, emotional support',
  authors: [{ name: 'Heal Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Heal - Mental Health Support Platform',
    description: 'Professional mental health support with AI-powered assistance',
    type: 'website',
    locale: 'en_US',
  },
  metadataBase: new URL('http://localhost:3000'), // or your production URL
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${acme.variable} scroll-smooth`}>
      <head>
        <meta name="application-name" content="Heal" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Heal" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" type="image/png" href="/images/heal-impact-mark.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Acme&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${acme.variable} font-inter antialiased bg-[#FEF5E3]`}>
        <DailyClientProvider>
          <div id="root">
            <ServiceWorkerRegistration />
            {children}
            {/* <FloatingBoltLogo /> */}
          </div>
        </DailyClientProvider>
      </body>
    </html>
  );
}