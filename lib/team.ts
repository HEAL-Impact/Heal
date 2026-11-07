// The HEAL-Impact team, shown on the About page. Photos live in public/images/team;
// members without a photo show their initials until one is added.
import type { L } from '@/lib/i18n';

export interface TeamMember {
  name: string;
  role: L;
  bio: L;
  photo?: string;
}

export const TEAM: TeamMember[] = [
  {
    name: 'Alice Anne Awuor Okingo',
    role: { en: 'Founder & Executive Director', sw: 'Mwanzilishi na Mkurugenzi Mtendaji' },
    bio: {
      en: 'Leads HEAL-Impact’s vision, strategy and programmes, and guides the build of its survivor-centred digital tools as a software developer.',
      sw: 'Anaongoza maono, mkakati na programu za HEAL-Impact, na anaelekeza ujenzi wa zana zake za kidijitali zinazomweka mhusika mbele kama msanidi programu.',
    },
    photo: '/images/team/anne-okingo.jpg',
  },
  {
    name: 'Asman Malika',
    role: { en: 'Co-Founder & Community Engagement Lead', sw: 'Mwanzilishi Mwenza na Kiongozi wa Ushirikishaji wa Jamii' },
    bio: {
      en: 'Builds trust with communities, survivors and local leaders so that HEAL’s services reach the women and girls who need them most.',
      sw: 'Anajenga uaminifu na jamii, wahusika na viongozi wa eneo ili huduma za HEAL ziwafikie wanawake na wasichana wanaozihitaji zaidi.',
    },
    photo: '/images/team/asman-malika.jpg',
  },
  {
    name: 'Hannah Apiko Juma',
    role: { en: 'Co-Founder & Head of Product Design', sw: 'Mwanzilishi Mwenza na Mkuu wa Usanifu wa Bidhaa' },
    bio: {
      en: 'Designs HEAL’s experience to be safe, calm and easy to use, including on low-cost phones, with survivors’ feedback at every step.',
      sw: 'Anasanifu HEAL iwe salama, tulivu na rahisi kutumia, hata kwenye simu za bei nafuu, kwa maoni ya wahusika katika kila hatua.',
    },
    photo: '/images/team/hannah-apiko-juma.jpg',
  },
  {
    name: 'Marione Toms',
    role: { en: 'Programme Coordinator', sw: 'Mratibu wa Programu' },
    bio: {
      en: 'Keeps HEAL’s programmes on track: planning activities, coordinating partners and making sure every referral is followed up.',
      sw: 'Anahakikisha programu za HEAL zinaenda vizuri: kupanga shughuli, kuratibu washirika na kuhakikisha kila rufaa inafuatiliwa.',
    },
    photo: '/images/team/marione-toms.jpg',
  },
  {
    name: 'Godwin Ouma',
    role: { en: 'Head of Partnerships', sw: 'Mkuu wa Ushirikiano' },
    bio: {
      en: 'Grows HEAL’s network of health facilities, rescue centres, police gender desks, CHPs and funders so that no survivor is left without a next step.',
      sw: 'Anapanua mtandao wa HEAL wa vituo vya afya, vituo vya uokoaji, madawati ya jinsia ya polisi, CHP na wafadhili ili hakuna mhusika anayekosa hatua inayofuata.',
    },
    photo: '/images/team/godwin-ouma.jpg',
  },
  {
    name: 'Andrew Osindo',
    role: { en: 'Health Data & MEL Lead', sw: 'Kiongozi wa Takwimu za Afya na Ufuatiliaji' },
    bio: {
      en: 'Leads monitoring, evaluation and learning, turning anonymous data into evidence for counties and partners while protecting privacy. Also a software developer.',
      sw: 'Anaongoza ufuatiliaji, tathmini na mafunzo, akigeuza takwimu zisizo na majina kuwa ushahidi kwa kaunti na washirika huku akilinda faragha. Pia ni msanidi programu.',
    },
    photo: '/images/team/andrew-osindo.jpg',
  },
  {
    name: 'Kennedy Ada',
    role: { en: 'Peer Support & Survivor Engagement Lead', sw: 'Kiongozi wa Usaidizi wa Rika na Ushirikishaji wa Wahusika' },
    bio: {
      en: 'Leads peer mentoring, making sure survivors’ voices shape HEAL and that support feels human, not clinical. Also a software developer.',
      sw: 'Anaongoza ushauri wa rika, akihakikisha sauti za wahusika zinaunda HEAL na kwamba msaada unahisi wa kibinadamu. Pia ni msanidi programu.',
    },
    photo: '/images/team/kennedy-ada.jpg',
  },
  {
    name: 'Philip Ochieng',
    role: { en: 'Frontend Engineer', sw: 'Mhandisi wa Programu (Frontend)' },
    bio: {
      en: 'Builds HEAL’s web and mobile screens so they are fast, accessible and work offline in English and Kiswahili.',
      sw: 'Anajenga skrini za wavuti na simu za HEAL ziwe za haraka, rahisi kufikia na zifanye kazi bila mtandao kwa Kiingereza na Kiswahili.',
    },
    photo: '/images/team/philip-ochieng.jpg',
  },
];
