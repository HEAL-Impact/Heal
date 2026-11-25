// Validation and messages for sign-in and sign-up, in English and Kiswahili.
// Rules match the Go API (backend/internal/models RegisterRequest).
import type { L } from '@/lib/i18n';

export const NAME_MAX = 50;
export const PASSWORD_MIN = 8;
/** bcrypt only reads the first 72 bytes, so the API rejects longer passwords. */
export const PASSWORD_MAX_BYTES = 72;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Unicode letters (any language), plus spaces, hyphens, apostrophes and dots.
const NAME_RE = new RegExp("^\\p{L}[\\p{L}\\p{M}' .-]*$", 'u');
const LETTER_RE = new RegExp('\\p{L}', 'u');

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function emailError(raw: string): L | null {
  const email = raw.trim();
  if (!email) return { en: 'Enter your email address.', sw: 'Weka barua pepe yako.' };
  if (email.length > 254 || !EMAIL_RE.test(email)) return { en: 'Enter a valid email address, like name@example.com.', sw: 'Weka barua pepe sahihi, kama jina@mfano.com.' };
  return null;
}

// Common typos in email domains, so a mistyped address doesn't lock someone out.
const DOMAIN_FIXES: Record<string, string> = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com', 'gnail.com': 'gmail.com', 'yaho.com': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'yahoo.con': 'yahoo.com',
  'hotmial.com': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'outlok.com': 'outlook.com', 'outlook.co': 'outlook.com', 'icloud.co': 'icloud.com',
};

export function emailSuggestion(raw: string): string | null {
  const email = normalizeEmail(raw);
  const at = email.lastIndexOf('@');
  if (at < 1) return null;
  const fix = DOMAIN_FIXES[email.slice(at + 1)];
  return fix ? `${email.slice(0, at)}@${fix}` : null;
}

export function nameError(raw: string, which: 'first' | 'last'): L | null {
  const name = raw.trim();
  if (!name) return which === 'first' ? { en: 'Enter your first name.', sw: 'Weka jina lako la kwanza.' } : { en: 'Enter your last name.', sw: 'Weka jina lako la mwisho.' };
  if (name.length > NAME_MAX) return { en: `Use ${NAME_MAX} characters or fewer.`, sw: `Tumia herufi ${NAME_MAX} au chache.` };
  if (!NAME_RE.test(name)) return { en: 'Use letters only (spaces, hyphens and apostrophes are fine).', sw: 'Tumia herufi tu (nafasi, vistari na alama ya \' zinakubalika).' };
  return null;
}

export interface PasswordCheck {
  id: string;
  ok: boolean;
  label: L;
}

export function passwordChecks(password: string, email: string): PasswordCheck[] {
  const bytes = new TextEncoder().encode(password).length;
  const local = normalizeEmail(email).split('@')[0];
  return [
    { id: 'length', ok: password.length >= PASSWORD_MIN, label: { en: `At least ${PASSWORD_MIN} characters`, sw: `Angalau herufi ${PASSWORD_MIN}` } },
    { id: 'letter', ok: LETTER_RE.test(password), label: { en: 'A letter', sw: 'Herufi' } },
    { id: 'number', ok: /\d/.test(password), label: { en: 'A number', sw: 'Namba' } },
    {
      id: 'personal',
      ok: password.length > 0 && bytes <= PASSWORD_MAX_BYTES && !(local.length >= 3 && password.toLowerCase().includes(local)),
      label: { en: 'Not your email, and not too long', sw: 'Si barua pepe yako, na si refu mno' },
    },
  ];
}

export function signUpPasswordError(password: string, email: string): L | null {
  if (!password) return { en: 'Create a password.', sw: 'Tengeneza nenosiri.' };
  if (password.trim() !== password) return { en: 'Remove spaces at the start or end of your password.', sw: 'Ondoa nafasi mwanzoni au mwishoni mwa nenosiri.' };
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) return { en: 'Use a shorter password (72 characters at most).', sw: 'Tumia nenosiri fupi zaidi (herufi 72 zaidi).' };
  if (passwordChecks(password, email).some((c) => !c.ok)) return { en: 'Your password does not meet all the rules below.', sw: 'Nenosiri lako halitimizi masharti yote hapa chini.' };
  return null;
}

/** A message for an error code from lib/auth (API codes plus network ones). */
export function authErrorMessage(code: string | undefined, retryAfter?: number): L {
  switch (code) {
    case 'invalid_credentials':
      return { en: 'That email and password don’t match an account. Check them and try again.', sw: 'Barua pepe na nenosiri hilo havilingani na akaunti yoyote. Viangalie ujaribu tena.' };
    case 'email_taken':
      return { en: 'An account with this email already exists.', sw: 'Akaunti yenye barua pepe hii tayari ipo.' };
    case 'too_many_attempts': {
      const mins = Math.max(1, Math.ceil((retryAfter ?? 900) / 60));
      return { en: `Too many attempts. For your safety, please wait ${mins} minute${mins === 1 ? '' : 's'} and try again.`, sw: `Majaribio mengi mno. Kwa usalama wako, tafadhali subiri dakika ${mins} kisha ujaribu tena.` };
    }
    case 'password_mismatch':
      return { en: 'The passwords don’t match.', sw: 'Manenosiri hayalingani.' };
    case 'invalid_input':
      return { en: 'Some details aren’t valid. Please check the form.', sw: 'Baadhi ya taarifa si sahihi. Tafadhali angalia fomu.' };
    case 'offline':
      return { en: 'You’re offline. Connect to the internet and try again.', sw: 'Huna mtandao. Unganisha intaneti ujaribu tena.' };
    case 'timeout':
      return { en: 'The server took too long to answer. Please try again in a moment.', sw: 'Seva imechukua muda mrefu kujibu. Tafadhali jaribu tena baada ya muda mfupi.' };
    case 'network':
      return { en: 'We couldn’t reach HEAL. Check your connection and try again.', sw: 'Hatukuweza kufikia HEAL. Angalia mtandao wako ujaribu tena.' };
    default:
      return { en: 'Something went wrong on our side. Please try again.', sw: 'Kuna hitilafu upande wetu. Tafadhali jaribu tena.' };
  }
}

/** Only follow internal paths after sign-in (no open redirects). */
export function safeNext(next: string | null, fallback = '/dashboard'): string {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') && !next.startsWith('/auth') ? next : fallback;
}
