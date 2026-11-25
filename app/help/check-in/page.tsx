'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Volume2, Check, Phone, MessageCircle, HeartHandshake, Sprout } from 'lucide-react';
import HelpShell from '@/components/help/HelpShell';
import {
  INSTRUMENTS,
  hasKiswahiliItems,
  instrumentById,
  optionLabel,
  questionText,
  scoreInstrument,
  type Instrument,
  type NextStep,
  type Result,
} from '@/lib/screening/instruments';
import { saveSelfCheck } from '@/lib/myspace/store';
import { useLang, type L } from '@/lib/i18n';

const NEXT_STEPS: Record<NextStep, { title: L; body: L; icon: typeof Phone; actions: { label: L; href: string }[] }> = {
  urgent: {
    title: { en: 'Please talk to someone today', sw: 'Tafadhali ongea na mtu leo' },
    body: {
      en: 'You said you have had thoughts of harming yourself. You do not have to carry this alone. These people are ready to listen, right now, for free.',
      sw: 'Umesema umekuwa na mawazo ya kujidhuru. Huhitaji kubeba hili peke yako. Watu hawa wako tayari kukusikiliza, sasa hivi, bure.',
    },
    icon: Phone,
    actions: [
      { label: { en: 'Call Befrienders Kenya', sw: 'Piga Befrienders Kenya' }, href: 'tel:+254722178177' },
      { label: { en: 'Call 1195', sw: 'Piga 1195' }, href: 'tel:1195' },
      { label: { en: "I'm not safe now", sw: 'Siko salama sasa' }, href: '/help/safe-now' },
    ],
  },
  see_someone: {
    title: { en: 'Your next step: talk to a counsellor', sw: 'Hatua yako inayofuata: ongea na mshauri' },
    body: {
      en: 'Talking with a trained person can really help, and it is confidential. A recovery centre or counsellor can see you, and you choose when.',
      sw: 'Kuongea na mtu aliyefunzwa kunaweza kusaidia sana, na ni siri. Kituo cha kupona au mshauri anaweza kukuona, na wewe ndiye unachagua lini.',
    },
    icon: HeartHandshake,
    actions: [
      { label: { en: 'Call GVRC 0709 400 200', sw: 'Piga GVRC 0709 400 200' }, href: 'tel:0709400200' },
      { label: { en: 'Ask HEAL to connect you', sw: 'Omba HEAL ikuunganishe' }, href: '#connect' },
    ],
  },
  talk: {
    title: { en: 'Your next step: talk it through', sw: 'Hatua yako inayofuata: ongea kuhusu hili' },
    body: {
      en: 'Sharing what you are carrying can make it lighter. Nia is here any time, and you can stay anonymous.',
      sw: 'Kushiriki unachobeba kunaweza kukifanya kiwe chepesi. Nia yupo wakati wowote, na unaweza kubaki bila jina.',
    },
    icon: MessageCircle,
    actions: [{ label: { en: 'Talk with Nia', sw: 'Ongea na Nia' }, href: '/anonymous' }],
  },
  self_care: {
    title: { en: 'Your next step: keep looking after yourself', sw: 'Hatua yako inayofuata: endelea kujitunza' },
    body: {
      en: 'Keep doing what helps. A safety plan and small daily check-ins can make hard days easier.',
      sw: 'Endelea kufanya kinachokusaidia. Mpango wa usalama na ukaguzi mdogo wa kila siku unaweza kurahisisha siku ngumu.',
    },
    icon: Sprout,
    actions: [{ label: { en: 'Open My Space', sw: 'Fungua Nafasi Yangu' }, href: '/my-space' }],
  },
};

function Chooser() {
  const { lang, tr } = useLang();
  return (
    <section className="py-8">
      <h1 className="text-3xl font-acme text-[#2C4A4E]">{tr("How are you doing?", "Unaendeleaje?")}</h1>
      <p className="mt-2 text-gray-600">
        {tr("Pick the one that sounds most like you. It’s a few quick questions, just for you: nothing is shared unless you choose.", "Chagua kinachokufanana zaidi. Ni maswali machache ya haraka, kwa ajili yako tu: hakuna kinachoshirikiwa usipochagua.")}
      </p>
      <div className="mt-6 space-y-3">
        {INSTRUMENTS.map((inst) => (
          <Link
            key={inst.id}
            href={`/help/check-in?tool=${inst.id}`}
            className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="flex-1">
              <span className="block font-acme text-xl text-[#2C4A4E]">{lang === 'sw' ? inst.titleSw : inst.title}</span>
              <span className="block text-sm text-gray-600">{lang === 'sw' ? inst.hintSw : inst.hint}</span>
              <span className="mt-1 block text-xs text-gray-500">
                {lang === 'sw' ? `Maswali ${inst.questions.length} · kama dakika ${inst.minutes}` : `${inst.questions.length} quick questions · about ${inst.minutes} minutes`}
                {lang === 'sw' && !hasKiswahiliItems(inst) && ' · maswali kwa Kiingereza kwa sasa'}
              </span>
            </span>
            <ChevronRight className="h-5 w-5 text-[#2C4A4E]" aria-hidden="true" />
          </Link>
        ))}
        <Link
          href="/anonymous?tab=screening"
          className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="flex-1">
            <span className="block font-acme text-xl text-[#2C4A4E]">{tr("After something frightening", "Baada ya jambo la kutisha")}</span>
            <span className="block text-sm text-gray-600">{tr("Bad memories, nightmares, or feeling jumpy or numb since something scary happened?", "Kumbukumbu mbaya, ndoto za kutisha, au kushtuka au kukosa hisia tangu jambo la kutisha litokee?")}</span>
            <span className="mt-1 block text-xs text-gray-500">{tr("8 quick questions · about 3 minutes · works without internet", "Maswali 8 · kama dakika 3 · inafanya kazi bila intaneti")}</span>
          </span>
          <ChevronRight className="h-5 w-5 text-[#2C4A4E]" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function Questionnaire({ instrument }: { instrument: Instrument }) {
  const { lang, tr } = useLang();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [saved, setSaved] = useState(false);
  const question = instrument.questions[index];
  const options = question.options ?? instrument.options;

  const choose = (value: number) => {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (index < instrument.questions.length - 1) setIndex(index + 1);
    else setResult(scoreInstrument(instrument, next));
  };

  const readAloud = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'sw' ? 'sw-KE' : 'en-KE';
    window.speechSynthesis.speak(utterance);
  };

  if (result) {
    const step = NEXT_STEPS[result.step];
    const Icon = step.icon;
    const save = () => {
      saveSelfCheck({
        tool: instrument.id,
        toolName: tr(instrument.title, instrument.titleSw),
        score: result.score,
        band: result.band.id,
        bandLabel: tr(result.band.label, result.band.labelSw),
        urgent: result.urgent,
        date: new Date().toISOString(),
      });
      setSaved(true);
    };
    return (
      <section className="py-8 space-y-4">
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm heal-panel">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#2C4A4E]">{tr(instrument.title, instrument.titleSw)}</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-acme text-[#2C4A4E]">{tr("Thank you for checking in", "Asante kwa kujikagua")}</h1>
          <p className="mt-3 text-gray-700 leading-relaxed">{tr(result.band.summary, result.band.summarySw)}</p>
          <p className="mt-2 text-xs text-gray-500">
            {tr(`This is a screening, not a diagnosis. Score ${result.score} of ${result.maxScore}.`, `Huu ni ukaguzi, si utambuzi wa ugonjwa. Alama ${result.score} kati ya ${result.maxScore}.`)}
          </p>
          <button
            type="button"
            onClick={() => readAloud(`${tr(result.band.summary, result.band.summarySw)} ${tr(step.title)}. ${tr(step.body)}`)}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2C4A4E] underline-offset-4 hover:underline"
          >
            <Volume2 className="h-4 w-4" aria-hidden="true" /> {tr("Read this to me", "Nisomee hii")}
          </button>
        </div>

        <div className={`rounded-3xl p-6 sm:p-8 shadow-sm ${result.urgent ? 'bg-[#2C4A4E] text-white' : 'bg-[#2C4A4E]/10'}`}>
          <Icon className={`h-8 w-8 ${result.urgent ? 'text-[#D97E7E]' : 'text-[#2C4A4E]'}`} aria-hidden="true" />
          <h2 className="mt-3 text-2xl font-acme">{tr(step.title)}</h2>
          <p className={`mt-2 leading-relaxed ${result.urgent ? 'text-white/85' : 'text-gray-700'}`}>{tr(step.body)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {step.actions.map((a, i) => (
              <a
                key={a.href}
                href={a.href}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold ${
                  i === 0
                    ? result.urgent
                      ? 'bg-white text-[#2C4A4E]'
                      : 'bg-[#2C4A4E] text-white hover:bg-[#2C4A4E]/90'
                    : result.urgent
                      ? 'border border-white/60 text-white'
                      : 'border border-[#2C4A4E] text-[#2C4A4E]'
                }`}
              >
                {tr(a.label)}
              </a>
            ))}
          </div>
        </div>

        <div id="connect" className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm heal-panel">
          <h2 className="text-2xl font-acme text-[#2C4A4E]">
            {result.step === 'self_care' ? tr("Would you like a CHP to check in on you?", "Ungependa CHP akutembelee?") : tr("Would you like us to connect you with care?", "Ungependa tukuunganishe na huduma?")}
          </h2>
          <p className="mt-2 text-gray-700">
            {tr("We pass your request to a trained partner near you, such as a Community Health Promoter or counsellor. You choose who, and how they reach you.", "Tunapeleka ombi lako kwa mshirika aliyefunzwa aliye karibu nawe, kama Mhamasishaji wa Afya ya Jamii au mshauri. Wewe ndiye unachagua nani, na wakufikie vipi.")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`/help/connect?from=screening&pathway=${result.step === 'urgent' || result.step === 'see_someone' ? 'refer' : 'chp_follow_up'}&urgent=${result.urgent ? 1 : 0}&tool=${instrument.id}&band=${result.band.id}&score=${result.score}`}
              className="rounded-full bg-[#2C4A4E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2C4A4E]/90"
            >
              {tr("Yes, connect me", "Ndiyo, niunganishe")}
            </a>
            <span className="self-center text-sm text-gray-600">{tr("or simply save your result below.", "au hifadhi tu matokeo yako hapa chini.")}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saved}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#2C4A4E] shadow-sm disabled:opacity-70 hover:opacity-90 hover:shadow-md"
          >
            {saved ? <Check className="h-4 w-4 text-[#2C4A4E]" /> : null}
            {saved ? tr("Saved to My Space", "Imehifadhiwa kwenye Nafasi Yangu") : tr("Save to My Space", "Hifadhi kwenye Nafasi Yangu")}
          </button>
          <Link href="/help/check-in" className="text-sm text-gray-600 underline hover:opacity-80">
            {tr("Try another check", "Jaribu ukaguzi mwingine")}
          </Link>
        </div>
        <p className="text-xs text-gray-400">{instrument.source}</p>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="flex items-center gap-1.5" aria-label={tr(`Question ${index + 1} of ${instrument.questions.length}`, `Swali ${index + 1} kati ya ${instrument.questions.length}`)}>
        {instrument.questions.map((q, i) => (
          <span key={q.id} className={`h-1.5 flex-1 rounded-full ${i <= index ? 'bg-[#2C4A4E]' : 'bg-black/10'}`} />
        ))}
      </div>
      {lang === 'sw' && !hasKiswahiliItems(instrument) && (
        <p className="mt-6 rounded-2xl bg-white/70 px-4 py-3 text-sm text-gray-700">
          Toleo la Kiswahili lililothibitishwa la maswali haya bado linaandaliwa, kwa hivyo maswali yako kwa Kiingereza.
        </p>
      )}
      <p className="mt-6 text-sm text-gray-600">{lang === 'sw' && instrument.stemSw ? instrument.stemSw : instrument.stem}</p>
      <h1 className="mt-3 text-2xl sm:text-3xl font-acme text-[#2C4A4E] leading-snug">{questionText(instrument, question, lang)}</h1>
      <div className="mt-6 space-y-3">
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => choose(o.value)}
            className={`w-full rounded-2xl border px-5 py-4 text-left font-medium transition-colors ${
              answers[question.id] === o.value
                ? 'border-[#2C4A4E] bg-[#2C4A4E]/10 text-[#2C4A4E]'
                : 'border-transparent bg-white text-[#2C4A4E] hover:border-[#2C4A4E]/40'
            }`}
          >
            {optionLabel(instrument, o, lang)}
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={index === 0}
          className="inline-flex items-center gap-1 text-gray-600 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> {tr("Back", "Rudi")}
        </button>
        <Link href="/help" className="text-gray-600 underline hover:opacity-80">
          {tr("Stop for now", "Simama kwa sasa")}
        </Link>
      </div>
    </section>
  );
}

function CheckInRouter() {
  const instrument = instrumentById(useSearchParams().get('tool'));
  return (
    <HelpShell back={instrument ? '/help/check-in' : '/help'} showLanguage={false}>
      {instrument ? <Questionnaire key={instrument.id} instrument={instrument} /> : <Chooser />}
    </HelpShell>
  );
}

export default function CheckInPage() {
  // useSearchParams needs a Suspense boundary in the static export.
  return (
    <Suspense fallback={null}>
      <CheckInRouter />
    </Suspense>
  );
}
