'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CloudOff,
  Headphones,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  ShieldCheck,
  Type,
  UserRound,
} from 'lucide-react';
import {
  ANSWER_OPTIONS,
  BANDS,
  MAX_SCORE,
  PTSD_INSTRUMENT_ID,
  QUESTIONS,
  QUESTION_STEM,
  scoreAnswers,
  type Band,
  type PresentationMode,
} from '@/lib/screening/ptsd-instrument';
import { KENYA_COUNTIES } from '@/lib/screening/counties';
import {
  newScreeningId,
  offlineStore,
  type LocalScreening,
  type ScreeningDraft,
} from '@/lib/screening/offline-store';
import { onScreeningsChanged, saveCompletedScreening } from '@/lib/screening/sync';

interface PtsdScreeningFlowProps {
  /** Signed-in user's id, or null in guest mode (results then stay on this device). */
  userId: string | null;
  /** Guest mode: switches the page to the AI companion tab. */
  onTalkToCompanion?: () => void;
}

const MODES: { mode: PresentationMode; title: string; description: string; icon: React.ReactNode; available: boolean }[] = [
  { mode: 'text', title: 'Text', description: 'Read each question and tap your answer.', icon: <Type className="h-5 w-5" />, available: true },
  { mode: 'audio', title: 'Audio', description: 'Listen to each question read aloud.', icon: <Headphones className="h-5 w-5" />, available: false },
  { mode: 'avatar', title: 'Avatar', description: 'Talk through the questions with a guide.', icon: <UserRound className="h-5 w-5" />, available: false },
];

const BAND_PILL: Record<Band, string> = {
  low: 'bg-emerald-100 text-emerald-800',
  moderate: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
};

const HOTLINES = [
  { label: 'Befrienders Kenya', number: '+254722178177', display: '+254 722 178 177' },
  { label: 'National GBV Hotline', number: '1195', display: '1195' },
  { label: 'Emergency', number: '999', display: '999' },
];

const card = 'bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-lg';
const primaryButton =
  'inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-accent disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-acme transition-all shadow-md hover:shadow-lg';
const secondaryButton =
  'inline-flex items-center justify-center gap-2 border border-brand-primary/30 text-brand-primary hover:bg-brand-light/50 px-6 py-3 rounded-full font-acme transition-colors';

function freshDraft(key: string): ScreeningDraft {
  return {
    key,
    step: 'intro',
    mode: null,
    county: null,
    answers: QUESTIONS.map(() => null),
    currentIndex: 0,
    resultId: null,
    updatedAt: new Date().toISOString(),
  };
}

export default function PtsdScreeningFlow({ userId, onTalkToCompanion }: PtsdScreeningFlowProps) {
  const draftKey = userId ?? 'guest';
  const [draft, setDraft] = useState<ScreeningDraft | null>(null);
  const [result, setResult] = useState<LocalScreening | null>(null);
  const [storageError, setStorageError] = useState(false);

  // Resume an unfinished screening from this device, if there is one.
  useEffect(() => {
    let cancelled = false;
    offlineStore
      .getDraft(draftKey)
      .then(async (saved) => {
        if (cancelled) return;
        const resumed = saved ?? freshDraft(draftKey);
        if (resumed.step === 'result' && resumed.resultId) {
          setResult((await offlineStore.getScreening(resumed.resultId)) ?? null);
        }
        setDraft(resumed);
      })
      .catch(() => {
        if (cancelled) return;
        // Private browsing can block IndexedDB; the flow still works, it just can't resume.
        setStorageError(true);
        setDraft(freshDraft(draftKey));
      });
    return () => {
      cancelled = true;
    };
  }, [draftKey]);

  // Keep the shown sync status current while the outbox drains.
  useEffect(() => {
    if (!result) return;
    return onScreeningsChanged(() => {
      offlineStore.getScreening(result.id).then((latest) => latest && setResult(latest));
    });
  }, [result]);

  const update = useCallback((changes: Partial<ScreeningDraft>) => {
    setDraft((current) => {
      if (!current) return current;
      const next = { ...current, ...changes, updatedAt: new Date().toISOString() };
      offlineStore.saveDraft(next).catch(() => setStorageError(true));
      return next;
    });
  }, []);

  const restart = () => {
    const next = freshDraft(draftKey);
    setResult(null);
    setDraft(next);
    offlineStore.saveDraft(next).catch(() => setStorageError(true));
  };

  const finish = async (answers: number[]) => {
    if (!draft) return;
    const { totalScore, band } = scoreAnswers(answers);
    const screening: LocalScreening = {
      id: newScreeningId(),
      instrument: PTSD_INSTRUMENT_ID,
      mode: draft.mode ?? 'text',
      county: draft.county,
      answers,
      totalScore,
      band,
      completedAt: new Date().toISOString(),
      ownerUserId: userId,
      syncStatus: userId ? 'pending' : 'local',
    };
    setResult(screening);
    update({ step: 'result', resultId: screening.id });
    try {
      await saveCompletedScreening(screening);
    } catch {
      setStorageError(true);
    }
  };

  if (!draft) {
    return <div className={`${card} p-10 text-center text-brand-secondary`}>Loading screening…</div>;
  }

  return (
    <div className="space-y-4">
      {storageError && (
        <p className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          This browser is blocking on-device storage, so your progress can't be saved if you leave the page.
        </p>
      )}

      {draft.step === 'intro' && (
        <section className={`${card} p-6 sm:p-8`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-brand-primary p-3 rounded-full shadow-md">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-acme text-brand-primary">Free PTSD screening</h2>
              <p className="text-sm text-brand-secondary">
                {QUESTIONS.length} questions · about 3 minutes · works offline
              </p>
            </div>
          </div>
          <p className="text-brand-primary mb-2">
            These questions ask how stressful experiences may be affecting you. At the end you'll get a score and what it means.
          </p>
          <p className="text-sm text-brand-secondary mb-6">
            This is a screening, not a diagnosis. Only a trained health worker can diagnose PTSD.
          </p>

          <label htmlFor="screening-county" className="flex items-center gap-2 text-sm font-medium text-brand-primary mb-2">
            <MapPin className="h-4 w-4" /> Which county are you in? <span className="font-normal text-brand-gray">(optional)</span>
          </label>
          <select
            id="screening-county"
            value={draft.county ?? ''}
            onChange={(e) => update({ county: e.target.value || null })}
            className="w-full sm:max-w-xs border border-brand-light bg-white/70 rounded-xl px-4 py-3 text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary mb-6"
          >
            <option value="">Prefer not to say</option>
            {KENYA_COUNTIES.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>

          <div>
            <button type="button" className={primaryButton} onClick={() => update({ step: 'mode' })}>
              Start screening <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {draft.step === 'mode' && (
        <section className={`${card} p-6 sm:p-8`}>
          <h2 className="text-2xl font-acme text-brand-primary text-center mb-1">How would you like to do the screening?</h2>
          <p className="text-sm text-brand-secondary text-center mb-6">You can choose a different way next time.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MODES.map((option) => (
              <button
                key={option.mode}
                type="button"
                disabled={!option.available}
                onClick={() => update({ mode: option.mode, step: 'consent' })}
                className={`flex flex-col items-center gap-2 rounded-xl border px-5 py-6 text-center transition-colors ${
                  option.available
                    ? 'border-brand-light bg-white hover:border-brand-primary hover:bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-primary/40'
                    : 'border-brand-light bg-white/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                  {option.icon}
                </span>
                <span className="font-acme text-lg text-brand-primary">{option.title}</span>
                <span className="text-sm text-brand-secondary">{option.description}</span>
                {!option.available && (
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-teal">Coming soon</span>
                )}
              </button>
            ))}
          </div>
          <button type="button" className="mt-6 inline-flex items-center gap-1 text-sm text-brand-secondary hover:text-brand-primary" onClick={() => update({ step: 'intro' })}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </section>
      )}

      {draft.step === 'consent' && (
        <section className={`${card} p-6 sm:p-8`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-brand-light/60 p-3 rounded-full">
              <Lock className="h-6 w-6 text-brand-primary" />
            </div>
            <h2 className="text-2xl font-acme text-brand-primary">Your answers and your privacy</h2>
          </div>
          <ul className="space-y-3 text-brand-primary mb-6">
            {userId ? (
              <>
                <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0" /> Your answers are saved on this device first, so the screening works without internet.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0" /> Your result is then saved to your Heal account, so you can see it in your dashboard.</li>
              </>
            ) : (
              <>
                <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0" /> Your answers stay on this device. Nothing is sent anywhere.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0" /> If you create an account later, you can choose to save this result to it.</li>
              </>
            )}
            <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0" /> You can stop at any time. Some questions may bring up difficult memories; the hotlines are always on this page.</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={primaryButton} onClick={() => update({ step: 'questions', currentIndex: 0 })}>
              I agree, continue
            </button>
            <button type="button" className={secondaryButton} onClick={() => update({ step: 'intro' })}>
              Not now
            </button>
          </div>
        </section>
      )}

      {draft.step === 'questions' && (
        <QuestionCard draft={draft} update={update} onFinish={finish} />
      )}

      {draft.step === 'result' && result && (
        <ResultCard result={result} signedIn={!!userId} onRestart={restart} onTalkToCompanion={onTalkToCompanion} />
      )}

      {draft.step === 'result' && !result && (
        <section className={`${card} p-6 text-center`}>
          <p className="text-brand-primary mb-4">We couldn't find your last result on this device.</p>
          <button type="button" className={primaryButton} onClick={restart}>
            Start a new screening
          </button>
        </section>
      )}
    </div>
  );
}

function QuestionCard({
  draft,
  update,
  onFinish,
}: {
  draft: ScreeningDraft;
  update: (changes: Partial<ScreeningDraft>) => void;
  onFinish: (answers: number[]) => void;
}) {
  const index = draft.currentIndex;
  const question = QUESTIONS[index];
  const selected = draft.answers[index];
  const isLast = index === QUESTIONS.length - 1;
  const progress = Math.round(((index + 1) / QUESTIONS.length) * 100);

  const choose = (value: number) => {
    const answers = [...draft.answers];
    answers[index] = value;
    update({ answers });
  };

  const next = () => {
    if (selected === null) return;
    if (isLast) onFinish(draft.answers as number[]);
    else update({ currentIndex: index + 1 });
  };

  return (
    <section className={`${card} p-6 sm:p-8`}>
      <div className="flex items-center justify-between text-sm text-brand-secondary mb-2">
        <span>
          Question {index + 1} of {QUESTIONS.length}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 rounded-full bg-brand-light mb-6" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-2 rounded-full bg-brand-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      <p className="text-sm text-brand-secondary mb-1">{QUESTION_STEM}</p>
      <h2 id={`question-${question.id}`} className="text-xl sm:text-2xl font-acme text-brand-primary mb-6">
        {question.text}
      </h2>

      <div role="radiogroup" aria-labelledby={`question-${question.id}`} className="grid gap-3">
        {ANSWER_OPTIONS.map((option) => {
          const checked = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => choose(option.value)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                checked
                  ? 'border-brand-primary bg-brand-primary text-white shadow-md'
                  : 'border-brand-light bg-white text-brand-primary hover:border-brand-primary hover:bg-brand-cream'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${checked ? 'border-white' : 'border-brand-gray'}`}
              >
                {checked && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
              </span>
              <span className="font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          className={secondaryButton}
          onClick={() => update(index === 0 ? { step: 'consent' } : { currentIndex: index - 1 })}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button type="button" className={primaryButton} disabled={selected === null} onClick={next}>
          {isLast ? 'See my result' : 'Next'} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function ResultCard({
  result,
  signedIn,
  onRestart,
  onTalkToCompanion,
}: {
  result: LocalScreening;
  signedIn: boolean;
  onRestart: () => void;
  onTalkToCompanion?: () => void;
}) {
  const band = BANDS[result.band];

  return (
    <section className={`${card} p-6 sm:p-8`}>
      <p className="text-center text-sm text-brand-secondary mb-1">Your score</p>
      <p className="text-center font-acme text-5xl text-brand-primary">
        {result.totalScore}
        <span className="text-2xl text-brand-gray"> / {MAX_SCORE}</span>
      </p>
      <div className="flex justify-center mt-3 mb-6">
        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${BAND_PILL[result.band]}`}>{band.label} symptoms</span>
      </div>

      <p className="text-brand-primary text-center mb-2">{band.summary}</p>
      <p className="text-brand-secondary text-center mb-6">{band.advice}</p>

      {result.band !== 'low' && (
        <div className={`rounded-xl p-4 mb-6 ${result.band === 'high' ? 'bg-red-50 border border-red-200' : 'bg-brand-light/40'}`}>
          <p className="text-sm font-medium text-brand-primary mb-3">Free support, available 24/7:</p>
          <div className="flex flex-wrap gap-2">
            {HOTLINES.map((line) => (
              <a
                key={line.number}
                href={`tel:${line.number}`}
                className="flex items-center gap-2 bg-white hover:bg-brand-light transition-colors px-3 py-2 rounded-lg text-sm shadow-sm"
              >
                <Phone className="h-4 w-4 text-brand-primary" />
                <span className="text-brand-primary font-medium">
                  {line.label}: {line.display}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-brand-secondary text-center mb-6">
        This is a screening result, not a diagnosis. The questions used here are placeholders for testing.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {onTalkToCompanion && (
          <button type="button" className={primaryButton} onClick={onTalkToCompanion}>
            <MessageCircle className="h-4 w-4" /> Talk to the AI companion
          </button>
        )}
        {signedIn ? (
          <Link href="/dashboard/screenings" className={primaryButton}>
            View my screenings
          </Link>
        ) : (
          <Link href="/auth/signup" className={secondaryButton}>
            Create an account to save this result
          </Link>
        )}
        <button type="button" className={secondaryButton} onClick={onRestart}>
          <RotateCcw className="h-4 w-4" /> Screen again
        </button>
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-brand-secondary">
        {result.syncStatus === 'synced' ? (
          <><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Saved to your account</>
        ) : result.syncStatus === 'pending' ? (
          <><CloudOff className="h-4 w-4" /> Saved on this device · will be saved to your account when you're online</>
        ) : (
          <><Lock className="h-4 w-4" /> Saved on this device only</>
        )}
      </p>
    </section>
  );
}
