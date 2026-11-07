'use client';

// English / Kiswahili strings for the survivor flow. Kiswahili text needs a
// review by native-speaking survivors and counsellors before launch.

import { useLang as useSharedLang } from '@/lib/i18n';

const STRINGS = {
  safetyTitle: { en: 'Are you safe to use this right now?', sw: 'Je, uko salama kutumia hii sasa hivi?' },
  safetyBody: {
    en: 'You are in control here. You can leave at any moment with the Quick exit button, or by pressing Esc twice.',
    sw: 'Wewe ndiye unaamua hapa. Unaweza kuondoka wakati wowote kwa kitufe cha Toka Haraka, au kubonyeza Esc mara mbili.',
  },
  safetyYes: { en: "Yes, I'm safe to continue", sw: 'Ndiyo, niko salama kuendelea' },
  safetyUnsure: { en: "I'm not sure", sw: 'Sina uhakika' },
  safetyNear: { en: 'Someone is near me', sw: 'Kuna mtu karibu nami' },
  safetyNearHint: {
    en: 'This shows a page of health tips. To come back, tap the "Afya Tips" title three times.',
    sw: 'Hii itaonyesha ukurasa wa vidokezo vya afya. Kurudi, gusa kichwa "Afya Tips" mara tatu.',
  },
  unsureTitle: { en: 'A few ways to stay private', sw: 'Njia za kubaki faragha' },
  unsureTips: {
    en: [
      'Use a private or incognito browser tab if you can.',
      'Quick exit (bottom right, or Esc twice) leaves instantly and hides this page from Back.',
      'Nothing is saved unless you choose to save it.',
      'If you share this phone, you can delete everything later from My Space.',
    ],
    sw: [
      'Tumia kichupo cha faragha (incognito) kama unaweza.',
      'Toka Haraka (chini kulia, au Esc mara mbili) inaondoka mara moja.',
      'Hakuna kinachohifadhiwa usipochagua kuhifadhi.',
      'Kama unashiriki simu hii, unaweza kufuta kila kitu baadaye kwenye Nafasi Yangu.',
    ],
  },
  continue: { en: 'Continue', sw: 'Endelea' },
  doorsTitle: { en: 'What would help right now?', sw: 'Nini kingesaidia sasa hivi?' },
  doorsBody: { en: 'Choose one. You can change your mind at any time.', sw: 'Chagua moja. Unaweza kubadilisha wakati wowote.' },
  doorSafeTitle: { en: "I'm not safe now", sw: 'Siko salama sasa' },
  doorSafeBody: { en: 'Call for help, share your location, find the nearest service.', sw: 'Piga simu kwa msaada, shiriki mahali ulipo, pata huduma iliyo karibu.' },
  doorTalkTitle: { en: 'I want to talk', sw: 'Nataka kuongea' },
  doorTalkBody: { en: 'Talk with Nia, our AI companion, or a person. Anonymous.', sw: 'Ongea na Nia, msaidizi wetu wa AI, au mtu. Bila jina.' },
  doorReportTitle: { en: 'I want to report', sw: 'Nataka kuripoti' },
  doorReportBody: { en: 'Step by step, skip anything. Get a case code to follow up.', sw: 'Hatua kwa hatua, ruka chochote. Pata namba ya kesi kufuatilia.' },
  doorCheckTitle: { en: 'How are you doing?', sw: 'Unaendeleaje?' },
  doorCheckBody: { en: 'A few quick, private questions and one clear next step.', sw: 'Maswali machache ya haraka na ya siri, na hatua moja inayofuata.' },
  mySpace: { en: 'My Space', sw: 'Nafasi Yangu' },
  mySpaceBody: { en: 'Your safety plan, case codes and check-ins. Saved only on this phone.', sw: 'Mpango wako wa usalama, namba za kesi na ukaguzi. Huhifadhiwa kwenye simu hii tu.' },
  noAccount: { en: 'No account needed. Nothing is shared unless you choose.', sw: 'Huhitaji akaunti. Hakuna kinachoshirikiwa usipochagua.' },
} as const;

type Key = keyof typeof STRINGS;

/** Keyed strings for the help hub, on top of the site-wide language setting. */
export function useLang() {
  const base = useSharedLang();
  const t = <K extends Key>(key: K): (typeof STRINGS)[K]['en'] => STRINGS[key][base.lang] as (typeof STRINGS)[K]['en'];
  return { ...base, t };
}
