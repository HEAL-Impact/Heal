import type { Band, PresentationMode } from './ptsd-instrument';

// On-device storage for screenings. Everything is written here first; the
// backend only ever receives copies (see sync.ts), so a screening works with
// no connection at all.

// 'local'   – guest screening, stays on this device until the person signs in and claims it
// 'pending' – belongs to a signed-in user, waiting to be sent to the backend
// 'synced'  – the backend has it
export type SyncStatus = 'local' | 'pending' | 'synced';

export interface LocalScreening {
  id: string;
  instrument: string;
  mode: PresentationMode;
  county: string | null;
  answers: number[];
  totalScore: number;
  band: Band;
  completedAt: string;
  ownerUserId: string | null;
  syncStatus: SyncStatus;
  syncedAt?: string;
  lastError?: string;
}

export type FlowStep = 'intro' | 'mode' | 'consent' | 'questions' | 'result';

export interface ScreeningDraft {
  key: string; // 'guest' or the signed-in user's id
  step: FlowStep;
  mode: PresentationMode | null;
  county: string | null;
  answers: (number | null)[];
  currentIndex: number;
  resultId: string | null;
  updatedAt: string;
}

const DB_NAME = 'heal-offline';
const DB_VERSION = 1;
const SCREENINGS = 'screenings';
const DRAFTS = 'drafts';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(SCREENINGS)) db.createObjectStore(SCREENINGS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(DRAFTS)) db.createObjectStore(DRAFTS, { keyPath: 'key' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }
  return dbPromise;
}

async function run<T>(store: string, mode: IDBTransactionMode, op: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = op(db.transaction(store, mode).objectStore(store));
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
  });
}

export function newScreeningId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // Fallback for non-secure contexts (plain http on a LAN IP).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export const offlineStore = {
  saveScreening: (screening: LocalScreening) => run<IDBValidKey>(SCREENINGS, 'readwrite', (s) => s.put(screening)),
  getScreening: (id: string) => run<LocalScreening | undefined>(SCREENINGS, 'readonly', (s) => s.get(id)),
  allScreenings: () => run<LocalScreening[]>(SCREENINGS, 'readonly', (s) => s.getAll()),

  getDraft: (key: string) => run<ScreeningDraft | undefined>(DRAFTS, 'readonly', (s) => s.get(key)),
  saveDraft: (draft: ScreeningDraft) => run<IDBValidKey>(DRAFTS, 'readwrite', (s) => s.put(draft)),
  deleteDraft: (key: string) => run<undefined>(DRAFTS, 'readwrite', (s) => s.delete(key)),
};
