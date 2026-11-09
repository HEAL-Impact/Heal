'use client';

// Partner (staff) side: sign-in and the real caseload API. Partner tokens are
// kept in sessionStorage so they end when the browser tab closes.

import type { CasePathway, CaseStatusName, ResponderType } from '@/lib/care/cases';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://hackathon-heal.onrender.com/api/v1';
const TOKEN_KEY = 'heal.partner.token';
const ACCOUNT_KEY = 'heal.partner.account';

export type Role = 'admin' | 'coordinator' | 'partner';

export interface PartnerAccount {
  id: string;
  email: string;
  name: string;
  role: Role;
  partnerId: string;
  partnerName: string;
  partnerType: ResponderType | '';
  active: boolean;
  createdAt: string;
}

export type OrgType = 'government' | 'ngo' | 'cbo' | 'faith_based' | 'private' | 'community';
export type PartnerStatus = 'pending' | 'approved' | 'rejected';

export interface PartnerFields {
  name: string;
  type: ResponderType;
  orgType: OrgType | '';
  services: ResponderType[];
  county: string;
  subCounty: string;
  ward: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  email: string;
  hours: string;
  registrationNumber: string;
  whatsappGroupId: string;
  focalPerson: string;
  isDefault: boolean;
  active: boolean;
}

export interface Partner extends PartnerFields {
  id: string;
  status: PartnerStatus;
  reviewedAt: string | null;
  reviewNote: string;
  createdAt: string;
}

/** What partners see about each other, ranked for a location. */
export interface DirectoryEntry {
  id: string;
  name: string;
  type: ResponderType;
  orgType: OrgType | '';
  services: ResponderType[];
  county: string;
  subCounty: string;
  ward: string;
  landmark: string;
  phone: string;
  email: string;
  hours: string;
  focalPerson: string;
  isDefault: boolean;
  /** 3 same ward, 2 same county or within 25 km, 1 default route, 0 another area */
  match: number;
  distanceKm: number | null;
  alertStatus?: string;
}

export interface CaseAlert {
  id: string;
  partnerId: string;
  partnerName: string;
  responderType: ResponderType;
  status: 'alerted' | 'accepted' | 'passed' | 'expired' | 'withdrawn' | 'done';
  escalationLevel: number;
  deadlineAt: string;
  respondedAt: string | null;
  note: string;
  createdAt: string;
}

export interface CaseEvent {
  actor: string;
  kind: string;
  detail: string;
  createdAt: string;
}

export interface CaseView {
  id: string;
  caseCode: string;
  source: string;
  pathway: CasePathway;
  urgent: boolean;
  needs: string[];
  consent: ResponderType[];
  county: string;
  ward: string;
  language: 'en' | 'sw';
  screening: { instrument: string; band: string; score: number } | null;
  status: CaseStatusName;
  outcome: string;
  failedAttempts: number;
  followUpAt: string | null;
  feedback: boolean | null;
  createdAt: string;
  updatedAt: string;
  myAlert: CaseAlert | null;
  alerts?: CaseAlert[];
  events?: CaseEvent[];
  contact?: { method: string; detail: string; safeTimes: string; silent: boolean; codeWord: string; name: string };
  summary?: string;
}

export interface Insights {
  smallCell: number;
  funnel: { label: string; count: number }[];
  byPathway: { label: string; count: number }[];
  bySource: { label: string; count: number }[];
  monthly: { month: string; cases: number; urgent: number; closed: number }[];
  counties: { county: string; cases: number | null; urgent: number | null; seen: number | null; closed: number | null; overdue: number | null }[];
  medianAcceptMinutes: number | null;
  overdueAlerts: number;
  helpedYes: number;
  helpedNo: number;
}

export function getSession(): { token: string; account: PartnerAccount } | null {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const account = sessionStorage.getItem(ACCOUNT_KEY);
    return token && account ? { token, account: JSON.parse(account) } : null;
  } catch {
    return null;
  }
}

export function signOut() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ACCOUNT_KEY);
  } catch {
    /* nothing stored */
  }
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getSession();
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.token}` } : {}), ...init.headers },
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection.', 0);
  }
  const body = await res.json().catch(() => ({}));
  if (res.status === 401 && session && !path.startsWith('/partner/login')) {
    signOut();
    if (typeof window !== 'undefined') window.location.href = '/partners/login';
  }
  if (res.status === 404 && !body.error) {
    throw new ApiError(`The server at ${API} has no partner routes. Point NEXT_PUBLIC_API_URL at the updated Go API.`, 404);
  }
  if (!res.ok) throw new ApiError(body.error || 'Something went wrong', res.status, body.code);
  return body as T;
}

export async function signIn(email: string, password: string): Promise<PartnerAccount> {
  const { token, account } = await call<{ token: string; account: PartnerAccount }>('/partner/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  return account;
}

export const partnerApi = {
  me: () => call<PartnerAccount>('/partner/me'),
  cases: (closed = false) => call<CaseView[]>(`/partner/cases${closed ? '?closed=1' : ''}`),
  case: (id: string) => call<CaseView>(`/partner/cases/${encodeURIComponent(id)}`),
  act: (id: string, action: { action: string; note?: string; outcome?: string; followUpAt?: string; partnerId?: string; service?: string; consentConfirmed?: boolean }) =>
    call<CaseView>(`/partner/cases/${encodeURIComponent(id)}/actions`, { method: 'POST', body: JSON.stringify(action) }),
  insights: () => call<Insights>('/partner/insights'),
  partners: () => call<Partner[]>('/partner/partners'),
  directory: (q: { county?: string; ward?: string; service?: string; caseId?: string }) =>
    call<DirectoryEntry[]>(`/partner/directory?${new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]).toString()}`),
  reviewPartner: (id: string, status: 'approved' | 'rejected', note = '') =>
    call<Partner>(`/partner/admin/partners/${id}/review`, { method: 'PUT', body: JSON.stringify({ status, note }) }),
  /** Public: an organisation registers itself and waits for approval. */
  register: (organisation: Omit<PartnerFields, 'isDefault' | 'active'>, account: { name: string; email: string; password: string }) =>
    call<{ status: PartnerStatus; name: string }>('/partner/register', {
      method: 'POST',
      body: JSON.stringify({ organisation, account, agreeCodeOfConduct: true }),
    }),
  savePartner: (p: PartnerFields, id?: string) =>
    call<Partner>(id ? `/partner/admin/partners/${id}` : '/partner/admin/partners', { method: id ? 'PUT' : 'POST', body: JSON.stringify(p) }),
  accounts: () => call<PartnerAccount[]>('/partner/admin/accounts'),
  createAccount: (a: { email: string; password: string; name: string; role: Role; partnerId: string }) =>
    call<PartnerAccount>('/partner/admin/accounts', { method: 'POST', body: JSON.stringify(a) }),
  setAccountActive: (id: string, active: boolean) =>
    call<{ ok: boolean }>(`/partner/admin/accounts/${id}/active`, { method: 'PUT', body: JSON.stringify({ active }) }),
  token: () => getSession()?.token,
};
