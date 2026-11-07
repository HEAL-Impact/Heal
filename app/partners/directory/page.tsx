'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';
import PartnerCard from '@/components/care/PartnerCard';
import StaffShell from '@/components/care/StaffShell';
import { fieldCls } from '@/components/care/PartnerForm';
import { partnerApi, type DirectoryEntry } from '@/lib/care/partner-api';
import type { ResponderType } from '@/lib/care/cases';
import { PARTNER_SERVICES, RESPONDER } from '@/lib/care/labels';
import { COUNTIES } from '@/lib/screening/location';
import { useLang } from '@/lib/i18n';

function Directory() {
  const { tr } = useLang();
  const [county, setCounty] = useState('');
  const [ward, setWard] = useState('');
  const [service, setService] = useState<ResponderType | ''>('');
  const [query, setQuery] = useState('');
  const [list, setList] = useState<DirectoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setList(null);
    const t = setTimeout(() => {
      partnerApi
        .directory({ county, ward, service })
        .then((d) => alive && setList(d))
        .catch((e) => alive && setError(e.message));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [county, ward, service]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (list ?? []).filter((p) => !q || [p.name, p.ward, p.subCounty, p.county, p.landmark].join(' ').toLowerCase().includes(q));
  }, [list, query]);

  // Without a county filter, group by county so coverage gaps are easy to see.
  const groups = useMemo(() => {
    if (county) return [[county, shown] as const];
    const m = new Map<string, DirectoryEntry[]>();
    for (const p of shown) {
      const k = p.county || tr('No county (default routes)', 'Bila kaunti (njia za kawaida)');
      m.set(k, [...(m.get(k) ?? []), p]);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [shown, county, tr]);

  return (
    <>
      <h1 className="font-acme text-3xl text-[#2C4A4E]">{tr('Partner directory', 'Orodha ya washirika')}</h1>
      <p className="text-gray-600">
        {tr('Approved partners by location. Choose a county and ward to see who is nearest first.', 'Washirika walioidhinishwa kwa eneo. Chagua kaunti na wadi kuona aliye karibu zaidi kwanza.')}
      </p>

      <div className="mt-5 grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-4">
        <select value={county} onChange={(e) => setCounty(e.target.value)} className={fieldCls} aria-label={tr('County', 'Kaunti')}>
          <option value="">{tr('All counties', 'Kaunti zote')}</option>
          {COUNTIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input value={ward} onChange={(e) => setWard(e.target.value)} disabled={!county} placeholder={tr('Ward', 'Wadi')} className={fieldCls} aria-label={tr('Ward', 'Wadi')} />
        <select value={service} onChange={(e) => setService(e.target.value as ResponderType | '')} className={fieldCls} aria-label={tr('Service', 'Huduma')}>
          <option value="">{tr('All services', 'Huduma zote')}</option>
          {PARTNER_SERVICES.map((s) => (
            <option key={s} value={s}>{tr(RESPONDER[s].label)}</option>
          ))}
        </select>
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2C4A4E]/60" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr('Search name or place', 'Tafuta jina au mahali')} className={`${fieldCls} pl-9`} />
        </label>
      </div>

      {error && <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-[#B34D4D]">{error}</p>}
      {!list && !error && <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-[#2C4A4E]" />}
      {list && shown.length === 0 && (
        <p className="mt-4 rounded-2xl bg-white p-6 text-gray-600">{tr('No approved partners match. Cases here go to the default route and the HEAL desk.', 'Hakuna washirika walioidhinishwa wanaolingana. Kesi za hapa zinaenda kwa njia ya kawaida na dawati la HEAL.')}</p>
      )}

      {groups.map(([name, items]) => (
        <section key={name} className="mt-6">
          <h2 className="flex items-center gap-2 font-acme text-xl text-[#2C4A4E]">
            <MapPin className="h-5 w-5" /> {name} <span className="text-sm font-sans text-gray-500">({items.length})</span>
          </h2>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {items.map((p) => (
              <li key={p.id}>
                <PartnerCard p={p} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

export default function DirectoryPage() {
  return (
    <StaffShell>
      <Directory />
    </StaffShell>
  );
}
