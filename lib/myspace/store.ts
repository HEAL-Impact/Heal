// "My Space": everything a survivor chooses to keep, stored only on this device.
// Nothing here is sent anywhere. Storage can be blocked (private mode, cleared
// site data), so every read falls back to an empty value and every write is
// best-effort.

const KEY = 'heal.myspace.v1';
const SCREENING_DB = 'heal-offline'; // lib/screening/offline-store.ts

export type Mood = 1 | 2 | 3 | 4; // struggling, low, okay, good

export interface CheckIn {
  date: string; // ISO
  mood: Mood;
}

export interface SavedCase {
  code: string;
  status: 'waiting' | 'received' | 'accepted' | 'contacted' | 'seen' | 'closed' | 'stopped';
  savedAt: string;
}

export interface SelfCheck {
  tool: string; // instrument id
  toolName: string;
  score: number;
  band: string;
  bandLabel: string;
  urgent: boolean;
  date: string;
}

export interface SafetyPlan {
  warningSigns: string;
  safePeople: { name: string; phone: string }[];
  safePlaces: string;
  copingSteps: string;
  goBag: Record<string, boolean>;
}

export interface MySpaceData {
  nickname: string;
  pinHash: string | null;
  checkIns: CheckIn[];
  cases: SavedCase[];
  selfChecks: SelfCheck[];
  safetyPlan: SafetyPlan;
  reminder: 'off' | 'weekly' | 'every3days';
}

// The English text is the stored key, so saved ticks survive a language switch.
export const GO_BAG_ITEMS: { key: string; sw: string }[] = [
  { key: 'ID card or birth certificate', sw: 'Kitambulisho au cheti cha kuzaliwa' },
  { key: 'Phone and charger', sw: 'Simu na chaja' },
  { key: 'Some money or M-Pesa PIN you remember', sw: 'Pesa kidogo au PIN ya M-Pesa unayoikumbuka' },
  { key: 'Medicines', sw: 'Dawa' },
  { key: 'Spare keys', sw: 'Funguo za ziada' },
  { key: 'Important documents (copies)', sw: 'Nakala za hati muhimu' },
  { key: 'Clothes for a few days', sw: 'Nguo za siku chache' },
  { key: 'Children’s items, if they come with you', sw: 'Vitu vya watoto, kama wataenda nawe' },
];
export const EMPTY: MySpaceData = {
  nickname: '',
  pinHash: null,
  checkIns: [],
  cases: [],
  selfChecks: [],
  safetyPlan: { warningSigns: '', safePeople: [], safePlaces: '', copingSteps: '', goBag: {} },
  reminder: 'off',
};

const listeners = new Set<() => void>();

export function onMySpaceChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadMySpace(): MySpaceData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const data = JSON.parse(raw) as Partial<MySpaceData>;
    return { ...EMPTY, ...data, safetyPlan: { ...EMPTY.safetyPlan, ...(data.safetyPlan ?? {}) } };
  } catch {
    return EMPTY;
  }
}

export function updateMySpace(change: (data: MySpaceData) => MySpaceData): MySpaceData {
  const next = change(loadMySpace());
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* best-effort */
  }
  listeners.forEach((l) => l());
  return next;
}

export const addCheckIn = (mood: Mood) =>
  updateMySpace((d) => ({ ...d, checkIns: [...d.checkIns, { date: new Date().toISOString(), mood }].slice(-120) }));

export const saveCaseCode = (code: string, status: SavedCase['status']) =>
  updateMySpace((d) => {
    const others = d.cases.filter((c) => c.code !== code);
    const existing = d.cases.find((c) => c.code === code);
    return { ...d, cases: [{ code, status, savedAt: existing?.savedAt ?? new Date().toISOString() }, ...others] };
  });

export const saveSelfCheck = (check: SelfCheck) =>
  updateMySpace((d) => ({ ...d, selfChecks: [check, ...d.selfChecks].slice(0, 50) }));

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`heal-myspace:${text}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function setPin(pin: string | null) {
  const pinHash = pin ? await sha256(pin) : null;
  updateMySpace((d) => ({ ...d, pinHash }));
}

export async function checkPin(pin: string): Promise<boolean> {
  const { pinHash } = loadMySpace();
  return !pinHash || pinHash === (await sha256(pin));
}

/** Deletes everything HEAL keeps on this device, including saved screenings. */
export async function deleteEverything(): Promise<void> {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('heal'))
      .forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
  await new Promise<void>((resolve) => {
    try {
      const req = indexedDB.deleteDatabase(SCREENING_DB);
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    } catch {
      resolve();
    }
  });
  listeners.forEach((l) => l());
}

/** A gentle sentence about recent check-ins, in words rather than numbers. */
export function trendInWords(checkIns: CheckIn[], lang: 'en' | 'sw' = 'en'): string | null {
  const say = (en: string, sw: string) => (lang === 'sw' ? sw : en);
  if (checkIns.length < 3) return null;
  const now = Date.now();
  const recent = checkIns.filter((c) => now - Date.parse(c.date) < 14 * 864e5);
  const earlier = checkIns.filter((c) => {
    const age = now - Date.parse(c.date);
    return age >= 14 * 864e5 && age < 60 * 864e5;
  });
  const avg = (xs: CheckIn[]) => xs.reduce((s, c) => s + c.mood, 0) / xs.length;
  if (!recent.length) return null;
  if (!earlier.length) {
    return avg(recent) >= 3
      ? say('Your recent check-ins have mostly felt okay or better.', 'Ukaguzi wako wa hivi karibuni umekuwa mzuri kiasi au bora zaidi.')
      : say(
          'Your recent check-ins have been heavy. Be gentle with yourself; support is here when you want it.',
          'Ukaguzi wako wa hivi karibuni umekuwa mzito. Jihurumie; msaada upo unapouhitaji.'
        );
  }
  const diff = avg(recent) - avg(earlier);
  if (diff > 0.4) return say('Things seem a little lighter than a few weeks ago.', 'Mambo yanaonekana mepesi kidogo kuliko wiki chache zilizopita.');
  if (diff < -0.4)
    return say(
      'Things seem heavier than a few weeks ago. It might help to talk to someone.',
      'Mambo yanaonekana mazito kuliko wiki chache zilizopita. Huenda ikasaidia kuongea na mtu.'
    );
  return say('Your check-ins have been fairly steady lately.', 'Ukaguzi wako umekuwa thabiti hivi karibuni.');
}
