'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import { ApiError, signIn } from '@/lib/care/partner-api';
import { useLang } from '@/lib/i18n';

const field = 'w-full rounded-xl border border-gray-200 bg-white p-3 text-[#2C4A4E] focus:outline-none focus:ring-2 focus:ring-[#2C4A4E]';

function LoginForm() {
  const { tr } = useLang();
  const router = useRouter();
  const next = useSearchParams().get('next');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mt-6 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await signIn(email, password);
          // Only follow internal paths.
          router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : '/care');
        } catch (err) {
          const code = err instanceof ApiError ? err.code : undefined;
          const known: Record<string, [string, string]> = {
            invalid_credentials: ['That email and password don’t match a partner account.', 'Barua pepe na nenosiri hilo havilingani na akaunti ya mshirika.'],
            pending_approval: ['Your organisation is registered and waiting for HEAL to approve it. We will call you; you can sign in once approved.', 'Shirika lenu limesajiliwa na linasubiri HEAL kuliidhinisha. Tutawapigia; mtaweza kuingia mkiidhinishwa.'],
            rejected: ['Your organisation’s registration was not approved. Contact info@heal-impact.org.', 'Usajili wa shirika lenu haukuidhinishwa. Wasiliana na info@heal-impact.org.'],
            account_off: ['This account has been switched off. Ask your organisation’s HEAL contact.', 'Akaunti hii imezimwa. Uliza mtu wa mawasiliano wa HEAL katika shirika lenu.'],
          };
          setError(code && known[code] ? tr(known[code][0], known[code][1]) : err instanceof Error ? err.message : tr('Sign-in failed', 'Kuingia kumeshindikana'));
          setBusy(false);
        }
      }}
    >
      <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tr("Work email", "Barua pepe ya kazi")} className={field} />
      <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={tr("Password", "Nenosiri")} className={field} />
      {error && <p className="text-sm text-[#B34D4D]">{error}</p>}
      <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2C4A4E] py-3 font-semibold text-white disabled:opacity-60 hover:opacity-90 hover:shadow-md">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {tr("Sign in", "Ingia")}
      </button>
    </form>
  );
}

export default function PartnerLoginPage() {
  const { tr } = useLang();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ECE5DA] px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm heal-panel">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label={tr("HEAL-Impact home", "Mwanzo wa HEAL-Impact")}>
            <Image src="/images/heal-impact-logo.png" alt="HEAL-Impact" width={157} height={40} className="h-9 w-auto" />
          </Link>
          <LanguageToggle />
        </div>
        <h1 className="mt-6 flex items-center gap-2 text-2xl font-acme text-[#2C4A4E]">
          <Lock className="h-5 w-5 text-[#2C4A4E]" /> {tr("Partner sign-in", "Kuingia kwa washirika")}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {tr("For CHPs, counsellors, facilities, police gender desks, rescue centres and the HEAL desk. Accounts are created by HEAL.", "Kwa CHP, washauri, vituo vya afya, madawati ya jinsia ya polisi, vituo vya uokoaji na dawati la HEAL. Akaunti zinaundwa na HEAL.")}
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 rounded-2xl bg-[#2C4A4E]/10 p-4 text-sm text-[#2C4A4E]">
          {tr('Is your organisation not on HEAL yet?', 'Shirika lenu bado halipo HEAL?')}{' '}
          <Link href="/partners/register" className="font-bold underline underline-offset-2 hover:text-[#2C4A4E]/80">{tr('Register your organisation', 'Sajili shirika lenu')}</Link>
        </p>
        <p className="mt-4 text-xs text-gray-500">
          {tr("Looking for help for yourself?", "Unatafuta msaada kwa ajili yako?")}{' '}
          <Link href="/help" className="underline hover:opacity-80">{tr("Go to Get help", "Nenda kwa Pata msaada")}</Link>
        </p>
      </div>
    </div>
  );
}
