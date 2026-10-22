'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, Smartphone, X } from 'lucide-react';
import { useGuestScreenings } from '@/hooks/use-guest-screenings';

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
      ? 'You have 1 screening from guest mode saved on this device.'
      : `You have ${count} screenings from guest mode saved on this device.`;
  const saveButton = (
    <button
      type="button"
      onClick={save}
      disabled={claiming}
      className="bg-brand-primary hover:bg-brand-accent disabled:opacity-60 text-white px-4 py-2 rounded-full font-acme text-sm shadow-md"
    >
      {claiming ? 'Saving…' : 'Save to my account'}
    </button>
  );

  if (variant === 'inline') {
    if (count === 0) return null;
    return (
      <div className="heal-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <Smartphone className="h-8 w-8 text-teal-300 flex-shrink-0" />
        <p className="flex-1 text-white">
          {message} Save {count === 1 ? 'it' : 'them'} to your account?
        </p>
        {saveButton}
      </div>
    );
  }

  if (justSaved) {
    return (
      <div role="status" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:w-96 z-40 rounded-xl border border-white/20 bg-black/60 backdrop-blur-md shadow-2xl p-4 flex items-center gap-3 text-white">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Saved to your account.
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
          <Bell className="h-5 w-5 text-teal-300" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
        </span>
        <div className="flex-1">
          <p className="text-white font-medium">{message}</p>
          <p className="text-sm text-white/75 mt-1">
            Save {count === 1 ? 'it' : 'them'} to your account to keep {count === 1 ? 'it' : 'them'} with your history.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {saveButton}
            <Link href="/dashboard/screenings" className="text-sm text-teal-200 hover:text-white px-2 py-2">
              View
            </Link>
            <button type="button" onClick={dismiss} className="text-sm text-white/75 hover:text-white px-2 py-2">
              Not now
            </button>
          </div>
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss" className="text-white/60 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
