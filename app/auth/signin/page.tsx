'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { FormNotice, PasswordField, TextField } from '@/components/auth/AuthFields';
import { useAuth } from '@/hooks/use-auth';
import { useOnline, useSlowRequest, useCountdown } from '@/hooks/use-auth-form';
import { authErrorMessage, emailError, emailSuggestion, normalizeEmail, safeNext } from '@/lib/auth-validation';
import { useLang, type L } from '@/lib/i18n';

function SignInForm() {
  const { tr } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: L | null; password?: L | null }>({});
  const [formError, setFormError] = useState<{ code?: string; message: L } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const online = useOnline();
  const slow = useSlowRequest(submitting);
  const [lockedFor, startLock] = useCountdown();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Read URL params after mount (static export) to prefill the email.
  useEffect(() => {
    const e = params.get('email');
    if (e) setEmail(e);
    if (params.get('reason') === 'expired') setFormError({ code: 'session_expired', message: { en: 'Your session ended. Please sign in again.', sw: 'Muda wako wa kuingia umeisha. Tafadhali ingia tena.' } });
  }, [params]);

  // Already signed in: go straight on.
  useEffect(() => {
    if (isAuthenticated && !authLoading && !submitting) router.replace(next);
  }, [isAuthenticated, authLoading, submitting, router, next]);

  const suggestion = emailSuggestion(email);

  const validate = () => {
    const errs = {
      email: emailError(email),
      password: password ? null : ({ en: 'Enter your password.', sw: 'Weka nenosiri lako.' } as L),
    };
    setFieldErrors(errs);
    if (errs.email) emailRef.current?.focus();
    else if (errs.password) passwordRef.current?.focus();
    return !errs.email && !errs.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || lockedFor > 0) return;
    setFormError(null);
    if (!validate()) return;
    if (!online) {
      setFormError({ code: 'offline', message: authErrorMessage('offline') });
      return;
    }

    setSubmitting(true);
    const result = await login(normalizeEmail(email), password);
    if (result.success) {
      router.replace(next);
      return;
    }
    setSubmitting(false);
    if (result.code === 'too_many_attempts') startLock(result.retryAfter ?? 900);
    if (result.code === 'invalid_credentials') {
      setPassword('');
      passwordRef.current?.focus();
    }
    setFormError({ code: result.code, message: authErrorMessage(result.code, result.retryAfter) });
  };

  if (authLoading && !submitting) return <AuthShell loading>{null}</AuthShell>;

  return (
    <AuthShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#2C4A4E] font-acme mb-1">{tr('Welcome back!', 'Karibu tena!')}</h1>
        <p className="text-[#2C4A4E] font-medium opacity-80">{tr('Sign in to see your conversations, check-ins and safety plan.', 'Ingia kuona mazungumzo yako, ukaguzi na mpango wako wa usalama.')}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {!online && (
          <FormNotice tone="info">{tr('You’re offline. You can sign in once you’re connected again.', 'Huna mtandao. Utaweza kuingia ukiunganishwa tena.')}</FormNotice>
        )}

        <TextField
          ref={emailRef}
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
          value={email}
          disabled={submitting}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
          }}
          onBlur={() => email && setFieldErrors((f) => ({ ...f, email: emailError(email) }))}
          error={fieldErrors.email ? tr(fieldErrors.email) : null}
          hint={
            suggestion ? (
              <span>
                {tr('Did you mean', 'Ulimaanisha')}{' '}
                <button type="button" className="rounded font-semibold text-[#2C4A4E] underline underline-offset-2 transition-colors hover:bg-[#2C4A4E]/10" onClick={() => setEmail(suggestion)}>{suggestion}</button>?
              </span>
            ) : undefined
          }
        />

        <PasswordField
          ref={passwordRef}
          id="password"
          name="password"
          autoComplete="current-password"
          maxLength={200}
          label={tr('Password', 'Nenosiri')}
          placeholder={tr('Enter your password', 'Weka nenosiri lako')}
          value={password}
          disabled={submitting}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
          }}
          error={fieldErrors.password ? tr(fieldErrors.password) : null}
        />

        {formError && (
          <FormNotice tone="error" title={tr('We couldn’t sign you in', 'Hatukuweza kukuingiza')}>
            <p>{tr(formError.message)}</p>
            {formError.code === 'too_many_attempts' && lockedFor > 0 && (
              <p className="mt-1 text-xs">{tr(`You can try again in ${Math.ceil(lockedFor / 60)} min.`, `Unaweza kujaribu tena baada ya dakika ${Math.ceil(lockedFor / 60)}.`)}</p>
            )}
            {formError.code === 'invalid_credentials' && (
              <p className="mt-2 text-xs text-[#2C4A4E]">
                {tr('New to HEAL?', 'Mgeni HEAL?')}{' '}
                <Link href={`/auth/signup?email=${encodeURIComponent(normalizeEmail(email))}`} className="font-semibold underline hover:opacity-80">{tr('Create an account', 'Fungua akaunti')}</Link>
              </p>
            )}
          </FormNotice>
        )}

        {slow && (
          <FormNotice tone="info">{tr('Still working… the server may be waking up. This can take up to a minute.', 'Bado inashughulikia… seva huenda inaamka. Hii inaweza kuchukua hadi dakika moja.')}</FormNotice>
        )}

        <button
          type="submit"
          className="w-full py-4 bg-[#2C4A4E] text-white rounded-2xl font-bold font-acme text-lg shadow-sm transition-all duration-300 hover:bg-[#2C4A4E]/90 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A4E] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm motion-reduce:transition-none motion-reduce:transform-none"
          disabled={submitting || lockedFor > 0}
          aria-busy={submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {tr('Signing in...', 'Inaingia...')}
            </span>
          ) : lockedFor > 0 ? (
            tr(`Try again in ${Math.ceil(lockedFor / 60)} min`, `Jaribu tena baada ya dakika ${Math.ceil(lockedFor / 60)}`)
          ) : (
            tr('Sign in', 'Ingia')
          )}
        </button>

        <p className="text-center text-xs text-gray-600">
          {tr('Forgot your password? Email', 'Umesahau nenosiri? Tuma barua pepe kwa')}{' '}
          <a href="mailto:info@heal-impact.org?subject=Password%20help" className="rounded font-semibold text-[#2C4A4E] underline underline-offset-2 transition-colors hover:bg-[#2C4A4E]/10">info@heal-impact.org</a>{' '}
          {tr('from the address you signed up with and we’ll help you back in.', 'kutoka kwa anwani uliyojisajili nayo na tutakusaidia kuingia tena.')}
        </p>

        <p className="text-center text-sm font-medium text-gray-600">
          {tr('Don’t have an account?', 'Huna akaunti?')}{' '}
          <Link href={`/auth/signup${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-[#2C4A4E] font-bold underline-offset-4 decoration-2 transition-colors hover:underline hover:text-[#2C4A4E]/80">{tr('Create one', 'Fungua akaunti')}</Link>
        </p>
        <p className="text-center text-xs text-gray-500">
          {tr('On a shared phone? Use', 'Unatumia simu ya pamoja? Tumia')}{' '}
          <Link href="/anonymous" className="underline hover:opacity-80">{tr('anonymous mode', 'hali ya bila jina')}</Link>{' '}
          {tr('or sign out when you finish.', 'au utoke ukimaliza.')}
        </p>
      </form>
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
