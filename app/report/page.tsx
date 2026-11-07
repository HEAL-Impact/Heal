'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, MapPin, Loader2, Copy, Check, ShieldCheck, Lock } from 'lucide-react';
import HelpShell from '@/components/help/HelpShell';
import { RECIPIENTS, submitReport, type ReportDraft } from '@/lib/reports';
import { saveCaseCode } from '@/lib/myspace/store';
import { requestApproxLocation } from '@/lib/screening/location';
import { useLang } from '@/lib/i18n';

// Values are stored in English so services read consistent reports; labels follow her language.
type Opt = { value: string; sw: string };
const INCIDENT_TYPES: Opt[] = [
  { value: 'Physical violence', sw: 'Ukatili wa kimwili' },
  { value: 'Sexual violence', sw: 'Ukatili wa kingono' },
  { value: 'Emotional or verbal abuse', sw: 'Unyanyasaji wa kihisia au kwa maneno' },
  { value: 'Money or property being controlled', sw: 'Kudhibitiwa pesa au mali' },
  { value: 'Online abuse or threats', sw: 'Unyanyasaji au vitisho mtandaoni' },
  { value: 'Forced or child marriage', sw: 'Ndoa ya kulazimishwa au ya utotoni' },
  { value: 'FGM', sw: 'Ukeketaji (FGM)' },
  { value: 'Something else', sw: 'Kitu kingine' },
];
const WHEN: Opt[] = [
  { value: 'In the last 3 days', sw: 'Ndani ya siku 3 zilizopita' },
  { value: 'In the last week', sw: 'Ndani ya wiki iliyopita' },
  { value: 'In the last month', sw: 'Ndani ya mwezi uliopita' },
  { value: 'Longer ago', sw: 'Zamani zaidi' },
  { value: 'It is still happening', sw: 'Bado kinaendelea' },
];
const SAFE: Opt[] = [
  { value: 'Yes', sw: 'Ndiyo' },
  { value: 'No', sw: 'Hapana' },
  { value: 'Not sure', sw: 'Sina uhakika' },
];
const CONTACT_CHOICES: Opt[] = [
  { value: 'Yes, contact me', sw: 'Ndiyo, wasiliana nami' },
  { value: 'No, I will use my case code', sw: 'Hapana, nitatumia namba yangu ya kesi' },
];
const CONTACT_METHODS: Opt[] = [
  { value: 'Phone call', sw: 'Simu' },
  { value: 'SMS', sw: 'SMS' },
  { value: 'WhatsApp', sw: 'WhatsApp' },
];
const label = (options: Opt[], value: string | undefined, lang: 'en' | 'sw') => {
  const o = options.find((x) => x.value === value);
  return o ? (lang === 'sw' ? o.sw : o.value) : value;
};

type Step = 'intro' | 'type' | 'when' | 'safe' | 'details' | 'where' | 'recipient' | 'contact' | 'review' | 'done';
const STEPS: Step[] = ['intro', 'type', 'when', 'safe', 'details', 'where', 'recipient', 'contact', 'review'];

function Choice({ options, value, onPick }: { options: Opt[]; value?: string; onPick: (v: string) => void }) {
  const { lang } = useLang();
  return (
    <div className="mt-6 space-y-3">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onPick(o.value)}
          className={`w-full rounded-2xl border px-5 py-4 text-left font-medium transition-colors ${
            value === o.value ? 'border-[#2C4A4E] bg-[#2C4A4E]/10' : 'border-transparent bg-white hover:border-[#2C4A4E]/40'
          } text-[#2C4A4E]`}
        >
          {lang === 'sw' ? o.sw : o.value}
        </button>
      ))}
    </div>
  );
}

function GuidedReport() {
  const { lang, tr } = useLang();
  const counselling = useSearchParams().get('reason') === 'counselling';
  const [step, setStep] = useState<Step>('intro');
  const [draft, setDraft] = useState<ReportDraft>(
    counselling ? { incidentType: 'Asking to be connected with a counsellor', recipient: 'heal', wantsContact: true } : {}
  );
  const [locating, setLocating] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ caseCode: string; sent: boolean } | null>(null);
  const [kept, setKept] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (patch: Partial<ReportDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const index = STEPS.indexOf(step);
  const next = () => setStep(STEPS[Math.min(index + 1, STEPS.length - 1)]);
  const back = () => setStep(STEPS[Math.max(index - 1, 0)]);
  const pickAndNext = (patch: Partial<ReportDraft>) => {
    set(patch);
    next();
  };

  const addLocation = async () => {
    setLocating(true);
    try {
      const loc = await requestApproxLocation();
      set({ latitude: loc.latitude, longitude: loc.longitude, county: loc.county ?? draft.county });
    } catch {
      /* she can type a place instead */
    } finally {
      setLocating(false);
    }
  };

  const send = async () => {
    setSending(true);
    const r = await submitReport(draft);
    setResult(r);
    setSending(false);
    setStep('done');
  };

  const recentSexualViolence = draft.incidentType === 'Sexual violence' && draft.whenHappened === 'In the last 3 days';
  const notSafe = draft.safeNow === 'No';

  if (step === 'done' && result) {
    return (
      <section className="py-8 space-y-4">
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-[#2C4A4E]" aria-hidden="true" />
          <h1 className="mt-3 text-3xl font-acme text-[#2C4A4E]">{tr("Thank you for trusting us", "Asante kwa kutuamini")}</h1>
          <p className="mt-2 text-gray-600">
            {result.sent
              ? tr("Your report was received and is stored encrypted.", "Ripoti yako imepokelewa na imehifadhiwa kwa usimbaji fiche.")
              : tr("You seem to be offline. Your report is saved on this phone and will be sent automatically when you are back online.", "Inaonekana huna mtandao. Ripoti yako imehifadhiwa kwenye simu hii na itatumwa yenyewe ukirudi mtandaoni.")}
          </p>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-gray-500">{tr("Your case code", "Namba yako ya kesi")}</p>
          <p className="mt-1 font-mono text-4xl font-bold tracking-wider text-[#2C4A4E]">{result.caseCode}</p>
          <p className="mt-2 text-sm text-gray-600">
            {tr("Use it to check progress without giving your name. Write it down somewhere safe.", "Itumie kufuatilia maendeleo bila kutoa jina lako. Iandike mahali salama.")}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(result.caseCode);
                setCopied(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#2C4A4E] px-4 py-2 text-sm font-semibold text-[#2C4A4E]"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? tr("Copied", "Imenakiliwa") : tr("Copy code", "Nakili namba")}
            </button>
            <button
              type="button"
              disabled={kept}
              onClick={() => {
                saveCaseCode(result.caseCode, result.sent ? 'received' : 'waiting');
                setKept(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#2C4A4E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
              <Lock className="h-4 w-4" /> {kept ? tr("Kept in My Space", "Imehifadhiwa kwenye Nafasi Yangu") : tr("Keep this code in My Space", "Hifadhi namba hii kwenye Nafasi Yangu")}
            </button>
          </div>
        </div>
        <div className="rounded-3xl bg-[#2C4A4E]/10 p-6">
          <h2 className="text-xl font-acme text-[#2C4A4E]">{tr("What happens next", "Kinachofuata")}</h2>
          <ol className="mt-3 space-y-2 text-sm text-gray-700">
            <li>1. {tr("Received: your report is safely stored.", "Imepokelewa: ripoti yako imehifadhiwa salama.")}</li>
            <li>2. {draft.wantsContact ? tr("Contacted: someone reaches out the way you asked, at a safe time.", "Kuwasiliana: mtu atawasiliana nawe kwa njia uliyoomba, wakati salama.") : tr("Contacted: you chose not to be contacted; you can check your code any time.", "Kuwasiliana: ulichagua usiwasiliane nawe; unaweza kukagua namba yako wakati wowote.")}</li>
            <li>3. {tr("Seen: you get support from the service you chose.", "Kuonwa: unapata msaada kutoka kwa huduma uliyochagua.")}</li>
          </ol>
          <Link href={`/report/status?code=${result.caseCode}`} className="mt-4 inline-block text-sm font-semibold underline">
            {tr("Check status", "Kagua hali")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      {step !== 'intro' && (
        <div className="flex items-center gap-1.5" aria-label={tr(`Step ${index} of ${STEPS.length - 1}`, `Hatua ${index} kati ya ${STEPS.length - 1}`)}>
          {STEPS.slice(1).map((s, i) => (
            <span key={s} className={`h-1.5 flex-1 rounded-full ${i < index ? 'bg-[#2C4A4E]' : 'bg-black/10'}`} />
          ))}
        </div>
      )}

      {step === 'intro' && (
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
          <h1 className="text-3xl font-acme text-[#2C4A4E]">{tr("Make a safe report", "Toa ripoti kwa usalama")}</h1>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>• {tr("You can skip any question.", "Unaweza kuruka swali lolote.")}</li>
            <li>• {tr("You don’t need to give your name.", "Huhitaji kutoa jina lako.")}</li>
            <li>• {tr("Nothing is sent until you press Send at the end.", "Hakuna kinachotumwa hadi ubonyeze Tuma mwishoni.")}</li>
            <li>• {tr("Your report is encrypted, and you get a case code to follow up.", "Ripoti yako inasimbwa kwa usiri, na unapata namba ya kesi ya kufuatilia.")}</li>
          </ul>
          <button type="button" onClick={next} className="mt-6 w-full rounded-2xl bg-[#2C4A4E] px-5 py-4 font-semibold text-white hover:bg-[#2C4A4E]/90">
            {tr("Start", "Anza")}
          </button>
          <Link href="/report/status" className="mt-4 block text-center text-sm text-gray-600 underline">
            {tr("I already have a case code", "Tayari nina namba ya kesi")}
          </Link>
        </div>
      )}

      {step === 'type' && (
        <>
          <h1 className="mt-6 text-2xl sm:text-3xl font-acme text-[#2C4A4E]">{tr("What happened?", "Nini kilitokea?")}</h1>
          <p className="mt-1 text-sm text-gray-600">{tr("Choose what fits best.", "Chagua kinachofaa zaidi.")}</p>
          <Choice options={INCIDENT_TYPES} value={draft.incidentType} onPick={(v) => pickAndNext({ incidentType: v })} />
        </>
      )}

      {step === 'when' && (
        <>
          <h1 className="mt-6 text-2xl sm:text-3xl font-acme text-[#2C4A4E]">{tr("When did it happen?", "Kilitokea lini?")}</h1>
          <Choice options={WHEN} value={draft.whenHappened} onPick={(v) => pickAndNext({ whenHappened: v })} />
        </>
      )}

      {step === 'safe' && (
        <>
          {recentSexualViolence && (
            <div className="mt-6 rounded-2xl bg-[#2C4A4E]/10 p-4 text-sm text-[#2C4A4E]">
              <strong>{tr("Time matters:", "Muda ni muhimu:")}</strong>{' '}
              {tr("within 72 hours a clinic can give PEP to prevent HIV, and emergency contraception. Call GVRC on", "ndani ya saa 72 kliniki inaweza kukupa PEP kuzuia VVU, na kidonge cha dharura cha kuzuia mimba. Piga GVRC")}{' '}
              <a className="underline" href="tel:0709400200">0709 400 200</a> {tr("or 1195.", "au 1195.")}
            </div>
          )}
          <h1 className="mt-6 text-2xl sm:text-3xl font-acme text-[#2C4A4E]">{tr("Are you safe right now?", "Je, uko salama sasa hivi?")}</h1>
          <Choice options={SAFE} value={draft.safeNow} onPick={(v) => (v === 'No' ? set({ safeNow: v }) : pickAndNext({ safeNow: v }))} />
          {notSafe && (
            <div className="mt-4 rounded-2xl bg-[#2C4A4E] p-5 text-white">
              <p className="font-semibold">{tr("Please call for help now if you can. It’s free.", "Tafadhali piga simu kuomba msaada sasa kama unaweza. Ni bure.")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="tel:1195" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#2C4A4E]">{tr("Call 1195", "Piga 1195")}</a>
                <a href="tel:999" className="rounded-full border border-white/60 px-4 py-2 text-sm font-semibold">{tr("Call 999", "Piga 999")}</a>
                <button type="button" onClick={next} className="rounded-full border border-white/60 px-4 py-2 text-sm font-semibold">
                  {tr("Continue the report", "Endelea na ripoti")}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {step === 'details' && (
        <>
          <h1 className="mt-6 text-2xl sm:text-3xl font-acme text-[#2C4A4E]">{tr("Tell us more, if you want to", "Tueleze zaidi, ukipenda")}</h1>
          <p className="mt-1 text-sm text-gray-600">{tr("Only share what feels okay. You can leave this empty.", "Shiriki tu kile unachoona ni sawa. Unaweza kuacha hapa wazi.")}</p>
          <textarea
            value={draft.description ?? ''}
            onChange={(e) => set({ description: e.target.value })}
            rows={7}
            maxLength={5000}
            className="mt-6 w-full rounded-2xl border border-transparent bg-white p-4 text-[#2C4A4E] focus:border-[#2C4A4E] focus:outline-none"
            placeholder={tr("What would you like us to know?", "Ungependa tujue nini?")}
            aria-label={tr("Details", "Maelezo")}
          />
          <button type="button" onClick={next} className="mt-4 w-full rounded-2xl bg-[#2C4A4E] px-5 py-4 font-semibold text-white hover:bg-[#2C4A4E]/90">
            {tr('Next', 'Endelea')}
          </button>
        </>
      )}

      {step === 'where' && (
        <>
          <h1 className="mt-6 text-2xl sm:text-3xl font-acme text-[#2C4A4E]">{tr("Where are you, roughly?", "Uko wapi, kwa takriban?")}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {tr("Optional. It helps us suggest the nearest service. Only your approximate area (about 1 km) is used.", "Si lazima. Inatusaidia kupendekeza huduma iliyo karibu zaidi. Ni eneo lako la takriban tu (karibu kilomita 1) linalotumika.")}
          </p>
          <input
            value={draft.county ?? ''}
            onChange={(e) => set({ county: e.target.value })}
            className="mt-6 w-full rounded-2xl border border-transparent bg-white p-4 text-[#2C4A4E] focus:border-[#2C4A4E] focus:outline-none"
            placeholder={tr("County or town, e.g. Kisumu", "Kaunti au mji, mf. Kisumu")}
            aria-label={tr("County or town", "Kaunti au mji")}
          />
          <button
            type="button"
            onClick={addLocation}
            disabled={locating || draft.latitude != null}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#2C4A4E] px-4 py-2 text-sm font-semibold text-[#2C4A4E] disabled:opacity-60"
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4 text-[#2C4A4E]" />}
            {draft.latitude != null ? tr("Approximate location added", "Mahali pa takriban pameongezwa") : tr("Use my approximate location", "Tumia mahali nilipo kwa takriban")}
          </button>
          <button type="button" onClick={next} className="mt-6 w-full rounded-2xl bg-[#2C4A4E] px-5 py-4 font-semibold text-white hover:bg-[#2C4A4E]/90">
            {tr('Next', 'Endelea')}
          </button>
        </>
      )}

      {step === 'recipient' && (
        <>
          <h1 className="mt-6 text-2xl sm:text-3xl font-acme text-[#2C4A4E]">{tr("Who should receive your report?", "Nani apokee ripoti yako?")}</h1>
          <div className="mt-6 space-y-3">
            {RECIPIENTS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => pickAndNext({ recipient: r.id })}
                className={`w-full rounded-2xl border px-5 py-4 text-left transition-colors ${
                  draft.recipient === r.id ? 'border-[#2C4A4E] bg-[#2C4A4E]/10' : 'border-transparent bg-white hover:border-[#2C4A4E]/40'
                }`}
              >
                <span className="block font-semibold text-[#2C4A4E]">{lang === 'sw' ? r.labelSw : r.label}</span>
                <span className="block text-sm text-gray-600">{lang === 'sw' ? r.noteSw : r.note}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'contact' && (
        <>
          <h1 className="mt-6 text-2xl sm:text-3xl font-acme text-[#2C4A4E]">{tr("Can someone contact you?", "Je, mtu anaweza kuwasiliana nawe?")}</h1>
          <p className="mt-1 text-sm text-gray-600">{tr("Only if it is safe for you. You can always use your case code instead.", "Ikiwa tu ni salama kwako. Unaweza kutumia namba yako ya kesi badala yake.")}</p>
          <Choice
            options={CONTACT_CHOICES}
            value={draft.wantsContact === undefined ? undefined : draft.wantsContact ? CONTACT_CHOICES[0].value : CONTACT_CHOICES[1].value}
            onPick={(v) => (v.startsWith('Yes') ? set({ wantsContact: true }) : pickAndNext({ wantsContact: false }))}
          />
          {draft.wantsContact && (
            <div className="mt-4 space-y-3 rounded-2xl bg-white p-5">
              <div className="flex flex-wrap gap-2">
                {CONTACT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => set({ contactMethod: m.value })}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${draft.contactMethod === m.value ? 'bg-[#2C4A4E] text-white' : 'bg-[#2C4A4E]/10 text-[#2C4A4E]'}`}
                  >
                    {lang === 'sw' ? m.sw : m.value}
                  </button>
                ))}
              </div>
              <input
                type="tel"
                value={draft.contactDetail ?? ''}
                onChange={(e) => set({ contactDetail: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3"
                placeholder={tr("Phone number", "Namba ya simu")}
                aria-label={tr("Phone number", "Namba ya simu")}
              />
              <input
                value={draft.safeTimes ?? ''}
                onChange={(e) => set({ safeTimes: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-3"
                placeholder={tr("When is it safe to reach you? e.g. weekdays 10am–2pm", "Ni lini salama kukufikia? mf. siku za kazi saa 4 asubuhi–8 mchana")}
                aria-label={tr("Safe times to contact you", "Nyakati salama za kuwasiliana nawe")}
              />
              <button type="button" onClick={next} className="w-full rounded-2xl bg-[#2C4A4E] px-5 py-3 font-semibold text-white hover:bg-[#2C4A4E]/90">
                {tr('Next', 'Endelea')}
              </button>
            </div>
          )}
        </>
      )}

      {step === 'review' && (
        <>
          <h1 className="mt-6 text-2xl sm:text-3xl font-acme text-[#2C4A4E]">{tr("Ready to send?", "Uko tayari kutuma?")}</h1>
          <dl className="mt-6 divide-y divide-gray-100 rounded-2xl bg-white p-5 text-sm">
            {[
              [tr('What happened', 'Kilichotokea'), label(INCIDENT_TYPES, draft.incidentType, lang)],
              [tr('When', 'Lini'), label(WHEN, draft.whenHappened, lang)],
              [tr('Safe now', 'Salama sasa'), label(SAFE, draft.safeNow, lang)],
              [tr('Details', 'Maelezo'), draft.description ? `${draft.description.slice(0, 80)}${draft.description.length > 80 ? '…' : ''}` : undefined],
              [tr('Area', 'Eneo'), draft.county || (draft.latitude != null ? tr('Approximate location', 'Mahali pa takriban') : undefined)],
              [tr('Sent to', 'Inatumwa kwa'), (() => { const r = RECIPIENTS.find((x) => x.id === (draft.recipient ?? 'heal')); return r && (lang === 'sw' ? r.labelSw : r.label); })()],
              [tr('Contact', 'Mawasiliano'), draft.wantsContact ? `${label(CONTACT_METHODS, draft.contactMethod, lang) ?? tr('Yes', 'Ndiyo')}${draft.safeTimes ? `, ${draft.safeTimes}` : ''}` : tr('No, case code only', 'Hapana, namba ya kesi tu')],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2">
                <dt className="text-gray-500">{k}</dt>
                <dd className="text-right text-[#2C4A4E]">{v || <span className="text-gray-400">{tr("Skipped", "Imerukwa")}</span>}</dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            onClick={send}
            disabled={sending}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2C4A4E] px-5 py-4 font-semibold text-white hover:bg-[#2C4A4E]/90 disabled:opacity-70"
          >
            {sending && <Loader2 className="h-4 w-4 animate-spin" />} {tr("Send my report", "Tuma ripoti yangu")}
          </button>
        </>
      )}

      {step !== 'intro' && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <button type="button" onClick={back} className="inline-flex items-center gap-1 text-gray-600">
            <ChevronLeft className="h-4 w-4" /> {tr("Back", "Rudi")}
          </button>
          {step !== 'review' && (
            <button type="button" onClick={next} className="text-gray-600 underline">
              {tr("Skip this question", "Ruka swali hili")}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default function ReportPage() {
  return (
    <HelpShell back="/help" showLanguage={false}>
      <Suspense fallback={null}>
        <GuidedReport />
      </Suspense>
    </HelpShell>
  );
}
