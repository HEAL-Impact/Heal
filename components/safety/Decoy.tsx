'use client';

import { useRef } from 'react';
import { useLang } from '@/lib/i18n';

// A neutral health-tips page shown when someone is nearby. Tapping the title
// three times returns to where they were.
export default function Decoy({ onReturn }: { onReturn: () => void }) {
  const { lang } = useLang();
  const taps = useRef<number[]>([]);

  const tapTitle = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 1500), now];
    if (taps.current.length >= 3) onReturn();
  };

  const tips = lang === 'sw' ? TIPS_SW : TIPS_EN;
  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-white text-gray-800">
      <header className="border-b bg-[#E8F5E8] px-5 py-4">
        <h1 onClick={tapTitle} className="cursor-default select-none text-xl font-bold text-[#4A635D] font-sans">
          Afya Tips
        </h1>
        <p className="text-xs text-gray-500">{lang === 'sw' ? 'Tabia rahisi kwa familia yenye afya' : 'Simple habits for a healthy family'}</p>
      </header>
      <main className="mx-auto max-w-xl space-y-6 px-5 py-6 font-sans">
        {tips.map(([title, body]) => (
          <article key={title}>
            <h2 className="text-lg font-semibold font-sans">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{body}</p>
          </article>
        ))}
      </main>
    </div>
  );
}

const TIPS_EN: [string, string][] = [
  ['Drink enough clean water', 'Adults need about 8 glasses of water a day, more in hot weather. Boil or treat water from wells and rivers, and keep it covered.'],
  ['Eat a rainbow', 'Sukuma wiki, managu, carrots, beans and fruit in season give the vitamins your body needs. Try to add one vegetable to every meal.'],
  ['Wash hands often', 'Wash with soap for 20 seconds before cooking, before eating and after using the toilet. A leaky tin makes a simple tippy-tap.'],
  ['Sleep well', 'Most adults need 7–9 hours. A regular bedtime and less phone light in the evening help.'],
];

const TIPS_SW: [string, string][] = [
  ['Kunywa maji safi ya kutosha', 'Mtu mzima anahitaji takriban glasi 8 za maji kwa siku, zaidi wakati wa joto. Chemsha au tibu maji ya kisima na mto, na uyafunike.'],
  ['Kula vyakula vya rangi mbalimbali', 'Sukuma wiki, managu, karoti, maharagwe na matunda ya msimu hutoa vitamini mwili unazohitaji. Jaribu kuongeza mboga moja kwa kila mlo.'],
  ['Nawa mikono mara kwa mara', 'Nawa kwa sabuni kwa sekunde 20 kabla ya kupika, kabla ya kula na baada ya kutoka chooni. Mkebe uliotobolewa unafaa kama kibuyu chirizi.'],
  ['Lala vizuri', 'Watu wazima wengi wanahitaji saa 7–9. Kulala muda uleule kila siku na kupunguza mwanga wa simu jioni husaidia.'],
];
