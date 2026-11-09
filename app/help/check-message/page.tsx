'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ShieldCheck, Download } from 'lucide-react';
import HelpShell from '@/components/help/HelpShell';
import { checkOnlineHarm, evidenceFingerprint, type HarmFinding } from '@/lib/help/online-safety';
import { useLang } from '@/lib/i18n';

export default function CheckMessagePage() {
  const { tr } = useLang();
  const [text, setText] = useState('');
  const [from, setFrom] = useState('');
  const [app, setApp] = useState('');
  const [findings, setFindings] = useState<HarmFinding[] | null>(null);

  const downloadEvidence = async () => {
    const at = new Date().toISOString();
    const hash = await evidenceFingerprint(text, at);
    const record = [
      'Evidence record',
      `Saved: ${at}`,
      `App: ${app || 'not given'}`,
      `From: ${from || 'not given'}`,
      '',
      'Message:',
      text,
      '',
      `SHA-256 fingerprint: ${hash}`,
      '(Any change to the message or time changes this fingerprint.)',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([record], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `record-${at.slice(0, 10)}.txt`; // neutral file name
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <HelpShell back="/help" showLanguage={false}>
      <section className="py-8">
        <h1 className="text-3xl font-acme text-[#2C4A4E]">{tr("Check a message", "Kagua ujumbe")}</h1>
        <p className="mt-2 text-gray-600">
          {tr("Got a message that worries you? Paste it here. It is checked on this phone and is not sent anywhere.", "Umepokea ujumbe unaokutia wasiwasi? Ubandike hapa. Unakaguliwa kwenye simu hii na hautumwi popote.")}
        </p>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setFindings(null);
          }}
          rows={6}
          className="mt-6 w-full rounded-2xl bg-white p-4 text-[#2C4A4E] focus:outline-none focus:ring-2 focus:ring-[#2C4A4E]"
          placeholder={tr("Paste the message here", "Bandika ujumbe hapa")}
          aria-label={tr("Message to check", "Ujumbe wa kukagua")}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder={tr("Who sent it? (optional)", "Nani aliutuma? (si lazima)")} className="rounded-2xl bg-white p-3" />
          <input value={app} onChange={(e) => setApp(e.target.value)} placeholder={tr("Which app? e.g. WhatsApp (optional)", "Programu gani? mf. WhatsApp (si lazima)")} className="rounded-2xl bg-white p-3" />
        </div>
        <button
          type="button"
          disabled={!text.trim()}
          onClick={() => setFindings(checkOnlineHarm(text))}
          className="mt-4 w-full rounded-2xl bg-[#2C4A4E] px-5 py-4 font-semibold text-white hover:bg-[#2C4A4E]/90 disabled:opacity-50"
        >
          {tr("Check this message", "Kagua ujumbe huu")}
        </button>

        {findings && (
          <div className="mt-6 space-y-4">
            {findings.length === 0 ? (
              <div className="rounded-3xl bg-white p-6 shadow-sm heal-card">
                <ShieldCheck className="h-7 w-7 text-[#2C4A4E]" aria-hidden="true" />
                <h2 className="mt-2 text-xl font-acme text-[#2C4A4E]">{tr("We didn’t spot common warning signs", "Hatukuona dalili za kawaida za hatari")}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {tr("That doesn’t mean it’s fine. If it made you feel unsafe or uneasy, trust that feeling and talk to someone.", "Hiyo haimaanishi kuwa ni sawa. Kama umejihisi si salama au huna amani, amini hisia hiyo na uongee na mtu.")}
                </p>
              </div>
            ) : (
              findings.map((f) => (
                <div key={f.kind} className="rounded-3xl bg-white p-6 shadow-sm heal-card">
                  <ShieldAlert className="h-7 w-7 text-[#B34D4D]" aria-hidden="true" />
                  <h2 className="mt-2 text-xl font-acme text-[#2C4A4E]">{tr(f.title)}</h2>
                  <p className="mt-1 text-gray-700">{tr(f.explain)}</p>
                  <ol className="mt-3 space-y-1.5 text-sm text-gray-700">
                    {f.steps.map((s, i) => (
                      <li key={s.en}>
                        {i + 1}. {tr(s)}
                      </li>
                    ))}
                  </ol>
                </div>
              ))
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadEvidence}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#2C4A4E] shadow-sm hover:opacity-90 hover:shadow-md"
              >
                <Download className="h-4 w-4" /> {tr("Save an evidence record", "Hifadhi rekodi ya ushahidi")}
              </button>
              <Link href="/report" className="rounded-full bg-[#2C4A4E] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 hover:shadow-md">
                {tr("Make a report", "Toa ripoti")}
              </Link>
              <Link href="/anonymous" className="rounded-full border border-[#2C4A4E] px-5 py-2.5 text-sm font-semibold text-[#2C4A4E] hover:bg-[#2C4A4E]/10">
                {tr("Talk it through with Nia", "Ongea na Nia kuhusu hili")}
              </Link>
            </div>
          </div>
        )}
      </section>
    </HelpShell>
  );
}
