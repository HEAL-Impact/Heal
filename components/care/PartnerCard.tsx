'use client';

import { Clock, MapPin, Phone, Star } from 'lucide-react';
import type { DirectoryEntry } from '@/lib/care/partner-api';
import { MATCH, ORG_TYPE, RESPONDER } from '@/lib/care/labels';
import { useLang } from '@/lib/i18n';

/** One partner in the directory: services, area, contact and how near it is. */
export default function PartnerCard({ p, action }: { p: DirectoryEntry; action?: React.ReactNode }) {
  const { tr } = useLang();
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transform-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[#2C4A4E]">
            {p.name} {p.isDefault && <Star className="inline h-4 w-4 fill-[#2C4A4E] text-[#2C4A4E]" aria-label={tr('Default route', 'Njia ya kawaida')} />}
          </p>
          <p className="text-xs text-gray-600">
            {p.orgType ? `${tr(ORG_TYPE[p.orgType])} · ` : ''}
            {[p.ward, p.subCounty, p.county].filter(Boolean).join(', ') || tr('Area not set', 'Eneo halijawekwa')}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[p.type, ...p.services].map((s) => (
              <span key={s} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s === p.type ? 'bg-[#2C4A4E] text-white' : 'bg-[#2C4A4E]/10 text-[#2C4A4E]'}`}>
                {tr(RESPONDER[s].label)}
              </span>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            {p.landmark && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.landmark}</span>}
            {p.hours && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{p.hours}</span>}
            {p.phone && (
              <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 font-semibold text-[#2C4A4E] hover:underline">
                <Phone className="h-3.5 w-3.5" />{p.phone}{p.focalPerson ? ` (${p.focalPerson})` : ''}
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.match >= 2 ? 'bg-[#2C4A4E] text-white' : 'bg-[#2C4A4E]/10 text-[#2C4A4E]'}`}>
            {tr(MATCH[p.match])}{p.distanceKm !== null ? ` · ${p.distanceKm} km` : ''}
          </span>
          {action}
        </div>
      </div>
    </div>
  );
}

