'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import HelpShell from '@/components/help/HelpShell';
import { fetchReportStatus, isCaseCode } from '@/lib/reports';
import { fetchCaseStatus, mySpaceStatus, sendFeedback, withdrawCase, type CaseStatus } from '@/lib/care/cases';
import { loadMySpace, saveCaseCode } from '@/lib/myspace/store';
import { useLang, type L } from '@/lib/i18n';

const STAGES: { id: string; label: L; note: L }[] = [
  { id: 'received', label: { en: 'Received', sw: 'Imepokelewa' }, note: { en: 'Your request reached HEAL.', sw: 'Ombi lako limefika HEAL.' } },
  { id: 'accepted', label: { en: 'Accepted', sw: 'Imekubaliwa' }, note: { en: 'A partner near you has taken your case.', sw: 'Mshirika aliye karibu nawe amechukua kesi yako.' } },
  { id: 'contacted', label: { en: 'Contacted', sw: 'Amewasiliana nawe' }, note: { en: 'They reached you the way you asked.', sw: 'Wamekufikia kwa njia uliyoomba.' } },
  { id: 'seen', label: { en: 'Seen', sw: 'Umeonwa' }, note: { en: 'You were seen by a service.', sw: 'Ulionwa na huduma.' } },
  { id: 'closed', label: { en: 'Closed', sw: 'Imefungwa' }, note: { en: 'The case is complete.', sw: 'Kesi imekamilika.' } },
];

type Lookup = { kind: 'case'; data: CaseStatus } | { kind: 'report'; timeline: Record<string, string | undefined> } | 'not_found' | 'offline' | null;

function StatusLookup() {
  const { tr } = useLang();
  const initial = useSearchParams().get('code') ?? '';
  const [code, setCode] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Lookup>(null);
  const [confirmStop, setConfirmStop] = useState(false);
  const [thanks, setThanks] = useState(false);

  const remember = (c: string, s: CaseStatus) => {
    if (loadMySpace().cases.some((x) => x.code === c)) saveCaseCode(c, mySpaceStatus(s.status));
  };

  const lookup = async (value = code) => {
    const c = value.trim().toUpperCase();
    if (!isCaseCode(c)) {
      setResult('not_found');
      return;
    }
    setLoading(true);
    const cs = await fetchCaseStatus(c);
    if (typeof cs === 'object') {
      setResult({ kind: 'case', data: cs });
      remember(c, cs);
    } else if (cs === 'not_found') {
      // Reports made before care routing have only a report status.
      const r = await fetchReportStatus(c);
      setResult(typeof r === 'object' ? { kind: 'report', timeline: r.timeline } : r);
    } else {
      setResult(cs);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initial) void lookup(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const data = result && typeof result === 'object' && result.kind === 'case' ? result.data : null;
  const timeline: Record<string, string | undefined> =
    result && typeof result === 'object' ? (result.kind === 'case' ? { ...result.data.timeline, seen: result.data.timeline.seen ?? result.data.timeline.follow_up } : result.timeline) : {};
  const stopped = data?.status === 'declined_by_survivor';
  const lost = data?.status === 'lost_to_follow_up';
  const open = data && !['closed', 'declined_by_survivor', 'lost_to_follow_up'].includes(data.status);
  const canFeedback = data && data.feedback === null && !stopped && (timeline.contacted || timeline.seen || timeline.closed);

  return (
    <section className="py-8">
      <h1 className="text-3xl font-acme text-[#2C4A4E]">{tr("Check your case", "Kagua kesi yako")}</h1>
      <p className="mt-2 text-gray-600">{tr("Enter your case code. We only show progress, never what you shared.", "Weka namba yako ya kesi. Tunaonyesha maendeleo tu, kamwe si ulichoshiriki.")}</p>
      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void lookup();
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="HEAL-XXX-XX"
          className="flex-1 rounded-2xl bg-white p-4 font-mono text-lg tracking-wider text-[#2C4A4E] focus:outline-none focus:ring-2 focus:ring-[#2C4A4E]"
          aria-label={tr("Case code", "Namba ya kesi")}
        />
        <button type="submit" className="rounded-2xl bg-[#2C4A4E] px-5 font-semibold text-white hover:bg-[#2C4A4E]/90">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : tr("Check", "Kagua")}
        </button>
      </form>

      {result === 'not_found' && (
        <p className="mt-6 rounded-2xl bg-white p-5 text-gray-700">
          {tr("We couldn’t find that code. Check it has the form HEAL-XXX-XX, or call 1195 for help.", "Hatukupata namba hiyo. Hakikisha iko katika muundo HEAL-XXX-XX, au piga 1195 kwa msaada.")}
        </p>
      )}
      {result === 'offline' && (
        <p className="mt-6 rounded-2xl bg-white p-5 text-gray-700">
          {tr("This is still waiting on your phone and will be sent when you’re online, or we can’t reach the server right now.", "Hii bado inasubiri kwenye simu yako na itatumwa ukiwa mtandaoni, au hatuwezi kufikia seva sasa hivi.")}
        </p>
      )}

      {result && typeof result === 'object' && (
        <>
          {stopped && (
            <p className="mt-6 rounded-2xl bg-white p-5 text-gray-700">
              {tr("You stopped this case. Partners were told to take no action and not to contact you. You can ask for help again any time.", "Ulisimamisha kesi hii. Washirika waliambiwa wasichukue hatua yoyote na wasiwasiliane nawe. Unaweza kuomba msaada tena wakati wowote.")}
            </p>
          )}
          {lost && (
            <p className="mt-6 rounded-2xl bg-white p-5 text-gray-700">
              {tr("We tried to reach you several times and could not. If you still want help, start again or call 1195.", "Tulijaribu kukufikia mara kadhaa bila mafanikio. Kama bado unataka msaada, anza tena au piga 1195.")}
            </p>
          )}
          <ol className="mt-8 space-y-4">
            {STAGES.map((stage) => {
              const at = timeline[stage.id];
              return (
                <li key={stage.id} className="flex items-start gap-4">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${at ? 'bg-[#2C4A4E] text-white' : 'bg-white text-gray-300'}`}>
                    <Check className="h-5 w-5" />
                  </span>
                  <span>
                    <span className={`block font-semibold ${at ? 'text-[#2C4A4E]' : 'text-gray-400'}`}>{tr(stage.label)}</span>
                    <span className="block text-xs text-gray-500">{at ? new Date(at).toLocaleString() : tr(stage.note)}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      )}

      {data && canFeedback && !thanks && (
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm heal-card">
          <p className="font-semibold text-[#2C4A4E]">{tr("Did you get the help you needed?", "Je, ulipata msaada uliohitaji?")}</p>
          <p className="mt-1 text-sm text-gray-600">{tr("Your answer is private and helps us check every partner.", "Jibu lako ni la siri na linatusaidia kufuatilia kila mshirika.")}</p>
          <div className="mt-4 flex gap-2">
            {[true, false].map((helped) => (
              <button
                key={String(helped)}
                type="button"
                onClick={async () => {
                  if (await sendFeedback(data.caseCode, helped)) setThanks(true);
                }}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${helped ? 'bg-[#2C4A4E] text-white hover:bg-[#2C4A4E]/90' : 'border border-[#2C4A4E] text-[#2C4A4E]'}`}
              >
                {helped ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
                {helped ? tr("Yes", "Ndiyo") : tr("Not yet", "Bado")}
              </button>
            ))}
          </div>
        </div>
      )}
      {thanks && (
        <p className="mt-8 rounded-2xl bg-[#2C4A4E]/10 p-5 text-[#2C4A4E]">
          {tr("Thank you. If you said not yet, the HEAL coordinator will look into your case.", "Asante. Kama ulisema bado, mratibu wa HEAL ataangalia kesi yako.")}
        </p>
      )}

      {data && open && (
        <div className="mt-8 border-t border-black/10 pt-6">
          {!confirmStop ? (
            <button type="button" onClick={() => setConfirmStop(true)} className="text-sm text-gray-600 underline">
              {tr("I don’t want to be contacted any more", "Sitaki kuwasiliana tena")}
            </button>
          ) : (
            <div className="rounded-2xl bg-white p-5">
              <p className="text-sm text-gray-700">
                {tr("This stops the case. Every partner is told to take no action and not to contact you.", "Hii inasimamisha kesi. Kila mshirika ataambiwa asichukue hatua yoyote na asiwasiliane nawe.")}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const s = await withdrawCase(data.caseCode);
                    if (s) {
                      setResult({ kind: 'case', data: s });
                      remember(data.caseCode, s);
                    }
                    setConfirmStop(false);
                  }}
                  className="rounded-full bg-[#2C4A4E] px-4 py-2 text-sm font-semibold text-white"
                >
                  {tr("Yes, stop it", "Ndiyo, simamisha")}
                </button>
                <button type="button" onClick={() => setConfirmStop(false)} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-[#2C4A4E]">
                  {tr("Keep my case", "Endelea na kesi yangu")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function ReportStatusPage() {
  return (
    <HelpShell back="/help" showLanguage={false}>
      <Suspense fallback={null}>
        <StatusLookup />
      </Suspense>
    </HelpShell>
  );
}
