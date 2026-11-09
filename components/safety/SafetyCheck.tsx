'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, HelpCircle, EyeOff } from 'lucide-react';
import Decoy from '@/components/safety/Decoy';
import { useLang } from '@/lib/help/i18n';

const ASKED_KEY = 'heal.safetyChecked';

/**
 * Asks "Are you safe to use this right now?" once per browser session before
 * showing its children. "Someone is near" swaps in a decoy page.
 */
export default function SafetyCheck({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const [state, setState] = useState<'loading' | 'ask' | 'tips' | 'decoy' | 'done'>('loading');

  useEffect(() => {
    let asked = false;
    try {
      asked = sessionStorage.getItem(ASKED_KEY) === '1';
    } catch {
      /* ask again */
    }
    setState(asked ? 'done' : 'ask');
  }, []);

  const finish = () => {
    try {
      sessionStorage.setItem(ASKED_KEY, '1');
    } catch {
      /* ignore */
    }
    setState('done');
  };

  if (state === 'loading') return null;
  if (state === 'done') return <>{children}</>;
  if (state === 'decoy') return <Decoy onReturn={() => setState('ask')} />;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-16">
      <div className="rounded-3xl bg-white p-7 sm:p-10 shadow-sm heal-card">
        {state === 'ask' ? (
          <>
            <ShieldCheck className="h-10 w-10 text-[#2C4A4E]" strokeWidth={1.5} aria-hidden="true" />
            <h1 className="mt-4 text-2xl sm:text-3xl font-acme text-[#2C4A4E]">{t('safetyTitle')}</h1>
            <p className="mt-3 text-gray-600 leading-relaxed">{t('safetyBody')}</p>
            <div className="mt-7 space-y-3">
              <button
                type="button"
                onClick={finish}
                className="w-full rounded-2xl bg-[#2C4A4E] px-5 py-4 text-left font-semibold text-white hover:bg-[#2C4A4E]/90 transition-colors"
              >
                {t('safetyYes')}
              </button>
              <button
                type="button"
                onClick={() => setState('tips')}
                className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left font-semibold text-[#2C4A4E] hover:bg-gray-50 transition-colors"
              >
                <HelpCircle className="h-5 w-5 text-[#2C4A4E]" aria-hidden="true" />
                {t('safetyUnsure')}
              </button>
              <button
                type="button"
                onClick={() => setState('decoy')}
                className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left font-semibold text-[#2C4A4E] hover:bg-gray-50 transition-colors"
              >
                <EyeOff className="h-5 w-5 text-[#2C4A4E]" aria-hidden="true" />
                <span>
                  {t('safetyNear')}
                  <span className="mt-1 block text-xs font-normal text-gray-500">{t('safetyNearHint')}</span>
                </span>
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-acme text-[#2C4A4E]">{t('unsureTitle')}</h1>
            <ul className="mt-4 space-y-3 text-gray-700">
              {t('unsureTips').map((tip) => (
                <li key={tip} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2C4A4E]" aria-hidden="true" />
                  {tip}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={finish}
              className="mt-7 w-full rounded-2xl bg-[#2C4A4E] px-5 py-4 font-semibold text-white hover:bg-[#2C4A4E]/90 transition-colors"
            >
              {t('continue')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
