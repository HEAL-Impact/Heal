// Anonymous GBV reports. The case code is made on the device so a report
// written offline keeps the same code when it's sent later.
// Keep the code format in sync with backend/internal/reports/reports.go.

import { loadMySpace, saveCaseCode } from '@/lib/myspace/store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hackathon-heal.onrender.com/api/v1';
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const OUTBOX_KEY = 'heal.reports.outbox';

export const RECIPIENTS = [
  { id: 'heal', label: 'HEAL-Impact team', labelSw: 'Timu ya HEAL-Impact', note: 'We follow up and help you choose next steps.', noteSw: 'Tunafuatilia na kukusaidia kuchagua hatua zinazofuata.' },
  { id: 'hotline_1195', label: 'National GBV Hotline (1195)', labelSw: 'Simu ya Kitaifa ya GBV (1195)', note: 'Government hotline, 24/7.', noteSw: 'Simu ya serikali, saa 24.' },
  { id: 'gbvrc', label: 'Gender Violence Recovery Centre', labelSw: 'Kituo cha Kupona Ukatili wa Kijinsia', note: 'Medical care, PEP and counselling.', noteSw: 'Matibabu, PEP na ushauri.' },
  { id: 'fida', label: 'FIDA Kenya', labelSw: 'FIDA Kenya', note: 'Free legal advice for women.', noteSw: 'Ushauri wa kisheria bure kwa wanawake.' },
  { id: 'police_gender_desk', label: 'Police Gender Desk', labelSw: 'Dawati la Jinsia la Polisi', note: 'To open a police case.', noteSw: 'Kufungua kesi ya polisi.' },
] as const;

export type RecipientId = (typeof RECIPIENTS)[number]['id'];

export interface ReportDraft {
  incidentType?: string;
  whenHappened?: string;
  description?: string;
  safeNow?: string;
  recipient?: RecipientId;
  wantsContact?: boolean;
  contactMethod?: string;
  contactDetail?: string;
  safeTimes?: string;
  county?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ReportStatus {
  caseCode: string;
  status: 'received' | 'contacted' | 'seen' | 'closed';
  recipient: string;
  timeline: Partial<Record<'received' | 'contacted' | 'seen' | 'closed', string>>;
  createdAt: string;
}

export function newCaseCode(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
  return `HEAL-${chars.slice(0, 3)}-${chars.slice(3)}`;
}

export const isCaseCode = (code: string) =>
  new RegExp(`^HEAL-[${ALPHABET}]{3}-[${ALPHABET}]{2}$`).test(code.trim().toUpperCase());

function readOutbox(): Record<string, ReportDraft> {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeOutbox(outbox: Record<string, ReportDraft>) {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
  } catch {
    /* storage blocked: the report still goes out if we're online */
  }
}

async function post(caseCode: string, draft: ReportDraft): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseCode, ...draft }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Sends a report. If it can't be sent now it waits on this device and is
 * retried later; either way the survivor gets her case code straight away.
 */
export async function submitReport(draft: ReportDraft): Promise<{ caseCode: string; sent: boolean }> {
  const caseCode = newCaseCode();
  const sent = await post(caseCode, draft);
  if (!sent) writeOutbox({ ...readOutbox(), [caseCode]: draft });
  // Nothing is kept in My Space unless she taps "Keep this code".
  return { caseCode, sent };
}

/** Retries reports that were saved offline. */
export async function flushReportOutbox(): Promise<void> {
  const outbox = readOutbox();
  for (const [code, draft] of Object.entries(outbox)) {
    if (await post(code, draft)) {
      delete outbox[code];
      if (loadMySpace().cases.some((c) => c.code === code)) saveCaseCode(code, 'received');
    }
  }
  writeOutbox(outbox);
}

export async function fetchReportStatus(caseCode: string): Promise<ReportStatus | 'not_found' | 'offline'> {
  const code = caseCode.trim().toUpperCase();
  if (readOutbox()[code]) return 'offline';
  try {
    const res = await fetch(`${API_BASE_URL}/reports/${encodeURIComponent(code)}`);
    if (res.status === 404) return 'not_found';
    if (!res.ok) return 'offline';
    return (await res.json()) as ReportStatus;
  } catch {
    return 'offline';
  }
}
