'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, Smartphone, X } from 'lucide-react';
import { useGuestScreenings } from '@/hooks/use-guest-screenings';
import { useLang } from '@/lib/i18n';

const DISMISSED_KEY = 'heal_guest_screenings_prompt_dismissed';

interface GuestScreeningsPromptProps {
  userId: string;
  /**
   * 'floating' – notification card shown on any dashboard page; "Not now" hides it for this browser session.
   * 'inline'   – banner on the Screenings page; always shown while there is something to save.
   */
  variant: 'floating' | 'inline';
}

/** Offers to save guest-mode screenings found on this device to the signed-in account. */
export function GuestScreeningsPrompt({ userId, variant }: GuestScreeningsPromptProps) {
  const { tr } = useLang();
  const { count, claiming, claim } = useGuestScreenings();
  const [dismissed, setDismissed] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (variant !== 'floating') return;
    try {
      setDismissed(sessionStorage.getItem(DISMISSED_KEY) === '1');
    } catch {
      // Storage blocked: the card simply shows again next time.
    }
  }, [variant]);

  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [justSaved]);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // ignore
    }
  };

  const save = async () => {
    await claim(userId);
    setJustSaved(true);
  };

  const message =
    count === 1
      ? tr('You have 1 screening from guest mode saved on this device.', 'Una ukaguzi 1 kutoka hali ya mgeni uliohifadhiwa kwenye kifaa hiki.')
      : tr(`You have ${count} screenings from guest mode saved on this device.`, `Una ukaguzi ${count} kutoka hali ya mgeni uliohifadhiwa kwenye kifaa hiki.`);
  const saveButton = (
    <button
      type="button"
      onClick={save}
      disabled={claiming}
      className="bg-brand-primary hover:bg-brand-accent disabled:opacity-60 text-white px-4 py-2 rounded-full font-acme text-sm shadow-md"
    >
      {claiming ? tr("Saving…", "Inahifadhi…") : tr("Save to my account", "Hifadhi kwenye akaunti yangu")}
    </button>
  );

  if (variant === 'inline') {
    if (count === 0) return null;
    return (
      <div className="heal-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <Smartphone className="h-8 w-8 text-[#ECE5DA] flex-shrink-0" />
        <p className="flex-1 text-white">
          {message} {tr('Save to your account?', 'Uhifadhi kwenye akaunti yako?')}
        </p>
        {saveButton}
      </div>
    );
  }

  if (justSaved) {
    return (
      <div role="status" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:w-96 z-40 rounded-xl border border-white/20 bg-black/60 backdrop-blur-md shadow-2xl p-4 flex items-center gap-3 text-white">
        <CheckCircle2 className="h-5 w-5 text-[#2C4A4E]" /> {tr("Saved to your account.", "Imehifadhiwa kwenye akaunti yako.")}
      </div>
    );
  }

  if (count === 0 || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:w-96 z-40 rounded-xl border border-white/20 bg-black/60 backdrop-blur-md shadow-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <span className="relative flex-shrink-0 mt-0.5">
          <Bell className="h-5 w-5 text-[#ECE5DA]" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
        </span>
        <div className="flex-1">
          <p className="text-white font-medium">{message}</p>
          <p className="text-sm text-white/75 mt-1">
            {tr("Save to your account to keep them with your history.", "Hifadhi kwenye akaunti yako ili ubaki nao pamoja na historia yako.")}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {saveButton}
            <Link href="/dashboard/screenings" className="text-sm text-[#ECE5DA] hover:text-white px-2 py-2">
              {tr("View", "Ona")}
            </Link>
            <button type="button" onClick={dismiss} className="text-sm text-white/75 hover:text-white px-2 py-2">
              {tr("Not now", "Si sasa")}
            </button>
          </div>
        </div>
        <button type="button" onClick={dismiss} aria-label={tr("Dismiss", "Funga")} className="text-white/60 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
