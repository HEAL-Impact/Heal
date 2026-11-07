'use client';

import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronLeft, Award } from 'lucide-react';
import StaffShell from '@/components/care/StaffShell';
import { MODULES, loadProgress, saveProgress, type Module } from '@/lib/care/training';
import { useLang } from '@/lib/i18n';

function ModuleView({ module, onDone }: { module: Module; onDone: () => void }) {
  const { tr } = useLang();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const correct = module.quiz.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" onClick={onDone} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:opacity-80">
        <ChevronLeft className="h-4 w-4" /> {tr("All modules", "Moduli zote")}
      </button>
      <h1 className="mt-3 text-3xl font-acme text-[#2C4A4E]">{tr(module.title)}</h1>
      <p className="text-sm text-gray-500">{tr(module.audience)} · {tr(`about ${module.minutes} minutes · works offline`, `kama dakika ${module.minutes} · inafanya kazi bila mtandao`)}</p>

      <div className="mt-6 space-y-4">
        {module.lessons.map((l) => (
          <section key={l.title.en} className="rounded-2xl bg-white p-5 shadow-sm heal-panel">
            <h2 className="font-acme text-xl text-[#2C4A4E]">{tr(l.title)}</h2>
            <ul className="mt-2 space-y-1.5 text-gray-700">
              {l.points.map((p) => (
                <li key={p.en}>• {tr(p)}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm heal-panel">
        <h2 className="font-acme text-xl text-[#2C4A4E]">{tr("Check your understanding", "Pima uelewa wako")}</h2>
        <ol className="mt-3 space-y-5">
          {module.quiz.map((q, i) => (
            <li key={q.q.en}>
              <p className="font-medium text-[#2C4A4E]">{i + 1}. {tr(q.q)}</p>
              <div className="mt-2 space-y-2">
                {q.options.map((o, j) => {
                  const chosen = answers[i] === j;
                  const state = submitted ? (j === q.answer ? 'right' : chosen ? 'wrong' : '') : chosen ? 'chosen' : '';
                  return (
                    <button
                      key={o.en}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers({ ...answers, [i]: j })}
                      className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm ${
                        state === 'right'
                          ? 'border-[#2C4A4E] bg-[#2C4A4E]/10'
                          : state === 'wrong'
                            ? 'border-[#D97E7E] bg-[#F9EBEB]'
                            : state === 'chosen'
                              ? 'border-[#2C4A4E] bg-[#2C4A4E]/10'
                              : 'border-gray-200'
                      }`}
                    >
                      {tr(o)}
                    </button>
                  );
                })}
              </div>
              {submitted && <p className="mt-2 text-sm text-gray-600">{tr(q.why)}</p>}
            </li>
          ))}
        </ol>
        {submitted ? (
          <p className="mt-5 flex items-center gap-2 font-semibold text-[#2C4A4E]">
            <Award className="h-5 w-5 text-[#F59E0B]" /> {tr(`${correct} of ${module.quiz.length} correct`, `${correct} kati ya ${module.quiz.length} sahihi`)}
          </p>
        ) : (
          <button
            type="button"
            disabled={Object.keys(answers).length < module.quiz.length}
            onClick={() => {
              setSubmitted(true);
              saveProgress(module.id, module.quiz.filter((q, i) => answers[i] === q.answer).length);
            }}
            className="mt-5 rounded-full bg-[#2C4A4E] px-6 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {tr("Check answers", "Kagua majibu")}
          </button>
        )}
      </section>
    </div>
  );
}

export default function LearnPage() {
  const { tr } = useLang();
  const [open, setOpen] = useState<Module | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => setProgress(loadProgress()), [open]);

  return (
    <StaffShell requireAuth={false}>
      {open ? (
        <ModuleView module={open} onDone={() => setOpen(null)} />
      ) : (
        <>
          <h1 className="text-3xl font-acme text-[#2C4A4E]">{tr("Training for frontline workers", "Mafunzo kwa wahudumu wa mstari wa mbele")}</h1>
          <p className="text-gray-600">{tr("Short modules for teachers, community health volunteers and social workers. They work offline.", "Moduli fupi kwa walimu, wahudumu wa afya wa jamii na wafanyakazi wa ustawi wa jamii. Zinafanya kazi bila mtandao.")}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {MODULES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setOpen(m)}
                className="flex flex-col rounded-2xl bg-white p-5 text-left shadow-sm hover:shadow-md"
              >
                <BookOpen className="h-7 w-7 text-[#2C4A4E]" aria-hidden="true" />
                <h2 className="mt-3 font-acme text-xl text-[#2C4A4E]">{tr(m.title)}</h2>
                <p className="mt-1 text-sm text-gray-600">{tr(m.audience)} · {tr(`${m.minutes} min`, `dakika ${m.minutes}`)}</p>
                {progress[m.id] !== undefined && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#2C4A4E]">
                    <CheckCircle2 className="h-4 w-4" /> {tr('Completed', 'Imekamilika')}: {progress[m.id]}/{m.quiz.length}
                  </p>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </StaffShell>
  );
}
