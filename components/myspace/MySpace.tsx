'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Lock, ShieldCheck, Trash2, FileText, Sprout, MessageCircle, LifeBuoy, Plus, X } from 'lucide-react';
import {
  GO_BAG_ITEMS,
  addCheckIn,
  checkPin,
  deleteEverything,
  loadMySpace,
  onMySpaceChange,
  setPin,
  trendInWords,
  updateMySpace,
  type MySpaceData,
  type Mood,
} from '@/lib/myspace/store';
import { fetchReportStatus } from '@/lib/reports';
import { fetchCaseStatus, mySpaceStatus } from '@/lib/care/cases';
import { useLang, type L } from '@/lib/i18n';

const MOODS: { value: Mood; emoji: string; label: L }[] = [
  { value: 1, emoji: '😔', label: { en: 'Struggling', sw: 'Ni ngumu' } },
  { value: 2, emoji: '😐', label: { en: 'Low', sw: 'Chini' } },
  { value: 3, emoji: '🙂', label: { en: 'Okay', sw: 'Sawa' } },
  { value: 4, emoji: '😊', label: { en: 'Good', sw: 'Vizuri' } },
];

const STATUS_LABEL: Record<string, L> = {
  waiting: { en: 'Waiting to send', sw: 'Inasubiri kutumwa' },
  received: { en: 'Received', sw: 'Imepokelewa' },
  accepted: { en: 'Accepted by a partner', sw: 'Imekubaliwa na mshirika' },
  stopped: { en: 'Stopped', sw: 'Imesimamishwa' },
  contacted: { en: 'Contacted', sw: 'Amewasiliana nawe' },
  seen: { en: 'Seen', sw: 'Umeonwa' },
  closed: { en: 'Closed', sw: 'Imefungwa' },
};

function greeting(lang: 'en' | 'sw') {
  const h = new Date().getHours();
  if (lang === 'sw') return h < 12 ? 'Habari za asubuhi' : h < 17 ? 'Habari za mchana' : 'Habari za jioni';
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

/** Picks the single most important next step, in priority order. */
function nextStep(data: MySpaceData): { title: L; body: L; action: { label: L; href: string } } {
  const urgent = data.selfChecks.find((c) => c.urgent && Date.now() - Date.parse(c.date) < 14 * 864e5);
  if (urgent) {
    return {
      title: { en: 'Talk to someone today', sw: 'Ongea na mtu leo' },
      body: {
        en: 'Your last check-in said things have been very hard. You don’t have to carry this alone.',
        sw: 'Ukaguzi wako wa mwisho ulionyesha mambo yamekuwa magumu sana. Huhitaji kubeba hili peke yako.',
      },
      action: { label: { en: 'Call Befrienders Kenya', sw: 'Piga Befrienders Kenya' }, href: 'tel:+254722178177' },
    };
  }
  const waiting = data.cases.find((c) => c.status === 'waiting');
  if (waiting) {
    return {
      title: { en: 'Your report is waiting to send', sw: 'Ripoti yako inasubiri kutumwa' },
      body: {
        en: `Report ${waiting.code} will send automatically when you’re online.`,
        sw: `Ripoti ${waiting.code} itatumwa yenyewe ukiwa mtandaoni.`,
      },
      action: { label: { en: 'Check status', sw: 'Kagua hali' }, href: `/report/status?code=${waiting.code}` },
    };
  }
  const open = data.cases.find((c) => c.status === 'received' || c.status === 'accepted' || c.status === 'contacted');
  if (open) {
    return {
      title: { en: 'Follow your report', sw: 'Fuatilia ripoti yako' },
      body: { en: `See what has happened with ${open.code}.`, sw: `Ona kilichotokea kuhusu ${open.code}.` },
      action: { label: { en: 'Check status', sw: 'Kagua hali' }, href: `/report/status?code=${open.code}` },
    };
  }
  const lastCheck = data.selfChecks[0];
  if (!lastCheck || Date.now() - Date.parse(lastCheck.date) > 30 * 864e5) {
    return {
      title: { en: 'A gentle check-in', sw: 'Ukaguzi mpole' },
      body: {
        en: 'A few private questions can help you notice how you are doing.',
        sw: 'Maswali machache ya faragha yanaweza kukusaidia kutambua unavyoendelea.',
      },
      action: { label: { en: 'Start a check-in', sw: 'Anza ukaguzi' }, href: '/help/check-in' },
    };
  }
  return {
    title: { en: 'Someone to talk to', sw: 'Mtu wa kuongea naye' },
    body: { en: 'Nia is here any time, anonymously.', sw: 'Nia yupo wakati wowote, bila jina.' },
    action: { label: { en: 'Talk with Nia', sw: 'Ongea na Nia' }, href: '/anonymous' },
  };
}

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const { tr } = useLang();
  const [pin, setPinValue] = useState('');
  const [error, setError] = useState(false);
  return (
    <form
      className="mx-auto max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await checkPin(pin)) onUnlock();
        else setError(true);
      }}
    >
      <Lock className="mx-auto h-8 w-8 text-[#2C4A4E]" aria-hidden="true" />
      <h1 className="mt-3 text-2xl font-acme text-[#2C4A4E]">{tr("Enter your PIN", "Weka PIN yako")}</h1>
      <input
        type="password"
        inputMode="numeric"
        autoComplete="off"
        value={pin}
        onChange={(e) => setPinValue(e.target.value)}
        className="mt-5 w-full rounded-2xl border border-gray-200 p-4 text-center text-2xl tracking-[0.5em]"
        aria-label="PIN"
      />
      {error && <p className="mt-2 text-sm text-gray-600">{tr("That PIN didn’t match.", "PIN hiyo haikulingana.")}</p>}
      <button type="submit" className="mt-5 w-full rounded-2xl bg-[#2C4A4E] py-3 font-semibold text-white">
        {tr("Open", "Fungua")}
      </button>
    </form>
  );
}

export default function MySpace({ signedInName }: { signedInName?: string }) {
  const { lang, tr } = useLang();
  const [data, setData] = useState<MySpaceData | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [person, setPerson] = useState({ name: '', phone: '' });

  useEffect(() => {
    const load = () => setData(loadMySpace());
    load();
    return onMySpaceChange(load);
  }, []);

  // Refresh saved case statuses when online.
  useEffect(() => {
    if (!data) return;
    data.cases
      .filter((c) => c.status !== 'closed' && c.status !== 'stopped')
      .forEach(async (c) => {
        // Cases (and reports, which now open a case) first; older reports fall back to the report status.
        const cs = await fetchCaseStatus(c.code);
        const next = typeof cs === 'object' ? mySpaceStatus(cs.status) : await fetchReportStatus(c.code).then((r) => (typeof r === 'object' ? r.status : null));
        if (next && next !== c.status) {
          updateMySpace((d) => ({ ...d, cases: d.cases.map((x) => (x.code === c.code ? { ...x, status: next } : x)) }));
        }
      });
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data === null]);

  if (!data) return null;
  if (data.pinHash && !unlocked) return <div className="py-12"><PinGate onUnlock={() => setUnlocked(true)} /></div>;

  const step = nextStep(data);
  const trend = trendInWords(data.checkIns, lang);
  const today = data.checkIns.find((c) => new Date(c.date).toDateString() === new Date().toDateString());
  const plan = data.safetyPlan;
  const setPlan = (patch: Partial<typeof plan>) => updateMySpace((d) => ({ ...d, safetyPlan: { ...d.safetyPlan, ...patch } }));

  return (
    <div className="space-y-4 py-6">
      {/* Greeting + one-tap check-in */}
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-acme text-[#2C4A4E]">
          {greeting(lang)}
          {data.nickname || signedInName ? `, ${data.nickname || signedInName}` : ''} 🌿
        </h1>
        <p className="mt-1 text-gray-600">{today ? tr("Thank you for checking in today.", "Asante kwa kujikagua leo.") : tr("How are you feeling right now?", "Unajisikiaje sasa hivi?")}</p>
        <div className="mt-4 grid grid-cols-4 gap-2" role="group" aria-label={tr("How are you feeling?", "Unajisikiaje?")}>
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => addCheckIn(m.value)}
              aria-pressed={today?.mood === m.value}
              className={`flex flex-col items-center rounded-2xl py-3 transition-colors ${
                today?.mood === m.value ? 'bg-[#2C4A4E]/10 ring-2 ring-[#2C4A4E]' : 'bg-[#ECE5DA]/60 hover:bg-[#2C4A4E]/10'
              }`}
            >
              <span className="text-2xl" aria-hidden="true">{m.emoji}</span>
              <span className="mt-1 text-xs text-gray-700">{tr(m.label)}</span>
            </button>
          ))}
        </div>
        {trend && <p className="mt-4 rounded-2xl bg-[#2C4A4E]/10 px-4 py-3 text-sm text-[#2C4A4E]">{trend}</p>}
      </section>

      {/* One next step */}
      <section className="rounded-3xl bg-[#2C4A4E] p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#D97E7E]">{tr("Your next step", "Hatua yako inayofuata")}</p>
        <h2 className="mt-2 text-2xl font-acme">{tr(step.title)}</h2>
        <p className="mt-1 text-white/80">{tr(step.body)}</p>
        <a href={step.action.href} className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#2C4A4E]">
          {tr(step.action.label)}
        </a>
      </section>

      {/* Four doors */}
      <section className="grid grid-cols-2 gap-3">
        {[
          { href: '/anonymous', icon: MessageCircle, label: tr('Talk', 'Ongea') },
          { href: '/report', icon: FileText, label: tr('Report', 'Ripoti') },
          { href: '/help/check-in', icon: Sprout, label: tr('Check-in', 'Ukaguzi') },
          { href: '/help/safe-now', icon: LifeBuoy, label: tr("I'm not safe", 'Siko salama') },
        ].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm hover:shadow-md">
            <Icon className="h-5 w-5 text-[#2C4A4E]" aria-hidden="true" />
            <span className="font-semibold text-[#2C4A4E]">{label}</span>
          </Link>
        ))}
      </section>

      {/* Case codes */}
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-acme text-[#2C4A4E]">{tr("My reports", "Ripoti zangu")}</h2>
        {data.cases.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">{tr("Case codes you choose to keep will appear here.", "Namba za kesi unazochagua kuhifadhi zitaonekana hapa.")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {data.cases.map((c) => (
              <li key={c.code}>
                <Link href={`/report/status?code=${c.code}`} className="flex items-center justify-between py-3">
                  <span className="font-mono font-semibold text-[#2C4A4E]">{c.code}</span>
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    {tr(STATUS_LABEL[c.status])} <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Self-check history in words */}
      {data.selfChecks.length > 0 && (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-acme text-[#2C4A4E]">{tr("How I’ve been doing", "Nimekuwa nikiendeleaje")}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.selfChecks.slice(0, 5).map((c) => (
              <li key={c.date} className="flex justify-between gap-3">
                <span className="text-[#2C4A4E]">{c.toolName}</span>
                <span className="text-gray-600">
                  {c.bandLabel} · {new Date(c.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Safety plan */}
      <section id="safety-plan" className="rounded-3xl bg-white p-6 shadow-sm scroll-mt-20">
        <h2 className="flex items-center gap-2 text-xl font-acme text-[#2C4A4E]">
          <ShieldCheck className="h-5 w-5 text-[#2C4A4E]" aria-hidden="true" /> {tr("My safety plan", "Mpango wangu wa usalama")}
        </h2>
        <p className="mt-1 text-sm text-gray-600">{tr("Fill in only what helps. It stays on this phone.", "Jaza tu kinachosaidia. Kinabaki kwenye simu hii.")}</p>
        <label className="mt-4 block text-sm font-semibold text-[#2C4A4E]">
          {tr("Warning signs that things are getting dangerous", "Dalili za onyo kwamba mambo yanakuwa hatari")}
          <textarea
            value={plan.warningSigns}
            onChange={(e) => setPlan({ warningSigns: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal"
          />
        </label>
        <div className="mt-4">
          <p className="text-sm font-semibold text-[#2C4A4E]">{tr("People I can call", "Watu ninaoweza kuwapigia")}</p>
          <ul className="mt-2 space-y-2">
            {plan.safePeople.map((p, i) => (
              <li key={`${p.phone}-${i}`} className="flex items-center justify-between rounded-xl bg-[#ECE5DA]/60 px-3 py-2 text-sm">
                <span>{p.name} · {p.phone}</span>
                <button
                  type="button"
                  aria-label={tr(`Remove ${p.name}`, `Ondoa ${p.name}`)}
                  onClick={() => setPlan({ safePeople: plan.safePeople.filter((_, j) => j !== i) })}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-2">
            <input value={person.name} onChange={(e) => setPerson({ ...person, name: e.target.value })} placeholder={tr("Name", "Jina")} aria-label={tr("Name", "Jina")} className="w-1/3 rounded-xl border border-gray-200 p-2 text-sm" />
            <input value={person.phone} onChange={(e) => setPerson({ ...person, phone: e.target.value })} placeholder={tr("Phone", "Simu")} aria-label={tr("Phone", "Simu")} type="tel" className="flex-1 rounded-xl border border-gray-200 p-2 text-sm" />
            <button
              type="button"
              aria-label={tr("Add person", "Ongeza mtu")}
              onClick={() => {
                if (!person.phone) return;
                setPlan({ safePeople: [...plan.safePeople, person] });
                setPerson({ name: '', phone: '' });
              }}
              className="rounded-xl bg-[#2C4A4E] px-3 text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <label className="mt-4 block text-sm font-semibold text-[#2C4A4E]">
          {tr("Safe places I can go", "Mahali salama ninapoweza kwenda")}
          <textarea value={plan.safePlaces} onChange={(e) => setPlan({ safePlaces: e.target.value })} rows={2} className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal" />
        </label>
        <label className="mt-4 block text-sm font-semibold text-[#2C4A4E]">
          {tr("Things that help me cope", "Vitu vinavyonisaidia kustahimili")}
          <textarea value={plan.copingSteps} onChange={(e) => setPlan({ copingSteps: e.target.value })} rows={2} className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal" />
        </label>
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[#2C4A4E]">{tr("Go-bag checklist", "Orodha ya begi la dharura")}</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {GO_BAG_ITEMS.map((item) => (
              <label key={item.key} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={!!plan.goBag[item.key]}
                  onChange={(e) => setPlan({ goBag: { ...plan.goBag, [item.key]: e.target.checked } })}
                  className="h-4 w-4 accent-[#2C4A4E]"
                />
                {tr(item.key, item.sw)}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {/* Privacy */}
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-acme text-[#2C4A4E]">{tr("Privacy", "Faragha")}</h2>
        <label className="mt-3 block text-sm font-semibold text-[#2C4A4E]">
          {tr("A name to greet you with (optional)", "Jina la kukusalimia nalo (si lazima)")}
          <input
            value={data.nickname}
            onChange={(e) => updateMySpace((d) => ({ ...d, nickname: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal"
            placeholder={tr("Leave empty to show no name", "Acha wazi ili lisionyeshwe jina")}
          />
        </label>
        <div className="mt-4">
          <p className="text-sm font-semibold text-[#2C4A4E]">{tr("PIN lock", "Kufuli ya PIN")}</p>
          {data.pinHash ? (
            <button type="button" onClick={() => setPin(null)} className="mt-2 rounded-full border border-gray-300 px-4 py-2 text-sm">
              {tr("Remove PIN", "Ondoa PIN")}
            </button>
          ) : (
            <div className="mt-2 flex gap-2">
              <input
                type="password"
                inputMode="numeric"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder={tr("4–8 digits", "Tarakimu 4–8")}
                aria-label={tr("New PIN", "PIN mpya")}
                className="flex-1 rounded-xl border border-gray-200 p-2 text-sm"
              />
              <button
                type="button"
                disabled={newPin.length < 4}
                onClick={async () => {
                  await setPin(newPin);
                  setNewPin('');
                  setUnlocked(true);
                }}
                className="rounded-xl bg-[#2C4A4E] px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {tr("Set PIN", "Weka PIN")}
              </button>
            </div>
          )}
        </div>
        <label className="mt-4 block text-sm font-semibold text-[#2C4A4E]">
          {tr("Gentle reminders to check in", "Vikumbusho vya upole vya kujikagua")}
          <select
            value={data.reminder}
            onChange={(e) => updateMySpace((d) => ({ ...d, reminder: e.target.value as MySpaceData['reminder'] }))}
            className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal"
          >
            <option value="off">{tr("Off", "Zima")}</option>
            <option value="every3days">{tr("Every 3 days", "Kila siku 3")}</option>
            <option value="weekly">{tr("Weekly", "Kila wiki")}</option>
          </select>
          <span className="mt-1 block text-xs font-normal text-gray-500">{tr("Reminder messages never mention HEAL or abuse.", "Jumbe za kukumbusha hazitaji kamwe HEAL wala unyanyasaji.")}</span>
        </label>
        <div className="mt-6 border-t pt-5">
          {confirmDelete ? (
            <div className="rounded-2xl bg-[#ECE5DA] p-4">
              <p className="text-sm text-[#2C4A4E]">
                {tr("This deletes your check-ins, safety plan, saved codes and screenings from this phone. Reports already sent stay with the service.", "Hii inafuta ukaguzi wako, mpango wa usalama, namba zilizohifadhiwa na matokeo ya ukaguzi kwenye simu hii. Ripoti zilizokwisha tumwa zinabaki kwa huduma husika.")}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await deleteEverything();
                    setConfirmDelete(false);
                  }}
                  className="rounded-full bg-[#2C4A4E] px-4 py-2 text-sm font-semibold text-white"
                >
                  {tr("Yes, delete everything", "Ndiyo, futa kila kitu")}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full border border-gray-300 px-4 py-2 text-sm">
                  {tr("Cancel", "Ghairi")}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-sm font-semibold text-[#2C4A4E]">
              <Trash2 className="h-4 w-4" /> {tr("Delete everything on this phone", "Futa kila kitu kwenye simu hii")}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
