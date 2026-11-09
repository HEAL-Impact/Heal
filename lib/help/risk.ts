// First-pass risk check on what someone types to Nia, run on the device so it
// works offline and nothing leaves the phone for it. It errs towards showing
// help: a false alarm costs a card; a miss can cost much more. Phrases cover
// English, Kiswahili and common Sheng. Replace with a reviewed classifier on the
// backend before launch; keep this as the offline fallback.

import type { L } from '@/lib/i18n';

export type RiskKind = 'danger' | 'self_harm' | 'child' | 'sexual_violence';

export interface RiskFlag {
  kind: RiskKind;
  title: L;
  message: L;
  actions: { label: L; href: string }[];
}

const PATTERNS: Record<RiskKind, RegExp[]> = {
  danger: [
    /\b(he|she|they)('s| is| are)? (going to|gonna) (kill|hurt|beat)/i,
    /\b(kill|hurt|beat) me\b/i,
    /\b(not safe|unsafe|in danger|scared for my life|locked (me )?in)\b/i,
    /\b(ananipiga|atanipiga|ataniua|sina usalama|niko hatarini|naogopa maisha yangu)\b/i,
  ],
  self_harm: [
    /\b(kill myself|end (my|it all)|suicid|want to die|don'?t want to (live|be here)|hurt myself|self[- ]?harm)\b/i,
    /\b(nataka kufa|kujiua|nijiue|sitaki kuishi|kujiumiza)\b/i,
  ],
  child: [
    /\b(my (child|daughter|son|kid)|a child|the child|niece|nephew)\b.*\b(touch|abuse|rape|defile|hurt|beat)/i,
    /\b(defile|defilement|unajisi|mtoto (amenajisiwa|amedhulumiwa))\b/i,
    /\b(i am|i'm) (1[0-7]|[5-9]) (years old|yrs)\b.*\b(touch|abuse|rape|hurt)/i,
  ],
  sexual_violence: [
    /\b(raped|rape|sexually (assaulted|abused)|forced me to have sex|forced sex)\b/i,
    /\b(amenibaka|nilibakwa|kubakwa|alinilazimisha)\b/i,
  ],
};

const FLAGS: Record<RiskKind, Omit<RiskFlag, 'kind'>> = {
  danger: {
    title: { en: 'Your safety comes first', sw: 'Usalama wako ni wa kwanza' },
    message: {
      en: 'If you are in danger right now, you can call for help. It is free and confidential.',
      sw: 'Kama uko hatarini sasa hivi, unaweza kupiga simu kuomba msaada. Ni bure na ni siri.',
    },
    actions: [
      { label: { en: 'Call 1195 (GBV hotline)', sw: 'Piga 1195 (simu ya GBV)' }, href: 'tel:1195' },
      { label: { en: 'Call 999 (police)', sw: 'Piga 999 (polisi)' }, href: 'tel:999' },
      { label: { en: 'Send help to me', sw: 'Nitumie msaada' }, href: '/help/connect?from=nia&pathway=emergency&urgent=1' },
      { label: { en: "I'm not safe now", sw: 'Siko salama sasa' }, href: '/help/safe-now' },
    ],
  },
  self_harm: {
    title: { en: 'Your life matters', sw: 'Maisha yako ni muhimu' },
    message: {
      en: 'You do not have to carry this alone. Someone can talk with you right now.',
      sw: 'Huhitaji kubeba hili peke yako. Kuna mtu anayeweza kuongea nawe sasa hivi.',
    },
    actions: [
      { label: { en: 'Call Befrienders Kenya', sw: 'Piga Befrienders Kenya' }, href: 'tel:+254722178177' },
      { label: { en: 'Call 1195', sw: 'Piga 1195' }, href: 'tel:1195' },
      { label: { en: 'Connect me with a counsellor', sw: 'Niunganishe na mshauri' }, href: '/help/connect?from=nia&pathway=refer&urgent=1' },
    ],
  },
  child: {
    title: { en: 'A child may need protection', sw: 'Mtoto anaweza kuhitaji ulinzi' },
    message: {
      en: 'Childline Kenya (116) is free and can help protect a child. You can also report safely here.',
      sw: 'Childline Kenya (116) ni bure na inaweza kusaidia kumlinda mtoto. Unaweza pia kuripoti kwa usalama hapa.',
    },
    actions: [
      { label: { en: 'Call 116 (Childline)', sw: 'Piga 116 (Childline)' }, href: 'tel:116' },
      { label: { en: 'Make a report', sw: 'Toa ripoti' }, href: '/report' },
    ],
  },
  sexual_violence: {
    title: { en: 'Medical care can help, and time matters', sw: 'Huduma ya matibabu inasaidia, na muda ni muhimu' },
    message: {
      en: 'If this happened in the last 72 hours, a clinic can give PEP to prevent HIV and emergency contraception. You decide what happens next.',
      sw: 'Kama hili limetokea ndani ya saa 72 zilizopita, kliniki inaweza kukupa PEP kuzuia VVU na kidonge cha dharura cha kuzuia mimba. Wewe ndiye unaamua kinachofuata.',
    },
    actions: [
      { label: { en: 'Get care today', sw: 'Pata huduma leo' }, href: '/help/connect?from=nia&pathway=facility_today&urgent=1' },
      { label: { en: 'Call GVRC 0709 400 200', sw: 'Piga GVRC 0709 400 200' }, href: 'tel:0709400200' },
      { label: { en: 'Call 1195', sw: 'Piga 1195' }, href: 'tel:1195' },
      { label: { en: 'Make a report', sw: 'Toa ripoti' }, href: '/report' },
    ],
  },
};

/** Returns the most urgent flag for a message, or null. */
export function checkMessageRisk(text: string): RiskFlag | null {
  const order: RiskKind[] = ['self_harm', 'danger', 'child', 'sexual_violence'];
  for (const kind of order) {
    if (PATTERNS[kind].some((rx) => rx.test(text))) return { kind, ...FLAGS[kind] };
  }
  return null;
}
