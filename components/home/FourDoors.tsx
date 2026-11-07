'use client';

import Link from 'next/link';
import { LifeBuoy, MessageCircle, FileText, Sprout, ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/i18n';

const DOORS = [
  { href: '/help/safe-now', icon: LifeBuoy, title: { en: "I'm not safe now", sw: "Siko salama sasa" }, body: { en: "One tap to 1195, 999 or 112, an optional message to someone you trust, and the nearest recovery centre.", sw: "Mguso mmoja kupiga 1195, 999 au 112, ujumbe kwa mtu unayemwamini ukipenda, na kituo cha kupona kilicho karibu." }, dark: true },
  { href: '/anonymous', icon: MessageCircle, title: { en: "I want to talk", sw: "Nataka kuongea" }, body: { en: "Nia, our AI companion, in English or Kiswahili. Every message is checked for risk, and a person is always one tap away.", sw: "Nia, msaidizi wetu wa AI, kwa Kiswahili au Kiingereza. Kila ujumbe unakaguliwa kwa hatari, na mtu halisi yuko mguso mmoja tu." } },
  { href: '/report', icon: FileText, title: { en: "I want to report", sw: "Nataka kuripoti" }, body: { en: "One question per screen, skip anything, no name needed. Encrypted, with a case code to follow up.", sw: "Swali moja kwa kila skrini, ruka chochote, huhitaji jina. Imesimbwa kwa usiri, na namba ya kesi ya kufuatilia." } },
  { href: '/help/check-in', icon: Sprout, title: { en: "How am I doing?", sw: "Ninaendeleaje?" }, body: { en: "Validated check-ins (PHQ-9, GAD-7, EPDS, trauma) with one clear next step, not a score.", sw: "Ukaguzi uliothibitishwa (PHQ-9, GAD-7, EPDS, kiwewe) wenye hatua moja wazi inayofuata, si alama tu." } },
];

/** The survivor flow in one glance: safety check, then four doors. */
export default function FourDoors() {
  const { tr } = useLang();
  return (
    <section className="relative py-20" aria-labelledby="four-doors-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2C4A4E]">{tr("How HEAL works", "HEAL inavyofanya kazi")}</p>
          <h2 id="four-doors-heading" className="mt-2 text-3xl md:text-4xl font-normal text-[#2C4A4E] font-acme">
            {tr("One safety check, then four doors", "Ukaguzi mmoja wa usalama, kisha milango minne")}
          </h2>
          <p className="mt-3 text-gray-600">
            {tr("We first ask if it’s safe to continue. If someone is nearby, HEAL becomes a page of health tips. Then you choose what you need, and you can leave in one tap at any time.", "Kwanza tunauliza kama ni salama kuendelea. Kama kuna mtu karibu, HEAL inageuka kuwa ukurasa wa vidokezo vya afya. Kisha unachagua unachohitaji, na unaweza kuondoka kwa mguso mmoja wakati wowote.")}
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DOORS.map(({ href, icon: Icon, title, body, dark }) => (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col rounded-3xl p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                dark ? 'bg-[#2C4A4E] text-white' : 'bg-white text-[#2C4A4E]'
              }`}
            >
              <Icon size={56} strokeWidth={1} className={dark ? 'text-[#D97E7E]' : 'text-[#333]'} aria-hidden="true" />
              <h3 className="mt-6 text-xl font-bold uppercase tracking-tight font-acme">{tr(title)}</h3>
              <p className={`mt-3 text-sm leading-relaxed ${dark ? 'text-white/80' : 'text-gray-600'}`}>{tr(body)}</p>
              <ArrowRight className={`mt-6 h-5 w-5 transition-transform group-hover:translate-x-1 ${dark ? 'text-white/70' : 'text-[#2C4A4E]'}`} aria-hidden="true" />
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 rounded-full bg-[#2C4A4E] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-transform hover:scale-105 hover:bg-[#2C4A4E]/90 font-acme"
          >
            {tr("Get support now", "Pata msaada sasa")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
