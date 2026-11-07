'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Smartphone, Hash, MessageSquare, Languages, WifiOff, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FourDoors from '@/components/home/FourDoors';
import SafetyByDesign from '@/components/home/SafetyByDesign';
import ForCommunities from '@/components/home/ForCommunities';
import { useLang } from '@/lib/i18n';

// Partner logos (IFAGE and Pamoja removed, Oct 2026).
const PARTNERS = [
  { src: '/client-2-1536x768.png', alt: 'New Nexus' },
  { src: '/client-5-1536x768.png', alt: 'Civil Society Organisation Network' },
  { src: '/client-6-1536x768.png', alt: 'Holy Family Mission Hospital' },
  { src: '/images/partners/wild-wonder-foundation.png', alt: 'Wild Wonder Foundation' },
];

const CHANNELS = [
  { icon: Smartphone, title: { en: "Web app", sw: "Programu ya wavuti" }, body: { en: "Installs like an app, works on low-cost smartphones.", sw: "Inasakinishwa kama programu, inafanya kazi kwenye simu janja za bei nafuu." }, status: { en: "Live", sw: "Inatumika" } },
  { icon: WifiOff, title: { en: "Offline first", sw: "Bila mtandao kwanza" }, body: { en: "Check-ins, screenings and reports work without signal and send later.", sw: "Ukaguzi na ripoti vinafanya kazi bila mtandao na kutumwa baadaye." }, status: { en: "Live", sw: "Inatumika" } },
  { icon: Hash, title: { en: "USSD", sw: "USSD" }, body: { en: "Nia, help lines and reporting on any phone, no data needed.", sw: "Nia, simu za msaada na kuripoti kwenye simu yoyote, bila bando." }, status: { en: "Prototype", sw: "Mfano wa majaribio" } },
  { icon: Languages, title: { en: "Kiswahili", sw: "Kiswahili" }, body: { en: "Every survivor screen in Kiswahili; Dholuo and Sheng next.", sw: "Kila skrini ya walionusurika kwa Kiswahili; Dholuo na Sheng zinafuata." }, status: { en: "Live, under review", sw: "Inatumika, inakaguliwa" } },
  { icon: MessageSquare, title: { en: "WhatsApp", sw: "WhatsApp" }, body: { en: "Check-ins and Nia where people already are.", sw: "Ukaguzi na Nia mahali watu walipo tayari." }, status: { en: "Planned", sw: "Imepangwa" } },
];

export default function ServicesPage() {
  const { tr } = useLang();
  return (
    <div className="min-h-screen bg-[#ECE5DA]">
      <Navbar />

      {/* Hero: same background and sizing as the home page */}
      <section
        className="relative -mt-20 flex min-h-[80vh] flex-col justify-center bg-cover bg-center bg-no-repeat pt-20"
        style={{ backgroundImage: 'url(/images/Hero-bg-image.png)' }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2C4A4E]">{tr("Our services", "Huduma zetu")}</p>
            <h1 className="mt-3 text-4xl md:text-5xl lg:text-6xl font-acme font-normal uppercase tracking-tight text-[#333]">
              {tr("Support that meets survivors where they are", "Msaada unaowafikia walionusurika walipo")}
            </h1>
            <p className="mt-6 text-base md:text-lg font-medium leading-relaxed text-[#2C4A4E]">
              {tr("Immediate, confidential help for survivors of gender-based violence, and the tools that community health volunteers, counsellors and counties need to respond well.", "Msaada wa haraka na wa siri kwa walionusurika ukatili wa kijinsia, na zana ambazo wahudumu wa afya wa jamii, washauri na kaunti wanahitaji ili kujibu vizuri.")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link
                href="/help"
                className="inline-flex items-center gap-2 rounded-full bg-[#2C4A4E] px-8 py-3 text-xs lg:text-sm font-semibold uppercase tracking-wider text-white transition-transform hover:scale-105 hover:bg-[#2C4A4E]/90 font-acme"
              >
                {tr("Get support now", "Pata msaada sasa")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/care"
                className="rounded-full border border-[#2C4A4E] bg-white/70 px-8 py-3 text-xs lg:text-sm font-semibold uppercase tracking-wider text-[#2C4A4E] transition-transform hover:scale-105 hover:bg-white font-acme"
              >
                {tr("For health workers", "Kwa wahudumu wa afya")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="relative w-full bg-[#2C4A4E] py-[80px]">
        <div className="flex flex-col items-center gap-[80px] px-4">
          <div className="font-acme text-white text-[40px] tracking-[0] leading-[normal] text-center">
            {tr("Trusted by 50+ Partners Worldwide", "Tunaaminiwa na Washirika 50+ Duniani")}
          </div>

          {/* Curved logos layout: outer logos sit lower */}
          <div className="relative w-full max-w-[1000px] flex justify-center flex-wrap lg:flex-nowrap gap-[60px] lg:gap-[120px]">
            {PARTNERS.map((logo, index) => {
              const curveHeights = [0, 10, 10, 0];
              return (
                <div
                  key={logo.src}
                  className="transition-transform duration-300 hover:scale-105"
                  style={{ transform: `translateY(-${curveHeights[index]}px)` }}
                >
                  <Image
                    className="w-[159px] h-[79px] object-contain opacity-50 hover:opacity-100 transition-opacity"
                    alt={logo.alt}
                    src={logo.src}
                    width={159}
                    height={79}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <FourDoors />
      <SafetyByDesign />
      <ForCommunities />

      {/* Channels and languages */}
      <section className="bg-[#ECE5DA] py-16 sm:py-24" aria-labelledby="channels-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2C4A4E]">{tr("Reach", "Ufikiaji")}</p>
            <h2 id="channels-heading" className="mt-2 text-3xl md:text-4xl font-normal text-[#2C4A4E] font-acme">
              {tr("On any phone, in her language", "Kwenye simu yoyote, kwa lugha yake")}
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {CHANNELS.map(({ icon: Icon, title, body, status }) => (
              <div key={title.en} className="rounded-3xl bg-white p-6 shadow-sm">
                <Icon className="h-8 w-8 text-[#2C4A4E]" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold uppercase tracking-tight text-[#2C4A4E] font-acme">{tr(title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{tr(body)}</p>
                <span className="mt-3 inline-block rounded-full bg-[#ECE5DA] px-3 py-1 text-xs font-semibold text-[#2C4A4E]">{tr(status)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-normal text-[#2C4A4E] font-acme">{tr("Partner with HEAL-Impact", "Shirikiana na HEAL-Impact")}</h2>
          <p className="mt-3 text-gray-600">
            {tr("Counties, recovery centres, schools and funders: let’s bring safe, survivor-centred support to more communities.", "Kaunti, vituo vya kupona, shule na wafadhili: tuwafikishie jamii zaidi msaada salama unaomlenga mnusurika.")}
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2C4A4E] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-transform hover:scale-105 font-acme"
          >
            {tr("Get in touch", "Wasiliana nasi")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
