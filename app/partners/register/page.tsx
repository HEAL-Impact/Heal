'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import PartnerForm, { EMPTY_PARTNER, fieldCls } from '@/components/care/PartnerForm';
import { ApiError, partnerApi, type PartnerFields } from '@/lib/care/partner-api';
import { emailError } from '@/lib/auth-validation';
import { useLang } from '@/lib/i18n';

const CONDUCT: { en: string; sw: string }[] = [
  { en: 'Keep every survivor’s details confidential, and only use them for the help they agreed to.', sw: 'Kuweka siri taarifa za kila mhusika, na kuzitumia tu kwa msaada aliokubali.' },
  { en: 'Contact survivors only through the safe channel they chose (for example SMS only, never call).', sw: 'Kuwasiliana naye tu kupitia njia salama aliyochagua (kwa mfano SMS tu, usipige simu).' },
  { en: 'Accept or pass on each alert quickly, and record what happened so nobody is lost.', sw: 'Kukubali au kupitisha kila arifa haraka, na kurekodi kilichotokea ili hakuna anayepotea.' },
  { en: 'Never charge survivors, pressure them, or share anything outside HEAL.', sw: 'Kutowatoza wahusika pesa, kutowashinikiza, wala kushiriki chochote nje ya HEAL.' },
];

export default function PartnerRegisterPage() {
  const { tr } = useLang();
  const [org, setOrg] = useState<PartnerFields>(EMPTY_PARTNER);
  const [account, setAccount] = useState({ name: '', email: '', password: '', confirm: '' });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!org.name.trim()) e.name = tr('Enter the organisation name.', 'Weka jina la shirika.');
    if (!org.county) e.county = tr('Choose your county so cases near you reach you.', 'Chagua kaunti yako ili kesi za karibu zikufikie.');
    if (org.phone.replace(/\D/g, '').length < 9) e.phone = tr('Enter a phone number HEAL can call.', 'Weka namba ya simu ambayo HEAL inaweza kupiga.');
    if (!account.name.trim()) e.accountName = tr('Enter your name.', 'Weka jina lako.');
    const em = emailError(account.email);
    if (em) e.accountEmail = tr(em);
    if (account.password.length < 10) e.password = tr('Use at least 10 characters.', 'Tumia angalau herufi 10.');
    else if (new TextEncoder().encode(account.password).length > 72) e.password = tr('Use 72 characters or fewer.', 'Tumia herufi 72 au chache.');
    if (account.confirm !== account.password) e.confirm = tr('The passwords don’t match.', 'Manenosiri hayalingani.');
    if (!agree) e.agree = tr('Please agree to the code of conduct.', 'Tafadhali kubali kanuni za maadili.');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    setFormError(null);
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setBusy(true);
    try {
      const { isDefault: _d, active: _a, ...organisation } = org;
      const res = await partnerApi.register(organisation, { name: account.name.trim(), email: account.email.trim().toLowerCase(), password: account.password });
      setDone(res.name);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'email_taken') setErrors((x) => ({ ...x, accountEmail: e.message }));
      setFormError(e instanceof Error ? e.message : tr('Something went wrong. Please try again.', 'Kuna hitilafu. Tafadhali jaribu tena.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECE5DA] px-4 pb-16">
      <header className="mx-auto flex max-w-3xl items-center justify-between py-5">
        <Link href="/" aria-label={tr('HEAL-Impact home', 'Mwanzo wa HEAL-Impact')}>
          <Image src="/images/heal-impact-logo.png" alt="HEAL-Impact" width={157} height={40} className="h-10 w-auto" />
        </Link>
        <LanguageToggle />
      </header>

      <main className="mx-auto max-w-3xl">
        {done ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#2C4A4E]" />
            <h1 className="mt-4 font-acme text-3xl text-[#2C4A4E]">{tr('Thank you for registering', 'Asante kwa kujisajili')}</h1>
            <p className="mt-2 text-gray-700">
              {tr(`${done} is now waiting for review. The HEAL team will check your details and call you. Once approved you can sign in and you will start receiving alerts for survivors near you.`, `${done} sasa linasubiri kukaguliwa. Timu ya HEAL itakagua taarifa zenu na kuwapigia simu. Mkiidhinishwa mtaweza kuingia na kuanza kupokea arifa za wahusika walio karibu nanyi.`)}
            </p>
            <Link href="/partners/login" className="mt-6 inline-block rounded-full bg-[#2C4A4E] px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg">
              {tr('Go to partner sign-in', 'Nenda kwa kuingia kwa washirika')}
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-6">
            <div>
              <h1 className="font-acme text-3xl text-[#2C4A4E] sm:text-4xl">{tr('Join the HEAL partner network', 'Jiunge na mtandao wa washirika wa HEAL')}</h1>
              <p className="mt-2 text-gray-700">
                {tr('For police gender desks, rescue centres, NGOs, CBOs, community health units (CHPs), health facilities, counsellors and legal aid providers. Register your organisation and where you work; when a survivor near you asks for help, you get the alert and can follow up.', 'Kwa madawati ya jinsia ya polisi, vituo vya uokoaji, NGO, CBO, vitengo vya afya ya jamii (CHP), vituo vya afya, washauri na watoa msaada wa kisheria. Sajilini shirika lenu na mahali mnapofanya kazi; mhusika aliye karibu nanyi akiomba msaada, mnapata arifa na mnaweza kufuatilia.')}
              </p>
            </div>

            {Object.keys(errors).length > 0 && (
              <p role="alert" className="rounded-2xl bg-[#F9EBEB] p-4 text-sm text-[#B34D4D]">{tr('Please fix the highlighted fields below.', 'Tafadhali rekebisha sehemu zilizoonyeshwa hapa chini.')}</p>
            )}

            <section className="rounded-3xl bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
              <PartnerForm value={org} onChange={setOrg} errors={errors as Partial<Record<keyof PartnerFields, string>>} />
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
              <h2 className="font-acme text-lg text-[#2C4A4E]">{tr('Your sign-in', 'Akaunti yako ya kuingia')}</h2>
              <p className="text-xs text-gray-600">{tr('The first staff account for your organisation. HEAL can add more later.', 'Akaunti ya kwanza ya mfanyakazi wa shirika lenu. HEAL inaweza kuongeza zaidi baadaye.')}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {([
                  ['accountName', tr('Your full name', 'Jina lako kamili'), 'text', 'name', account.name, (v: string) => setAccount({ ...account, name: v })],
                  ['accountEmail', tr('Work email', 'Barua pepe ya kazi'), 'email', 'email', account.email, (v: string) => setAccount({ ...account, email: v })],
                  ['password', tr('Password (10+ characters)', 'Nenosiri (herufi 10+)'), 'password', 'new-password', account.password, (v: string) => setAccount({ ...account, password: v })],
                  ['confirm', tr('Confirm password', 'Thibitisha nenosiri'), 'password', 'new-password', account.confirm, (v: string) => setAccount({ ...account, confirm: v })],
                ] as const).map(([key, label, type, auto, val, on]) => (
                  <label key={key}>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#2C4A4E]/80">{label} <span className="text-[#B34D4D]">*</span></span>
                    <input type={type} autoComplete={auto} value={val} onChange={(e) => on(e.target.value)} aria-invalid={!!errors[key]} className={`${fieldCls} ${errors[key] ? 'border-[#B34D4D]' : ''}`} />
                    {errors[key] && <span role="alert" className="mt-1 block text-xs text-[#B34D4D]">{errors[key]}</span>}
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
              <h2 className="flex items-center gap-2 font-acme text-lg text-[#2C4A4E]">
                <ShieldCheck className="h-5 w-5" /> {tr('Partner code of conduct', 'Kanuni za maadili za washirika')}
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {CONDUCT.map((c) => (
                  <li key={c.en}>{tr(c)}</li>
                ))}
              </ul>
              <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-xl p-3 -mx-3 text-sm font-medium text-[#2C4A4E] transition-colors hover:bg-[#2C4A4E]/5">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#2C4A4E]" />
                {tr('We agree to this code of conduct and confirm the details above are correct.', 'Tunakubali kanuni hizi za maadili na tunathibitisha taarifa zilizo hapo juu ni sahihi.')}
              </label>
              {errors.agree && <span role="alert" className="block text-xs text-[#B34D4D]">{errors.agree}</span>}
            </section>

            {formError && <p role="alert" className="rounded-2xl bg-[#F9EBEB] p-4 text-sm text-[#B34D4D]">{formError}</p>}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2C4A4E] py-4 font-acme text-lg font-bold text-white shadow-sm transition-all hover:-translate-y-1 hover:bg-[#2C4A4E]/90 hover:shadow-xl disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {busy && <Loader2 className="h-5 w-5 animate-spin" />}
              {tr('Register organisation', 'Sajili shirika')}
            </button>
            <p className="text-center text-sm text-gray-600">
              {tr('Already registered?', 'Tayari mmesajiliwa?')}{' '}
              <Link href="/partners/login" className="font-bold text-[#2C4A4E] hover:underline">{tr('Sign in', 'Ingia')}</Link>
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
