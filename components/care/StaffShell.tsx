'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useLang, type L } from '@/lib/i18n';
import LanguageToggle from '@/components/LanguageToggle';
import { getSession, signOut, type PartnerAccount, type Role } from '@/lib/care/partner-api';

const NAV: { href: string; label: L; roles?: Role[] }[] = [
  { href: '/care', label: { en: 'Caseload', sw: 'Orodha ya Kesi' } },
  { href: '/partners/directory', label: { en: 'Directory', sw: 'Orodha ya washirika' } },
  { href: '/insights', label: { en: 'Insights', sw: 'Takwimu' }, roles: ['admin', 'coordinator'] },
  { href: '/partners/admin', label: { en: 'Partners', sw: 'Washirika' }, roles: ['admin'] },
  { href: '/learn', label: { en: 'Training', sw: 'Mafunzo' } },
];

const AccountContext = createContext<PartnerAccount | null>(null);

/** The signed-in partner account (inside a StaffShell that requires sign-in). */
export const usePartnerAccount = () => useContext(AccountContext);

interface StaffShellProps {
  children: React.ReactNode;
  /** Pages open to anyone (training) set this to false. */
  requireAuth?: boolean;
  /** Only these roles may open the page. */
  roles?: Role[];
}

/** Frame for partner pages: CHPs, counsellors, facilities, police desks, rescue centres and the HEAL desk. */
export default function StaffShell({ children, requireAuth = true, roles }: StaffShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { tr } = useLang();
  const [account, setAccount] = useState<PartnerAccount | null>(null);
  const [checked, setChecked] = useState(false);

  // Sign-in is checked on the device after load (static export: no server middleware).
  useEffect(() => {
    const s = getSession();
    setAccount(s?.account ?? null);
    setChecked(true);
    if (requireAuth && !s) router.replace(`/partners/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  }, [requireAuth, router]);

  const allowed = !roles || (account && roles.includes(account.role));
  const nav = NAV.filter((n) => !n.roles || (account && n.roles.includes(account.role)));

  return (
    <AccountContext.Provider value={account}>
      <div className="min-h-screen bg-[#ECE5DA] pb-20">
        <header className="sticky top-0 z-40 border-b border-black/5 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" aria-label={tr("HEAL-Impact home", "Mwanzo wa HEAL-Impact")}>
              <Image src="/images/heal-impact-logo.png" alt="HEAL-Impact" width={157} height={40} className="h-9 w-auto" />
            </Link>
            <nav className="flex flex-wrap items-center gap-1" aria-label={tr("Partner tools", "Zana za washirika")}>
              <LanguageToggle className="mr-1" />
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={pathname === n.href ? 'page' : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    pathname === n.href ? 'bg-[#2C4A4E] text-white' : 'text-[#2C4A4E] hover:bg-black/5'
                  }`}
                >
                  {tr(n.label)}
                </Link>
              ))}
              {account ? (
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    router.replace('/partners/login');
                  }}
                  className="ml-1 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-gray-600 hover:bg-black/5"
                  title={`${account.name} · ${account.partnerName || 'HEAL'}`}
                >
                  <LogOut className="h-4 w-4" /> {tr("Sign out", "Toka")}
                </button>
              ) : (
                checked && (
                  <Link href="/partners/login" className="ml-1 rounded-full px-3 py-2 text-sm font-semibold text-[#2C4A4E] hover:bg-black/5">
                    {tr("Partner sign-in", "Ingia kama mshirika")}
                  </Link>
                )
              )}
            </nav>
          </div>
          {account && (
            <p className="bg-[#ECE5DA] px-4 py-1.5 text-center text-xs font-medium text-[#2C4A4E]">
              {account.name} · {account.partnerName || tr("HEAL coordinator desk", "Dawati la mratibu wa HEAL")} ·{' '}
              {tr("Every case you open is logged. Share nothing outside HEAL.", "Kila kesi unayofungua inarekodiwa. Usishiriki chochote nje ya HEAL.")}
            </p>
          )}
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          {!checked || (requireAuth && !account) ? null : allowed ? (
            children
          ) : (
            <p className="rounded-2xl bg-white p-6 text-gray-700">{tr("Your account cannot open this page.", "Akaunti yako haiwezi kufungua ukurasa huu.")}</p>
          )}
        </main>
      </div>
    </AccountContext.Provider>
  );
}
