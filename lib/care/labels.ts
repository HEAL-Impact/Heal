// Bilingual labels for care routing, shared by survivor and partner pages.
import type { L } from '@/lib/i18n';
import type { CasePathway, CaseStatusName, ResponderType } from '@/lib/care/cases';

export const RESPONDER: Record<ResponderType, { label: L; who: L }> = {
  chp: {
    label: { en: 'Community Health Promoter (CHP)', sw: 'Mhamasishaji wa Afya ya Jamii (CHP)' },
    who: { en: 'A trained person from your community who checks on you and links you to care.', sw: 'Mtu aliyefunzwa kutoka jamii yako anayekuangalia na kukuunganisha na huduma.' },
  },
  counsellor: {
    label: { en: 'Counsellor', sw: 'Mshauri' },
    who: { en: 'Someone to talk to in confidence about what you are going through.', sw: 'Mtu wa kuongea naye kwa siri kuhusu unachopitia.' },
  },
  facility: {
    label: { en: 'Health facility / GBV recovery centre', sw: 'Kituo cha afya / kituo cha kupona ukatili' },
    who: { en: 'Medical care, PEP, emergency contraception and SRHR services.', sw: 'Huduma ya matibabu, PEP, kidonge cha dharura na huduma za afya ya uzazi.' },
  },
  rescue_centre: {
    label: { en: 'Rescue centre / safe house', sw: 'Kituo cha uokoaji / nyumba salama' },
    who: { en: 'A safe place to stay if you cannot go home.', sw: 'Mahali salama pa kukaa kama huwezi kurudi nyumbani.' },
  },
  police_desk: {
    label: { en: 'Police gender desk', sw: 'Dawati la jinsia la polisi' },
    who: { en: 'Officers trained to take GBV reports and protect you.', sw: 'Maafisa waliofunzwa kupokea ripoti za ukatili na kukulinda.' },
  },
  legal_aid: {
    label: { en: 'Legal aid', sw: 'Msaada wa kisheria' },
    who: { en: 'Free legal advice, for example from FIDA Kenya.', sw: 'Ushauri wa kisheria bure, kwa mfano kutoka FIDA Kenya.' },
  },
  coordinator: {
    label: { en: 'HEAL coordinator', sw: 'Mratibu wa HEAL' },
    who: { en: 'The HEAL duty desk that makes sure nobody is missed.', sw: 'Dawati la HEAL linalohakikisha hakuna anayesahaulika.' },
  },
};

export const PATHWAY: Record<CasePathway, { label: L; colour: string }> = {
  emergency: { label: { en: 'Emergency', sw: 'Dharura' }, colour: '#DC2626' },
  facility_today: { label: { en: 'Facility today (within 72 h)', sw: 'Kituo cha afya leo (ndani ya saa 72)' }, colour: '#B34D4D' },
  refer: { label: { en: 'Refer to counsellor', sw: 'Rufaa kwa mshauri' }, colour: '#2C4A4E' },
  chp_follow_up: { label: { en: 'CHP follow-up', sw: 'Ufuatiliaji wa CHP' }, colour: '#6F8F7A' },
  report: { label: { en: 'Report', sw: 'Ripoti' }, colour: '#4A635D' },
};

export const STATUS: Record<CaseStatusName, L> = {
  created: { en: 'Received', sw: 'Imepokelewa' },
  alerted: { en: 'Partner alerted', sw: 'Mshirika amearifiwa' },
  accepted: { en: 'Accepted', sw: 'Imekubaliwa' },
  contacted: { en: 'Contacted', sw: 'Amewasiliana' },
  seen: { en: 'Seen', sw: 'Ameonwa' },
  follow_up: { en: 'Follow-up', sw: 'Ufuatiliaji' },
  closed: { en: 'Closed', sw: 'Imefungwa' },
  declined_by_survivor: { en: 'Stopped by survivor', sw: 'Imesimamishwa na mhusika' },
  lost_to_follow_up: { en: 'Lost to follow-up', sw: 'Hakupatikana' },
};

export const NEEDS: { id: string; label: L }[] = [
  { id: 'psychosocial', label: { en: 'Someone to talk to', sw: 'Mtu wa kuongea naye' } },
  { id: 'medical', label: { en: 'Medical care', sw: 'Huduma ya matibabu' } },
  { id: 'srhr', label: { en: 'Sexual & reproductive health', sw: 'Afya ya uzazi na ya kingono' } },
  { id: 'shelter', label: { en: 'A safe place to stay', sw: 'Mahali salama pa kukaa' } },
  { id: 'police', label: { en: 'Report to police', sw: 'Kuripoti polisi' } },
  { id: 'legal', label: { en: 'Legal advice', sw: 'Ushauri wa kisheria' } },
];

/** Who each pathway offers to connect her with, in order. */
export const OFFER: Record<CasePathway, ResponderType[]> = {
  emergency: ['rescue_centre', 'police_desk', 'chp', 'facility'],
  facility_today: ['facility', 'chp', 'police_desk', 'counsellor'],
  refer: ['counsellor', 'chp', 'facility', 'legal_aid'],
  chp_follow_up: ['chp', 'counsellor'],
  report: ['chp', 'counsellor', 'facility', 'police_desk', 'legal_aid'],
};

export const ORG_TYPE: Record<'government' | 'ngo' | 'cbo' | 'faith_based' | 'private' | 'community', L> = {
  government: { en: 'Government (e.g. police, county hospital)', sw: 'Serikali (k.m. polisi, hospitali ya kaunti)' },
  ngo: { en: 'NGO', sw: 'Shirika lisilo la kiserikali (NGO)' },
  cbo: { en: 'Community-based organisation (CBO)', sw: 'Shirika la kijamii (CBO)' },
  faith_based: { en: 'Faith-based organisation', sw: 'Shirika la kidini' },
  private: { en: 'Private (e.g. clinic, law firm)', sw: 'Binafsi (k.m. kliniki, kampuni ya sheria)' },
  community: { en: 'Community health unit (CHPs)', sw: 'Kitengo cha afya ya jamii (CHP)' },
};

/** Services a partner can register for (the coordinator desk is HEAL-only). */
export const PARTNER_SERVICES: ResponderType[] = ['police_desk', 'rescue_centre', 'chp', 'facility', 'counsellor', 'legal_aid'];

export const MATCH: Record<number, L> = {
  3: { en: 'Same ward', sw: 'Wadi moja' },
  2: { en: 'Same county / nearby', sw: 'Kaunti moja / karibu' },
  1: { en: 'Default route', sw: 'Njia ya kawaida' },
  0: { en: 'Another area', sw: 'Eneo jingine' },
};
