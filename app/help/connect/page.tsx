'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Copy, Loader2, MapPin, ShieldCheck } from 'lucide-react';
import HelpShell from '@/components/help/HelpShell';
import { openCase, type CasePathway, type CaseRequest, type ResponderType } from '@/lib/care/cases';
import { NEEDS, OFFER, PATHWAY, RESPONDER } from '@/lib/care/labels';
import { saveCaseCode } from '@/lib/myspace/store';
import { COUNTIES, requestApproxLocation } from '@/lib/screening/location';
import { useLang } from '@/lib/i18n';

const SOURCES = ['screening', 'emergency', 'nia', 'report'] as const;
const PATHWAYS: CasePathway[] = ['emergency', 'facility_today', 'refer', 'chp_follow_up'];

const field = 'w-full rounded-2xl bg-white p-3 text-[#2C4A4E] focus:outline-none focus:ring-2 focus:ring-[#2C4A4E]';

function Connect() {
  const { lang, tr } = useLang();
  const params = useSearchParams();
  const fromParam = params.get('from');
  const source = (SOURCES as readonly string[]).includes(fromParam ?? '') ? (fromParam as CaseRequest['source']) : 'screening';
  const pathwayParam = params.get('pathway') as CasePathway | null;
  const pathway: CasePathway = pathwayParam && PATHWAYS.includes(pathwayParam) ? pathwayParam : 'chp_follow_up';
  const urgent = params.get('urgent') === '1' || pathway === 'emergency';
  const emergency = pathway === 'emergency';
  const tool = params.get('tool');
  const score = Number(params.get('score'));
  const band = params.get('band');

  const [consent, setConsent] = useState<ResponderType[]>([]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [county, setCounty] = useState('');
  const [ward, setWard] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [method, setMethod] = useState<'sms' | 'call' | 'whatsapp' | 'none'>('sms');
  const [phone, setPhone] = useState('');
  const [safeTimes, setSafeTimes] = useState('');
  const [silent, setSilent] = useState(true);
  const [codeWord, setCodeWord] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ caseCode: string; sent: boolean } | null>(null);
  const [kept, setKept] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sensible default: the first two responders this pathway offers are ticked.
  useEffect(() => setConsent(OFFER[pathway].slice(0, 2)), [pathway]);

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const useLocation = async () => {
    setLocating(true);
    try {
      const loc = await requestApproxLocation();
      setCoords({ latitude: loc.latitude, longitude: loc.longitude });
      if (loc.county) setCounty(loc.county);
    } catch {
      /* the survivor can still pick a county or skip */
    } finally {
      setLocating(false);
    }
  };

  const needsContact = method !== 'none';
  const ready = consent.length > 0 && (!needsContact || phone.replace(/\D/g, '').length >= 9);

  const submit = async () => {
    setSending(true);
    const result = await openCase({
      source,
      pathway,
      urgent,
      needs,
      consent,
      county: county || undefined,
      ward: ward.trim() || undefined,
      ...(coords ?? {}),
      language: lang,
      screening: tool && band && Number.isFinite(score) ? { instrument: tool, band, score } : undefined,
      contact: { method, detail: needsContact ? phone.trim() : '', safeTimes: safeTimes.trim(), silent: method === 'sms' ? true : silent, codeWord: codeWord.trim(), name: name.trim() },
    });
    setSending(false);
    setDone(result);
  };

  if (done) {
    return (
      <section className="py-8">
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
          <ShieldCheck className="h-9 w-9 text-[#2C4A4E]" aria-hidden="true" />
          <h1 className="mt-3 text-3xl font-acme text-[#2C4A4E]">
            {done.sent ? tr("We’ve passed your request on", "Tumepeleka ombi lako") : tr("Saved on your phone", "Imehifadhiwa kwenye simu yako")}
          </h1>
          <p className="mt-2 text-gray-700">
            {done.sent
              ? emergency
                ? tr("Partners near you have been alerted now. If you are in danger, call 999 or 112 as well.", "Washirika walio karibu nawe wamearifiwa sasa. Kama uko hatarini, piga pia 999 au 112.")
                : tr("A partner near you has been alerted and will contact you only the way you chose.", "Mshirika aliye karibu nawe ameharifiwa na atawasiliana nawe kwa njia uliyochagua tu.")
              : tr("You’re offline. It will be sent automatically when you’re back online. If you need help now, call 1195.", "Huna mtandao. Itatumwa yenyewe ukirudi mtandaoni. Kama unahitaji msaada sasa, piga 1195.")}
          </p>
          <p className="mt-6 text-sm text-gray-600">{tr("Your case code", "Namba yako ya kesi")}</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="font-mono text-3xl font-bold tracking-wider text-[#2C4A4E]">{done.caseCode}</span>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(done.caseCode);
                setCopied(true);
              }}
              className="rounded-full bg-[#2C4A4E]/10 p-2 text-[#2C4A4E]"
              aria-label={tr("Copy case code", "Nakili namba ya kesi")}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">{tr("Use it to check progress or to stop the case. It is the only way to find your case: we don’t know who you are.", "Itumie kukagua maendeleo au kusimamisha kesi. Ndiyo njia pekee ya kupata kesi yako: hatujui wewe ni nani.")}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={kept}
              onClick={() => {
                saveCaseCode(done.caseCode, done.sent ? 'received' : 'waiting');
                setKept(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#2C4A4E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2C4A4E]/90 disabled:opacity-70"
            >
              {kept && <Check className="h-4 w-4" />}
              {kept ? tr("Kept in My Space", "Imehifadhiwa kwenye Nafasi Yangu") : tr("Keep this code in My Space", "Hifadhi namba hii kwenye Nafasi Yangu")}
            </button>
            <Link href={`/report/status?code=${done.caseCode}`} className="rounded-full border border-[#2C4A4E] px-5 py-2.5 text-sm font-semibold text-[#2C4A4E]">
              {tr("Check progress", "Kagua maendeleo")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: PATHWAY[pathway].colour }}>{tr(PATHWAY[pathway].label)}</p>
        <h1 className="mt-1 text-3xl font-acme text-[#2C4A4E]">
          {emergency ? tr("Send help to me", "Nitumie msaada") : tr("Connect me with care", "Niunganishe na huduma")}
        </h1>
        <p className="mt-2 text-gray-600">
          {tr("You decide who we contact and how they reach you. Nothing is shared without your yes, and you can stop at any time.", "Wewe ndiye unaamua tuwasiliane na nani na wakufikie vipi. Hakuna kinachoshirikiwa bila ridhaa yako, na unaweza kusimamisha wakati wowote.")}
        </p>
      </div>

      <fieldset className="rounded-3xl bg-white p-5 shadow-sm">
        <legend className="sr-only">{tr("Who can we contact?", "Tuwasiliane na nani?")}</legend>
        <p className="font-semibold text-[#2C4A4E]">1. {tr("Who can we share your request with?", "Tushiriki ombi lako na nani?")}</p>
        <div className="mt-3 space-y-2">
          {OFFER[pathway].map((r) => (
            <label key={r} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${consent.includes(r) ? 'border-[#2C4A4E] bg-[#2C4A4E]/10' : 'border-gray-200'}`}>
              <input type="checkbox" checked={consent.includes(r)} onChange={() => setConsent(toggle(consent, r))} className="mt-1 h-4 w-4 accent-[#2C4A4E]" />
              <span>
                <span className="block font-semibold text-[#2C4A4E]">{tr(RESPONDER[r].label)}</span>
                <span className="block text-sm text-gray-600">{tr(RESPONDER[r].who)}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold text-[#2C4A4E]">{tr("Anything else you need? (optional)", "Unahitaji kitu kingine? (si lazima)")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {NEEDS.map((n) => (
            <button
              key={n.id}
              type="button"
              aria-pressed={needs.includes(n.id)}
              onClick={() => setNeeds(toggle(needs, n.id))}
              className={`rounded-full px-3 py-1.5 text-sm ${needs.includes(n.id) ? 'bg-[#2C4A4E] text-white' : 'bg-[#2C4A4E]/10 text-[#2C4A4E]'}`}
            >
              {tr(n.label)}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">{tr("A need is only passed on to a service you ticked above.", "Hitaji linapelekwa tu kwa huduma uliyochagua hapo juu.")}</p>
      </fieldset>

      <fieldset className="rounded-3xl bg-white p-5 shadow-sm">
        <legend className="sr-only">{tr("Where are you?", "Uko wapi?")}</legend>
        <p className="font-semibold text-[#2C4A4E]">2. {tr("Roughly where are you?", "Uko wapi kwa takriban?")}</p>
        <p className="mt-1 text-sm text-gray-600">{tr("So we alert the partner nearest to you. If you’d rather not say, your request goes to our default team.", "Ili tumwarifu mshirika aliye karibu zaidi nawe. Ukipenda kutosema, ombi lako linaenda kwa timu yetu ya kawaida.")}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <select value={county} onChange={(e) => setCounty(e.target.value)} className={field} aria-label={tr("County", "Kaunti")}>
            <option value="">{tr("I’d rather not say", "Napendelea kutosema")}</option>
            {COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input value={ward} onChange={(e) => setWard(e.target.value)} placeholder={tr("Ward or area (optional)", "Wadi au eneo (si lazima)")} className={field} disabled={!county} />
        </div>
        <button type="button" onClick={useLocation} disabled={locating} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#2C4A4E] underline-offset-4 hover:underline disabled:opacity-60">
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4 text-[#2C4A4E]" />}
          {coords ? tr("Approximate location added (about 1 km)", "Mahali pa takriban pameongezwa (karibu kilomita 1)") : tr("Use my approximate location", "Tumia mahali nilipo kwa takriban")}
        </button>
      </fieldset>

      <fieldset className="rounded-3xl bg-white p-5 shadow-sm">
        <legend className="sr-only">{tr("How can they reach you safely?", "Wakufikie vipi kwa usalama?")}</legend>
        <p className="font-semibold text-[#2C4A4E]">3. {tr("How can they reach you safely?", "Wakufikie vipi kwa usalama?")}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            ['sms', tr('SMS only', 'SMS tu')],
            ['call', tr('Phone call', 'Simu')],
            ['whatsapp', 'WhatsApp'],
            ['none', tr('Don’t contact me', 'Usiniwasiliane')],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={method === id}
              onClick={() => setMethod(id)}
              className={`rounded-2xl px-3 py-2.5 text-sm font-semibold ${method === id ? 'bg-[#2C4A4E] text-white' : 'bg-[#2C4A4E]/10 text-[#2C4A4E]'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {method === 'none' ? (
          <p className="mt-3 text-sm text-gray-600">{tr("Nobody will contact you. Use your case code to check progress. A partner can only act if you visit them with the code.", "Hakuna atakayewasiliana nawe. Tumia namba yako ya kesi kukagua maendeleo. Mshirika anaweza kuchukua hatua tu ukimtembelea na namba hiyo.")}</p>
        ) : (
          <div className="mt-3 space-y-2">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder={tr("Phone number that is safe to use", "Namba ya simu iliyo salama kutumia")} className={field} />
            <input value={safeTimes} onChange={(e) => setSafeTimes(e.target.value)} placeholder={tr("Safe times (e.g. weekdays 10am–2pm)", "Nyakati salama (k.m. siku za kazi saa 4–8 mchana)")} className={field} />
            <input value={codeWord} onChange={(e) => setCodeWord(e.target.value)} placeholder={tr("A code word so you know it’s us (optional)", "Neno la siri ili ujue ni sisi (si lazima)")} className={field} />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("A name they can use (optional, can be any name)", "Jina wanaloweza kutumia (si lazima, linaweza kuwa jina lolote)")} className={field} />
            {method !== 'sms' && (
              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={silent} onChange={(e) => setSilent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#2C4A4E]" />
                {tr("Text me first before calling (silent mode)", "Nitumie ujumbe kwanza kabla ya kupiga simu (hali ya kimya)")}
              </label>
            )}
            <p className="text-xs text-gray-500">{tr("Your number is locked and only the partner who accepts your case can see it.", "Namba yako imefungwa na ni mshirika anayekubali kesi yako tu anayeweza kuiona.")}</p>
          </div>
        )}
      </fieldset>

      <button
        type="button"
        onClick={submit}
        disabled={!ready || sending}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-semibold text-white disabled:opacity-50 ${emergency ? 'bg-[#2C4A4E] hover:bg-black' : 'bg-[#2C4A4E] hover:bg-[#2C4A4E]/90'}`}
      >
        {sending && <Loader2 className="h-5 w-5 animate-spin" />}
        {emergency ? tr("Yes, send help now", "Ndiyo, tuma msaada sasa") : tr("Yes, connect me", "Ndiyo, niunganishe")}
      </button>
      {consent.length === 0 && <p className="text-center text-sm text-gray-600">{tr("Choose at least one service in step 1.", "Chagua angalau huduma moja katika hatua ya 1.")}</p>}
      {emergency && (
        <p className="text-center text-sm text-gray-600">
          {tr("In immediate danger? Don’t wait:", "Uko hatarini sasa hivi? Usisubiri:")}{' '}
          <a href="tel:999" className="font-semibold underline">999</a> · <a href="tel:112" className="font-semibold underline">112</a> · <a href="tel:1195" className="font-semibold underline">1195</a>
        </p>
      )}
    </section>
  );
}

export default function ConnectPage() {
  return (
    <HelpShell back="/help" showLanguage={false}>
      <Suspense fallback={null}>
        <Connect />
      </Suspense>
    </HelpShell>
  );
}
