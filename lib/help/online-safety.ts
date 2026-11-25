// "Check this message": a first-pass, on-device look at a message someone
// received, to name what it might be and suggest safe next steps. Like the chat
// risk check, this errs towards caution and should be backed by a reviewed
// classifier on the server before launch.

import type { L } from '@/lib/i18n';

export type HarmKind = 'threat' | 'sextortion' | 'doxxing' | 'harassment' | 'control';

export interface HarmFinding {
  kind: HarmKind;
  title: L;
  explain: L;
  steps: L[];
}

const RULES: { kind: HarmKind; patterns: RegExp[] }[] = [
  {
    kind: 'sextortion',
    patterns: [
      /\b(nudes?|naked|intimate|private) (photos?|pics?|pictures?|videos?)\b/i,
      /\b(send|share|post|leak|expose)\b.*\b(photos?|pics?|videos?)\b.*\b(unless|or else|if you don'?t)\b/i,
      /\b(pay|send (me )?money|m-?pesa)\b.*\b(or|else)\b.*\b(post|share|leak|send)/i,
      /\b(picha (zako )?za uchi|nitaweka picha|nitasambaza)\b/i,
    ],
  },
  {
    kind: 'threat',
    patterns: [
      /\b(i('ll| will)|we('ll| will)|gonna) (kill|hurt|beat|find|get) (you|u)\b/i,
      /\b(you('ll| will) (regret|pay|see))\b/i,
      /\b(watch your back|you'?re dead|nitakuua|nitakuumiza|utajuta)\b/i,
    ],
  },
  {
    kind: 'doxxing',
    patterns: [
      /\b(i know where you (live|work|stay)|your (home )?address is|i'?ll (post|share) your (number|address|location))\b/i,
      /\b(najua unapoishi|najua unakoishi|nitaweka namba yako)\b/i,
    ],
  },
  {
    kind: 'control',
    patterns: [
      /\b(send (me )?your (location|password|pin)|share your location|who are you (talking|chatting) to|delete (him|her|them|that app))\b/i,
      /\b(nitumie (location|password)|unaongea na nani)\b/i,
    ],
  },
  {
    kind: 'harassment',
    patterns: [
      /\b(slut|whore|bitch|stupid woman|ugly|worthless|malaya|kahaba|mjinga)\b/i,
      /\b(nobody (will|would) (believe|want) you|you deserve(d)? it)\b/i,
    ],
  },
];

const FINDINGS: Record<HarmKind, Omit<HarmFinding, 'kind'>> = {
  sextortion: {
    title: { en: 'This looks like sextortion', sw: 'Hii inaonekana kuwa unyanyasaji kwa picha za siri (sextortion)' },
    explain: {
      en: 'Someone is using intimate images, real or fake, to pressure or threaten you. This is a crime, and it is not your fault.',
      sw: 'Mtu anatumia picha za siri, za kweli au za kughushi, kukulazimisha au kukutishia. Hii ni jinai, na si kosa lako.',
    },
    steps: [
      { en: 'Do not pay or send more images. Paying usually leads to more demands.', sw: 'Usilipe wala usitume picha zaidi. Kulipa mara nyingi huleta madai zaidi.' },
      { en: 'Keep the evidence: save this record and take screenshots showing the sender’s name or number.', sw: 'Hifadhi ushahidi: hifadhi rekodi hii na piga picha za skrini zinazoonyesha jina au namba ya mtumaji.' },
      { en: 'Report the account on the app, then block it.', sw: 'Ripoti akaunti hiyo kwenye programu, kisha uizuie.' },
      { en: 'Report to the police Gender Desk or call 1195 for support. If you are under 18, call Childline on 116.', sw: 'Ripoti kwa Dawati la Jinsia la polisi au piga 1195 kwa msaada. Kama una umri chini ya miaka 18, piga Childline 116.' },
    ],
  },
  threat: {
    title: { en: 'This looks like a threat', sw: 'Hii inaonekana kuwa tishio' },
    explain: { en: 'A message that threatens to hurt you is serious, even if it seems like a joke.', sw: 'Ujumbe unaotishia kukuumiza ni jambo zito, hata kama unaonekana kama mzaha.' },
    steps: [
      { en: 'If you feel in danger now, use “I’m not safe now” to call for help.', sw: 'Kama unahisi uko hatarini sasa, tumia “Siko salama sasa” kupiga simu kuomba msaada.' },
      { en: 'Keep the evidence and do not reply.', sw: 'Hifadhi ushahidi na usijibu.' },
      { en: 'Tell someone you trust and report it to the police Gender Desk.', sw: 'Mwambie mtu unayemwamini na uripoti kwa Dawati la Jinsia la polisi.' },
    ],
  },
  doxxing: {
    title: { en: 'This looks like doxxing', sw: 'Hii inaonekana kuwa tishio la kuanika taarifa zako (doxxing)' },
    explain: { en: 'Someone is threatening to share where you live, work or how to reach you.', sw: 'Mtu anatishia kusambaza unapoishi, unapofanya kazi au jinsi ya kukufikia.' },
    steps: [
      { en: 'Check your safety plan and think about where you could stay if needed.', sw: 'Angalia mpango wako wa usalama na fikiria mahali unapoweza kukaa ikihitajika.' },
      { en: 'Keep the evidence; report and block the account.', sw: 'Hifadhi ushahidi; ripoti na uzuie akaunti hiyo.' },
      { en: 'Review who can see your posts, location and phone number on each app.', sw: 'Kagua nani anaweza kuona machapisho yako, mahali ulipo na namba yako ya simu kwenye kila programu.' },
    ],
  },
  control: {
    title: { en: 'This may be controlling behaviour', sw: 'Hii inaweza kuwa tabia ya kukudhibiti' },
    explain: {
      en: 'Demanding your location, passwords or who you talk to can be a sign of digital control in a relationship.',
      sw: 'Kudai kujua mahali ulipo, nywila zako au unaongea na nani kunaweza kuwa ishara ya udhibiti wa kidijitali katika uhusiano.',
    },
    steps: [
      { en: 'You have a right to privacy. You don’t have to share passwords or your location.', sw: 'Una haki ya faragha. Huhitaji kushiriki nywila au mahali ulipo.' },
      { en: 'Change passwords from a device they can’t reach, and turn off location sharing.', sw: 'Badilisha nywila ukitumia kifaa ambacho hawawezi kufikia, na uzime kushiriki mahali ulipo.' },
      { en: 'Talk it through with Nia or a counsellor if you want to.', sw: 'Ongea kuhusu hili na Nia au mshauri ukipenda.' },
    ],
  },
  harassment: {
    title: { en: 'This looks like harassment', sw: 'Hii inaonekana kuwa unyanyasaji' },
    explain: { en: 'Insults and degrading messages are abuse. You don’t deserve them.', sw: 'Matusi na jumbe za kudhalilisha ni unyanyasaji. Hustahili kutendewa hivyo.' },
    steps: [
      { en: 'Keep the evidence, then report and block the account.', sw: 'Hifadhi ushahidi, kisha ripoti na uzuie akaunti hiyo.' },
      { en: 'Talk to someone you trust; you don’t have to handle it alone.', sw: 'Ongea na mtu unayemwamini; huhitaji kulishughulikia peke yako.' },
    ],
  },
};

export function checkOnlineHarm(text: string): HarmFinding[] {
  return RULES.filter((r) => r.patterns.some((rx) => rx.test(text))).map((r) => ({ kind: r.kind, ...FINDINGS[r.kind] }));
}

export async function evidenceFingerprint(text: string, at: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${at}\n${text}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
