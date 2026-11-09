'use client';

import Link from 'next/link';
import { LifeBuoy, MessageCircle, FileText, Sprout, Lock, ChevronRight, ShieldAlert, KeyRound } from 'lucide-react';
import HelpShell from '@/components/help/HelpShell';
import SafetyCheck from '@/components/safety/SafetyCheck';
import { useLang } from '@/lib/help/i18n';

export default function HelpHub() {
  const { t } = useLang();

  const doors = [
    { href: '/help/safe-now', icon: LifeBuoy, title: t('doorSafeTitle'), body: t('doorSafeBody'), urgent: true },
    { href: '/anonymous', icon: MessageCircle, title: t('doorTalkTitle'), body: t('doorTalkBody') },
    { href: '/report', icon: FileText, title: t('doorReportTitle'), body: t('doorReportBody') },
    { href: '/help/check-in', icon: Sprout, title: t('doorCheckTitle'), body: t('doorCheckBody') },
  ];

  return (
    <HelpShell>
      <SafetyCheck>
        <section className="py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-acme text-[#2C4A4E]">{t('doorsTitle')}</h1>
          <p className="mt-2 text-gray-600">{t('doorsBody')}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {doors.map(({ href, icon: Icon, title, body, urgent }) => (
              <Link
                key={href}
                href={href}
                className={`group flex flex-col rounded-3xl p-6 sm:p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2C4A4E]/40 ${
                  urgent ? 'bg-[#2C4A4E] text-white' : 'bg-white text-[#2C4A4E]'
                }`}
              >
                <Icon
                  className={`h-10 w-10 ${urgent ? 'text-[#D97E7E]' : 'text-[#2C4A4E]'}`}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h2 className="mt-4 text-2xl font-acme">{title}</h2>
                <p className={`mt-2 text-sm leading-relaxed ${urgent ? 'text-white/80' : 'text-gray-600'}`}>{body}</p>
                <ChevronRight
                  className={`mt-4 h-5 w-5 self-end transition-transform group-hover:translate-x-1 ${urgent ? 'text-white/70' : 'text-[#2C4A4E]'}`}
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>

          <Link
            href="/my-space"
            className="mt-4 flex items-center gap-4 rounded-3xl border border-[#2C4A4E]/30 bg-white/60 p-5 hover:bg-white transition-colors"
          >
            <Lock className="h-6 w-6 shrink-0 text-[#2C4A4E]" aria-hidden="true" />
            <span>
              <span className="block font-acme text-lg text-[#2C4A4E]">{t('mySpace')}</span>
              <span className="block text-sm text-gray-600">{t('mySpaceBody')}</span>
            </span>
            <ChevronRight className="ml-auto h-5 w-5 text-[#2C4A4E]" aria-hidden="true" />
          </Link>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/help/check-message" className="flex items-center gap-3 rounded-2xl bg-white/60 px-5 py-4 text-sm font-semibold text-[#2C4A4E] hover:bg-white">
              <ShieldAlert className="h-5 w-5 text-[#2C4A4E]" aria-hidden="true" />
              Check a worrying message
            </Link>
            <Link href="/report/status" className="flex items-center gap-3 rounded-2xl bg-white/60 px-5 py-4 text-sm font-semibold text-[#2C4A4E] hover:bg-white">
              <KeyRound className="h-5 w-5 text-[#2C4A4E]" aria-hidden="true" />
              Check my report with a case code
            </Link>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">{t('noAccount')}</p>
        </section>
      </SafetyCheck>
    </HelpShell>
  );
}
