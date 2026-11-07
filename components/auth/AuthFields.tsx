'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useLang } from '@/lib/i18n';

const inputBase =
  'w-full px-4 py-3 rounded-xl border outline-none text-base lg:text-lg bg-[#ECE5DA]/60 transition-all duration-200 hover:border-[#2C4A4E]/50 hover:bg-white focus:bg-white focus:border-[#2C4A4E] focus:ring-2 focus:ring-[#2C4A4E]/30 focus:shadow-md disabled:opacity-60 motion-reduce:transition-none';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string | null;
  hint?: React.ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField({ id, label, error, hint, className, ...rest }, ref) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-base lg:text-lg font-normal text-[#2C4A4E]">{label}</label>
      <input
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${inputBase} ${error ? 'border-[#B34D4D]' : 'border-gray-200'} ${className ?? ''}`}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-[#B34D4D]">{error}</p>
      ) : hint ? (
        <div id={`${id}-hint`} className="text-xs text-gray-600">{hint}</div>
      ) : null}
    </div>
  );
});

/** Password input with show/hide and a Caps Lock warning. */
export const PasswordField = forwardRef<HTMLInputElement, FieldProps>(function PasswordField({ id, label, error, hint, ...rest }, ref) {
  const { tr } = useLang();
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const checkCaps = (e: React.KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState?.('CapsLock') ?? false);
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-base lg:text-lg font-normal text-[#2C4A4E]">{label}</label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={show ? 'text' : 'password'}
          aria-invalid={!!error}
          aria-describedby={[error ? `${id}-error` : '', hint ? `${id}-hint` : '', caps ? `${id}-caps` : ''].filter(Boolean).join(' ') || undefined}
          onKeyUp={checkCaps}
          onKeyDown={checkCaps}
          onBlur={() => setCaps(false)}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={`${inputBase} pr-12 ${error ? 'border-[#B34D4D]' : 'border-gray-200'}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? tr('Hide password', 'Ficha nenosiri') : tr('Show password', 'Onyesha nenosiri')}
          aria-pressed={show}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#2C4A4E] opacity-70 transition-all duration-200 hover:opacity-100 hover:bg-[#2C4A4E]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A4E]"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {caps && (
        <p id={`${id}-caps`} className="text-xs font-semibold text-[#2C4A4E]">{tr('Caps Lock is on.', 'Caps Lock imewashwa.')}</p>
      )}
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-[#B34D4D]">{error}</p>}
      {hint && <div id={`${id}-hint`}>{hint}</div>}
    </div>
  );
});

/** Banner for the whole form: errors, offline, slow server. */
export function FormNotice({ tone, title, children }: { tone: 'error' | 'info'; title?: string; children: React.ReactNode }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-lg px-4 py-3 text-sm ${tone === 'error' ? 'border border-[#B34D4D]/30 bg-[#F9EBEB] text-[#B34D4D]' : 'border border-[#2C4A4E]/20 bg-[#ECE5DA] text-[#2C4A4E]'}`}
    >
      {title && <p className="font-semibold">{title}</p>}
      <div>{children}</div>
    </div>
  );
}
