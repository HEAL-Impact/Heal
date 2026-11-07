// Micro-learning for frontline workers (teachers, CHVs, social workers).
// Content summarises established guidance (WHO Psychological First Aid; WHO
// clinical guidance on responding to violence against women; EPDS guidance).
// Have it reviewed by a clinical lead and adapted with county trainers.

import type { L } from '@/lib/i18n';

export interface Lesson {
  title: L;
  points: L[];
}

export interface QuizQuestion {
  q: L;
  options: L[];
  answer: number;
  why: L;
}

export interface Module {
  id: string;
  title: L;
  audience: L;
  minutes: number;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

export const MODULES: Module[] = [
  {
    id: 'pfa',
    title: { en: 'Psychological first aid: Look, Listen, Link', sw: 'Huduma ya kwanza ya kisaikolojia: Tazama, Sikiliza, Unganisha' },
    audience: { en: 'Everyone', sw: 'Kila mtu' },
    minutes: 10,
    lessons: [
      {
        title: { en: 'Look', sw: 'Tazama' },
        points: [
          { en: 'Check for safety first: is anyone in immediate danger?', sw: 'Angalia usalama kwanza: je, kuna mtu aliye hatarini sasa hivi?' },
          {
            en: 'Notice urgent needs: injuries, hunger, a child alone, someone very distressed.',
            sw: 'Tambua mahitaji ya haraka: majeraha, njaa, mtoto aliye peke yake, mtu aliye na dhiki kubwa.',
          },
        ],
      },
      {
        title: { en: 'Listen', sw: 'Sikiliza' },
        points: [
          { en: 'Approach calmly, introduce yourself and ask how you can help.', sw: 'Mkaribie kwa utulivu, jitambulishe na uulize unavyoweza kusaidia.' },
          { en: 'Listen without pressure. Never force someone to tell their story.', sw: 'Sikiliza bila kulazimisha. Kamwe usimlazimishe mtu kusimulia yaliyompata.' },
          { en: 'Help them feel calm: a quiet place, slow breathing, water.', sw: 'Msaidie atulie: mahali patulivu, kupumua polepole, maji ya kunywa.' },
        ],
      },
      {
        title: { en: 'Link', sw: 'Unganisha' },
        points: [
          { en: 'Help with practical needs and information.', sw: 'Saidia kwa mahitaji ya kila siku na taarifa.' },
          {
            en: 'Connect them with loved ones and services: health, protection, counselling.',
            sw: 'Muunganishe na wapendwa wake na huduma: afya, ulinzi, ushauri.',
          },
          { en: 'Respect their choices. They decide what happens next.', sw: 'Heshimu maamuzi yake. Yeye ndiye anaamua kinachofuata.' },
        ],
      },
    ],
    quiz: [
      {
        q: { en: 'A woman is crying after a fight at home. What do you do first?', sw: 'Mwanamke analia baada ya ugomvi nyumbani. Unafanya nini kwanza?' },
        options: [
          { en: 'Ask her to explain exactly what happened', sw: 'Mwombe aeleze hasa kilichotokea' },
          { en: 'Check that she is safe right now', sw: 'Hakikisha yuko salama sasa hivi' },
          { en: 'Call her husband to calm things down', sw: 'Mpigie mume wake simu ili kutuliza mambo' },
        ],
        answer: 1,
        why: {
          en: 'Safety comes first. Never contact the person who may have caused harm.',
          sw: 'Usalama ni wa kwanza. Kamwe usiwasiliane na mtu ambaye huenda alisababisha madhara.',
        },
      },
      {
        q: { en: 'She doesn’t want to talk about it. You should…', sw: 'Hataki kuzungumza kuhusu hilo. Unapaswa…' },
        options: [
          { en: 'Gently insist so you can help', sw: 'Msisitize kwa upole ili uweze kusaidia' },
          { en: 'Respect that and offer practical help and information', sw: 'Heshimu hilo na umpe msaada wa vitendo na taarifa' },
          { en: 'Leave immediately', sw: 'Ondoka mara moja' },
        ],
        answer: 1,
        why: {
          en: 'Psychological first aid never pressures people to share their story.',
          sw: 'Huduma ya kwanza ya kisaikolojia kamwe haimlazimishi mtu kusimulia yaliyompata.',
        },
      },
    ],
  },
  {
    id: 'gbv',
    title: { en: 'Responding safely to gender-based violence', sw: 'Kukabiliana kwa usalama na ukatili wa kijinsia' },
    audience: { en: 'Teachers, CHVs, social workers', sw: 'Walimu, CHV, wafanyakazi wa ustawi wa jamii' },
    minutes: 12,
    lessons: [
      {
        title: { en: 'Believe and don’t blame', sw: 'Amini na usilaumu' },
        points: [
          { en: 'Say “I believe you” and “It is not your fault.”', sw: 'Sema “Ninakuamini” na “Si kosa lako.”' },
          { en: 'Avoid “why” questions, which can sound like blame.', sw: 'Epuka maswali ya “kwa nini”, ambayo yanaweza kusikika kama lawama.' },
        ],
      },
      {
        title: { en: 'Keep it confidential', sw: 'Tunza siri' },
        points: [
          { en: 'Talk somewhere private. Don’t share details without consent.', sw: 'Ongeeni mahali pa faragha. Usishiriki maelezo bila ridhaa yake.' },
          {
            en: 'For children, explain that you must involve protection services to keep them safe.',
            sw: 'Kwa watoto, eleza kwamba lazima uhusishe huduma za ulinzi ili kuwaweka salama.',
          },
        ],
      },
      {
        title: { en: 'Time-sensitive care', sw: 'Huduma inayozingatia muda' },
        points: [
          {
            en: 'After rape, PEP to prevent HIV must start within 72 hours, and emergency contraception works best early.',
            sw: 'Baada ya ubakaji, PEP ya kuzuia VVU lazima ianze ndani ya saa 72, na kidonge cha dharura cha kuzuia mimba hufanya kazi vizuri zaidi mapema.',
          },
          {
            en: 'Refer to the nearest GBV Recovery Centre; the National GBV Hotline is 1195, Childline is 116.',
            sw: 'Toa rufaa kwa Kituo cha Kupona Ukatili wa Kijinsia kilicho karibu; Simu ya Kitaifa ya GBV ni 1195, Childline ni 116.',
          },
        ],
      },
    ],
    quiz: [
      {
        q: {
          en: 'A survivor tells you she was raped two days ago. The most urgent step is…',
          sw: 'Mnusurika anakueleza kwamba alibakwa siku mbili zilizopita. Hatua ya dharura zaidi ni…',
        },
        options: [
          { en: 'Wait until she is ready to go to the police', sw: 'Subiri hadi atakapokuwa tayari kwenda polisi' },
          { en: 'Explain PEP and help her reach a facility today', sw: 'Eleza kuhusu PEP na umsaidie kufika kituo cha afya leo' },
          { en: 'Advise her to rest for a week', sw: 'Mshauri apumzike kwa wiki moja' },
        ],
        answer: 1,
        why: {
          en: 'PEP must start within 72 hours. She still decides about reporting to the police.',
          sw: 'PEP lazima ianze ndani ya saa 72. Yeye bado ndiye anaamua kuhusu kuripoti polisi.',
        },
      },
      {
        q: { en: 'Which phrase is supportive?', sw: 'Kauli ipi inatoa msaada?' },
        options: [
          { en: 'Why didn’t you leave?', sw: 'Kwa nini hukuondoka?' },
          { en: 'It is not your fault', sw: 'Si kosa lako' },
          { en: 'You should have been more careful', sw: 'Ulipaswa kuwa mwangalifu zaidi' },
        ],
        answer: 1,
        why: {
          en: 'Blame increases shame and makes people less likely to seek help.',
          sw: 'Lawama huongeza aibu na hufanya watu wasite kutafuta msaada.',
        },
      },
    ],
  },
  {
    id: 'perinatal',
    title: { en: 'Spotting depression in pregnancy and after birth', sw: 'Kutambua msongo wa mawazo wakati wa ujauzito na baada ya kujifungua' },
    audience: { en: 'CHVs, midwives', sw: 'CHV, wakunga' },
    minutes: 8,
    lessons: [
      {
        title: { en: 'What to look for', sw: 'Cha kuangalia' },
        points: [
          {
            en: 'Persistent sadness, crying, loss of interest, feeling unable to cope or bond with the baby.',
            sw: 'Huzuni isiyoisha, kulia, kukosa hamu, kuhisi kushindwa kukabiliana au kushikamana na mtoto.',
          },
          {
            en: '“Baby blues” in the first two weeks are common; feelings that last longer need attention.',
            sw: 'Huzuni ya muda mfupi katika wiki mbili za kwanza ni ya kawaida; hisia zinazodumu zaidi zinahitaji kushughulikiwa.',
          },
        ],
      },
      {
        title: { en: 'Screen and act', sw: 'Kagua na uchukue hatua' },
        points: [
          {
            en: 'Use the EPDS: a score of 13 or more suggests depression; 10–12 needs follow-up.',
            sw: 'Tumia EPDS: alama 13 au zaidi zinaashiria msongo wa mawazo; 10–12 zinahitaji ufuatiliaji.',
          },
          {
            en: 'Any answer other than “Never” to the self-harm question means acting the same day.',
            sw: 'Jibu lolote zaidi ya “Kamwe” kwenye swali la kujidhuru linamaanisha kuchukua hatua siku hiyo hiyo.',
          },
          {
            en: 'Use HEAL’s Caseload “Screen a client” for referral guidance.',
            sw: 'Tumia “Kagua mteja” kwenye Orodha ya Wateja ya HEAL kupata mwongozo wa rufaa.',
          },
        ],
      },
    ],
    quiz: [
      {
        q: {
          en: 'A mother scores 8 on the EPDS but says she has sometimes thought of harming herself. You should…',
          sw: 'Mama amepata alama 8 kwenye EPDS lakini anasema wakati mwingine amefikiria kujidhuru. Unapaswa…',
        },
        options: [
          { en: 'Reassure her the score is low', sw: 'Mhakikishie kwamba alama ni ndogo' },
          { en: 'Act the same day and connect her to urgent support', sw: 'Chukua hatua siku hiyo hiyo na umuunganishe na msaada wa haraka' },
          { en: 'Re-screen next month', sw: 'Mkague tena mwezi ujao' },
        ],
        answer: 1,
        why: { en: 'The self-harm item overrides the total score.', sw: 'Swali la kujidhuru linazidi uzito wa jumla ya alama.' },
      },
    ],
  },
];

const PROGRESS_KEY = 'heal.training.v1';

export function loadProgress(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveProgress(moduleId: string, score: number) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...loadProgress(), [moduleId]: score }));
  } catch {
    /* ignore */
  }
}
