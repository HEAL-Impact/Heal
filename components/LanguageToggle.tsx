'use client';

import { useLang } from '@/lib/i18n';

/** EN / SW switch. The choice applies to every screen and is remembered on this device. */
export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`flex rounded-full bg-white/70 p-0.5 text-xs font-semibold ${className}`} role="group" aria-label="Language / Lugha">
      {(['en', 'sw'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          lang={l}
          title={l === 'en' ? 'English' : 'Kiswahili'}
          className={`rounded-full px-2.5 py-1 ${lang === l ? 'bg-[#2C4A4E] text-white' : 'text-[#2C4A4E]'}`}
        >
          {l === 'en' ? 'EN' : 'SW'}
        </button>
      ))}
    </div>
  );
}
