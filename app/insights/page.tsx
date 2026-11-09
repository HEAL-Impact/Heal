'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Database, ShieldCheck, Loader2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import StaffShell from '@/components/care/StaffShell';
import { partnerApi, type Insights } from '@/lib/care/partner-api';
import { PATHWAY } from '@/lib/care/labels';
import type { CasePathway } from '@/lib/care/cases';
import { useLang, type L } from '@/lib/i18n';

// DHIS2 data elements for a HEAL monthly data set. Codes are placeholders until
// mapped to KHIS with the county health records team.
const DATA_ELEMENTS = [
  { key: 'cases', code: 'HEAL_CASES_OPENED', name: { en: 'Cases opened', sw: 'Kesi zilizofunguliwa' } },
  { key: 'urgent', code: 'HEAL_CASES_URGENT', name: { en: 'Urgent cases', sw: 'Kesi za dharura' } },
  { key: 'seen', code: 'HEAL_REFERRALS_SEEN', name: { en: 'Seen by a service', sw: 'Walioonwa na huduma' } },
  { key: 'closed', code: 'HEAL_CASES_CLOSED', name: { en: 'Closed with outcome', sw: 'Zilizofungwa na matokeo' } },
  { key: 'overdue', code: 'HEAL_ALERTS_MISSED', name: { en: 'Cases with a missed alert', sw: 'Kesi zenye arifa iliyokosa jibu' } },
] as const;

const FUNNEL_SW: Record<string, string> = {
  'Cases opened': 'Kesi zilizofunguliwa',
  'Accepted by a partner': 'Zilizokubaliwa na mshirika',
  'Contacted safely': 'Waliowasiliana kwa usalama',
  'Seen by a service': 'Walioonwa na huduma',
  'Closed with an outcome': 'Zilizofungwa na matokeo',
};

const SOURCE: Record<string, L> = {
  screening: { en: 'Self check-in', sw: 'Kujikagua' },
  emergency: { en: 'Send help to me', sw: 'Nitumie msaada' },
  report: { en: 'Report', sw: 'Ripoti' },
  nia: { en: 'Nia chat', sw: 'Mazungumzo na Nia' },
  chp: { en: 'CHP visit', sw: 'Ziara ya CHP' },
};

function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function InsightsView() {
  const { tr } = useLang();
  const [data, setData] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    partnerApi.insights().then(setData).catch((e) => setError(e.message));
  }, []);

  const period = new Date().toISOString().slice(0, 7).replace('-', '');
  // Aggregate only; suppressed cells (null) are left out of the export.
  const dataValueSet = useMemo(
    () => ({
      dataSet: 'HEAL_MONTHLY',
      period,
      dataValues: (data?.counties ?? [])
        .filter((c) => c.county !== 'Not shared')
        .flatMap((c) =>
          DATA_ELEMENTS.flatMap((de) => {
            const v = c[de.key];
            return v === null ? [] : [{ dataElement: de.code, orgUnit: `KE_COUNTY_${c.county.toUpperCase().replace(/[^A-Z]/g, '_')}`, period, value: String(v) }];
          })
        ),
    }),
    [data, period]
  );

  if (error) return <p className="rounded-2xl bg-white p-6 text-[#B34D4D]">{error}</p>;
  if (!data) return <Loader2 className="mx-auto mt-12 h-6 w-6 animate-spin text-[#2C4A4E]" />;

  const small = data.smallCell;
  const csv = [
    ['county', ...DATA_ELEMENTS.map((d) => d.code)].join(','),
    ...data.counties.map((c) => [c.county, ...DATA_ELEMENTS.map((d) => c[d.key] ?? `<${small}`)].join(',')),
  ].join('\n');

  return (
    <>
      <h1 className="text-3xl font-acme text-[#2C4A4E]">{tr('Insights', 'Takwimu')}</h1>
      <p className="text-gray-600">{tr('Live numbers from HEAL care routing. Aggregate only: no names, no case details.', 'Takwimu halisi kutoka kwa mfumo wa rufaa wa HEAL. Za jumla tu: hakuna majina, hakuna maelezo ya kesi.')}</p>

      <section className="mt-6 grid gap-3 sm:grid-cols-5">
        {data.funnel.map((f, i) => (
          <div key={f.label} className="rounded-2xl bg-white p-4 shadow-sm heal-card">
            <p className="text-2xl font-bold text-[#2C4A4E]">{f.count.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{tr(f.label, FUNNEL_SW[f.label] ?? f.label)}</p>
            {i > 0 && data.funnel[0].count > 0 && (
              <p className="mt-1 text-xs text-gray-400">{tr(`${Math.round((f.count / data.funnel[0].count) * 100)}% of cases`, `${Math.round((f.count / data.funnel[0].count) * 100)}% ya kesi`)}</p>
            )}
          </div>
        ))}
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm heal-card">
          <p className="text-2xl font-bold text-[#2C4A4E]">{data.medianAcceptMinutes === null ? '–' : `${data.medianAcceptMinutes} min`}</p>
          <p className="text-sm text-gray-600">{tr('Median time to acceptance', 'Muda wa wastani hadi kukubaliwa')}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm heal-card">
          <p className="text-2xl font-bold" style={{ color: data.overdueAlerts ? '#B34D4D' : '#2C4A4E' }}>{data.overdueAlerts}</p>
          <p className="text-sm text-gray-600">{tr('Alerts past their deadline now', 'Arifa zilizopita muda sasa')}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm heal-card">
          <p className="text-2xl font-bold text-[#2C4A4E]">{data.helpedYes} / {data.helpedYes + data.helpedNo}</p>
          <p className="text-sm text-gray-600">{tr('Survivors who said they got the help they needed', 'Waliosema walipata msaada waliohitaji')}</p>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm heal-card">
          <h2 className="font-acme text-xl text-[#2C4A4E]">{tr('Cases by month', 'Kesi kwa mwezi')}</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <LineChart data={data.monthly} margin={{ left: -16, right: 8 }}>
                <CartesianGrid stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="cases" name={tr('Opened', 'Zilizofunguliwa')} stroke="#2C4A4E" strokeWidth={2.5} dot />
                <Line type="monotone" dataKey="urgent" name={tr('Urgent', 'Dharura')} stroke="#D97E7E" strokeWidth={2.5} dot />
                <Line type="monotone" dataKey="closed" name={tr('Closed', 'Zilizofungwa')} stroke="#6F8F7A" strokeWidth={2.5} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm heal-card">
          <h2 className="font-acme text-xl text-[#2C4A4E]">{tr('How cases start', 'Jinsi kesi zinavyoanza')}</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart
                data={[
                  ...data.bySource.map((s) => ({ label: tr(SOURCE[s.label] ?? { en: s.label, sw: s.label }), count: s.count })),
                ]}
                layout="vertical"
                margin={{ left: 24, right: 16 }}
              >
                <CartesianGrid stroke="#E0E0E0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} fontSize={12} width={110} />
                <Tooltip />
                <Bar dataKey="count" name={tr('Cases', 'Kesi')} fill="#2C4A4E" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2 text-xs">
            {data.byPathway.map((p) => (
              <li key={p.label} className="flex items-center gap-1.5 rounded-full bg-[#ECE5DA] px-3 py-1 text-[#2C4A4E]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: PATHWAY[p.label as CasePathway]?.colour ?? '#2C4A4E' }} />
                {tr(PATHWAY[p.label as CasePathway]?.label ?? { en: p.label, sw: p.label })}: {p.count}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm heal-panel">
        <h2 className="font-acme text-xl text-[#2C4A4E]">{tr('By county, all time', 'Kwa kaunti, tangu mwanzo')}</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2 pr-4 font-medium">{tr('County', 'Kaunti')}</th>
                {DATA_ELEMENTS.map((d) => (
                  <th key={d.key} className="py-2 pr-4 text-right font-medium">{tr(d.name)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.counties.map((c) => (
                <tr key={c.county} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-[#2C4A4E]">{c.county === 'Not shared' ? tr('Not shared', 'Haijashirikiwa') : c.county}</td>
                  {DATA_ELEMENTS.map((d) => (
                    <td key={d.key} className="py-2 pr-4 text-right tabular-nums text-gray-700">
                      {c[d.key] ?? <span className="text-gray-400" title={tr(`Fewer than ${small}, hidden to protect privacy`, `Chini ya ${small}, imefichwa kulinda faragha`)}>&lt;{small}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4" /> {tr(`Counts under ${small} are hidden on the server so no one can be identified.`, `Idadi chini ya ${small} zinafichwa kwenye seva ili mtu yeyote asitambulike.`)}
        </p>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm heal-panel">
        <h2 className="flex items-center gap-2 font-acme text-xl text-[#2C4A4E]">
          <Database className="h-5 w-5 text-[#2C4A4E]" /> {tr('DHIS2 / KHIS export', 'Usafirishaji kwa DHIS2 / KHIS')}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {tr('A', 'Faili ya')} <code>dataValueSet</code> {tr('ready to POST to', 'tayari kutumwa kwa POST kwenda')} <code>/api/dataValueSets</code>.{' '}
          {tr('Data element and org unit codes are placeholders until mapped with the county health records team.', 'Namba za vipengele vya takwimu na vitengo ni za muda hadi zilinganishwe na timu ya kumbukumbu za afya ya kaunti.')}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => download(`heal-dhis2-${period}.json`, JSON.stringify(dataValueSet, null, 2), 'application/json')} className="inline-flex items-center gap-2 rounded-full bg-[#2C4A4E] px-4 py-2 text-sm font-semibold text-white">
            <Download className="h-4 w-4" /> {tr('Download DHIS2 JSON', 'Pakua JSON ya DHIS2')}
          </button>
          <button type="button" onClick={() => download(`heal-county-summary-${period}.csv`, csv, 'text/csv')} className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-[#2C4A4E]">
            <Download className="h-4 w-4" /> {tr('Download CSV', 'Pakua CSV')}
          </button>
        </div>
      </section>
    </>
  );
}

export default function InsightsPage() {
  return (
    <StaffShell roles={['admin', 'coordinator']}>
      <InsightsView />
    </StaffShell>
  );
}
