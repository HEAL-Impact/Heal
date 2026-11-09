'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useLang } from '@/lib/i18n';

// Where Quick exit lands: something ordinary that won't raise questions.
const EXIT_URL = 'https://www.google.com/search?q=weather+kisumu';

/**
 * Leaves HEAL instantly. Clears this tab's session data and replaces the page,
 * so the browser's Back button can't bring someone back to it. Things the survivor
 * chose to keep in My Space stay (they can delete them there).
 */
export function quickExit() {
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
  window.location.replace(EXIT_URL);
}

/** Quick exit button on every page, plus Esc-twice and a firm shake on phones. */
export default function QuickExit() {
  const { tr } = useLang();
  const lastEsc = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const now = Date.now();
      if (now - lastEsc.current < 800) quickExit();
      lastEsc.current = now;
    };

    // Three strong jolts within a second count as a shake.
    let jolts: number[] = [];
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const force = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
      if (force < 30) return;
      const now = Date.now();
      jolts = [...jolts.filter((t) => now - t < 1000), now];
      if (jolts.length >= 3) quickExit();
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('devicemotion', onMotion);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('devicemotion', onMotion);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={quickExit}
      className="fixed bottom-4 right-4 z-[70] flex items-center gap-1.5 rounded-full bg-[#2C4A4E] px-4 py-2.5 text-sm font-semibold text-white shadow-lg ring-2 ring-white/70 hover:bg-black focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2C4A4E]"
      aria-label={tr('Quick exit: leave this site now', 'Toka haraka: ondoka kwenye tovuti hii sasa')}
      title={tr('Quick exit (or press Esc twice)', 'Toka haraka (au bonyeza Esc mara mbili)')}
    >
      <X className="h-4 w-4" aria-hidden="true" />
      {tr('Quick exit', 'Toka haraka')}
    </button>
  );
}
