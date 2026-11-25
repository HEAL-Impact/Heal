'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Loader2, Users } from 'lucide-react';
import StaffShell, { usePartnerAccount } from '@/components/care/StaffShell';
import { PATHWAYS, triage, type Pathway, type TriageResult } from '@/lib/care/triage';
import { openCase, type CasePathway, type ResponderType } from '@/lib/care/cases';
import { OFFER, PATHWAY, RESPONDER, STATUS } from '@/lib/care/labels';
import { partnerApi, type CaseView } from '@/lib/care/partner-api';
import { COUNTIES } from '@/lib/screening/location';
import { INSTRUMENTS, instrumentById, optionLabel, questionText } from '@/lib/screening/instruments';
import { useLang } from '@/lib/i18n';

const PRIORITY: Pathway[] = ['emergency', 'facility_today', 'refer', 'chv_follow_up', 'self_care'];

function timeLeft(iso: string, tr: (en: string, sw: string) => string) {
  const mins = Math.round((Date.parse(iso) - Date.now()) / 60000);
  if (mins <= 0) return tr('overdue', 'imechelewa');
  if (mins < 60) return tr(`${mins} min left`, `dakika ${mins} zimebaki`);
  const h = Math.round(mins / 60);
  return h < 48 ? tr(`${h} h left`, `saa ${h} zimebaki`) : tr(`${Math.round(h / 24)} days left`, `siku ${Math.round(h / 24)} zimebaki`);
}

/** The open alert that needs a response: mine, or (for the HEAL desk) any. */
function pendingAlert(c: CaseView) {
  if (c.myAlert) return c.myAlert.status === 'alerted' ? c.myAlert : null;
  return c.alerts?.find((a) => a.status === 'alerted') ?? null;
}

function Queue() {
  const { tr } = useLang();
  const [showClosed, setShowClosed] = useState(false);
  const [cases, setCases] = useState<CaseView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      partnerApi
        .cases(showClosed)
        .then((c) => alive && (setCases(c), setError(null)))
        .catch((e) => alive && setError(e.message));
    void load();
    const t = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [showClosed]);

  const list = cases ?? [];
  const waiting = list.filter((c) => pendingAlert(c)).length;
  const urgent = list.filter((c) => c.urgent && c.status !== 'closed').length;
  const followUps = list.filter((c) => c.followUpAt && Date.parse(c.followUpAt) <= Date.now() + 864e5).length;

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: tr('Waiting for acceptance', 'Zinasubiri kukubaliwa'), value: waiting, colour: PATHWAY.emergency.colour },
          { label: tr('Urgent', 'Za dharura'), value: urgent, colour: PATHWAY.facility_today.colour },
          { label: tr('Follow-ups due', 'Ufuatiliaji unaodaiwa'), value: followUps, colour: PATHWAY.refer.colour },
        ].map((t) => (
          <div key={t.label} className="rounded-2xl bg-white p-4 shadow-sm heal-card">
            <p className="text-3xl font-bold" style={{ color: t.colour }}>{cases ? t.value : '–'}</p>
            <p className="text-sm text-gray-600">{t.label}</p>
          </div>
        ))}
      </div>

      <label className="mt-6 flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} className="h-4 w-4 accent-[#2C4A4E]" />
        {tr('Show closed cases', 'Onyesha kesi zilizofungwa')}
      </label>

      {error && <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-[#B34D4D]">{error}</p>}
      {cases && cases.length === 0 && (
        <p className="mt-4 rounded-2xl bg-white p-6 text-gray-600">{tr('No cases right now. New alerts also arrive in your WhatsApp group.', 'Hakuna kesi kwa sasa. Arifa mpya pia zinafika kwenye kikundi chako cha WhatsApp.')}</p>
      )}

      <ul className="mt-4 space-y-3">
        {list.map((c) => {
          const p = PATHWAY[c.pathway];
          const pending = pendingAlert(c);
          return (
            <li key={c.id}>
              <Link href={`/care/case?id=${c.id}`} className="block rounded-2xl bg-white p-4 shadow-sm hover:shadow-md" style={{ borderLeft: `5px solid ${p.colour}` }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono font-semibold text-[#2C4A4E]">
                      {c.caseCode} {c.urgent && <span className="ml-1 rounded-full bg-[#F9EBEB] px-2 py-0.5 font-sans text-xs font-semibold text-[#B34D4D]">{tr('Urgent', 'Dharura')}</span>}
                    </p>
                    <p className="mt-1 text-sm font-semibold" style={{ color: p.colour }}>{tr(p.label)}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {c.county ? `${c.county}${c.ward ? `, ${c.ward}` : ''}` : tr('Area not shared (default route)', 'Eneo halikushirikiwa (njia ya kawaida)')} ·{' '}
                      {new Date(c.createdAt).toLocaleString()}
                      {c.screening ? ` · ${c.screening.instrument.toUpperCase()} ${c.screening.score}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-full bg-[#ECE5DA] px-3 py-1 text-xs font-semibold text-[#2C4A4E]">{tr(STATUS[c.status])}</span>
                    {pending && (
                      <p className="mt-1 text-xs font-semibold text-[#B34D4D]">
                        {tr('Accept:', 'Kubali:')} {timeLeft(pending.deadlineAt, tr)}
                      </p>
                    )}
                    {c.followUpAt && c.status !== 'closed' && (
                      <p className="mt-1 text-xs text-gray-500">{tr('Follow-up', 'Ufuatiliaji')} {new Date(c.followUpAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-gray-500">
        {tr('Urgent cases first, then newest. You only see contact details after you accept a case, and every view is logged.', 'Kesi za dharura kwanza, kisha mpya zaidi. Unaona maelezo ya mawasiliano tu baada ya kukubali kesi, na kila kuangalia kunarekodiwa.')}
      </p>
    </>
  );
}

const TRIAGE_TO_CASE: Record<Pathway, CasePathway | null> = {
  emergency: 'emergency',
  facility_today: 'facility_today',
  refer: 'refer',
  chv_follow_up: 'chp_follow_up',
  self_care: null,
};

/** After a CHP screening: open a real case, with the client's consent. */
function OpenCase({ result, tool, sexualViolence }: { result: TriageResult; tool: string; sexualViolence: boolean }) {
  const { lang, tr } = useLang();
  const pathway = TRIAGE_TO_CASE[result.pathway] ?? 'chp_follow_up';
  const [consent, setConsent] = useState<ResponderType[]>(OFFER[pathway].filter((r) => r !== 'chp').slice(0, 2));
  const [county, setCounty] = useState('');
  const [ward, setWard] = useState('');
  const [phone, setPhone] = useState('');
  const [safeTimes, setSafeTimes] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const account = usePartnerAccount();
  const offered = OFFER[pathway].filter((r) => r !== 'chp');

  if (done) {
    return (
      <div className="mt-4 rounded-xl bg-[#ECE5DA] p-3 text-sm text-[#2C4A4E]">
        {tr('Case opened:', 'Kesi imefunguliwa:')} <span className="font-mono font-semibold">{done}</span>.{' '}
        {tr('Give the client this code. Partners have been alerted.', 'Mpe mteja namba hii. Washirika wamearifiwa.')}
      </div>
    );
  }
  return (
    <div className="mt-4 border-t pt-4">
      <p className="text-sm font-semibold text-[#2C4A4E]">{tr('Refer through HEAL', 'Toa rufaa kupitia HEAL')}</p>
      <p className="mt-1 text-xs text-gray-600">{tr('Ask the client who they agree to be referred to.', 'Muulize mteja anakubali kupewa rufaa kwa nani.')}</p>
      <div className="mt-2 space-y-1">
        {offered.map((r) => (
          <label key={r} className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={consent.includes(r)} onChange={() => setConsent(consent.includes(r) ? consent.filter((x) => x !== r) : [...consent, r])} className="h-4 w-4 accent-[#2C4A4E]" />
            {tr(RESPONDER[r].label)}
          </label>
        ))}
      </div>
      <select value={county} onChange={(e) => setCounty(e.target.value)} className="mt-3 w-full rounded-lg border border-gray-200 p-2 text-sm">
        <option value="">{tr('County', 'Kaunti')}</option>
        {COUNTIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <input value={ward} onChange={(e) => setWard(e.target.value)} placeholder={tr('Ward', 'Wadi')} className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-sm" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={tr("Client's safe phone (optional)", 'Simu salama ya mteja (si lazima)')} className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-sm" />
      <input value={safeTimes} onChange={(e) => setSafeTimes(e.target.value)} placeholder={tr('Safe times to contact', 'Nyakati salama za kuwasiliana')} className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-sm" />
      <label className="mt-3 flex items-start gap-2 text-xs text-gray-700">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#2C4A4E]" />
        {tr('The client agreed to this referral and to the contact details being shared with these services.', 'Mteja amekubali rufaa hii na maelezo ya mawasiliano kushirikiwa na huduma hizi.')}
      </label>
      {error && <p className="mt-2 text-xs text-[#B34D4D]">{error}</p>}
      <button
        type="button"
        disabled={!agreed || busy || consent.length === 0}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const { caseCode, sent } = await openCase(
            {
              source: 'chp',
              pathway,
              urgent: result.pathway === 'emergency' || result.pathway === 'facility_today',
              needs: sexualViolence ? ['medical'] : [],
              // The CHP who screened keeps the follow-up, so CHP is always included.
              consent: Array.from(new Set<ResponderType>([...consent, 'chp'])),
              county: county || undefined,
              ward: ward.trim() || undefined,
              language: lang,
              screening: result.score !== undefined ? { instrument: tool, band: result.band?.en ?? '', score: result.score } : undefined,
              contact: phone.trim() ? { method: 'call', detail: phone.trim(), safeTimes: safeTimes.trim(), silent: false, codeWord: '', name: '' } : undefined,
              summary: `Screened by ${account?.name ?? 'CHP'} (${account?.partnerName ?? ''}).`,
            },
            partnerApi.token()
          );
          setBusy(false);
          if (sent) setDone(caseCode);
          else setError(tr('Could not open the case. Check your connection and try again.', 'Imeshindikana kufungua kesi. Angalia mtandao wako ujaribu tena.'));
        }}
        className="mt-3 w-full rounded-xl bg-[#2C4A4E] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : tr('Open case and alert partners', 'Fungua kesi na uarifu washirika')}
      </button>
    </div>
  );
}

function ChvScreening() {
  const { lang, tr } = useLang();
  const [tool, setTool] = useState(INSTRUMENTS[0].id);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState({ immediateDanger: false, sexualViolenceWithin72h: false, pregnantOrPostpartum: false });
  const [result, setResult] = useState<TriageResult | null>(null);
  const instrument = instrumentById(tool)!;
  const complete = instrument.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="rounded-2xl bg-white p-5 shadow-sm heal-card">
        <div className="flex flex-wrap gap-2">
          {INSTRUMENTS.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => {
                setTool(i.id);
                setAnswers({});
                setResult(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${tool === i.id ? 'bg-[#2C4A4E] text-white' : 'bg-gray-100 text-[#2C4A4E]'}`}
            >
              {tr(i.name, i.nameSw)}
            </button>
          ))}
        </div>

        <fieldset className="mt-5 space-y-2 rounded-xl bg-[#F9EBEB] p-4">
          <legend className="text-sm font-semibold text-[#2C4A4E]">{tr("Safety first: ask before the questionnaire", "Usalama kwanza: uliza kabla ya dodoso")}</legend>
          {([
            ['immediateDanger', tr("Is the person in immediate danger, or have they talked about ending their life?", "Je, mtu huyu yuko hatarini sasa hivi, au amezungumzia kujiua?")],
            ['sexualViolenceWithin72h', tr("Sexual violence in the last 72 hours?", "Ukatili wa kingono ndani ya saa 72 zilizopita?")],
            ['pregnantOrPostpartum', tr("Pregnant or had a baby in the last year?", "Mjamzito au amejifungua katika mwaka uliopita?")],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={flags[key]}
                onChange={(e) => setFlags({ ...flags, [key]: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-[#2C4A4E]"
              />
              {label}
            </label>
          ))}
        </fieldset>

        <p className="mt-5 text-sm text-gray-600">{lang === 'sw' && instrument.stemSw ? instrument.stemSw : instrument.stem}</p>
        <ol className="mt-3 space-y-4">
          {instrument.questions.map((q, n) => (
            <li key={q.id}>
              <p className="text-sm font-medium text-[#2C4A4E]">{n + 1}. {questionText(instrument, q, lang)}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(q.options ?? instrument.options).map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => setAnswers({ ...answers, [q.id]: o.value })}
                    className={`rounded-lg px-3 py-1.5 text-xs ${answers[q.id] === o.value ? 'bg-[#2C4A4E] text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {optionLabel(instrument, o, lang)}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          disabled={!complete && !flags.immediateDanger}
          onClick={() => setResult(triage({ tool, answers, ...flags }))}
          className="mt-6 w-full rounded-xl bg-[#2C4A4E] py-3 font-semibold text-white disabled:opacity-50"
        >
          {tr("Get referral guidance", "Pata mwongozo wa rufaa")}
        </button>
        <p className="mt-2 text-xs text-gray-500">{tr("Scored on this device, so it works without signal. Opening a case needs a connection.", "Alama zinahesabiwa kwenye kifaa hiki, kwa hivyo inafanya kazi bila mtandao. Kufungua kesi kunahitaji mtandao.")}</p>
      </div>

      <div className="lg:sticky lg:top-28 h-fit rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 font-acme text-xl text-[#2C4A4E]">
          <ClipboardList className="h-5 w-5 text-[#2C4A4E]" /> {tr("Referral guidance", "Mwongozo wa rufaa")}
        </h3>
        {result ? (
          <div className="mt-3">
            <p className="text-lg font-semibold" style={{ color: result.colour }}>{tr(result.label)}</p>
            {result.score !== undefined && (
              <p className="text-sm text-gray-600">{tr(`Score ${result.score}`, `Alama ${result.score}`)}{result.band ? ` · ${tr(result.band)}` : ''}</p>
            )}
            <ol className="mt-3 space-y-2 text-sm text-gray-700">
              {result.actions.map((a, i) => (
                <li key={a.en}>{i + 1}. {tr(a)}</li>
              ))}
            </ol>
            <OpenCase key={`${tool}-${result.pathway}-${result.score}`} result={result} tool={tool} sexualViolence={flags.sexualViolenceWithin72h} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-600">{tr("Answer the safety questions and the questionnaire to see the recommended pathway.", "Jibu maswali ya usalama na dodoso ili kuona njia inayopendekezwa.")}</p>
        )}
        <div className="mt-5 border-t pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{tr("Pathways", "Njia za rufaa")}</p>
          <ul className="mt-2 space-y-1 text-xs">
            {PRIORITY.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: PATHWAYS[p].colour }} />
                {tr(PATHWAYS[p].label)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function CarePage() {
  const { tr } = useLang();
  const [tab, setTab] = useState<'queue' | 'screen'>('queue');
  return (
    <StaffShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-acme text-[#2C4A4E]">{tr("Caseload", "Orodha ya Wateja")}</h1>
          <p className="text-gray-600">{tr("Cases routed to you by location. Accept, contact safely, record what happened, and close with an outcome.", "Kesi zinazoletwa kwako kwa eneo. Kubali, wasiliana kwa usalama, rekodi kilichotokea, na ufunge na matokeo.")}</p>
        </div>
        <div className="flex rounded-full bg-white p-1 shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setTab('queue')}
            aria-pressed={tab === 'queue'}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${tab === 'queue' ? 'bg-[#2C4A4E] text-white' : 'text-[#2C4A4E]'}`}
          >
            <Users className="h-4 w-4" /> {tr("My cases", "Kesi zangu")}
          </button>
          <button
            type="button"
            onClick={() => setTab('screen')}
            aria-pressed={tab === 'screen'}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${tab === 'screen' ? 'bg-[#2C4A4E] text-white' : 'text-[#2C4A4E]'}`}
          >
            <ClipboardList className="h-4 w-4" /> {tr("Screen a client", "Kagua mteja")}
          </button>
        </div>
      </div>
      <div className="mt-6">{tab === 'queue' ? <Queue /> : <ChvScreening />}</div>
    </StaffShell>
  );
}
