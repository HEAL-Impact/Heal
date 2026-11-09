'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { flushReportOutbox } from '@/lib/reports';
import { flushCaseOutbox } from '@/lib/care/cases';
import { useLang } from '@/lib/help/i18n';
import LanguageToggle from '@/components/LanguageToggle';

interface HelpShellProps {
  children: React.ReactNode;
  /** Where the back arrow goes; omit on the hub itself. */
  back?: string;
  /** Kept for existing callers; every survivor page is now bilingual. */
  showLanguage?: boolean;
}

/** Calm, minimal frame for the survivor flow: logo, language, My Space. */
export default function HelpShell({ children, back }: HelpShellProps) {
  const { t, tr } = useLang();

  // Reports written offline go out as soon as the phone is back online.
  useEffect(() => {
    void flushReportOutbox();
    void flushCaseOutbox();
    const onOnline = () => {
      void flushReportOutbox();
      void flushCaseOutbox();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  return (
    <div className="min-h-screen bg-[#ECE5DA] pb-20">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#ECE5DA]/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            {back && (
              <Link href={back} className="rounded-full p-2 text-[#2C4A4E] hover:bg-black/5" aria-label={tr('Back', 'Rudi')}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <Link href="/" aria-label={tr('HEAL-Impact home', 'Mwanzo wa HEAL-Impact')}>
              <Image src="/images/heal-impact-logo.png" alt="HEAL-Impact" width={157} height={40} className="h-9 w-auto" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link
              href="/my-space"
              className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#2C4A4E] hover:bg-white"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              {t('mySpace')}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4">{children}</main>
    </div>
  );
}
