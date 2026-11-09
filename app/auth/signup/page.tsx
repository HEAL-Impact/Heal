'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Circle, Loader2 } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { FormNotice, PasswordField, TextField } from '@/components/auth/AuthFields';
import { useAuth } from '@/hooks/use-auth';
import { useCountdown, useOnline, useSlowRequest } from '@/hooks/use-auth-form';
import {
  NAME_MAX,
  authErrorMessage,
  emailError,
  emailSuggestion,
  nameError,
  normalizeEmail,
  passwordChecks,
  safeNext,
  signUpPasswordError,
} from '@/lib/auth-validation';
import { useLang, type L } from '@/lib/i18n';

type Field = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword' | 'consent';
const ORDER: Field[] = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'consent'];

function SignUpForm() {
  const { tr } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', consent: false });
  const [errors, setErrors] = useState<Partial<Record<Field, L | null>>>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [formError, setFormError] = useState<{ code?: string; message: L } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const online = useOnline();
  const slow = useSlowRequest(submitting);
  const [lockedFor, startLock] = useCountdown();
  const refs = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});

  useEffect(() => {
    const e = params.get('email');
    if (e) setForm((f) => ({ ...f, email: e }));
  }, [params]);

  useEffect(() => {
    if (isAuthenticated && !authLoading && !submitting) router.replace(next);
  }, [isAuthenticated, authLoading, submitting, router, next]);

  const check = (field: Field, f = form): L | null => {
    switch (field) {
      case 'firstName':
        return nameError(f.firstName, 'first');
      case 'lastName':
        return nameError(f.lastName, 'last');
      case 'email':
        return emailError(f.email);
      case 'password':
        return signUpPasswordError(f.password, f.email);
      case 'confirmPassword':
        if (!f.confirmPassword) return { en: 'Type your password again.', sw: 'Andika nenosiri lako tena.' };
        return f.confirmPassword === f.password ? null : { en: 'The passwords don’t match.', sw: 'Manenosiri hayalingani.' };
      case 'consent':
        return f.consent ? null : { en: 'Please agree to the terms and privacy policy to continue.', sw: 'Tafadhali kubali masharti na sera ya faragha ili kuendelea.' };
    }
  };

  const update = (field: Field, value: string | boolean) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    // Re-check fields already shown as wrong, so errors clear as soon as they're fixed.
    const recheck: Field[] = [field];
    if (field === 'password' && touched.confirmPassword) recheck.push('confirmPassword');
    if (field === 'email' && touched.password) recheck.push('password');
    setErrors((prev) => {
      const out = { ...prev };
      for (const f of recheck) if (prev[f] || (f !== field && touched[f])) out[f] = check(f, nextForm);
      if (field === 'consent') out.consent = check('consent', nextForm);
      return out;
    });
  };

  const blur = (field: Field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const raw = form[field];
    if (typeof raw === 'string' && raw === '' && field !== 'confirmPassword') return; // don't nag on an untouched empty field
    setErrors((e) => ({ ...e, [field]: check(field) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || lockedFor > 0) return;
    setFormError(null);
    const all = Object.fromEntries(ORDER.map((f) => [f, check(f)])) as Record<Field, L | null>;
    setErrors(all);
    setTouched(Object.fromEntries(ORDER.map((f) => [f, true])));
    const first = ORDER.find((f) => all[f]);
    if (first) {
      refs.current[first]?.focus();
      return;
    }
    if (!online) {
      setFormError({ code: 'offline', message: authErrorMessage('offline') });
      return;
    }

    setSubmitting(true);
    const result = await register({
      email: normalizeEmail(form.email),
      password: form.password,
      confirmPassword: form.confirmPassword,
      firstName: form.firstName.trim().replace(/\s+/g, ' '),
      lastName: form.lastName.trim().replace(/\s+/g, ' '),
    });
    if (result.success) {
      router.replace(next);
      return;
    }
    setSubmitting(false);
    if (result.code === 'too_many_attempts') startLock(result.retryAfter ?? 3600);
    if (result.code === 'email_taken') {
      setErrors((x) => ({ ...x, email: authErrorMessage('email_taken') }));
      refs.current.email?.focus();
    }
    if (result.code === 'password_mismatch') setErrors((x) => ({ ...x, confirmPassword: authErrorMessage('password_mismatch') }));
    setFormError({ code: result.code, message: authErrorMessage(result.code, result.retryAfter) });
  };

  if (authLoading && !submitting) return <AuthShell loading>{null}</AuthShell>;

  const suggestion = emailSuggestion(form.email);
  const checks = passwordChecks(form.password, form.email);
  const err = (f: Field) => (errors[f] ? tr(errors[f]!) : null);
  const disabled = submitting;

  return (
    <AuthShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#2C4A4E] font-acme mb-1">{tr('Welcome To HEAL!', 'Karibu HEAL!')}</h1>
        <p className="text-[#2C4A4E] font-medium opacity-80">{tr('Create an account to save your conversations, check-ins and safety plan.', 'Fungua akaunti kuhifadhi mazungumzo yako, ukaguzi na mpango wako wa usalama.')}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {!online && <FormNotice tone="info">{tr('You’re offline. You can create your account once you’re connected again.', 'Huna mtandao. Utaweza kufungua akaunti ukiunganishwa tena.')}</FormNotice>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            ref={(el) => { refs.current.firstName = el; }}
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            maxLength={NAME_MAX + 10}
            label={tr('First Name', 'Jina la Kwanza')}
            placeholder={tr('First name', 'Jina la kwanza')}
            value={form.firstName}
            disabled={disabled}
            onChange={(e) => update('firstName', e.target.value)}
            onBlur={() => blur('firstName')}
            error={err('firstName')}
          />
          <TextField
            ref={(el) => { refs.current.lastName = el; }}
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            maxLength={NAME_MAX + 10}
            label={tr('Last Name', 'Jina la Mwisho')}
            placeholder={tr('Last name', 'Jina la mwisho')}
            value={form.lastName}
            disabled={disabled}
            onChange={(e) => update('lastName', e.target.value)}
            onBlur={() => blur('lastName')}
            error={err('lastName')}
          />
        </div>
        <p className="-mt-3 text-xs text-gray-600">{tr('You can use a nickname. Only you see it.', 'Unaweza kutumia jina la utani. Ni wewe tu unayeliona.')}</p>

        <TextField
          ref={(el) => { refs.current.email = el; }}
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={254}
          label={tr('Email Address', 'Barua Pepe')}
          placeholder={tr('Enter your email address', 'Weka barua pepe yako')}
          value={form.email}
          disabled={disabled}
          onChange={(e) => update('email', e.target.value)}
          onBlur={() => blur('email')}
          error={err('email')}
          hint={
            suggestion ? (
              <span>
                {tr('Did you mean', 'Ulimaanisha')}{' '}
                <button type="button" className="rounded font-semibold text-[#2C4A4E] underline underline-offset-2 transition-colors hover:bg-[#2C4A4E]/10" onClick={() => update('email', suggestion)}>{suggestion}</button>?
              </span>
            ) : (
              tr('Use an email only you can open. We never email anything about what you share.', 'Tumia barua pepe ambayo ni wewe tu unaweza kufungua. Hatutumi barua pepe kuhusu unachoshiriki.')
            )
          }
        />
        {formError?.code === 'email_taken' && (
          <p className="-mt-3 text-sm text-[#2C4A4E]">
            <Link href={`/auth/signin?email=${encodeURIComponent(normalizeEmail(form.email))}${params.get('next') ? `&next=${encodeURIComponent(next)}` : ''}`} className="rounded font-semibold text-[#2C4A4E] underline underline-offset-2 transition-colors hover:bg-[#2C4A4E]/10">
              {tr('Sign in with this email instead', 'Ingia kwa barua pepe hii badala yake')}
            </Link>
          </p>
        )}

        <PasswordField
          ref={(el) => { refs.current.password = el; }}
          id="password"
          name="password"
          autoComplete="new-password"
          maxLength={200}
          label={tr('Password', 'Nenosiri')}
          placeholder={tr('Create a password', 'Tengeneza nenosiri')}
          value={form.password}
          disabled={disabled}
          onChange={(e) => update('password', e.target.value)}
          onBlur={() => blur('password')}
          error={err('password')}
          hint={
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-xs" aria-label={tr('Password rules', 'Masharti ya nenosiri')}>
              {checks.map((c) => (
                <li key={c.id} className={`flex items-center gap-1.5 transition-colors duration-300 ${c.ok ? 'text-[#2C4A4E] font-semibold' : 'text-gray-600'}`}>
                  {c.ok ? <Check className="h-3.5 w-3.5 animate-in zoom-in duration-300" aria-hidden="true" /> : <Circle className="h-3 w-3" aria-hidden="true" />}
                  <span>{tr(c.label)}</span>
                  <span className="sr-only">{c.ok ? tr('(done)', '(imetimia)') : tr('(not yet)', '(bado)')}</span>
                </li>
              ))}
            </ul>
          }
        />

        <PasswordField
          ref={(el) => { refs.current.confirmPassword = el; }}
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          maxLength={200}
          label={tr('Confirm Password', 'Thibitisha Nenosiri')}
          placeholder={tr('Type your password again', 'Andika nenosiri lako tena')}
          value={form.confirmPassword}
          disabled={disabled}
          onPaste={(e) => e.preventDefault()}
          onChange={(e) => update('confirmPassword', e.target.value)}
          onBlur={() => blur('confirmPassword')}
          error={err('confirmPassword')}
        />

        <div className="space-y-1">
          <label className="flex items-start gap-2 rounded-xl p-3 -mx-3 text-sm text-[#2C4A4E] font-medium cursor-pointer transition-colors duration-200 hover:bg-[#2C4A4E]/5">
            <input
              ref={(el) => { refs.current.consent = el; }}
              type="checkbox"
              name="consent"
              checked={form.consent}
              disabled={disabled}
              onChange={(e) => update('consent', e.target.checked)}
              aria-invalid={!!errors.consent}
              aria-describedby={errors.consent ? 'consent-error' : undefined}
              className="mt-0.5 h-4 w-4 cursor-pointer accent-[#2C4A4E] transition-transform hover:scale-110"
            />
            <span>
              {tr('I agree to the Terms and the', 'Ninakubali Masharti na')}{' '}
              <Link href="/privacy" target="_blank" className="underline hover:opacity-80">{tr('Privacy Policy', 'Sera ya Faragha')}</Link>
              {tr(', and I am 18 or older, or have permission from a trusted adult.', ', na nina miaka 18 au zaidi, au nina ruhusa kutoka kwa mtu mzima ninayemwamini.')}
            </span>
          </label>
          {errors.consent && <p id="consent-error" role="alert" className="text-sm text-[#B34D4D]">{tr(errors.consent)}</p>}
        </div>

        {formError && formError.code !== 'email_taken' && (
          <FormNotice tone="error" title={tr('We couldn’t create your account', 'Hatukuweza kufungua akaunti yako')}>
            <p>{tr(formError.message)}</p>
            {formError.code === 'too_many_attempts' && lockedFor > 0 && (
              <p className="mt-1 text-xs">{tr(`You can try again in ${Math.ceil(lockedFor / 60)} min.`, `Unaweza kujaribu tena baada ya dakika ${Math.ceil(lockedFor / 60)}.`)}</p>
            )}
          </FormNotice>
        )}

        {slow && <FormNotice tone="info">{tr('Still working… the server may be waking up. This can take up to a minute.', 'Bado inashughulikia… seva huenda inaamka. Hii inaweza kuchukua hadi dakika moja.')}</FormNotice>}

        <button
          type="submit"
          className="w-full py-4 bg-[#2C4A4E] text-white rounded-2xl font-bold font-acme text-lg shadow-sm transition-all duration-300 hover:bg-[#2C4A4E]/90 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A4E] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm motion-reduce:transition-none motion-reduce:transform-none"
          disabled={submitting || lockedFor > 0}
          aria-busy={submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {tr('Creating your account...', 'Inafungua akaunti yako...')}
            </span>
          ) : lockedFor > 0 ? (
            tr(`Try again in ${Math.ceil(lockedFor / 60)} min`, `Jaribu tena baada ya dakika ${Math.ceil(lockedFor / 60)}`)
          ) : (
            tr('Create Account', 'Fungua Akaunti')
          )}
        </button>

        <p className="text-center text-sm font-medium text-gray-600">
          {tr('Already have an account?', 'Tayari una akaunti?')}{' '}
          <Link href={`/auth/signin${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-[#2C4A4E] font-bold underline-offset-4 decoration-2 transition-colors hover:underline hover:text-[#2C4A4E]/80">{tr('Sign in', 'Ingia')}</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
