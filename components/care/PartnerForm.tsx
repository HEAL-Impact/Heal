'use client';

import { useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import type { ResponderType } from '@/lib/care/cases';
import type { OrgType, PartnerFields } from '@/lib/care/partner-api';
import { ORG_TYPE, PARTNER_SERVICES, RESPONDER } from '@/lib/care/labels';
import { COUNTIES, requestApproxLocation } from '@/lib/screening/location';
import { useLang } from '@/lib/i18n';

export const EMPTY_PARTNER: PartnerFields = {
  name: '', type: 'chp', orgType: '', services: [], county: '', subCounty: '', ward: '', landmark: '',
  latitude: null, longitude: null, phone: '', email: '', hours: '', registrationNumber: '',
  whatsappGroupId: '', focalPerson: '', isDefault: false, active: true,
};

export const fieldCls =
  'w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm text-[#2C4A4E] transition-all hover:border-[#2C4A4E]/50 focus:outline-none focus:border-[#2C4A4E] focus:ring-2 focus:ring-[#2C4A4E]/30';

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#2C4A4E]/80">
      {children} {required && <span className="text-[#B34D4D]">*</span>}
    </span>
  );
}

/**
 * Organisation details: what it does and where it is. Used by self-registration
 * and by HEAL admins. `admin` shows HEAL-only fields (default route, active).
 */
export default function PartnerForm({
  value,
  onChange,
  admin = false,
  errors = {},
}: {
  value: PartnerFields;
  onChange: (v: PartnerFields) => void;
  admin?: boolean;
  errors?: Partial<Record<keyof PartnerFields, string>>;
}) {
  const { tr } = useLang();
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const set = <K extends keyof PartnerFields>(k: K, v: PartnerFields[K]) => onChange({ ...value, [k]: v });
  const types = admin ? ([...PARTNER_SERVICES, 'coordinator'] as ResponderType[]) : PARTNER_SERVICES;
  const err = (k: keyof PartnerFields) => errors[k] && <span role="alert" className="mt-1 block text-xs text-[#B34D4D]">{errors[k]}</span>;

  const locate = async () => {
    setLocating(true);
    setLocError(null);
    try {
      const loc = await requestApproxLocation();
      onChange({ ...value, latitude: loc.latitude, longitude: loc.longitude, county: value.county || loc.county || '' });
    } catch {
      setLocError(tr('Could not get the location. You can skip this; the county and ward are enough.', 'Imeshindikana kupata mahali. Unaweza kuruka hili; kaunti na wadi zinatosha.'));
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="space-y-6">
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 font-acme text-lg text-[#2C4A4E]">{tr('Organisation', 'Shirika')}</legend>
        <label className="sm:col-span-2">
          <Label required>{tr('Organisation name', 'Jina la shirika')}</Label>
          <input value={value.name} maxLength={150} onChange={(e) => set('name', e.target.value)} className={fieldCls} placeholder={tr('e.g. Kondele Police Gender Desk', 'k.m. Dawati la Jinsia Polisi Kondele')} />
          {err('name')}
        </label>
        <label>
          <Label>{tr('Type of organisation', 'Aina ya shirika')}</Label>
          <select value={value.orgType} onChange={(e) => set('orgType', e.target.value as OrgType | '')} className={fieldCls}>
            <option value="">{tr('Choose…', 'Chagua…')}</option>
            {(Object.keys(ORG_TYPE) as OrgType[]).map((o) => (
              <option key={o} value={o}>{tr(ORG_TYPE[o])}</option>
            ))}
          </select>
        </label>
        <label>
          <Label required>{tr('Main service', 'Huduma kuu')}</Label>
          <select
            value={value.type}
            onChange={(e) => {
              const t = e.target.value as ResponderType;
              onChange({ ...value, type: t, services: value.services.filter((s) => s !== t) });
            }}
            className={fieldCls}
          >
            {types.map((t) => (
              <option key={t} value={t}>{tr(RESPONDER[t].label)}</option>
            ))}
          </select>
          {err('type')}
        </label>
        <div className="sm:col-span-2">
          <Label>{tr('Other services you also offer', 'Huduma nyingine mnazotoa pia')}</Label>
          <div className="flex flex-wrap gap-2">
            {PARTNER_SERVICES.filter((s) => s !== value.type).map((s) => {
              const on = value.services.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set('services', on ? value.services.filter((x) => x !== s) : [...value.services, s])}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm ${on ? 'bg-[#2C4A4E] text-white' : 'bg-[#2C4A4E]/10 text-[#2C4A4E]'}`}
                >
                  {tr(RESPONDER[s].label)}
                </button>
              );
            })}
          </div>
          <span className="mt-1 block text-xs text-gray-500">{tr('You receive cases for every service you tick, so only tick what you really provide.', 'Mtapokea kesi kwa kila huduma mnayochagua, kwa hivyo chagueni tu mnazotoa kweli.')}</span>
        </div>
        <label>
          <Label>{tr('Registration / licence number', 'Namba ya usajili / leseni')}</Label>
          <input value={value.registrationNumber} maxLength={80} onChange={(e) => set('registrationNumber', e.target.value)} className={fieldCls} />
        </label>
        <label>
          <Label>{tr('Opening hours', 'Saa za kazi')}</Label>
          <input value={value.hours} maxLength={120} onChange={(e) => set('hours', e.target.value)} className={fieldCls} placeholder={tr('e.g. 24 hours, or Mon–Fri 8am–5pm', 'k.m. saa 24, au Jumatatu–Ijumaa 2 asubuhi–11 jioni')} />
        </label>
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 font-acme text-lg text-[#2C4A4E]">{tr('Where you are', 'Mahali mlipo')}</legend>
        <p className="-mt-1 text-xs text-gray-600 sm:col-span-2">
          {tr('Cases are sent to the partner nearest the survivor, so give your exact area.', 'Kesi zinatumwa kwa mshirika aliye karibu zaidi na mhusika, kwa hivyo toeni eneo lenu kamili.')}
        </p>
        <label>
          <Label required={!admin}>{tr('County', 'Kaunti')}</Label>
          <select value={value.county} onChange={(e) => set('county', e.target.value)} className={fieldCls}>
            <option value="">{admin ? tr('None (default route only)', 'Hakuna (njia ya kawaida tu)') : tr('Choose your county', 'Chagua kaunti yako')}</option>
            {COUNTIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {err('county')}
        </label>
        <label>
          <Label>{tr('Sub-county', 'Kaunti ndogo')}</Label>
          <input value={value.subCounty} maxLength={80} onChange={(e) => set('subCounty', e.target.value)} className={fieldCls} />
        </label>
        <label>
          <Label>{tr('Ward', 'Wadi')}</Label>
          <input value={value.ward} maxLength={80} onChange={(e) => set('ward', e.target.value)} className={fieldCls} />
        </label>
        <label>
          <Label>{tr('Landmark / directions', 'Alama ya eneo / maelekezo')}</Label>
          <input value={value.landmark} maxLength={150} onChange={(e) => set('landmark', e.target.value)} className={fieldCls} placeholder={tr('e.g. next to Kondele market', 'k.m. karibu na soko la Kondele')} />
        </label>
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className="inline-flex items-center gap-2 rounded-full border border-[#2C4A4E] px-4 py-2 text-sm font-semibold text-[#2C4A4E] transition-all hover:-translate-y-0.5 hover:bg-[#2C4A4E] hover:text-white hover:shadow-md disabled:opacity-60"
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            {value.latitude !== null
              ? tr(`Location saved (${value.latitude}, ${value.longitude}). Update`, `Mahali pamehifadhiwa (${value.latitude}, ${value.longitude}). Sasisha`)
              : tr('Use this device’s location (do this at your office)', 'Tumia mahali pa kifaa hiki (fanya hivi ukiwa ofisini)')}
          </button>
          {value.latitude !== null && (
            <button type="button" onClick={() => onChange({ ...value, latitude: null, longitude: null })} className="ml-3 text-xs text-gray-500 underline hover:text-[#2C4A4E]">
              {tr('Remove', 'Ondoa')}
            </button>
          )}
          <span className="mt-1 block text-xs text-gray-500">{tr('Saved to about 1 km. Lets us find the nearest partner even across county lines.', 'Inahifadhiwa kwa takriban kilomita 1. Inatusaidia kupata mshirika wa karibu hata kuvuka mipaka ya kaunti.')}</span>
          {locError && <span className="mt-1 block text-xs text-[#B34D4D]">{locError}</span>}
        </div>
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 font-acme text-lg text-[#2C4A4E]">{tr('Contact', 'Mawasiliano')}</legend>
        <label>
          <Label required={!admin}>{tr('Phone (desk or focal person)', 'Simu (dawati au mtu wa mawasiliano)')}</Label>
          <input value={value.phone} inputMode="tel" maxLength={30} onChange={(e) => set('phone', e.target.value)} className={fieldCls} />
          {err('phone')}
        </label>
        <label>
          <Label>{tr('Organisation email', 'Barua pepe ya shirika')}</Label>
          <input type="email" value={value.email} maxLength={254} onChange={(e) => set('email', e.target.value)} className={fieldCls} />
        </label>
        <label>
          <Label>{tr('Focal person', 'Mtu wa mawasiliano')}</Label>
          <input value={value.focalPerson} maxLength={100} onChange={(e) => set('focalPerson', e.target.value)} className={fieldCls} />
        </label>
        <label>
          <Label>{tr('WhatsApp group ID for alerts', 'Kitambulisho cha kikundi cha WhatsApp cha arifa')}</Label>
          <input value={value.whatsappGroupId} maxLength={120} onChange={(e) => set('whatsappGroupId', e.target.value)} className={fieldCls} placeholder="1203…@g.us" />
          <span className="mt-1 block text-xs text-gray-500">{tr('Don’t know it? Leave it blank; the HEAL team will set it up with you.', 'Hujui? Liache wazi; timu ya HEAL itakusaidia kuliweka.')}</span>
        </label>
      </fieldset>

      {admin && (
        <div className="flex flex-wrap gap-5 text-sm text-[#2C4A4E]">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={value.isDefault} onChange={(e) => set('isDefault', e.target.checked)} className="h-4 w-4 accent-[#2C4A4E]" />
            {tr('Default route (gets anonymous cases, and cases where no partner covers the area)', 'Njia ya kawaida (inapata kesi za bila jina, na kesi ambazo hakuna mshirika katika eneo)')}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={value.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4 accent-[#2C4A4E]" />
            {tr('Active', 'Hai')}
          </label>
        </div>
      )}
    </div>
  );
}
