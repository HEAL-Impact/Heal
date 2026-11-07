'use client';

import { X, EyeOff, Lock, Trash2, MapPin, ShieldCheck } from 'lucide-react';
import { useLang } from '@/lib/i18n';

const FEATURES = [
  { icon: X, title: { en: "Quick exit everywhere", sw: "Toka haraka kila mahali" }, body: { en: "A button on every page, Esc twice, or a shake. HEAL disappears and Back won’t bring it back.", sw: "Kitufe kwenye kila ukurasa, Esc mara mbili, au kutikisa simu. HEAL inatoweka na kitufe cha Rudi hakiirudishi." } },
  { icon: EyeOff, title: { en: "“Someone is near” mode", sw: "Hali ya “Kuna mtu karibu”" }, body: { en: "One tap turns HEAL into a page of health tips. Three taps on the title bring you back.", sw: "Mguso mmoja unageuza HEAL kuwa ukurasa wa vidokezo vya afya. Kugusa kichwa mara tatu kunakurudisha." } },
  { icon: Lock, title: { en: "Anonymous by default", sw: "Bila jina kwa chaguo-msingi" }, body: { en: "No account needed. My Space lives only on your phone, behind an optional PIN.", sw: "Huhitaji akaunti. Nafasi Yangu inakaa kwenye simu yako tu, nyuma ya PIN ukipenda." } },
  { icon: ShieldCheck, title: { en: "Encrypted reports", sw: "Ripoti zilizosimbwa" }, body: { en: "Reports are encrypted at rest. A case code shows progress, never the contents.", sw: "Ripoti zinahifadhiwa zikiwa zimesimbwa kwa usiri. Namba ya kesi inaonyesha maendeleo, kamwe si yaliyomo." } },
  { icon: MapPin, title: { en: "Location only on request", sw: "Mahali kwa ombi tu" }, body: { en: "Never asked for automatically, and rounded to about 1 km when shared.", sw: "Haiombwi yenyewe, na inapunguzwa hadi karibu kilomita 1 ikishirikiwa." } },
  { icon: Trash2, title: { en: "Delete everything", sw: "Futa kila kitu" }, body: { en: "One button wipes check-ins, plans, codes and screenings from the device.", sw: "Kitufe kimoja kinafuta ukaguzi, mipango, namba na matokeo kwenye kifaa." } },
];

export default function SafetyByDesign() {
  const { tr } = useLang();
  return (
    <section className="bg-[#ECE5DA] py-16 sm:py-24" aria-labelledby="safety-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2C4A4E]">{tr("Safety by design", "Usalama tangu mwanzo")}</p>
          <h2 id="safety-heading" className="mt-2 text-3xl md:text-4xl font-normal text-[#2C4A4E] font-acme">
            {tr("Built for a phone that might not be yours alone", "Imeundwa kwa simu ambayo huenda si yako peke yako")}
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title.en} className="rounded-3xl bg-white p-7 shadow-sm">
              <Icon className="h-8 w-8 text-[#2C4A4E]" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-4 text-lg font-bold uppercase tracking-tight text-[#2C4A4E] font-acme">{tr(title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{tr(body)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
