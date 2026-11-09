// MOCK instrument: placeholder items and cut-offs for exercising the workflow.
// Not clinically validated. Mirrors the shape of the PCL-5 (0–4 Likert per item)
// so swapping in the real instrument is a content change, not a code change.
// Keep in sync with backend/internal/screening/ptsd_instrument.go.

export const PTSD_INSTRUMENT_ID = 'ptsd-mock-v1';

export const ANSWER_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'A little bit' },
  { value: 2, label: 'Moderately' },
  { value: 3, label: 'Quite a bit' },
  { value: 4, label: 'Extremely' },
] as const;

export const QUESTION_STEM = 'In the past month, how much were you bothered by:';

export const QUESTIONS = [
  { id: 'q1', text: 'Repeated, disturbing, and unwanted memories of a stressful experience?' },
  { id: 'q2', text: 'Repeated, disturbing dreams of a stressful experience?' },
  { id: 'q3', text: 'Feeling very upset when something reminded you of a stressful experience?' },
  { id: 'q4', text: 'Avoiding people, places, or activities that remind you of a stressful experience?' },
  { id: 'q5', text: 'Feeling distant or cut off from other people?' },
  { id: 'q6', text: 'Having strong negative feelings such as fear, anger, guilt, or shame?' },
  { id: 'q7', text: 'Being "super alert", watchful, or on guard?' },
  { id: 'q8', text: 'Having difficulty falling or staying asleep?' },
] as const;

export const MAX_SCORE = QUESTIONS.length * ANSWER_OPTIONS[ANSWER_OPTIONS.length - 1].value;

export type Band = 'low' | 'moderate' | 'high';

export const BANDS: Record<Band, { label: string; min: number; max: number; summary: string; advice: string }> = {
  low: {
    label: 'Low',
    min: 0,
    max: 10,
    summary: 'Your answers suggest few trauma-related symptoms right now.',
    advice: 'Keep looking after yourself. If things change, you can screen again any time.',
  },
  moderate: {
    label: 'Moderate',
    min: 11,
    max: 20,
    summary: 'Your answers suggest some trauma-related symptoms that may be affecting you.',
    advice: 'Talking to someone can help. Consider reaching out to a counsellor or a community health volunteer.',
  },
  high: {
    label: 'High',
    min: 21,
    max: MAX_SCORE,
    summary: 'Your answers suggest significant trauma-related symptoms.',
    advice: 'Please reach out for support soon. The hotlines below are free and available 24/7.',
  },
};

export type PresentationMode = 'text' | 'audio' | 'avatar';

export function bandFor(score: number): Band {
  if (score >= BANDS.high.min) return 'high';
  if (score >= BANDS.moderate.min) return 'moderate';
  return 'low';
}

export function scoreAnswers(answers: number[]): { totalScore: number; band: Band } {
  const totalScore = answers.reduce((sum, value) => sum + value, 0);
  return { totalScore, band: bandFor(totalScore) };
}

// Kiswahili for the placeholder questions above (same order and values). Like the
// English, these are for testing the workflow only; a validated instrument and
// its validated Kiswahili version replace both.
export const QUESTION_STEM_SW = 'Katika mwezi uliopita, ni kwa kiasi gani umesumbuliwa na:';

export const ANSWER_OPTIONS_SW = ['Hata kidogo', 'Kidogo', 'Kwa kiasi', 'Sana', 'Kupita kiasi'];

export const QUESTIONS_SW: Record<string, string> = {
  q1: 'Kumbukumbu za mara kwa mara, zinazosumbua na usizozitaka, za tukio lililokuletea dhiki?',
  q2: 'Ndoto za mara kwa mara zinazosumbua kuhusu tukio lililokuletea dhiki?',
  q3: 'Kusumbuka sana kitu kilipokukumbusha tukio lililokuletea dhiki?',
  q4: 'Kuepuka watu, mahali, au shughuli zinazokukumbusha tukio lililokuletea dhiki?',
  q5: 'Kujihisi mbali au kutengwa na watu wengine?',
  q6: 'Kuwa na hisia kali mbaya kama hofu, hasira, hatia, au aibu?',
  q7: 'Kuwa macho kupita kiasi, mwangalifu sana, au kujihami kila wakati?',
  q8: 'Kuwa na shida ya kupata usingizi au kuendelea kulala?',
};

export const BANDS_SW: Record<Band, { label: string; summary: string; advice: string }> = {
  low: {
    label: 'Chini',
    summary: 'Majibu yako yanaonyesha dalili chache zinazohusiana na kiwewe kwa sasa.',
    advice: 'Endelea kujitunza. Mambo yakibadilika, unaweza kujikagua tena wakati wowote.',
  },
  moderate: {
    label: 'Wastani',
    summary: 'Majibu yako yanaonyesha baadhi ya dalili zinazohusiana na kiwewe ambazo huenda zinakuathiri.',
    advice: 'Kuongea na mtu kunaweza kusaidia. Fikiria kuwasiliana na mshauri au mhudumu wa afya wa jamii.',
  },
  high: {
    label: 'Juu',
    summary: 'Majibu yako yanaonyesha dalili kubwa zinazohusiana na kiwewe.',
    advice: 'Tafadhali tafuta msaada mapema. Simu zilizo hapa chini ni bure na zinapatikana saa 24.',
  },
};
