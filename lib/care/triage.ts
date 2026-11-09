// Referral decision support for community health volunteers (CHVs) and
// counsellors. Safety questions always come first, then the screening band.
// Thresholds follow the instruments' published cut-offs; the pathway itself
// must be agreed with the county mental health and GBV focal persons.

import { instrumentById, scoreInstrument } from '@/lib/screening/instruments';
import type { L } from '@/lib/i18n';

export type Pathway = 'emergency' | 'facility_today' | 'refer' | 'chv_follow_up' | 'self_care';

export interface TriageInput {
  tool: string;
  answers: Record<string, number>;
  immediateDanger: boolean;
  sexualViolenceWithin72h: boolean;
  pregnantOrPostpartum: boolean;
}

export interface TriageResult {
  pathway: Pathway;
  label: L;
  colour: string;
  actions: L[];
  score?: number;
  band?: L;
}

export const PATHWAYS: Record<Pathway, Omit<TriageResult, 'pathway'>> = {
  emergency: {
    label: { en: 'Emergency: act now', sw: 'Dharura: chukua hatua sasa' },
    colour: '#DC2626',
    actions: [
      { en: 'Stay with the person if it is safe to do so.', sw: 'Kaa na mtu huyo kama ni salama kufanya hivyo.' },
      {
        en: 'Call 1195 or 999 together; for thoughts of suicide, call Befrienders Kenya +254 722 178 177.',
        sw: 'Pigeni 1195 au 999 pamoja; kwa mawazo ya kujiua, pigeni Befrienders Kenya +254 722 178 177.',
      },
      {
        en: 'Accompany them to the nearest facility today and inform your CHA.',
        sw: 'Mwandamane naye hadi kituo cha afya kilicho karibu leo na umjulishe CHA wako.',
      },
    ],
  },
  facility_today: {
    label: { en: 'Facility today (within 72 hours of assault)', sw: 'Kituo cha afya leo (ndani ya saa 72 tangu shambulio)' },
    colour: '#B34D4D',
    actions: [
      {
        en: 'Explain PEP and emergency contraception, which must start within 72 hours.',
        sw: 'Eleza kuhusu PEP na kidonge cha dharura cha kuzuia mimba, ambavyo lazima vianze ndani ya saa 72.',
      },
      {
        en: 'Refer or accompany to the nearest GBV Recovery Centre or facility today.',
        sw: 'Mpe rufaa au mwandamane naye hadi Kituo cha Kupona Ukatili wa Kijinsia au kituo cha afya kilicho karibu leo.',
      },
      {
        en: 'Offer to help them make a report if and when they choose.',
        sw: 'Jitolee kumsaidia kutoa ripoti ikiwa na wakati atakapochagua.',
      },
    ],
  },
  refer: {
    label: { en: 'Refer to a counsellor or clinician', sw: 'Mpe rufaa kwa mshauri au mhudumu wa afya' },
    colour: '#2C4A4E',
    actions: [
      { en: 'Book an appointment with the facility counsellor within 1 week.', sw: 'Panga miadi na mshauri wa kituo ndani ya wiki 1.' },
      {
        en: 'Share the case code with consent so the facility can see the screening.',
        sw: 'Shiriki namba ya kesi kwa ridhaa yake ili kituo kione matokeo ya ukaguzi.',
      },
      { en: 'Follow up by phone within 3 days to check they attended.', sw: 'Fuatilia kwa simu ndani ya siku 3 kuhakikisha alihudhuria.' },
    ],
  },
  chv_follow_up: {
    label: { en: 'CHV follow-up', sw: 'Ufuatiliaji wa CHV' },
    colour: '#6F8F7A',
    actions: [
      { en: 'Offer psychological first aid: look, listen, link.', sw: 'Toa huduma ya kwanza ya kisaikolojia: tazama, sikiliza, unganisha.' },
      { en: 'Agree a follow-up visit or call within 2 weeks and re-screen.', sw: 'Kubalianeni ziara au simu ya ufuatiliaji ndani ya wiki 2 na mkague tena.' },
      { en: 'Share the self-help and safety-plan tools in HEAL.', sw: 'Mwonyeshe zana za kujisaidia na mpango wa usalama zilizo kwenye HEAL.' },
    ],
  },
  self_care: {
    label: { en: 'Self-care and re-screen', sw: 'Kujitunza na kukagua tena' },
    colour: '#4A635D',
    actions: [
      { en: 'Encourage self-care and support from trusted people.', sw: 'Mhimize kujitunza na kupata msaada kutoka kwa watu anaowaamini.' },
      { en: 'Re-screen in about 1 month, or sooner if things change.', sw: 'Kagua tena baada ya takriban mwezi 1, au mapema mambo yakibadilika.' },
    ],
  },
};

export function triage(input: TriageInput): TriageResult {
  const instrument = instrumentById(input.tool);
  const result = instrument ? scoreInstrument(instrument, input.answers) : null;

  let pathway: Pathway;
  if (input.immediateDanger || result?.urgent) pathway = 'emergency';
  else if (input.sexualViolenceWithin72h) pathway = 'facility_today';
  else if (result?.step === 'see_someone') pathway = 'refer';
  // Pregnant or postpartum clients always get a CHV follow-up visit.
  else if (result?.step === 'talk' || input.pregnantOrPostpartum) pathway = 'chv_follow_up';
  else pathway = 'self_care';

  const band = result ? { en: result.band.label, sw: result.band.labelSw } : undefined;
  return { pathway, ...PATHWAYS[pathway], score: result?.score, band };
}
