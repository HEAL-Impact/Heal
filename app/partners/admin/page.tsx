'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Loader2, MapPin, Pencil, Plus, Star, UserPlus, X } from 'lucide-react';
import StaffShell from '@/components/care/StaffShell';
import PartnerForm, { EMPTY_PARTNER } from '@/components/care/PartnerForm';
import { partnerApi, type Partner, type PartnerAccount, type PartnerFields, type Role } from '@/lib/care/partner-api';
import type { ResponderType } from '@/lib/care/cases';
import { ORG_TYPE, RESPONDER } from '@/lib/care/labels';
import { useLang } from '@/lib/i18n';

const TYPES: ResponderType[] = ['chp', 'rescue_centre', 'facility', 'police_desk', 'counsellor', 'legal_aid', 'coordinator'];
const input = 'w-full rounded-lg border border-gray-200 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C4A4E]';

const fieldsOf = (p: Partner): PartnerFields => {
  const { id: _i, status: _s, reviewedAt: _r, reviewNote: _n, createdAt: _c, ...f } = p;
  return f;
};

function EditPartner({ initial, id, onSaved, onCancel }: { initial: PartnerFields; id?: string; onSaved: () => void; onCancel: () => void }) {
  const { tr } = useLang();
  const [p, setP] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="rounded-2xl bg-white p-5 shadow-md ring-2 ring-[#2C4A4E]/20"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await partnerApi.savePartner(p, id);
          onSaved();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed');
        } finally {
          setBusy(false);
        }
      }}
    >
      <PartnerForm value={p} onChange={setP} admin />
      {error && <p className="mt-3 text-sm text-[#B34D4D]">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={busy} className="rounded-full bg-[#2C4A4E] px-5 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : tr('Save partner', 'Hifadhi mshirika')}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-[#2C4A4E] hover:bg-[#2C4A4E]/5">
          {tr('Cancel', 'Ghairi')}
        </button>
      </div>
    </form>
  );
}

/** A registration waiting for HEAL to check it (call them, verify the licence). */
function ReviewCard({ p, onDone }: { p: Partner; onDone: () => void }) {
  const { tr } = useLang();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const review = async (status: 'approved' | 'rejected') => {
    setBusy(status);
    setError(null);
    try {
      await partnerApi.reviewPartner(p.id, status, note);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
      setBusy(null);
    }
  };
  return (
    <li className="rounded-2xl bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[#2C4A4E]">{p.name}</p>
          <p className="text-sm text-gray-600">
            {tr(RESPONDER[p.type].label)}
            {p.services.length > 0 && ` + ${p.services.map((s) => tr(RESPONDER[s].label)).join(', ')}`}
            {p.orgType && ` · ${tr(ORG_TYPE[p.orgType])}`}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-4 w-4" /> {[p.landmark, p.ward, p.subCounty, p.county].filter(Boolean).join(', ')}
            {p.latitude !== null && ` (${p.latitude}, ${p.longitude})`}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {p.phone} {p.email && `· ${p.email}`} {p.focalPerson && `· ${p.focalPerson}`} {p.registrationNumber && `· ${tr('Reg.', 'Usajili')} ${p.registrationNumber}`}
          </p>
          <p className="text-xs text-gray-500">{tr('Registered', 'Imesajiliwa')} {new Date(p.createdAt).toLocaleString()}</p>
        </div>
        <span className="rounded-full bg-[#2C4A4E]/10 px-3 py-1 text-xs font-semibold text-[#2C4A4E]">{tr('Waiting for review', 'Inasubiri ukaguzi')}</span>
      </div>
      <p className="mt-3 text-xs text-gray-600">{tr('Before approving: call the number above and check the licence or registration. Approved partners can see survivors’ cases.', 'Kabla ya kuidhinisha: piga namba iliyo hapo juu na ukague leseni au usajili. Washirika walioidhinishwa wanaweza kuona kesi za wahusika.')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={tr('Note (shared with them if rejected)', 'Dokezo (litatumwa kwao ikikataliwa)')} className={`${input} flex-1 min-w-[200px]`} />
        <button type="button" disabled={!!busy} onClick={() => review('approved')} className="inline-flex items-center gap-1 rounded-full bg-[#2C4A4E] px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50">
          {busy === 'approved' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {tr('Approve', 'Idhinisha')}
        </button>
        <button type="button" disabled={!!busy} onClick={() => review('rejected')} className="inline-flex items-center gap-1 rounded-full border border-[#B34D4D] px-4 py-2 text-sm font-semibold text-[#B34D4D] transition-all hover:bg-[#F9EBEB] disabled:opacity-50">
          <X className="h-4 w-4" /> {tr('Reject', 'Kataa')}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-[#B34D4D]">{error}</p>}
    </li>
  );
}

function AccountForm({ partners, onSaved }: { partners: Partner[]; onSaved: () => void }) {
  const { tr } = useLang();
  const [a, setA] = useState({ email: '', password: '', name: '', role: 'partner' as Role, partnerId: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="grid gap-2 rounded-2xl bg-[#ECE5DA] p-4 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await partnerApi.createAccount(a);
          setA({ email: '', password: '', name: '', role: 'partner', partnerId: '' });
          onSaved();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed');
        } finally {
          setBusy(false);
        }
      }}
    >
      <input required value={a.name} onChange={(e) => setA({ ...a, name: e.target.value })} placeholder={tr('Full name', 'Jina kamili')} className={input} />
      <input required type="email" value={a.email} onChange={(e) => setA({ ...a, email: e.target.value })} placeholder={tr('Work email', 'Barua pepe ya kazi')} className={input} />
      <input required minLength={10} type="password" autoComplete="new-password" value={a.password} onChange={(e) => setA({ ...a, password: e.target.value })} placeholder={tr('Temporary password (10+ characters)', 'Nenosiri la muda (herufi 10+)')} className={input} />
      <select value={a.role} onChange={(e) => setA({ ...a, role: e.target.value as Role })} className={input}>
        <option value="partner">{tr('Partner staff (sees own cases)', 'Mfanyakazi wa mshirika (anaona kesi zake)')}</option>
        <option value="coordinator">{tr('HEAL coordinator (sees all cases)', 'Mratibu wa HEAL (anaona kesi zote)')}</option>
        <option value="admin">{tr('Admin (manages partners and accounts)', 'Msimamizi (anasimamia washirika na akaunti)')}</option>
      </select>
      {a.role === 'partner' && (
        <select required value={a.partnerId} onChange={(e) => setA({ ...a, partnerId: e.target.value })} className={`${input} sm:col-span-2`}>
          <option value="">{tr('Which partner?', 'Mshirika gani?')}</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>{p.name} · {tr(RESPONDER[p.type].label)}{p.county ? ` · ${p.county}` : ''}</option>
          ))}
        </select>
      )}
      {error && <p className="text-sm text-[#B34D4D] sm:col-span-2">{error}</p>}
      <button type="submit" disabled={busy} className="rounded-full bg-[#2C4A4E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:w-fit hover:opacity-90 hover:shadow-md">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : tr('Create account', 'Unda akaunti')}
      </button>
    </form>
  );
}

function Admin() {
  const { tr } = useLang();
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [accounts, setAccounts] = useState<PartnerAccount[]>([]);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [addingAccount, setAddingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([partnerApi.partners(), partnerApi.accounts()])
      .then(([p, a]) => {
        setPartners(p);
        setAccounts(a);
      })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const pending = useMemo(() => (partners ?? []).filter((p) => p.status === 'pending'), [partners]);
  const byCounty = useMemo(() => {
    const m = new Map<string, Partner[]>();
    for (const p of (partners ?? []).filter((x) => x.status !== 'pending')) {
      const k = p.county || tr('No county (default routes)', 'Bila kaunti (njia za kawaida)');
      m.set(k, [...(m.get(k) ?? []), p]);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [partners, tr]);

  if (error) return <p className="rounded-2xl bg-white p-6 text-[#B34D4D]">{error}</p>;
  if (!partners) return <Loader2 className="mx-auto mt-12 h-6 w-6 animate-spin text-[#2C4A4E]" />;

  const live = partners.filter((p) => p.status === 'approved' && p.active);
  const missingDefaults = TYPES.filter((t) => !live.some((p) => p.type === t && p.isDefault));

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-acme text-[#2C4A4E]">{tr('Partners', 'Washirika')}</h1>
        <p className="text-gray-600">{tr('Organisations register themselves with their location. Approve them here; each one then gets alerts for survivors in its area.', 'Mashirika yanajisajili yenyewe pamoja na mahali yalipo. Yaidhinishe hapa; kila moja kisha linapata arifa za wahusika katika eneo lake.')}</p>
        {pending.length > 0 && (
          <div className="mt-5">
            <h2 className="font-acme text-xl text-[#2C4A4E]">{tr(`Waiting for review (${pending.length})`, `Yanasubiri ukaguzi (${pending.length})`)}</h2>
            <ul className="mt-3 space-y-3">
              {pending.map((p) => (
                <ReviewCard key={p.id} p={p} onDone={load} />
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-acme text-xl text-[#2C4A4E]">{tr('Partners by location', 'Washirika kwa eneo')}</h2>
          <button type="button" onClick={() => setEditing('new')} className="inline-flex items-center gap-1.5 rounded-full bg-[#2C4A4E] px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <Plus className="h-4 w-4" /> {tr('Add partner', 'Ongeza mshirika')}
          </button>
        </div>
        {missingDefaults.length > 0 && (
          <p className="mt-4 rounded-xl bg-[#2C4A4E]/10 p-3 text-sm text-[#2C4A4E]">
            {tr('No active default route for:', 'Hakuna njia ya kawaida inayofanya kazi kwa:')} {missingDefaults.map((t) => tr(RESPONDER[t].label)).join(', ')}.{' '}
            {tr('Anonymous cases needing these go to the HEAL coordinator instead.', 'Kesi za bila jina zinazohitaji hizi zinaenda kwa mratibu wa HEAL badala yake.')}
          </p>
        )}
        {editing === 'new' && (
          <div className="mt-4">
            <EditPartner initial={EMPTY_PARTNER} onSaved={() => (setEditing(null), load())} onCancel={() => setEditing(null)} />
          </div>
        )}
        {byCounty.map(([county, list]) => (
          <div key={county} className="mt-6">
            <h3 className="flex items-center gap-2 font-acme text-lg text-[#2C4A4E]">
              <MapPin className="h-4 w-4" /> {county} <span className="font-sans text-sm text-gray-500">({list.length})</span>
            </h3>
            <ul className="mt-2 space-y-2">
              {list.map((p) =>
                editing === p.id ? (
                  <li key={p.id}>
                    <EditPartner initial={fieldsOf(p)} id={p.id} onSaved={() => (setEditing(null), load())} onCancel={() => setEditing(null)} />
                  </li>
                ) : (
                  <li key={p.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${p.active && p.status === 'approved' ? '' : 'opacity-60'}`}>
                    <div>
                      <p className="font-semibold text-[#2C4A4E]">
                        {p.name} {p.isDefault && <Star className="inline h-4 w-4 fill-[#2C4A4E] text-[#2C4A4E]" aria-label={tr('Default route', 'Njia ya kawaida')} />}
                        {p.status === 'rejected' && <span className="ml-2 text-xs text-[#B34D4D]">({tr('rejected', 'imekataliwa')})</span>}
                        {p.status === 'approved' && !p.active && <span className="ml-2 text-xs text-gray-500">({tr('inactive', 'haifanyi kazi')})</span>}
                      </p>
                      <p className="text-sm text-gray-600">
                        {tr(RESPONDER[p.type].label)}
                        {p.services.length > 0 && ` + ${p.services.map((s) => tr(RESPONDER[s].label)).join(', ')}`}
                        {' · '}
                        {[p.ward, p.subCounty].filter(Boolean).join(', ') || tr('whole county', 'kaunti nzima')}
                        {p.latitude !== null && ' · 📍'}
                      </p>
                      <p className="text-xs text-gray-500">
                        WhatsApp: {p.whatsappGroupId || <span className="text-[#B34D4D]">{tr('not set: alerts cannot be delivered', 'haijawekwa: arifa haziwezi kufika')}</span>}
                        {p.focalPerson ? ` · ${p.focalPerson}` : ''}
                        {p.phone ? ` · ${p.phone}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {p.status === 'rejected' && (
                        <button type="button" onClick={() => partnerApi.reviewPartner(p.id, 'approved').then(load).catch((e) => setError(e.message))} className="rounded-full border border-gray-300 px-3 py-1.5 text-sm text-[#2C4A4E] hover:bg-[#2C4A4E]/5">
                          {tr('Approve', 'Idhinisha')}
                        </button>
                      )}
                      <button type="button" onClick={() => setEditing(p.id)} className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-[#2C4A4E] transition-colors hover:bg-[#2C4A4E]/5">
                        <Pencil className="h-3.5 w-3.5" /> {tr('Edit', 'Hariri')}
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-acme text-[#2C4A4E]">{tr('Staff accounts', 'Akaunti za wafanyakazi')}</h2>
            <p className="text-gray-600">{tr('Only people with an account can open cases. Deactivate anyone who leaves.', 'Ni watu wenye akaunti tu wanaoweza kufungua kesi. Zima akaunti ya yeyote anayeondoka.')}</p>
          </div>
          <button type="button" onClick={() => setAddingAccount(!addingAccount)} className="inline-flex items-center gap-1.5 rounded-full bg-[#2C4A4E] px-4 py-2 text-sm font-semibold text-white">
            <UserPlus className="h-4 w-4" /> {tr('Add account', 'Ongeza akaunti')}
          </button>
        </div>
        {addingAccount && (
          <div className="mt-4">
            <AccountForm partners={partners.filter((p) => p.active && p.status === 'approved')} onSaved={() => (setAddingAccount(false), load())} />
          </div>
        )}
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm heal-panel">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="p-3 font-medium">{tr('Name', 'Jina')}</th>
                <th className="p-3 font-medium">{tr('Email', 'Barua pepe')}</th>
                <th className="p-3 font-medium">{tr('Role', 'Jukumu')}</th>
                <th className="p-3 font-medium">{tr('Partner', 'Mshirika')}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className={`border-b last:border-0 ${a.active ? '' : 'opacity-60'}`}>
                  <td className="p-3 font-medium text-[#2C4A4E]">{a.name}</td>
                  <td className="p-3 text-gray-700">{a.email}</td>
                  <td className="p-3 text-gray-700">{a.role}</td>
                  <td className="p-3 text-gray-700">{a.partnerName || 'HEAL'}</td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => partnerApi.setAccountActive(a.id, !a.active).then(load).catch((e) => setError(e.message))}
                      className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-[#2C4A4E]"
                    >
                      {a.active ? tr('Deactivate', 'Zima') : tr('Reactivate', 'Washa tena')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function PartnersAdminPage() {
  return (
    <StaffShell roles={['admin']}>
      <Admin />
    </StaffShell>
  );
}
