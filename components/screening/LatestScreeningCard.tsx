'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { offlineStore } from '@/lib/screening/offline-store';
import { apiClient } from '@/lib/api';
import { BANDS, MAX_SCORE, type Band } from '@/lib/screening/ptsd-instrument';

const BAND_PILL: Record<Band, string> = {
  low: 'bg-[#2C4A4E]/10 text-[#2C4A4E]',
  moderate: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
};

interface Latest {
  completedAt: string;
  totalScore: number;
  band: Band;
}

import { BANDS_SW } from '@/lib/screening/ptsd-instrument';
import { useLang } from '@/lib/i18n';

export function LatestScreeningCard({ userId }: { userId: string }) {
  const { tr } = useLang();
  const [latest, setLatest] = useState<Latest | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const candidates: Latest[] = [];
      try {
        candidates.push(...(await offlineStore.allScreenings()).filter((s) => s.ownerUserId === userId));
      } catch {
        // On-device storage blocked; the server list below still works.
      }
      const { data } = await apiClient.getScreenings();
      candidates.push(...(data?.screenings ?? []));
      candidates.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
      if (!cancelled) {
        setLatest(candidates[0] ?? null);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-sm sm:text-base drop-shadow font-acme flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[#ECE5DA]" /> {tr("Latest screening", "Ukaguzi wa karibuni")}
        </h3>
        <Link href="/dashboard/screenings" className="text-xs text-[#ECE5DA] hover:text-white">
          {tr("View all", "Ona yote")}
        </Link>
      </div>
      {!loaded ? (
        <p className="text-sm text-white/70">{tr("Loading…", "Inapakia…")}</p>
      ) : latest ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-acme text-2xl text-white">
              {latest.totalScore}
              <span className="text-sm text-white/60"> / {MAX_SCORE}</span>
            </p>
            <p className="text-xs text-white/70">{new Date(latest.completedAt).toLocaleDateString([], { dateStyle: 'medium' })}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${BAND_PILL[latest.band]}`}>{tr(BANDS[latest.band].label, BANDS_SW[latest.band].label)}</span>
        </div>
      ) : (
        <div>
          <p className="text-sm text-white/80 mb-3">{tr("A free trauma check takes about 3 minutes.", "Ukaguzi wa kiwewe wa bure unachukua kama dakika 3.")}</p>
          <Link
            href="/dashboard/screenings/new"
            className="inline-block bg-white/90 hover:bg-white text-brand-primary px-4 py-2 rounded-lg text-sm font-medium"
          >
            {tr("Take a screening", "Fanya ukaguzi")}
          </Link>
        </div>
      )}
    </div>
  );
}
