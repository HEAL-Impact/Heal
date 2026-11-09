'use client';

import Link from 'next/link';
import { ClipboardList, GraduationCap, BarChart3, ShieldAlert, ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/i18n';

const TOOLS = [
  {
    href: '/care',
    icon: ClipboardList,
    title: { en: "Caseload for CHVs & GBV centres", sw: "Orodha ya wateja kwa CHV na vituo vya GBV" },
    body: { en: "Screen a client offline with PHQ-9, GAD-7 or EPDS, get a referral pathway, and work a queue sorted by risk.", sw: "Kagua mteja bila mtandao kwa PHQ-9, GAD-7 au EPDS, pata njia ya rufaa, na fanyia kazi foleni iliyopangwa kwa hatari." },
  },
  {
    href: '/learn',
    icon: GraduationCap,
    title: { en: "Training for frontline workers", sw: "Mafunzo kwa wahudumu wa mstari wa mbele" },
    body: { en: "Offline micro-modules for teachers, CHVs and social workers: psychological first aid, GBV response, perinatal depression.", sw: "Moduli fupi zisizohitaji mtandao kwa walimu, CHV na wafanyakazi wa ustawi wa jamii: huduma ya kwanza ya kisaikolojia, kukabiliana na GBV, msongo wa mawazo wakati wa ujauzito na baada ya kujifungua." },
  },
  {
    href: '/insights',
    icon: BarChart3,
    title: { en: "Insights & DHIS2 export", sw: "Takwimu na usafirishaji kwa DHIS2" },
    body: { en: "Aggregate, privacy-safe numbers for counties and partners, exported as a DHIS2 dataValueSet for KHIS.", sw: "Takwimu za jumla zinazolinda faragha kwa kaunti na washirika, zinazotumwa kama dataValueSet ya DHIS2 kwa KHIS." },
  },
  {
    href: '/help/check-message',
    icon: ShieldAlert,
    title: { en: "Online safety check", sw: "Ukaguzi wa usalama mtandaoni" },
    body: { en: "Paste a worrying message to spot threats, sextortion or doxxing, get safe next steps and save an evidence record.", sw: "Bandika ujumbe unaokutia wasiwasi ili kutambua vitisho, unyanyasaji kwa picha za siri au kuanikwa taarifa, pata hatua salama na uhifadhi rekodi ya ushahidi." },
  },
];

export default function ForCommunities() {
  const { tr } = useLang();
  return (
    <section className="py-16 sm:py-24" aria-labelledby="communities-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2C4A4E]">{tr("Beyond the app", "Zaidi ya programu")}</p>
          <h2 id="communities-heading" className="mt-2 text-3xl md:text-4xl font-normal text-[#2C4A4E] font-acme">
            {tr("Tools for the people who support survivors", "Zana kwa watu wanaowasaidia walionusurika")}
          </h2>
          <p className="mt-3 text-gray-600">
            {tr("Community health volunteers, counsellors, teachers and counties get the decision support, training and data they need, without ever seeing more than a survivor agreed to share.", "Wahudumu wa afya wa jamii, washauri, walimu na kaunti wanapata msaada wa kufanya maamuzi, mafunzo na takwimu wanazohitaji, bila kuona zaidi ya kile mnusurika alichokubali kushiriki.")}
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {TOOLS.map(({ href, icon: Icon, title, body }) => (
            <Link key={href} href={href} className="group flex gap-5 rounded-3xl bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <Icon className="h-10 w-10 shrink-0 text-[#2C4A4E]" strokeWidth={1.5} aria-hidden="true" />
              <span>
                <span className="block text-lg font-bold uppercase tracking-tight text-[#2C4A4E] font-acme">{tr(title)}</span>
                <span className="mt-2 block text-sm leading-relaxed text-gray-600">{tr(body)}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2C4A4E]">
                  {tr("Open", "Fungua")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
