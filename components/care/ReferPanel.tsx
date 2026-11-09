'use client';

import { useEffect, useState } from 'react';
import { Loader2, Send, Users } from 'lucide-react';
import PartnerCard from '@/components/care/PartnerCard';
import { fieldCls } from '@/components/care/PartnerForm';
import { partnerApi, type CaseView, type DirectoryEntry } from '@/lib/care/partner-api';
import type { ResponderType } from '@/lib/care/cases';
import { PARTNER_SERVICES, RESPONDER } from '@/lib/care/labels';
import { useLang } from '@/lib/i18n';

const ALERT_LABEL: Record<string, { en: string; sw: string }> = {
  alerted: { en: 'Alerted, waiting', sw: 'Ameharifiwa, anasubiri' },
  accepted: { en: 'Has the case', sw: 'Ana kesi' },
  done: { en: 'Done', sw: 'Imekamilika' },
  passed: { en: 'Passed it on', sw: 'Ameipitisha' },
  expired: { en: 'Did not answer', sw: 'Hakujibu' },
  withdrawn: { en: 'Stopped', sw: 'Imesimamishwa' },
};

/**
 * "Partners near the survivor": the nearest partners for a service, so the
 * CHP (or the HEAL desk) can refer the survivor to a specific one. Every referral becomes
 * a tracked alert on the case, with a deadline and a WhatsApp message.
 */
export default function ReferPanel({ c, onUpdated }: { c: CaseView; onUpdated: (c: CaseView) => void }) {
  const { tr } = useLang();
  const firstNeeded = (PARTNER_SERVICES.find((s) => c.consent.includes(s) && !c.alerts?.some((a) => a.responderType === s)) ?? 'counsellor') as ResponderType;
  const [service, setService] = useState<ResponderType>(firstNeeded);
  const [list, setList] = useState<DirectoryEntry[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [choosing, setChoosing] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setList(null);
    partnerApi
      .directory({ caseId: c.id, service })
      .then((d) => alive && setList(d))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [c.id, service, c.alerts?.length]);

  const needsConsent = !c.consent.includes(service);
  const near = (list ?? []).filter((p) => p.match > 0);
  const shown = showAll ? list ?? [] : near.slice(0, 5);

  const refer = async (p: DirectoryEntry) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await partnerApi.act(c.id, { action: 'refer', partnerId: p.id, service, note, consentConfirmed: agreed });
      onUpdated(updated);
      setSent(p.name);
      setChoosing(null);
      setNote('');
      setAgreed(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-lg">
      <h2 className="flex items-center gap-2 font-acme text-xl text-[#2C4A4E]">
        <Users className="h-5 w-5" /> {tr('Partners near the survivor', 'Washirika walio karibu naye')}
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        {c.county
          ? tr(`Nearest to ${[c.ward, c.county].filter(Boolean).join(', ')} first. Refer the survivor to the one that fits; they get a WhatsApp alert and the referral is tracked below.`, `Walio karibu zaidi na ${[c.ward, c.county].filter(Boolean).join(', ')} kwanza. Mpe rufaa kwa anayefaa; wanapata arifa ya WhatsApp na rufaa inafuatiliwa hapa chini.`)
          : tr('The survivor did not share their area, so default routes are shown first. Ask where they can safely go.', 'Hakushiriki eneo lake, kwa hivyo njia za kawaida zinaonyeshwa kwanza. Muulize anaweza kwenda wapi kwa usalama.')}
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={tr('Service', 'Huduma')}>
        {PARTNER_SERVICES.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={service === s}
            onClick={() => {
              setService(s);
              setChoosing(null);
              setShowAll(false);
              setSent(null);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm ${service === s ? 'bg-[#2C4A4E] text-white' : 'bg-[#2C4A4E]/10 text-[#2C4A4E]'}`}
          >
            {tr(RESPONDER[s].label)}
            {c.consent.includes(s) && ' ✓'}
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-gray-500">{tr('✓ = the survivor has already agreed to this service.', '✓ = tayari amekubali huduma hii.')}</p>

      {sent && <p className="mt-3 rounded-xl bg-[#2C4A4E]/10 p-3 text-sm text-[#2C4A4E]">{tr(`Referred to ${sent}. They have been alerted on WhatsApp.`, `Amepewa rufaa kwa ${sent}. Wamearifiwa kwa WhatsApp.`)}</p>}
      {error && <p className="mt-3 rounded-xl bg-[#F9EBEB] p-3 text-sm text-[#B34D4D]">{error}</p>}
      {!list && !error && <Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin text-[#2C4A4E]" />}
      {list && near.length === 0 && !showAll && (
        <p className="mt-4 text-sm text-gray-600">
          {tr(`No ${tr(RESPONDER[service].label)} is registered near the survivor yet.`, `Hakuna ${tr(RESPONDER[service].label)} aliyesajiliwa karibu naye bado.`)}{' '}
          {list.length > 0 && tr('You can still choose one from another area.', 'Bado unaweza kuchagua kutoka eneo jingine.')}
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {shown.map((p) => {
          const busyWith = p.alertStatus === 'alerted' || p.alertStatus === 'accepted';
          return (
            <li key={p.id}>
              <PartnerCard
                p={p}
                action={
                  <div className="flex flex-col items-end gap-1">
                    {p.alertStatus && (
                      <span className="rounded-full bg-[#2C4A4E]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2C4A4E]">{tr(ALERT_LABEL[p.alertStatus] ?? { en: p.alertStatus, sw: p.alertStatus })}</span>
                    )}
                    {!busyWith && (
                      <button
                        type="button"
                        onClick={() => {
                          setChoosing(choosing === p.id ? null : p.id);
                          setSent(null);
                          setError(null);
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-[#2C4A4E] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <Send className="h-3.5 w-3.5" /> {tr('Refer', 'Toa rufaa')}
                      </button>
                    )}
                  </div>
                }
              />
              {choosing === p.id && (
                <div className="mt-2 space-y-2 rounded-2xl bg-[#2C4A4E]/5 p-4">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    maxLength={1000}
                    placeholder={tr('Note for them (no names or story details; they see contact details only after accepting)', 'Dokezo kwao (bila majina wala maelezo ya tukio; wanaona mawasiliano yake tu baada ya kukubali)')}
                    className={fieldCls}
                  />
                  {needsConsent && (
                    <label className="flex cursor-pointer items-start gap-2 text-sm text-[#2C4A4E]">
                      <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#2C4A4E]" />
                      {tr(`I asked the survivor and they agreed to be referred to ${tr(RESPONDER[service].label)}.`, `Nimemuuliza na amekubali kupewa rufaa kwa ${tr(RESPONDER[service].label)}.`)}
                    </label>
                  )}
                  <button
                    type="button"
                    disabled={busy || (needsConsent && !agreed)}
                    onClick={() => refer(p)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2C4A4E] px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    {tr(`Refer to ${p.name}`, `Toa rufaa kwa ${p.name}`)}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {list && list.length > near.slice(0, 5).length && (
        <button type="button" onClick={() => setShowAll(!showAll)} className="mt-3 text-sm font-semibold text-[#2C4A4E] underline-offset-4 hover:underline">
          {showAll ? tr('Show nearest only', 'Onyesha walio karibu tu') : tr(`Show all ${list.length} (other areas too)`, `Onyesha wote ${list.length} (maeneo mengine pia)`)}
        </button>
      )}
    </div>
  );
}
