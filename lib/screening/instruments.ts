// Validated self-check questionnaires, scored on the device. Results are
// screening only, never a diagnosis: each result leads to one clear next step.
//
// Sources (wording and scoring must not be changed):
// - PHQ-9 and GAD-7: Spitzer, Williams, Kroenke et al. Developed with an
//   educational grant from Pfizer Inc. No permission required to reproduce.
// - EPDS: Cox, J.L., Holden, J.M., and Sagovsky, R. (1987). British Journal of
//   Psychiatry 150:782-786. May be reproduced without permission provided the
//   source is cited.
// Translations (Kiswahili, Dholuo) must be validated versions, e.g. the WEMA
// questionnaire set, not ad-hoc translations.

export type NextStep = 'self_care' | 'talk' | 'see_someone' | 'urgent';

export interface Option {
  label: string;
  labelSw?: string;
  value: number;
}

export interface Question {
  id: string;
  text: string;
  textSw?: string;
  options?: Option[]; // defaults to the instrument's options
  /** A non-zero answer always means the result is urgent (e.g. thoughts of self-harm). */
  safetyItem?: boolean;
}

export interface Band {
  id: string;
  label: string;
  labelSw: string;
  min: number;
  summary: string;
  summarySw: string;
  step: NextStep;
}

export interface Instrument {
  id: string;
  name: string;
  nameSw: string;
  shortName: string;
  about: string;
  aboutSw: string;
  forWho: string;
  forWhoSw: string;
  minutes: number;
  stem: string;
  /** Kiswahili question wording (WEMA set, under review); null until a validated version exists. */
  stemSw: string | null;
  options: Option[];
  questions: Question[];
  bands: Band[]; // ascending by min
  source: string;
}

const FREQUENCY: Option[] = [
  { label: 'Not at all', labelSw: 'Hapana, kabisa', value: 0 },
  { label: 'Several days', labelSw: 'Siku kadhaa', value: 1 },
  { label: 'More than half the days', labelSw: 'Zaidi ya nusu ya siku', value: 2 },
  { label: 'Nearly every day', labelSw: 'Karibu kila siku', value: 3 },
];

export const PHQ9: Instrument = {
  id: 'phq9',
  name: 'Mood check (PHQ-9)',
  nameSw: 'Ukaguzi wa hisia (PHQ-9)',
  shortName: 'Mood',
  about: 'Nine questions about low mood and interest over the last two weeks.',
  aboutSw: 'Maswali tisa kuhusu huzuni na kukosa hamu katika wiki mbili zilizopita.',
  forWho: 'Anyone who has been feeling down.',
  forWhoSw: 'Yeyote ambaye amekuwa akijihisi mnyonge.',
  minutes: 3,
  stem: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
  stemSw: 'Katika wiki 2 zilizopita, ni mara ngapi umesumbuliwa na matatizo yoyote yafuatayo?',
  options: FREQUENCY,
  questions: [
    { id: 'q1', text: 'Little interest or pleasure in doing things', textSw: 'Nia ndogo au raha kidogo katika kufanya mambo' },
    { id: 'q2', text: 'Feeling down, depressed, or hopeless', textSw: 'Kujihisi mnyonge, mwenye huzuni, au bila matumaini' },
    { id: 'q3', text: 'Trouble falling or staying asleep, or sleeping too much', textSw: 'Shida ya kupata au kubaki umelala, au kulala sana' },
    { id: 'q4', text: 'Feeling tired or having little energy', textSw: 'Kujihisi mchovu au kuwa na nguvu kidogo' },
    { id: 'q5', text: 'Poor appetite or overeating', textSw: 'Tamu mbaya ya kula au kula kupita kiasi' },
    { id: 'q6', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', textSw: 'Kujihisi vibaya kuhusu nafsi yako — au kwamba wewe ni mshindwa au umejiangusha au kuangusha familia yako' },
    { id: 'q7', text: 'Trouble concentrating on things, such as reading the newspaper or watching television', textSw: 'Shida ya kuweka umakini kwenye mambo, kama vile kusoma gazeti au kutazama runinga' },
    { id: 'q8', text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', textSw: 'Kutembea au kuongea polepole sana hivi kwamba watu wengine wangeweza kutambua? Au kinyume chake — kuwa na wasiwasi au kukosa utulivu hivi kwamba umekuwa ukitembea sana kuliko kawaida' },
    { id: 'q9', text: 'Thoughts that you would be better off dead or of hurting yourself in some way', textSw: 'Mawazo kwamba ungekuwa bora zaidi kama ungekufa au kujiumiza kwa njia fulani', safetyItem: true },
  ],
  bands: [
    { id: 'minimal', label: 'Few signs', labelSw: 'Dalili chache', min: 0, summary: 'Your answers show few signs of low mood right now.', summarySw: 'Majibu yako yanaonyesha dalili chache za huzuni kwa sasa.', step: 'self_care' },
    { id: 'mild', label: 'Some signs', labelSw: 'Dalili kiasi', min: 5, summary: 'Your answers show some signs of low mood.', summarySw: 'Majibu yako yanaonyesha baadhi ya dalili za huzuni.', step: 'talk' },
    { id: 'moderate', label: 'Clear signs', labelSw: 'Dalili za wazi', min: 10, summary: 'Your answers show clear signs of low mood that may be affecting your days.', summarySw: 'Majibu yako yanaonyesha dalili za wazi za huzuni ambazo huenda zinaathiri siku zako.', step: 'see_someone' },
    { id: 'moderately_severe', label: 'Strong signs', labelSw: 'Dalili kali', min: 15, summary: 'Your answers show strong signs of low mood.', summarySw: 'Majibu yako yanaonyesha dalili kali za huzuni.', step: 'see_someone' },
    { id: 'severe', label: 'Very strong signs', labelSw: 'Dalili kali sana', min: 20, summary: 'Your answers show very strong signs of low mood.', summarySw: 'Majibu yako yanaonyesha dalili kali sana za huzuni.', step: 'see_someone' },
  ],
  source: 'PHQ-9 © Pfizer Inc. Used without permission as permitted for screening.',
};

export const GAD7: Instrument = {
  id: 'gad7',
  name: 'Worry check (GAD-7)',
  nameSw: 'Ukaguzi wa wasiwasi (GAD-7)',
  shortName: 'Worry',
  about: 'Seven questions about worry and feeling on edge over the last two weeks.',
  aboutSw: 'Maswali saba kuhusu wasiwasi na kukosa utulivu katika wiki mbili zilizopita.',
  forWho: 'Anyone who has been feeling anxious or tense.',
  forWhoSw: 'Yeyote ambaye amekuwa na wasiwasi au msongo.',
  minutes: 2,
  stem: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
  stemSw: null,
  options: FREQUENCY,
  questions: [
    { id: 'q1', text: 'Feeling nervous, anxious or on edge' },
    { id: 'q2', text: 'Not being able to stop or control worrying' },
    { id: 'q3', text: 'Worrying too much about different things' },
    { id: 'q4', text: 'Trouble relaxing' },
    { id: 'q5', text: 'Being so restless that it is hard to sit still' },
    { id: 'q6', text: 'Becoming easily annoyed or irritable' },
    { id: 'q7', text: 'Feeling afraid as if something awful might happen' },
  ],
  bands: [
    { id: 'minimal', label: 'Few signs', labelSw: 'Dalili chache', min: 0, summary: 'Your answers show few signs of anxiety right now.', summarySw: 'Majibu yako yanaonyesha dalili chache za wasiwasi kwa sasa.', step: 'self_care' },
    { id: 'mild', label: 'Some signs', labelSw: 'Dalili kiasi', min: 5, summary: 'Your answers show some signs of anxiety.', summarySw: 'Majibu yako yanaonyesha baadhi ya dalili za wasiwasi.', step: 'talk' },
    { id: 'moderate', label: 'Clear signs', labelSw: 'Dalili za wazi', min: 10, summary: 'Your answers show clear signs of anxiety that may be affecting your days.', summarySw: 'Majibu yako yanaonyesha dalili za wazi za wasiwasi ambazo huenda zinaathiri siku zako.', step: 'see_someone' },
    { id: 'severe', label: 'Strong signs', labelSw: 'Dalili kali', min: 15, summary: 'Your answers show strong signs of anxiety.', summarySw: 'Majibu yako yanaonyesha dalili kali za wasiwasi.', step: 'see_someone' },
  ],
  source: 'GAD-7 © Pfizer Inc. Used without permission as permitted for screening.',
};

export const EPDS: Instrument = {
  id: 'epds',
  name: 'Pregnancy & new-baby check (EPDS)',
  nameSw: 'Ukaguzi wa ujauzito na mtoto mchanga (EPDS)',
  shortName: 'Pregnancy',
  about: 'Ten questions about how you have felt in the past 7 days.',
  aboutSw: 'Maswali kumi kuhusu jinsi ulivyohisi katika siku 7 zilizopita.',
  forWho: 'Anyone who is pregnant or has had a baby in the last year.',
  forWhoSw: 'Yeyote aliye mjamzito au aliyejifungua katika mwaka uliopita.',
  minutes: 3,
  stem: 'As you are pregnant or have recently had a baby, we would like to know how you are feeling. Please choose the answer that comes closest to how you have felt in the past 7 days, not just how you feel today.',
  stemSw: 'Tafadhali chagua jibu linalokaribia zaidi jinsi ulivyohisi katika siku 7 zilizopita, sio tu jinsi unavyohisi leo.',
  options: [],
  questions: [
    { id: 'q1', text: 'I have been able to laugh and see the funny side of things', textSw: 'Nimeweza kucheka na kuona upande wa kuchekesha wa mambo', options: [{ label: 'As much as I always could', labelSw: 'Kama nilivyokuwa nikiweza kila wakati', value: 0 }, { label: 'Not quite so much now', labelSw: 'Sio sana kama zamani', value: 1 }, { label: 'Definitely not so much now', labelSw: 'Hakika si kama zamani', value: 2 }, { label: 'Not at all', labelSw: 'Kabisa siwezi', value: 3 }] },
    { id: 'q2', text: 'I have looked forward with enjoyment to things', textSw: 'Nimetarajia mambo kwa furaha', options: [{ label: 'As much as I ever did', labelSw: 'Kama nilivyokuwa nikifanya hapo awali', value: 0 }, { label: 'Rather less than I used to', labelSw: 'Kidogo kuliko zamani', value: 1 }, { label: 'Definitely less than I used to', labelSw: 'Hakika kidogo kuliko zamani', value: 2 }, { label: 'Hardly at all', labelSw: 'Karibu kabisa hapana', value: 3 }] },
    { id: 'q3', text: 'I have blamed myself unnecessarily when things went wrong', textSw: 'Nimejilaumu bila sababu ya msingi mambo yalipoharibika', options: [{ label: 'Yes, most of the time', labelSw: 'Ndiyo, mara nyingi', value: 3 }, { label: 'Yes, some of the time', labelSw: 'Ndiyo, wakati mwingine', value: 2 }, { label: 'Not very often', labelSw: 'Sio mara nyingi', value: 1 }, { label: 'No, never', labelSw: 'Hapana, kamwe', value: 0 }] },
    { id: 'q4', text: 'I have been anxious or worried for no good reason', textSw: 'Nimekuwa na wasiwasi au hofu bila sababu ya msingi', options: [{ label: 'No, not at all', labelSw: 'Hapana, kabisa', value: 0 }, { label: 'Hardly ever', labelSw: 'Mara chache sana', value: 1 }, { label: 'Yes, sometimes', labelSw: 'Ndiyo, wakati mwingine', value: 2 }, { label: 'Yes, very often', labelSw: 'Ndiyo, mara nyingi sana', value: 3 }] },
    { id: 'q5', text: 'I have felt scared or panicky for no very good reason', textSw: 'Nimehisi kuogopa au kupata hofu kali bila sababu ya msingi', options: [{ label: 'Yes, quite a lot', labelSw: 'Ndiyo, mara nyingi', value: 3 }, { label: 'Yes, sometimes', labelSw: 'Ndiyo, wakati mwingine', value: 2 }, { label: 'No, not much', labelSw: 'Hapana, si sana', value: 1 }, { label: 'No, not at all', labelSw: 'Hapana, kabisa', value: 0 }] },
    { id: 'q6', text: 'Things have been getting on top of me', textSw: 'Mambo yamekuwa yakinilemea', options: [{ label: 'Yes, most of the time I haven\'t been able to cope at all', labelSw: 'Ndiyo, mara nyingi nimeshindwa kabisa kukabiliana nayo', value: 3 }, { label: 'Yes, sometimes I haven\'t been coping as well as usual', labelSw: 'Ndiyo, wakati mwingine sijakabiliana nayo kama kawaida', value: 2 }, { label: 'No, most of the time I have coped quite well', labelSw: 'Hapana, mara nyingi nimeweza kukabiliana nayo vizuri', value: 1 }, { label: 'No, I have been coping as well as ever', labelSw: 'Hapana, nimekuwa nikikabiliana nayo kama kawaida', value: 0 }] },
    { id: 'q7', text: 'I have been so unhappy that I have had difficulty sleeping', textSw: 'Nimekuwa na huzuni kiasi cha kupata shida ya kulala', options: [{ label: 'Yes, most of the time', labelSw: 'Ndiyo, mara nyingi', value: 3 }, { label: 'Yes, sometimes', labelSw: 'Ndiyo, wakati mwingine', value: 2 }, { label: 'Not very often', labelSw: 'Sio mara nyingi', value: 1 }, { label: 'No, not at all', labelSw: 'Hapana, kabisa', value: 0 }] },
    { id: 'q8', text: 'I have felt sad or miserable', textSw: 'Nimehisi huzuni au kukata tamaa', options: [{ label: 'Yes, most of the time', labelSw: 'Ndiyo, karibu wakati wote', value: 3 }, { label: 'Yes, quite often', labelSw: 'Ndiyo, mara nyingi', value: 2 }, { label: 'Not very often', labelSw: 'Sio mara nyingi', value: 1 }, { label: 'No, not at all', labelSw: 'Hapana, kabisa', value: 0 }] },
    { id: 'q9', text: 'I have been so unhappy that I have been crying', textSw: 'Nimekuwa na huzuni kiasi cha kulia', options: [{ label: 'Yes, most of the time', labelSw: 'Ndiyo, karibu wakati wote', value: 3 }, { label: 'Yes, quite often', labelSw: 'Ndiyo, mara nyingi', value: 2 }, { label: 'Only occasionally', labelSw: 'Mara chache tu', value: 1 }, { label: 'No, never', labelSw: 'Hapana, kamwe', value: 0 }] },
    { id: 'q10', text: 'The thought of harming myself has occurred to me', textSw: 'Wazo la kujidhuru limewahi kunijia', options: [{ label: 'Yes, quite often', labelSw: 'Ndiyo, mara nyingi', value: 3 }, { label: 'Sometimes', labelSw: 'Wakati mwingine', value: 2 }, { label: 'Hardly ever', labelSw: 'Mara chache sana', value: 1 }, { label: 'Never', labelSw: 'Kamwe', value: 0 }], safetyItem: true },
  ],
  bands: [
    { id: 'low', label: 'Few signs', labelSw: 'Dalili chache', min: 0, summary: 'Your answers show few signs of depression around pregnancy or birth.', summarySw: 'Majibu yako yanaonyesha dalili chache za msongo wa mawazo wakati wa ujauzito au baada ya kujifungua.', step: 'self_care' },
    { id: 'possible', label: 'Some signs', labelSw: 'Dalili kiasi', min: 10, summary: 'Your answers show some signs of depression around pregnancy or birth.', summarySw: 'Majibu yako yanaonyesha baadhi ya dalili za msongo wa mawazo wakati wa ujauzito au baada ya kujifungua.', step: 'talk' },
    { id: 'likely', label: 'Clear signs', labelSw: 'Dalili za wazi', min: 13, summary: 'Your answers show clear signs of depression around pregnancy or birth. This is common and treatable.', summarySw: 'Majibu yako yanaonyesha dalili za wazi za msongo wa mawazo wakati wa ujauzito au baada ya kujifungua. Hili ni jambo la kawaida na linatibika.', step: 'see_someone' },
  ],
  source: 'EPDS: Cox, J.L., Holden, J.M., and Sagovsky, R. (1987). British Journal of Psychiatry 150:782-786.',
};

export const INSTRUMENTS = [PHQ9, GAD7, EPDS];

export const instrumentById = (id: string | null) => INSTRUMENTS.find((i) => i.id === id) ?? null;

export interface Result {
  score: number;
  maxScore: number;
  band: Band;
  urgent: boolean;
  step: NextStep;
}

export function scoreInstrument(instrument: Instrument, answers: Record<string, number>): Result {
  const score = instrument.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
  const maxScore = instrument.questions.reduce(
    (sum, q) => sum + Math.max(...(q.options ?? instrument.options).map((o) => o.value)),
    0
  );
  const band = [...instrument.bands].reverse().find((b) => score >= b.min) ?? instrument.bands[0];
  const urgent = instrument.questions.some((q) => q.safetyItem && (answers[q.id] ?? 0) > 0);
  return { score, maxScore, band, urgent, step: urgent ? 'urgent' : band.step };
}

export type ScreeningLang = 'en' | 'sw';

/** Kiswahili questions exist for this instrument (WEMA set, under review). */
export const hasKiswahiliItems = (instrument: Instrument) => instrument.stemSw !== null;

/** Question and answer text in the chosen language, falling back to English. */
export function questionText(instrument: Instrument, q: Question, lang: ScreeningLang) {
  return lang === 'sw' && hasKiswahiliItems(instrument) && q.textSw ? q.textSw : q.text;
}

export function optionLabel(instrument: Instrument, o: Option, lang: ScreeningLang) {
  return lang === 'sw' && hasKiswahiliItems(instrument) && o.labelSw ? o.labelSw : o.label;
}
