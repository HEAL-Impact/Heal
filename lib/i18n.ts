'use client';

// One language setting for the whole site (English / Kiswahili), shared by every
// component so switching it anywhere updates every screen at once.
// Kiswahili copy needs review by native-speaking survivors and counsellors.

import { useSyncExternalStore } from 'react';

export type Lang = 'en' | 'sw';
/** A piece of text in both languages. */
export type L = { en: string; sw: string };

const KEY = 'heal.lang';
const listeners = new Set<() => void>();
let current: Lang | null = null;

function read(): Lang {
  if (current) return current;
  try {
    current = localStorage.getItem(KEY) === 'sw' ? 'sw' : 'en';
  } catch {
    current = 'en';
  }
  return current;
}

export function setLang(lang: Lang) {
  current = lang;
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* still switches for this visit */
  }
  document.documentElement.lang = lang;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const pick = (text: L, lang: Lang) => text[lang] || text.en;

/**
 * Current language plus a translator: `tr('Hello', 'Habari')` or `tr({ en, sw })`.
 * The server render is always English; the saved choice applies after hydration.
 */
export function useLang() {
  const lang = useSyncExternalStore(subscribe, read, () => 'en' as Lang);
  const tr = (en: string | L, sw?: string) => (typeof en === 'string' ? (lang === 'sw' && sw ? sw : en) : pick(en, lang));
  return { lang, setLang, tr };
}
