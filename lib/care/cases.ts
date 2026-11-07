// Survivor side of care routing: open a case ("Yes, connect me", "Send help to
// me", Nia "Get care"), check it, stop it, and say whether it helped.
// No account is needed; the case code is the only key. Cases that can't be sent
// now wait on this device and are retried, like reports.

import { newCaseCode } from '@/lib/reports';
import { loadMySpace, saveCaseCode } from '@/lib/myspace/store';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://hackathon-heal.onrender.com/api/v1';
const OUTBOX_KEY = 'heal.case-outbox';

export type CasePathway = 'emergency' | 'facility_today' | 'refer' | 'chp_follow_up' | 'report';
export type ResponderType = 'chp' | 'rescue_centre' | 'facility' | 'police_desk' | 'counsellor' | 'legal_aid' | 'coordinator';
export type CaseStatusName =
  | 'created'
  | 'alerted'
  | 'accepted'
  | 'contacted'
  | 'seen'
  | 'follow_up'
  | 'closed'
  | 'declined_by_survivor'
  | 'lost_to_follow_up';

export interface CaseRequest {
  source: 'screening' | 'emergency' | 'report' | 'nia' | 'chp';
  pathway: CasePathway;
  urgent: boolean;
  needs: string[];
  consent: ResponderType[];
  county?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  language: 'en' | 'sw';
  screening?: { instrument: string; band: string; score: number };
  contact?: { method: 'call' | 'sms' | 'whatsapp' | 'none'; detail: string; safeTimes: string; silent: boolean; codeWord: string; name: string };
  summary?: string;
}

export interface CaseStatus {
  caseCode: string;
  status: CaseStatusName;
  pathway: CasePathway;
  timeline: Partial<Record<'received' | CaseStatusName, string>>;
  feedback: boolean | null;
  createdAt: string;
}

function readOutbox(): Record<string, CaseRequest> {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeOutbox(o: Record<string, CaseRequest>) {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(o));
  } catch {
    /* storage blocked */
  }
}

async function post(caseCode: string, req: CaseRequest, token?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ caseCode, ...req }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Opens a case. The survivor always gets their case code, even offline. */
export async function openCase(req: CaseRequest, token?: string): Promise<{ caseCode: string; sent: boolean }> {
  const caseCode = newCaseCode();
  const sent = await post(caseCode, req, token);
  if (!sent && !token) writeOutbox({ ...readOutbox(), [caseCode]: req });
  return { caseCode, sent };
}

/** Retries cases saved offline. */
export async function flushCaseOutbox(): Promise<void> {
  const outbox = readOutbox();
  for (const [code, req] of Object.entries(outbox)) {
    if (await post(code, req)) {
      delete outbox[code];
      if (loadMySpace().cases.some((c) => c.code === code)) saveCaseCode(code, 'received');
    }
  }
  writeOutbox(outbox);
}

export const isQueued = (code: string) => Boolean(readOutbox()[code.trim().toUpperCase()]);

export async function fetchCaseStatus(code: string): Promise<CaseStatus | 'not_found' | 'offline'> {
  const c = code.trim().toUpperCase();
  if (isQueued(c)) return 'offline';
  try {
    const res = await fetch(`${API}/cases/${encodeURIComponent(c)}`);
    if (res.status === 404) return 'not_found';
    if (!res.ok) return 'offline';
    return (await res.json()) as CaseStatus;
  } catch {
    return 'offline';
  }
}

export async function withdrawCase(code: string): Promise<CaseStatus | null> {
  try {
    const res = await fetch(`${API}/cases/${encodeURIComponent(code)}/withdraw`, { method: 'POST' });
    return res.ok ? ((await res.json()) as CaseStatus) : null;
  } catch {
    return null;
  }
}

export async function sendFeedback(code: string, helped: boolean): Promise<boolean> {
  try {
    const res = await fetch(`${API}/cases/${encodeURIComponent(code)}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helped }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** The simpler status kept in My Space. */
export function mySpaceStatus(s: CaseStatusName): 'received' | 'accepted' | 'contacted' | 'seen' | 'closed' | 'stopped' {
  switch (s) {
    case 'accepted':
      return 'accepted';
    case 'contacted':
      return 'contacted';
    case 'seen':
    case 'follow_up':
      return 'seen';
    case 'closed':
    case 'lost_to_follow_up':
      return 'closed';
    case 'declined_by_survivor':
      return 'stopped';
    default:
      return 'received';
  }
}
