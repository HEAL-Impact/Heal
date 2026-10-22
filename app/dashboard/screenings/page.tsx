'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, ClipboardList, CloudOff, CheckCircle2, MapPin, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { offlineStore } from '@/lib/screening/offline-store';
import { onScreeningsChanged, startScreeningSync } from '@/lib/screening/sync';
import { GuestScreeningsPrompt } from '@/components/screening/GuestScreeningsPrompt';
import { ANSWER_OPTIONS, BANDS, MAX_SCORE, QUESTIONS, type Band } from '@/lib/screening/ptsd-instrument';

interface ScreeningRow {
  id: string;
  completedAt: string;
  totalScore: number;
  band: Band;
  county: string | null;
  mode: string;
  answers: number[];
  status: 'synced' | 'pending';
  lastError?: string;
}

const BAND_PILL: Record<Band, string> = {
  low: 'bg-emerald-100 text-emerald-800',
  moderate: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
};

export default function ScreeningsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ScreeningRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverUnavailable, setServerUnavailable] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    // This device's copies first, so the list works offline; the server's list fills in the rest.
    const byId = new Map<string, ScreeningRow>();
    try {
      for (const s of await offlineStore.allScreenings()) {
        if (s.ownerUserId !== user.id) continue;
        byId.set(s.id, {
          id: s.id,
          completedAt: s.completedAt,
          totalScore: s.totalScore,
          band: s.band,
          county: s.county,
          mode: s.mode,
          answers: s.answers,
          status: s.syncStatus === 'synced' ? 'synced' : 'pending',
          lastError: s.lastError,
        });
      }
    } catch {
      // On-device storage blocked; fall back to the server list only.
    }

    const { data, error } = await apiClient.getScreenings();
    setServerUnavailable(!!error);
    for (const s of data?.screenings ?? []) {
      byId.set(s.id, { ...s, status: 'synced' });
    }

    setRows(Array.from(byId.values()).sort((a, b) => b.completedAt.localeCompare(a.completedAt)));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void load();
    const stopSync = startScreeningSync(user.id);
    const unsubscribe = onScreeningsChanged(() => void load());
    return () => {
      stopSync();
      unsubscribe();
    };
  }, [user, load]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="shadow-sm border-b border-gray-700">
        <div className="mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-6 w-6 text-teal-300" />
              <h1 className="text-xl font-bold text-white font-acme">Screenings</h1>
            </div>
          </div>
          <Link
            href="/dashboard/screenings/new"
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-accent text-white px-4 py-2 rounded-full font-acme text-sm shadow-md transition-colors"
          >
            <Plus className="h-4 w-4" /> New screening
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {user && <GuestScreeningsPrompt userId={user.id} variant="inline" />}

        {serverUnavailable && !loading && (
          <p className="flex items-center gap-2 text-sm text-amber-200">
            <CloudOff className="h-4 w-4" /> Can't reach the server right now. Showing screenings saved on this device.
          </p>
        )}

        {loading ? (
          <div className="heal-card p-10 text-center text-white">Loading screenings…</div>
        ) : rows.length === 0 ? (
          <div className="heal-card p-10 text-center">
            <ClipboardList className="h-12 w-12 text-teal-300 mx-auto mb-4" />
            <h2 className="text-xl font-acme text-white mb-2">No screenings yet</h2>
            <p className="text-white/80 mb-6">A free PTSD screening takes about 3 minutes and works offline.</p>
            <Link
              href="/dashboard/screenings/new"
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-accent text-white px-6 py-3 rounded-full font-acme shadow-md"
            >
              Start a screening
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.id} className="heal-card p-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex-1 min-w-[10rem]">
                    <p className="text-white font-medium">PTSD screening</p>
                    <p className="text-sm text-white/70">
                      {new Date(row.completedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      {row.county && (
                        <span className="inline-flex items-center gap-1 ml-2">
                          <MapPin className="h-3 w-3" /> {row.county}
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="font-acme text-2xl text-white">
                    {row.totalScore}
                    <span className="text-sm text-white/60"> / {MAX_SCORE}</span>
                  </p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${BAND_PILL[row.band]}`}>
                    {BANDS[row.band].label}
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs text-white/70"
                    title={row.status === 'pending' ? row.lastError ?? 'Waiting for a connection' : undefined}
                  >
                    {row.status === 'synced' ? (
                      <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Saved</>
                    ) : (
                      <><CloudOff className="h-4 w-4 text-amber-300" /> Waiting to sync</>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                    aria-expanded={expanded === row.id}
                    className="flex items-center gap-1 text-sm text-teal-200 hover:text-white"
                  >
                    Answers {expanded === row.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {expanded === row.id && (
                  <ol className="mt-4 space-y-2 border-t border-white/20 pt-4">
                    {QUESTIONS.map((question, i) => (
                      <li key={question.id} className="flex justify-between gap-4 text-sm">
                        <span className="text-white/80">
                          {i + 1}. {question.text}
                        </span>
                        <span className="text-white font-medium whitespace-nowrap">
                          {ANSWER_OPTIONS.find((o) => o.value === row.answers[i])?.label ?? '—'}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
