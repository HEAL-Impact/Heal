'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CloudOff,
  Headphones,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  MessageCircle,
  Mic,
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
  QUESTION_STEM_SW,
  QUESTIONS_SW,
  ANSWER_OPTIONS_SW,
  BANDS_SW,
  scoreAnswers,
  type Band,
  type PresentationMode,
} from '@/lib/screening/ptsd-instrument';
import { requestApproxLocation, type LocationError } from '@/lib/screening/location';
import {
  newScreeningId,
  offlineStore,
  type LocalScreening,
  type ScreeningDraft,
} from '@/lib/screening/offline-store';
import { onScreeningsChanged, saveCompletedScreening } from '@/lib/screening/sync';
import { useLang, type L } from '@/lib/i18n';

interface PtsdScreeningFlowProps {
  /** Signed-in user's id, or null in guest mode (results then stay on this device). */
  userId: string | null;
  /** Guest mode: switches the page to the AI companion chat tab. Signed in, the result links to /dashboard/chat. */
  onChatWithNia?: () => void;
}

const MODES: { mode: PresentationMode; title: L; description: L; icon: React.ReactNode; available: boolean }[] = [
  { mode: 'text', title: { en: 'Text', sw: 'Maandishi' }, description: { en: 'Read each question and tap your answer.', sw: 'Soma kila swali na uguse jibu lako.' }, icon: <Type className="h-5 w-5" />, available: true },
  { mode: 'audio', title: { en: 'Audio', sw: 'Sauti' }, description: { en: 'Listen to each question read aloud.', sw: 'Sikiliza kila swali likisomwa kwa sauti.' }, icon: <Headphones className="h-5 w-5" />, available: false },
  { mode: 'avatar', title: { en: 'Avatar', sw: 'Mwongozaji' }, description: { en: 'Talk through the questions with a guide.', sw: 'Pitia maswali pamoja na mwongozaji.' }, icon: <UserRound className="h-5 w-5" />, available: false },
];

const BAND_PILL: Record<Band, string> = {
  low: 'bg-[#2C4A4E]/10 text-[#2C4A4E]',
  moderate: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
};

const HOTLINES = [
  { label: { en: 'Befrienders Kenya', sw: 'Befrienders Kenya' }, number: '+254722178177', display: '+254 722 178 177' },
  { label: { en: 'National GBV Hotline', sw: 'Simu ya Kitaifa ya GBV' }, number: '1195', display: '1195' },
  { label: { en: 'Emergency', sw: 'Dharura' }, number: '999', display: '999' },
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
    latitude: null,
    longitude: null,
    answers: QUESTIONS.map(() => null),
    currentIndex: 0,
    resultId: null,
    updatedAt: new Date().toISOString(),
  };
}

export default function PtsdScreeningFlow({ userId, onChatWithNia }: PtsdScreeningFlowProps) {
  const { tr } = useLang();
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
      // ?? null: drafts saved before location was added have no coordinates.
      latitude: draft.latitude ?? null,
      longitude: draft.longitude ?? null,
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
    return <div className={`${card} p-10 text-center text-brand-secondary`}>{tr('Loading screening…', 'Inapakia ukaguzi…')}</div>;
  }

  return (
    <div className="space-y-4">
      {storageError && (
        <p className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          {tr("This browser is blocking on-device storage, so your progress can't be saved if you leave the page.", 'Kivinjari hiki kinazuia kuhifadhi kwenye kifaa, kwa hivyo maendeleo yako hayawezi kuhifadhiwa ukitoka kwenye ukurasa.')}
        </p>
      )}

      {draft.step === 'intro' && (
        <section className={`${card} p-6 sm:p-8`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-brand-primary p-3 rounded-full shadow-md">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-acme text-brand-primary">{tr('Trauma check', 'Ukaguzi wa kiwewe')}</h2>
              <p className="text-sm text-brand-secondary">
                {QUESTIONS.length} {tr('questions · about 3 minutes · works offline', 'maswali · kama dakika 3 · inafanya kazi bila mtandao')}
              </p>
            </div>
          </div>
          <p className="text-brand-primary mb-2">
            {tr("These questions ask how stressful experiences may be affecting you. At the end you'll see what your answers suggest and one next step.", 'Maswali haya yanauliza jinsi matukio ya dhiki yanavyoweza kukuathiri. Mwishoni utaona majibu yako yanaashiria nini na hatua moja inayofuata.')}
          </p>
          <p className="text-sm text-brand-secondary mb-6">
            {tr('This is a screening, not a diagnosis. Only a trained health worker can diagnose PTSD.', 'Huu ni ukaguzi, si utambuzi wa ugonjwa. Ni mhudumu wa afya aliyefunzwa pekee anayeweza kutambua PTSD.')}
          </p>

          <LocationPicker draft={draft} update={update} />

          <div>
            <button type="button" className={primaryButton} onClick={() => update({ step: 'mode' })}>
              {tr('Start', 'Anza')} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {draft.step === 'mode' && (
        <section className={`${card} p-6 sm:p-8`}>
          <h2 className="text-2xl font-acme text-brand-primary text-center mb-1">{tr('How would you like to do the check?', 'Ungependa kufanya ukaguzi kwa njia gani?')}</h2>
          <p className="text-sm text-brand-secondary text-center mb-6">{tr('You can choose a different way next time.', 'Unaweza kuchagua njia tofauti wakati ujao.')}</p>
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
                <span className="text-lg text-brand-primary">{tr(option.title)}</span>
                <span className="text-sm text-brand-secondary">{tr(option.description)}</span>
                {!option.available && (
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-teal">{tr('Coming soon', 'Inakuja hivi karibuni')}</span>
                )}
              </button>
            ))}
          </div>
          <button type="button" className="mt-6 inline-flex items-center gap-1 text-sm text-brand-secondary hover:text-brand-primary" onClick={() => update({ step: 'intro' })}>
            <ArrowLeft className="h-4 w-4" /> {tr('Back', 'Rudi')}
          </button>
        </section>
      )}

      {draft.step === 'consent' && (
        <section className={`${card} p-6 sm:p-8`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-brand-light/60 p-3 rounded-full">
              <Lock className="h-6 w-6 text-brand-primary" />
            </div>
            <h2 className="text-2xl font-acme text-brand-primary">{tr('Your answers and your privacy', 'Majibu yako na faragha yako')}</h2>
          </div>
          <ul className="space-y-3 text-brand-primary mb-6">
            {userId ? (
              <>
                <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0" /> {tr('Your answers are saved on this device first, so the check works without internet.', 'Majibu yako yanahifadhiwa kwanza kwenye kifaa hiki, kwa hivyo ukaguzi unafanya kazi bila mtandao.')}</li>
                <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0" /> {tr('Your result is then saved to your HEAL account, so you can see it in My Space.', 'Kisha matokeo yako yanahifadhiwa kwenye akaunti yako ya HEAL, ili uyaone kwenye Nafasi Yangu.')}</li>
              </>
            ) : (
              <>
                <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0" /> {tr('Your answers stay on this device. Nothing is sent anywhere.', 'Majibu yako yanabaki kwenye kifaa hiki. Hakuna kinachotumwa popote.')}</li>
                <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0" /> {tr('If you create an account later, you can choose to save this result to it.', 'Ukifungua akaunti baadaye, unaweza kuchagua kuhifadhi matokeo haya humo.')}</li>
              </>
            )}
            <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0" /> {tr('You can stop at any time. Some questions may bring up difficult memories; the help lines are always on this page.', 'Unaweza kusimama wakati wowote. Baadhi ya maswali yanaweza kuleta kumbukumbu ngumu; simu za msaada ziko kwenye ukurasa huu kila wakati.')}</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={primaryButton} onClick={() => update({ step: 'questions', currentIndex: 0 })}>
              {tr('I agree, continue', 'Nakubali, endelea')}
            </button>
            <button type="button" className={secondaryButton} onClick={() => update({ step: 'intro' })}>
              {tr('Not now', 'Si sasa')}
            </button>
          </div>
        </section>
      )}

      {draft.step === 'questions' && (
        <QuestionCard draft={draft} update={update} onFinish={finish} />
      )}

      {draft.step === 'result' && result && (
        <ResultCard result={result} signedIn={!!userId} onRestart={restart} onChatWithNia={onChatWithNia} />
      )}

      {draft.step === 'result' && !result && (
        <section className={`${card} p-6 text-center`}>
          <p className="text-brand-primary mb-4">{tr("We couldn't find your last result on this device.", 'Hatukupata matokeo yako ya mwisho kwenye kifaa hiki.')}</p>
          <button type="button" className={primaryButton} onClick={restart}>
            {tr('Start a new check', 'Anza ukaguzi mpya')}
          </button>
        </section>
      )}
    </div>
  );
}

const LOCATION_ERRORS: Record<LocationError, L> = {
  denied: { en: 'Location access was declined. You can continue without it, or allow it later in your browser settings.', sw: 'Ruhusa ya mahali ilikataliwa. Unaweza kuendelea bila hiyo, au kuiruhusu baadaye kwenye mipangilio ya kivinjari.' },
  unavailable: { en: "We couldn't find your location. You can continue without it.", sw: 'Hatukuweza kupata mahali ulipo. Unaweza kuendelea bila hiyo.' },
  timeout: { en: 'Finding your location took too long. You can try again or continue without it.', sw: 'Kupata mahali ulipo kumechukua muda mrefu. Unaweza kujaribu tena au kuendelea bila hiyo.' },
  unsupported: { en: "This browser can't share its location. You can continue without it.", sw: 'Kivinjari hiki hakiwezi kushiriki mahali. Unaweza kuendelea bila hiyo.' },
};

function LocationPicker({
  draft,
  update,
}: {
  draft: ScreeningDraft;
  update: (changes: Partial<ScreeningDraft>) => void;
}) {
  const { tr } = useLang();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);

  const share = async () => {
    setLocating(true);
    setError(null);
    try {
      const { latitude, longitude, county } = await requestApproxLocation();
      update({ latitude, longitude, county });
    } catch (reason) {
      setError(reason as LocationError);
    } finally {
      setLocating(false);
    }
  };

  if (draft.latitude != null && draft.longitude != null) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-brand-light/40 px-4 py-3 mb-6">
        <MapPin className="h-5 w-5 text-brand-teal" />
        <span className="text-brand-primary font-medium">
          {draft.county ? tr(`${draft.county} County (approximate)`, `Kaunti ya ${draft.county} (takriban)`) : tr('Location shared (outside Kenya)', 'Mahali pameshirikiwa (nje ya Kenya)')}
        </span>
        <button
          type="button"
          onClick={() => update({ latitude: null, longitude: null, county: null })}
          className="ml-auto text-sm text-brand-secondary hover:text-brand-primary underline"
        >
          {tr('Remove', 'Ondoa')}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-light bg-white/60 px-4 py-4 mb-6">
      <p className="flex items-center gap-2 text-sm font-medium text-brand-primary mb-1">
        <MapPin className="h-4 w-4" /> {tr('Share your location', 'Shiriki mahali ulipo')} <span className="font-normal text-brand-gray">{tr('(optional)', '(si lazima)')}</span>
      </p>
      <p className="text-sm text-brand-secondary mb-3">
        {tr('This helps us connect you with support near you. Your browser will ask for permission. We only keep your approximate area, never your exact position.', 'Hii inatusaidia kukuunganisha na msaada ulio karibu nawe. Kivinjari kitaomba ruhusa. Tunahifadhi eneo lako la takriban tu, kamwe si mahali halisi.')}
      </p>
      <button
        type="button"
        onClick={share}
        disabled={locating}
        className="inline-flex items-center gap-2 border border-brand-primary/30 text-brand-primary hover:bg-brand-light/50 disabled:opacity-60 px-4 py-2 rounded-full text-sm font-medium transition-colors"
      >
        {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
        {locating ? tr('Finding your location…', 'Inatafuta mahali ulipo…') : tr('Use my location', 'Tumia mahali nilipo')}
      </button>
      {error && (
        <p role="status" className="mt-3 text-sm text-amber-800">
          {tr(LOCATION_ERRORS[error])}
        </p>
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
  const { lang, tr } = useLang();
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
          {tr(`Question ${index + 1} of ${QUESTIONS.length}`, `Swali ${index + 1} kati ya ${QUESTIONS.length}`)}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 rounded-full bg-brand-light mb-6" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-2 rounded-full bg-brand-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      <p className="text-sm text-brand-secondary mb-1">{lang === 'sw' ? QUESTION_STEM_SW : QUESTION_STEM}</p>
      <h2 id={`question-${question.id}`} className="text-xl sm:text-2xl font-acme text-brand-primary mb-6">
        {lang === 'sw' ? QUESTIONS_SW[question.id] ?? question.text : question.text}
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
              <span className="font-medium">{lang === 'sw' ? ANSWER_OPTIONS_SW[option.value] : option.label}</span>
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
          <ArrowLeft className="h-4 w-4" /> {tr('Back', 'Rudi')}
        </button>
        <button type="button" className={primaryButton} disabled={selected === null} onClick={next}>
          {isLast ? tr('See my result', 'Ona matokeo yangu') : tr('Next', 'Endelea')} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function ResultCard({
  result,
  signedIn,
  onRestart,
  onChatWithNia,
}: {
  result: LocalScreening;
  signedIn: boolean;
  onRestart: () => void;
  onChatWithNia?: () => void;
}) {
  const { lang, tr } = useLang();
  const band = lang === 'sw' ? { ...BANDS[result.band], ...BANDS_SW[result.band] } : BANDS[result.band];

  return (
    <section className={`${card} p-6 sm:p-8`}>
      <p className="text-center text-sm text-brand-secondary mb-1">{tr('Your score', 'Alama zako')}</p>
      <p className="text-center font-acme text-5xl text-brand-primary">
        {result.totalScore}
        <span className="text-2xl text-brand-gray"> / {MAX_SCORE}</span>
      </p>
      <div className="flex justify-center mt-3 mb-6">
        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${BAND_PILL[result.band]}`}>{tr(`${band.label} symptoms`, `Dalili: ${band.label}`)}</span>
      </div>

      <p className="text-brand-primary text-center mb-2">{band.summary}</p>
      <p className="text-brand-secondary text-center mb-6">{band.advice}</p>

      {result.band !== 'low' && (
        <div className={`rounded-xl p-4 mb-6 ${result.band === 'high' ? 'bg-red-50 border border-red-200' : 'bg-brand-light/40'}`}>
          <p className="text-sm font-medium text-brand-primary mb-3">{tr('Free support, available 24/7:', 'Msaada wa bure, saa 24:')}</p>
          <div className="flex flex-wrap gap-2">
            {HOTLINES.map((line) => (
              <a
                key={line.number}
                href={`tel:${line.number}`}
                className="flex items-center gap-2 bg-white hover:bg-brand-light transition-colors px-3 py-2 rounded-lg text-sm shadow-sm"
              >
                <Phone className="h-4 w-4 text-brand-primary" />
                <span className="text-brand-primary font-medium">
                  {tr(line.label)}: {line.display}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-brand-secondary text-center mb-6">
        {tr('This is a screening result, not a diagnosis. The questions used here are placeholders for testing.', 'Haya ni matokeo ya ukaguzi, si utambuzi wa ugonjwa. Maswali yaliyotumika hapa ni ya majaribio tu.')}
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {signedIn ? (
          <Link href="/dashboard/chat" className={primaryButton}>
            <MessageCircle className="h-4 w-4" /> {tr('Chat with Nia', 'Ongea na Nia')}
          </Link>
        ) : (
          onChatWithNia && (
            <button type="button" className={primaryButton} onClick={onChatWithNia}>
              <MessageCircle className="h-4 w-4" /> {tr('Chat with Nia (AI companion)', 'Ongea na Nia (msaidizi wa AI)')}
            </button>
          )
        )}
        {/* Placeholder for the Nia psychologist AI; enable and wire up once it exists. */}
        <button type="button" className={primaryButton} disabled title={tr('Coming soon', 'Inakuja hivi karibuni')}>
          <Mic className="h-4 w-4" /> {signedIn ? tr('Talk to Nia', 'Zungumza na Nia') : tr('Talk to Nia (AI companion)', 'Zungumza na Nia (msaidizi wa AI)')}
          <span className="ml-1 rounded-full bg-white/30 px-2 py-0.5 text-[10px] uppercase tracking-wide">{tr('Soon', 'Karibuni')}</span>
        </button>
        {signedIn ? (
          <Link href="/dashboard/screenings" className={secondaryButton}>
            {tr('View my screenings', 'Ona ukaguzi wangu')}
          </Link>
        ) : (
          <Link href="/auth/signup" className={secondaryButton}>
            {tr('Create an account to save this result', 'Fungua akaunti kuhifadhi matokeo haya')}
          </Link>
        )}
        <button type="button" className={secondaryButton} onClick={onRestart}>
          <RotateCcw className="h-4 w-4" /> {tr('Check again', 'Kagua tena')}
        </button>
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-brand-secondary">
        {result.syncStatus === 'synced' ? (
          <><CheckCircle2 className="h-4 w-4 text-[#2C4A4E]" /> {tr('Saved to your account', 'Imehifadhiwa kwenye akaunti yako')}</>
        ) : result.syncStatus === 'pending' ? (
          <><CloudOff className="h-4 w-4" /> {tr("Saved on this device · will be saved to your account when you're online", 'Imehifadhiwa kwenye kifaa hiki · itahifadhiwa kwenye akaunti yako ukiwa mtandaoni')}</>
        ) : (
          <><Lock className="h-4 w-4" /> {tr('Saved on this device only', 'Imehifadhiwa kwenye kifaa hiki tu')}</>
        )}
      </p>
    </section>
  );
}
