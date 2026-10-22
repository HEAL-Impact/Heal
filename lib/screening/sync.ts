import { apiClient } from '@/lib/api';
import { offlineStore, type LocalScreening } from './offline-store';

// Outbox drain for signed-in users' screenings: one drain at a time, retried
// with exponential backoff and whenever the browser comes back online.
// Guest screenings ('local') are never sent; claimGuestScreenings() turns them
// into 'pending' once their owner signs in on this device and agrees.

const BASE_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

let draining = false;
let retryCount = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

/** Subscribe to local screening changes (saved, claimed, synced). */
export function onScreeningsChanged(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function scheduleRetry(userId: string) {
  if (retryTimer) clearTimeout(retryTimer);
  const delay = Math.min(BASE_BACKOFF_MS * 2 ** retryCount, MAX_BACKOFF_MS);
  retryCount += 1;
  retryTimer = setTimeout(() => void drainScreenings(userId), delay);
}

export async function drainScreenings(userId: string): Promise<void> {
  if (draining) return;
  draining = true;
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;

  try {
    const pending = (await offlineStore.allScreenings()).filter(
      (s) => s.ownerUserId === userId && s.syncStatus === 'pending'
    );
    for (const screening of pending) {
      const { error } = await apiClient.createScreening({
        id: screening.id,
        instrument: screening.instrument,
        mode: screening.mode,
        county: screening.county,
        answers: screening.answers,
        completedAt: screening.completedAt,
      });
      if (error) {
        await offlineStore.saveScreening({ ...screening, lastError: error });
        notify();
        scheduleRetry(userId);
        return;
      }
      await offlineStore.saveScreening({
        ...screening,
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
        lastError: undefined,
      });
      notify();
    }
    retryCount = 0;
  } finally {
    draining = false;
  }
}

export async function saveCompletedScreening(screening: LocalScreening): Promise<void> {
  await offlineStore.saveScreening(screening);
  notify();
  if (screening.ownerUserId) void drainScreenings(screening.ownerUserId);
}

export async function unclaimedGuestScreenings(): Promise<LocalScreening[]> {
  return (await offlineStore.allScreenings()).filter((s) => s.ownerUserId === null);
}

export async function claimGuestScreenings(userId: string): Promise<void> {
  for (const screening of await unclaimedGuestScreenings()) {
    await offlineStore.saveScreening({ ...screening, ownerUserId: userId, syncStatus: 'pending' });
  }
  notify();
  await drainScreenings(userId);
}

/** Starts draining for this user now and on every reconnect. Returns a cleanup function. */
export function startScreeningSync(userId: string): () => void {
  const onOnline = () => {
    retryCount = 0;
    void drainScreenings(userId);
  };
  window.addEventListener('online', onOnline);
  void drainScreenings(userId);
  return () => {
    window.removeEventListener('online', onOnline);
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = null;
  };
}
