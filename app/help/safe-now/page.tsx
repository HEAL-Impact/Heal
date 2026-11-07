'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, MapPin, Send, Search, Loader2 } from 'lucide-react';
import HelpShell from '@/components/help/HelpShell';
import { EMERGENCY_LINES, SUPPORT_LINES, telHref } from '@/lib/help/hotlines';
import { loadMySpace } from '@/lib/myspace/store';
import { requestApproxLocation, type ApproxLocation } from '@/lib/screening/location';
import { useLang } from '@/lib/i18n';

export default function SafeNowPage() {
  const { lang, tr } = useLang();
  const [trusted, setTrusted] = useState<{ name: string; phone: string }[]>([]);
  const [location, setLocation] = useState<ApproxLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    setTrusted(loadMySpace().safetyPlan.safePeople.filter((p) => p.phone));
  }, []);

  // Location is only requested when she taps, and only an approximate (~1 km) position is used.
  const getLocation = async () => {
    setLocating(true);
    setLocError(null);
    try {
      setLocation(await requestApproxLocation());
    } catch (e) {
      setLocError(e === 'denied' ? tr("Location permission was not given. You can still call or send a message.", "Ruhusa ya mahali haikutolewa. Bado unaweza kupiga simu au kutuma ujumbe.") : tr("Could not find your location right now.", "Hatukuweza kupata mahali ulipo sasa hivi."));
    } finally {
      setLocating(false);
    }
  };

  const message = location
    ? tr(`I need help. I am near here: https://maps.google.com/?q=${location.latitude},${location.longitude}`, `Nahitaji msaada. Niko karibu na hapa: https://maps.google.com/?q=${location.latitude},${location.longitude}`)
    : tr("I need help. Please call me.", "Nahitaji msaada. Tafadhali nipigie.");
  const smsHref = (phone = '') => `sms:${phone}?body=${encodeURIComponent(message)}`;

  return (
    <HelpShell back="/help" showLanguage={false}>
      <section className="py-8">
        <h1 className="text-3xl font-acme text-[#2C4A4E]">{tr("You deserve to be safe", "Unastahili kuwa salama")}</h1>
        <p className="mt-2 text-gray-600">{tr("If you are in danger now, call. These lines are free.", "Kama uko hatarini sasa, piga simu. Simu hizi ni bure.")}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {EMERGENCY_LINES.map((line) => (
            <a
              key={line.id}
              href={telHref(line)}
              className="flex flex-col rounded-3xl bg-[#2C4A4E] p-5 text-white shadow-sm hover:bg-black transition-colors"
            >
              <Phone className="h-6 w-6 text-[#D97E7E]" aria-hidden="true" />
              <span className="mt-3 text-3xl font-acme">{line.display}</span>
              <span className="text-sm font-semibold">{lang === 'sw' ? line.nameSw : line.name}</span>
              <span className="text-xs text-white/70">{lang === 'sw' ? line.noteSw : line.note}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="mb-4 rounded-3xl bg-[#2C4A4E] p-6 text-white shadow-sm">
        <h2 className="text-xl font-acme">{tr("Send help to me", "Nitumie msaada")}</h2>
        <p className="mt-2 text-sm text-white/85">
          {tr("We alert a rescue centre, the police gender desk and a Community Health Promoter near you, only the ones you agree to. You choose how they reach you, including SMS only.", "Tunaarifu kituo cha uokoaji, dawati la jinsia la polisi na Mhamasishaji wa Afya ya Jamii aliye karibu nawe, wale tu unaokubali. Wewe ndiye unachagua wakufikie vipi, ikiwemo SMS tu.")}
        </p>
        <Link href="/help/connect?from=emergency&pathway=emergency&urgent=1" className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#2C4A4E]">
          {tr("Send help to me", "Nitumie msaada")}
        </Link>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-acme text-[#2C4A4E]">
          <Send className="h-5 w-5 text-[#2C4A4E]" aria-hidden="true" />
          {tr("Tell someone you trust", "Mwambie mtu unayemwamini")}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {tr("Send a text message. Adding your location is optional, and only your approximate area (about 1 km) is shared.", "Tuma ujumbe mfupi. Kuongeza mahali ulipo si lazima, na ni eneo lako la takriban tu (karibu kilomita 1) linalotumwa.")}
        </p>

        {!location && (
          <button
            type="button"
            onClick={getLocation}
            disabled={locating}
            className="mt-4 flex items-center gap-2 rounded-full border border-[#2C4A4E] px-4 py-2 text-sm font-semibold text-[#2C4A4E] hover:bg-[#2C4A4E]/10 disabled:opacity-60"
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4 text-[#2C4A4E]" />}
            {tr("Add my approximate location", "Ongeza mahali nilipo kwa takriban")}
          </button>
        )}
        {location && (
          <p className="mt-4 rounded-xl bg-[#2C4A4E]/10 px-4 py-2 text-sm text-[#2C4A4E]">
            {location.county ? tr(`Location added (around ${location.county}).`, `Mahali pameongezwa (karibu na ${location.county}).`) : tr("Location added.", "Mahali pameongezwa.")}
          </p>
        )}
        {locError && <p className="mt-3 text-sm text-gray-600">{locError}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {trusted.map((p) => (
            <a
              key={p.phone}
              href={smsHref(p.phone)}
              className="rounded-full bg-[#2C4A4E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C4A4E]/90"
            >
              {tr(`Text ${p.name || p.phone}`, `Mtumie ujumbe ${p.name || p.phone}`)}
            </a>
          ))}
          <a
            href={smsHref()}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-[#2C4A4E] hover:bg-gray-50"
          >
            {tr("Choose who to text", "Chagua wa kumtumia ujumbe")}
          </a>
        </div>
        {trusted.length === 0 && (
          <p className="mt-3 text-xs text-gray-500">
            {tr('Tip: add trusted people to your', 'Kidokezo: ongeza watu unaowaamini kwenye')}{' '}
            <Link href="/my-space#safety-plan" className="underline">
              {tr("safety plan", "mpango wa usalama")}
            </Link>{' '}
            {tr("so they appear here.", "ili waonekane hapa.")}
          </p>
        )}
      </section>

      <section className="mt-4 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-acme text-[#2C4A4E]">
          <Search className="h-5 w-5 text-[#2C4A4E]" aria-hidden="true" />
          {tr("Find help near you", "Pata msaada karibu nawe")}
        </h2>
        <a
          href="https://www.google.com/maps/search/gender+violence+recovery+centre+near+me"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-full border border-[#2C4A4E] px-4 py-2 text-sm font-semibold text-[#2C4A4E] hover:bg-[#2C4A4E]/10"
        >
          {tr("Show recovery centres on a map", "Onyesha vituo vya kupona kwenye ramani")}
        </a>
        <ul className="mt-4 divide-y divide-gray-100">
          {SUPPORT_LINES.map((line) => (
            <li key={line.id} className="flex items-center justify-between gap-3 py-3">
              <span>
                <span className="block font-semibold text-[#2C4A4E]">{lang === 'sw' ? line.nameSw : line.name}</span>
                <span className="block text-xs text-gray-500">{lang === 'sw' ? line.noteSw : line.note}</span>
              </span>
              <a href={telHref(line)} className="shrink-0 rounded-full bg-[#2C4A4E]/10 px-3 py-1.5 text-sm font-semibold text-[#2C4A4E]">
                {line.display}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-3xl bg-white/60 p-6">
        <h2 className="text-xl font-acme text-[#2C4A4E]">{tr("If you can, right now", "Ukiweza, sasa hivi")}</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li>• {tr("Move towards a room with a way out, away from kitchens and anything that can be used to hurt you.", "Nenda kwenye chumba chenye njia ya kutokea, mbali na jikoni na chochote kinachoweza kutumiwa kukuumiza.")}</li>
          <li>• {tr("Go to a neighbour, a shop or anywhere with other people around.", "Nenda kwa jirani, dukani au mahali popote penye watu wengine.")}</li>
          <li>• {tr("If you were sexually assaulted, a clinic can give PEP within 72 hours to prevent HIV. Try not to wash first if you may report.", "Kama ulinajisiwa au kubakwa, kliniki inaweza kukupa PEP ndani ya saa 72 kuzuia VVU. Jaribu kutooga kwanza kama huenda ukaripoti.")}</li>
          <li>
            • {tr("When you are ready, make a", "Ukiwa tayari, toa")} <Link href="/report" className="underline">{tr("safe report", "ripoti salama")}</Link> {tr("or build a", "au tengeneza")}{' '}
            <Link href="/my-space#safety-plan" className="underline">{tr("safety plan", "mpango wa usalama")}</Link>.
          </li>
        </ul>
      </section>
    </HelpShell>
  );
}
