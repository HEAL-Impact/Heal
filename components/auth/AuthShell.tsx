'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import LanguageToggle from '@/components/LanguageToggle';

const SUNBURSTS = [
  { style: { inset: '15% 5% auto 50%' }, size: 50, cls: '' },
  { style: { inset: '20% auto auto 48%' }, size: 70, cls: 'hidden lg:block -rotate-6' },
  { style: { inset: '15% 5% auto auto' }, size: 50, cls: '' },
  { style: { inset: '20% auto auto 88%' }, size: 70, cls: '-rotate-6' },
  { style: { inset: '20% auto auto 8%' }, size: 70, cls: 'rotate-12' },
  { style: { inset: '75% 60% auto auto' }, size: 70, cls: 'rotate-45' },
];

/** Shared frame for sign-in and sign-up: illustration on the left, form card on the right. */
export default function AuthShell({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  const { tr } = useLang();

  if (loading) {
    return (
      <main className="min-h-screen bg-[#ECE5DA] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#2C4A4E]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{tr('Loading...', 'Inapakia...')}</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#ECE5DA] flex flex-col items-center p-4 md:p-10 relative overflow-hidden">
      {SUNBURSTS.map((s, i) => (
        <Image key={i} src="/images/decoration.png" alt="" aria-hidden="true" className={`absolute pointer-events-none ${s.cls}`} style={s.style} width={s.size} height={s.size} priority={i < 2} />
      ))}

      {/* Logo and language sit in their own row, so they never overlap the heading. */}
      <header className="relative z-20 flex w-full max-w-7xl items-center justify-between gap-4 pb-6 lg:pb-10">
        <Link href="/" aria-label={tr('HEAL-Impact home', 'Mwanzo wa HEAL-Impact')}>
          <Image src="/images/heal-impact-logo.png" alt="HEAL-Impact" width={204} height={52} className="h-10 sm:h-12 w-auto object-contain" priority />
        </Link>
        <LanguageToggle />
      </header>

      <div className="flex flex-1 flex-col lg:flex-row w-full max-w-7xl gap-10 items-center relative z-10">
        <div className="flex flex-col items-center lg:w-1/2 text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C4A4E] font-acme">{tr('Join Our Platform', 'Jiunge na Jukwaa Letu')}</h2>
            <p className="text-base lg:text-lg text-gray-600 font-medium italic font-inter">{tr('Get full access to all platform features', 'Pata ufikiaji kamili wa vipengele vyote')}</p>
          </div>
          <div className="group hidden sm:block rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 max-w-[350px] motion-reduce:transition-none motion-reduce:transform-none">
            <Image src="/images/hugging-friends.png" alt="" aria-hidden="true" width={350} height={350} className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:transform-none" />
          </div>
          <p className="text-[#2C4A4E] text-2xl md:text-3xl font-bold font-acme leading-tight max-w-md">
            {tr('“Access confidential, dignified mental health support anytime, anywhere.”', '“Pata msaada wa afya ya akili wa siri na wenye heshima, wakati wowote, mahali popote.”')}
            <span className="text-[#2C4A4E]">-24/7</span>
          </p>
          <div className="flex flex-col items-center space-y-4 pt-4">
            <div className="flex items-center w-full max-w-xs">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="px-4 text-gray-400 font-bold text-sm">{tr('OR', 'AU')}</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>
            <Link href="/anonymous" className="px-10 py-3 border-2 border-[#2C4A4E] text-[#2C4A4E] rounded-full font-bold font-acme hover:bg-[#2C4A4E] hover:text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A4E] focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:transform-none">
              {tr('Join Anonymously', 'Jiunge Bila Jina')}
            </Link>
            <p className="max-w-xs text-xs text-gray-600">{tr('No account needed. Nothing is saved about you.', 'Huhitaji akaunti. Hakuna kinachohifadhiwa kukuhusu.')}</p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="w-full max-w-[580px] bg-white p-6 sm:p-8 md:p-12 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 motion-reduce:transition-none motion-reduce:transform-none">{children}</div>
        </div>
      </div>
    </main>
  );
}
