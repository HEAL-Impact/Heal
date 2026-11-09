'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Loader2, Lock, MessageSquare, Phone, ShieldAlert } from 'lucide-react';
import StaffShell, { usePartnerAccount } from '@/components/care/StaffShell';
import ReferPanel from '@/components/care/ReferPanel';
import { partnerApi, type CaseView } from '@/lib/care/partner-api';
import { NEEDS, PATHWAY, RESPONDER, STATUS } from '@/lib/care/labels';
import { useLang, type L } from '@/lib/i18n';

const OUTCOMES: L[] = [
  { en: 'Linked to counselling', sw: 'Ameunganishwa na ushauri' },
  { en: 'Received medical care / PEP', sw: 'Amepata matibabu / PEP' },
  { en: 'Safe accommodation arranged', sw: 'Makazi salama yamepangwa' },
  { en: 'Report made to police', sw: 'Ripoti imetolewa polisi' },
  { en: 'Legal support arranged', sw: 'Msaada wa kisheria umepangwa' },
  { en: 'Supported by CHP, no further need', sw: 'Amesaidiwa na CHP, hakuna hitaji zaidi' },
  { en: 'Referred to another service', sw: 'Amepewa rufaa kwa huduma nyingine' },
];

const EVENT: Record<string, L> = {
  created: { en: 'Case opened', sw: 'Kesi imefunguliwa' },
  alerted: { en: 'Partner alerted', sw: 'Mshirika amearifiwa' },
  referred: { en: 'Referred to a partner', sw: 'Amepewa rufaa kwa mshirika' },
  consent_added: { en: 'Survivor agreed to a new service', sw: 'Amekubali huduma mpya' },
  reminded: { en: 'Reminder sent', sw: 'Ukumbusho umetumwa' },
  expired: { en: 'Not accepted in time', sw: 'Haikukubaliwa kwa wakati' },
  accepted: { en: 'Accepted', sw: 'Imekubaliwa' },
  passed: { en: 'Passed on', sw: 'Imepitishwa' },
  contacted: { en: 'Contacted', sw: 'Amewasiliana' },
  attempt_failed: { en: 'Contact attempt failed', sw: 'Jaribio la kuwasiliana limeshindikana' },
  seen: { en: 'Seen', sw: 'Ameonwa' },
  follow_up: { en: 'Follow-up set', sw: 'Ufuatiliaji umepangwa' },
  follow_up_due: { en: 'Follow-up due', sw: 'Ufuatiliaji unadaiwa' },
  note: { en: 'Note', sw: 'Dokezo' },
  closed: { en: 'Closed', sw: 'Imefungwa' },
  declined_by_survivor: { en: 'Stopped by survivor', sw: 'Imesimamishwa na mhusika' },
  lost_to_follow_up: { en: 'Lost to follow-up', sw: 'Hakupatikana' },
  feedback: { en: 'Survivor feedback', sw: 'Maoni ya mhusika' },
  no_partner: { en: 'No partner available', sw: 'Hakuna mshirika aliyepatikana' },
  delivery_failed: { en: 'WhatsApp delivery failed', sw: 'Ujumbe wa WhatsApp haukufika' },
};

const btn = 'rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50';
const input = 'w-full rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C4A4E]';

function CaseDetail() {
  const { tr } = useLang();
  const id = useSearchParams().get('id') ?? '';
  const account = usePartnerAccount();
  const [c, setC] = useState<CaseView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [passReason, setPassReason] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [outcome, setOutcome] = useState('');
  const [panel, setPanel] = useState<'pass' | 'follow_up' | 'close' | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    partnerApi.case(id).then(setC).catch((e) => setError(e.message));
  }, [id]);
  useEffect(load, [load]);

  const act = async (action: string, extra: { note?: string; outcome?: string; followUpAt?: string } = {}) => {
    setBusy(action);
    setError(null);
    try {
      setC(await partnerApi.act(id, { action, ...extra }));
      setPanel(null);
      setNote('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(null);
    }
  };

  if (error && !c) return <p className="rounded-2xl bg-white p-6 text-[#B34D4D]">{error}</p>;
  if (!c) return <Loader2 className="mx-auto mt-12 h-6 w-6 animate-spin text-[#2C4A4E]" />;

  const coordinator = account?.role === 'admin' || account?.role === 'coordinator';
  const mine = c.myAlert;
  const accepted = coordinator || mine?.status === 'accepted' || mine?.status === 'done';
  const open = !['closed', 'declined_by_survivor', 'lost_to_follow_up'].includes(c.status);
  const p = PATHWAY[c.pathway];

  return (
    <div className="space-y-5">
      <Link href="/care" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> {tr('Caseload', 'Orodha ya kesi')}
      </Link>

      <div className="rounded-2xl bg-white p-5 shadow-sm heal-card" style={{ borderLeft: `6px solid ${p.colour}` }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-mono text-2xl font-bold text-[#2C4A4E]">
              {c.caseCode}
              {c.urgent && <span className="ml-2 rounded-full bg-[#F9EBEB] px-2.5 py-0.5 font-sans text-sm font-semibold text-[#B34D4D]">{tr('Urgent', 'Dharura')}</span>}
            </h1>
            <p className="mt-1 font-semibold" style={{ color: p.colour }}>{tr(p.label)}</p>
          </div>
          <span className="rounded-full bg-[#ECE5DA] px-3 py-1 text-sm font-semibold text-[#2C4A4E]">{tr(STATUS[c.status])}</span>
        </div>
        <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div><dt className="text-gray-500">{tr('Area', 'Eneo')}</dt><dd className="text-[#2C4A4E]">{c.county ? `${c.county}${c.ward ? `, ${c.ward}` : ''}` : tr('Not shared (default route)', 'Halikushirikiwa (njia ya kawaida)')}</dd></div>
          <div><dt className="text-gray-500">{tr('Opened', 'Imefunguliwa')}</dt><dd className="text-[#2C4A4E]">{new Date(c.createdAt).toLocaleString()} · {c.source}</dd></div>
          <div><dt className="text-gray-500">{tr('Language', 'Lugha')}</dt><dd className="text-[#2C4A4E]">{c.language === 'sw' ? 'Kiswahili' : 'English'}</dd></div>
          {c.screening && (
            <div><dt className="text-gray-500">{tr('Screening', 'Ukaguzi')}</dt><dd className="text-[#2C4A4E]">{c.screening.instrument.toUpperCase()} {c.screening.score} · {c.screening.band}</dd></div>
          )}
          <div><dt className="text-gray-500">{tr('Needs', 'Mahitaji')}</dt><dd className="text-[#2C4A4E]">{c.needs.length ? c.needs.map((n) => tr(NEEDS.find((x) => x.id === n)?.label ?? { en: n, sw: n })).join(', ') : '–'}</dd></div>
          <div><dt className="text-gray-500">{tr('Survivor agreed to', 'Amekubali')}</dt><dd className="text-[#2C4A4E]">{c.consent.map((r) => tr(RESPONDER[r].label)).join(', ') || '–'}</dd></div>
          {c.followUpAt && <div><dt className="text-gray-500">{tr('Follow-up', 'Ufuatiliaji')}</dt><dd className="text-[#2C4A4E]">{new Date(c.followUpAt).toLocaleDateString()}</dd></div>}
          {c.outcome && <div><dt className="text-gray-500">{tr('Outcome', 'Matokeo')}</dt><dd className="text-[#2C4A4E]">{c.outcome}</dd></div>}
          {c.feedback !== null && <div><dt className="text-gray-500">{tr('Survivor’s feedback', 'Maoni yake')}</dt><dd className="text-[#2C4A4E]">{c.feedback ? tr('Got the help they needed', 'Alipata msaada aliohitaji') : tr('Did not get the help they needed', 'Hakupata msaada aliohitaji')}</dd></div>}
        </dl>
      </div>

      {error && <p className="rounded-xl bg-[#F9EBEB] p-3 text-sm text-[#B34D4D]">{error}</p>}

      {/* Accept or pass */}
      {open && mine && mine.status === 'alerted' && (
        <div className="rounded-2xl bg-[#2C4A4E] p-5 text-white shadow-sm">
          <p className="font-acme text-xl">{tr(`This case was sent to you as ${tr(RESPONDER[mine.responderType].label)}`, `Kesi hii imetumwa kwako kama ${tr(RESPONDER[mine.responderType].label)}`)}</p>
          <p className="mt-1 text-sm text-white/80">
            {tr('Accept by', 'Kubali kabla ya')} {new Date(mine.deadlineAt).toLocaleString()}. {tr('If nobody accepts, it moves to the next partner and the HEAL desk is told.', 'Isipokubaliwa, inahamia kwa mshirika anayefuata na dawati la HEAL linaarifiwa.')}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" disabled={!!busy} onClick={() => act('accept')} className={`${btn} bg-white text-[#2C4A4E]`}>
              {busy === 'accept' ? <Loader2 className="h-4 w-4 animate-spin" /> : tr('Accept case', 'Kubali kesi')}
            </button>
            <button type="button" onClick={() => setPanel(panel === 'pass' ? null : 'pass')} className={`${btn} border border-white/60 text-white`}>
              {tr("We can't take this", 'Hatuwezi kuichukua')}
            </button>
          </div>
          {panel === 'pass' && (
            <div className="mt-3 flex flex-wrap gap-2">
              <input value={passReason} onChange={(e) => setPassReason(e.target.value)} placeholder={tr('Reason (e.g. no capacity, outside our area)', 'Sababu (k.m. hatuna nafasi, nje ya eneo letu)')} className={`${input} flex-1 text-[#2C4A4E]`} />
              <button type="button" disabled={!passReason.trim() || !!busy} onClick={() => act('pass', { note: passReason })} className={`${btn} bg-white text-[#2C4A4E]`}>
                {tr('Pass to next partner', 'Pitisha kwa mshirika anayefuata')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contact: unlocked only after accepting */}
      <div className="rounded-2xl bg-white p-5 shadow-sm heal-card">
        <h2 className="flex items-center gap-2 font-acme text-xl text-[#2C4A4E]">
          <Phone className="h-5 w-5 text-[#2C4A4E]" /> {tr('How to reach the survivor safely', 'Jinsi ya kumfikia kwa usalama')}
        </h2>
        {!accepted ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4" /> {tr('Accept the case to see contact details.', 'Kubali kesi ili kuona maelezo ya mawasiliano.')}
          </p>
        ) : c.contact && c.contact.method !== 'none' ? (
          <div className="mt-3 space-y-2 text-sm">
            {(c.contact.silent || c.contact.method === 'sms') && (
              <p className="flex items-start gap-2 rounded-xl bg-[#F9EBEB] p-3 font-semibold text-[#B34D4D]">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {c.contact.method === 'sms'
                  ? tr('SMS ONLY. Never call. Send a neutral message.', 'SMS TU. Usipige simu kamwe. Tuma ujumbe usio na dalili.')
                  : tr('Text first and wait for a reply before calling.', 'Tuma ujumbe kwanza na usubiri ajibu kabla ya kupiga simu.')}
              </p>
            )}
            <p><span className="text-gray-500">{tr('Method', 'Njia')}:</span> <span className="font-semibold text-[#2C4A4E]">{c.contact.method}</span></p>
            <p><span className="text-gray-500">{tr('Number', 'Namba')}:</span> <span className="font-mono font-semibold text-[#2C4A4E]">{c.contact.detail}</span></p>
            {c.contact.safeTimes && <p><span className="text-gray-500">{tr('Safe times', 'Nyakati salama')}:</span> {c.contact.safeTimes}</p>}
            {c.contact.codeWord && <p><span className="text-gray-500">{tr('Code word', 'Neno la siri')}:</span> {c.contact.codeWord}</p>}
            {c.contact.name && <p><span className="text-gray-500">{tr('Name to use', 'Jina la kutumia')}:</span> {c.contact.name}</p>}
            <p className="text-xs text-gray-500">{tr('If someone else answers, say it is a wrong number. Never mention HEAL, GBV or the case.', 'Mtu mwingine akijibu, sema ni namba isiyo sahihi. Usitaje HEAL, ukatili au kesi kamwe.')}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-600">{tr('The survivor chose not to be contacted. Act only if they come to you with their case code.', 'Alichagua kutowasiliana. Chukua hatua tu akikuja kwako na namba yake ya kesi.')}</p>
        )}
        {accepted && c.summary && (
          <div className="mt-4 rounded-xl bg-[#ECE5DA] p-3 text-sm text-[#2C4A4E]">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{tr('What the survivor shared', 'Alichoshiriki')}</p>
            <p className="mt-1 whitespace-pre-wrap">{c.summary}</p>
          </div>
        )}
      </div>

      {/* Record what happened */}
      {open && accepted && (
        <div className="rounded-2xl bg-white p-5 shadow-sm heal-card">
          <h2 className="font-acme text-xl text-[#2C4A4E]">{tr('Record what happened', 'Rekodi kilichotokea')}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={!!busy} onClick={() => act('contacted', { note })} className={`${btn} bg-[#2C4A4E] text-white`}>
              <Check className="mr-1 inline h-4 w-4" />{tr('Contacted them safely', 'Nimewasiliana naye kwa usalama')}
            </button>
            <button type="button" disabled={!!busy} onClick={() => act('attempt_failed', { note })} className={`${btn} border border-gray-300 text-[#2C4A4E]`}>
              {tr(`Couldn't reach them (${c.failedAttempts}/3)`, `Sikumpata (${c.failedAttempts}/3)`)}
            </button>
            <button type="button" disabled={!!busy} onClick={() => act('seen', { note })} className={`${btn} border border-gray-300 text-[#2C4A4E]`}>
              {tr('Survivor was seen', 'Ameonwa')}
            </button>
            <button type="button" onClick={() => setPanel(panel === 'follow_up' ? null : 'follow_up')} className={`${btn} border border-gray-300 text-[#2C4A4E]`}>
              {tr('Set follow-up', 'Panga ufuatiliaji')}
            </button>
            <button type="button" onClick={() => setPanel(panel === 'close' ? null : 'close')} className={`${btn} border border-gray-300 text-[#2C4A4E]`}>
              {tr('Close case', 'Funga kesi')}
            </button>
          </div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={1000} placeholder={tr('Note (optional; no names or story details)', 'Dokezo (si lazima; bila majina wala maelezo ya tukio)')} className={`${input} mt-3`} />
          {panel === 'follow_up' && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input type="date" value={followUp} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setFollowUp(e.target.value)} className={`${input} w-auto`} />
              <button type="button" disabled={!followUp || !!busy} onClick={() => act('follow_up', { followUpAt: followUp, note })} className={`${btn} bg-[#2C4A4E] text-white`}>
                {tr('Save follow-up', 'Hifadhi ufuatiliaji')}
              </button>
              <span className="text-xs text-gray-500">{tr('You get a WhatsApp reminder that morning.', 'Utapata ukumbusho wa WhatsApp asubuhi hiyo.')}</span>
            </div>
          )}
          {panel === 'close' && (
            <div className="mt-3 space-y-2">
              <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className={input}>
                <option value="">{tr('Choose the outcome', 'Chagua matokeo')}</option>
                {OUTCOMES.map((o) => (
                  <option key={o.en} value={o.en}>{tr(o)}</option>
                ))}
              </select>
              <button type="button" disabled={!outcome || !!busy} onClick={() => act('close', { outcome, note })} className={`${btn} bg-[#2C4A4E] text-white`}>
                {tr('Close with this outcome', 'Funga na matokeo haya')}
              </button>
            </div>
          )}
          <button type="button" disabled={!note.trim() || !!busy} onClick={() => act('note', { note })} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#2C4A4E] disabled:opacity-40">
            <MessageSquare className="h-4 w-4" /> {tr('Add note only', 'Ongeza dokezo tu')}
          </button>
        </div>
      )}

      {/* Refer the survivor to the nearest relevant partner (tracked as an alert) */}
      {open && accepted && <ReferPanel c={c} onUpdated={setC} />}

      {/* Who was alerted */}
      {c.alerts && c.alerts.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm heal-card">
          <h2 className="font-acme text-xl text-[#2C4A4E]">{tr('Partners on this case (tracking)', 'Washirika kwenye kesi hii (ufuatiliaji)')}</h2>
          <ul className="mt-3 divide-y divide-gray-100 text-sm">
            {c.alerts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className="font-semibold text-[#2C4A4E]">{a.partnerName}</span>{' '}
                  <span className="text-gray-500">· {tr(RESPONDER[a.responderType].label)}{a.escalationLevel > 0 ? ` · ${tr('reassigned', 'imehamishwa')}` : ''}</span>
                </span>
                <span className="text-xs text-gray-600">
                  {a.status} · {tr('deadline', 'mwisho')} {new Date(a.deadlineAt).toLocaleString()}
                  {a.note ? ` · ${a.note}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-2xl bg-white p-5 shadow-sm heal-card">
        <h2 className="font-acme text-xl text-[#2C4A4E]">{tr('Timeline', 'Mfuatano')}</h2>
        <ol className="mt-3 space-y-3 border-l-2 border-[#ECE5DA] pl-4 text-sm">
          {(c.events ?? []).map((e, i) => (
            <li key={i}>
              <p className="font-semibold text-[#2C4A4E]">{tr(EVENT[e.kind] ?? { en: e.kind, sw: e.kind })}{e.detail ? <span className="font-normal text-gray-700"> · {e.detail}</span> : null}</p>
              <p className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleString()} · {e.actor}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function CasePage() {
  return (
    <StaffShell>
      <Suspense fallback={null}>
        <CaseDetail />
      </Suspense>
    </StaffShell>
  );
}
