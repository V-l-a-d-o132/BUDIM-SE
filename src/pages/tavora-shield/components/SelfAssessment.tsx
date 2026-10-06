import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/base/Icon';
import {
  assessmentParts, assessmentQuestions, assessmentScales, assessmentAnswerLabel,
  skippedAnswerLabel, hasAssessmentAnswer, calculateSelfAssessment, ASSESSMENT_VERSION,
  type AssessmentAnswers,
} from '@/lib/self-assessment';

export default function SelfAssessment() {
  const [started, setStarted] = useState(false);
  const [currentPart, setCurrentPart] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const part = assessmentParts[currentPart];
  const answeredCount = assessmentQuestions.filter(question => hasAssessmentAnswer(answers, question)).length;
  const remainingInPart = part.questions.filter(question => !hasAssessmentAnswer(answers, question)).length;
  const complete = answeredCount === assessmentQuestions.length;
  const result = showResults && complete ? calculateSelfAssessment(answers) : null;

  const focusHeading = () => requestAnimationFrame(() => {
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  const navigate = (index: number) => {
    setCurrentPart(index);
    focusHeading();
  };
  const next = () => {
    if (remainingInPart) return;
    if (currentPart < assessmentParts.length - 1) navigate(currentPart + 1);
    else if (complete) { setShowResults(true); focusHeading(); }
    else navigate(assessmentParts.findIndex(candidate => candidate.questions.some(question => !hasAssessmentAnswer(answers, question))));
  };
  const reset = () => {
    setAnswers({}); setCurrentPart(0); setShowResults(false); setStarted(false);
    focusHeading();
  };

  return (
    <div className="max-w-3xl mx-auto" data-testid="self-assessment">
      {!started ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-5">
            <Icon name="ri-brain-line" size={25} className="text-gray-700" aria-hidden="true" />
          </div>
          <h3 ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl font-medium text-gray-900 mb-3 scroll-mt-28">Разгледай дигиталните си навици</h3>
          <p className="text-sm text-gray-600 leading-relaxed">Оригиналните 35 въпроса от авторската рамка, с ясна карта на отговорите по пет теми. Избираш отговор и продължаваш със собствено темпо.</p>
          <div className="grid grid-cols-3 gap-3 my-6 border-y border-gray-100 py-5">
            {[['35', 'въпроса'], ['5', 'теми'], ['Твоето', 'темпо']].map(([number, label]) => (
              <div key={label}><p className="text-xl font-medium text-gray-900">{number}</p><p className="text-xs text-gray-500 mt-1">{label}</p></div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-600 leading-relaxed mb-6">
            <p>За въпросите за честота и сила на преживяването мисли за последните 7 дни. За общата собствена преценка използвай опита си сега.</p>
            <p>Ако ситуацията не се отнася за теб или нямаш достатъчно опит, избери „Не се отнася / не мога да преценя“. Този избор се показва отделно.</p>
            <p>Няма верни и грешни отговори. Честото използване на телефон може да има различни причини, включително работа, достъпност или грижа за друг човек.</p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">Това е авторска образователна самооценка без психометрична валидация. Тя не установява зависимост, психично здраве, произход на мислите или „степен“ на човека.</p>
          <p className="text-xs text-gray-500 leading-relaxed mb-6"><Icon name="ri-lock-line" size={13} className="inline mr-1" aria-hidden="true" />Отговорите и резултатът се обработват само в този отворен раздел на браузъра. Не се изпращат към сървър или AI и не се записват. При презареждане се изчистват. <Link to="/privacy" className="underline underline-offset-2">Поверителност</Link>.</p>
          <button type="button" onClick={() => { setStarted(true); focusHeading(); }} className="inline-flex items-center gap-2 px-7 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
            Започни <Icon name="ri-arrow-right-line" size={17} aria-hidden="true" />
          </button>
        </div>
      ) : result ? (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Твоята самооценка</p>
            <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-medium text-gray-900 mb-3 scroll-mt-28">Карта на отговорите</h3>
            <p className="text-sm text-gray-600 leading-relaxed">Виж какво си избрал по всяка тема. Навиците, преживяванията и собствената преценка се показват по съответната им скала. Отговор от една тема не променя или отменя отговор от друга.</p>
            <div className="flex flex-wrap gap-2 mt-5 text-xs">
              <span className="px-3 py-2 bg-gray-100 rounded-full text-gray-700">{result.answeredCount} {result.answeredCount === 1 ? 'конкретен отговор' : 'конкретни отговора'}</span>
              <span className="px-3 py-2 bg-gray-100 rounded-full text-gray-700">{result.skippedCount} неприложими / без преценка</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mt-4">Картата е описание на самоотчета ти. Тя не е оценка за „добър“ или „лош“ навик, диагноза или сравнение с други хора. Различни отговори могат да са едновременно верни в различни ситуации.</p>
          </div>
          <details className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-600">
            <summary className="cursor-pointer font-medium text-gray-900">Как се получава резултатът</summary>
            <div className="mt-3 space-y-2 leading-relaxed">
              <p>Броим избраните отговори по тема и вид скала. Например „Често — 3“ означава, че си избрал „Често“ за три въпроса от тази група.</p>
              <p>Няма обърнато точкуване, скрити тежести, бонуси, наказания или въпроси за „разкриване“ на други отговори. Не събираме различните скали в общ индекс.</p>
              <p>Неприложимите отговори се показват отделно и не се третират като „Никога“ или като затруднение. При повече такива отговори картината е по-непълна.</p>
              <p className="text-xs text-gray-500">Метод: {ASSESSMENT_VERSION}. Въпросите са авторски и не са валидиран диагностичен инструмент. По-старият общ индекс не е съпоставим с тази карта.</p>
            </div>
          </details>
          {result.parts.map((summary, index) => {
            const definition = assessmentParts[index];
            return (
              <section key={summary.id} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-medium text-gray-900">{index + 1}. {summary.title}</h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{summary.answeredCount} / {summary.totalCount} конкретни</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">{definition.description}</p>
                {summary.groups.map(group => (
                  <div key={group.kind} className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">{group.title} · {group.answeredCount} отговора</p>
                    {group.answeredCount ? (
                      <div className="flex flex-wrap gap-2">
                        {group.choices.filter(choice => choice.count > 0).map(choice => (
                          <span key={choice.value} className="border border-gray-200 bg-gray-50 px-3 py-2 rounded-lg text-xs text-gray-700">{choice.label} <strong className="ml-1 tabular-nums">{choice.count}</strong></span>
                        ))}
                      </div>
                    ) : <p className="text-xs text-gray-500">Няма конкретни отговори по тази скала.</p>}
                  </div>
                ))}
                {summary.skippedCount > 0 && <p className="text-xs text-gray-500 mb-4">{summary.skippedCount} въпроса: не се отнасят / без достатъчно преценка.</p>}
                <details className="border-t border-gray-100 pt-3">
                  <summary className="text-sm text-gray-700 font-medium cursor-pointer">Виж въпросите и отговорите</summary>
                  <ol className="divide-y divide-gray-100 mt-3">
                    {definition.questions.map(question => (
                      <li key={question.id} className="py-3 text-sm">
                        <p className="text-gray-600 leading-relaxed">{question.text}</p>
                        <p className="text-gray-900 font-medium mt-1">{assessmentAnswerLabel(question, answers[question.id])}</p>
                      </li>
                    ))}
                  </ol>
                </details>
                {summary.answeredCount > 0 && <div className="mt-4 p-4 bg-gray-50 rounded-xl"><p className="text-xs font-medium text-gray-700 mb-1">По желание: малък експеримент</p><p className="text-sm text-gray-600 leading-relaxed">{definition.action}</p></div>}
              </section>
            );
          })}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => { setShowResults(false); focusHeading(); }} className="px-5 py-3 border border-gray-300 rounded-full text-sm text-gray-800 hover:bg-gray-50">Редактирай отговорите</button>
            <button type="button" onClick={reset} className="px-5 py-3 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200">Започни наново</button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8">
          <div className="flex items-center justify-between gap-4 text-xs text-gray-500 mb-3">
            <span>Тема {currentPart + 1} от {assessmentParts.length}</span>
            <span aria-live="polite">{answeredCount} / {assessmentQuestions.length} избрани</span>
          </div>
          <progress aria-label="Напредък на самооценката" value={answeredCount} max={assessmentQuestions.length} className="w-full h-1.5 accent-gray-900 mb-5" />
          <div className="flex flex-wrap gap-2 mb-6" aria-label="Теми на самооценката">
            {assessmentParts.map((candidate, index) => (
              <button type="button" key={candidate.id} onClick={() => navigate(index)} aria-current={index === currentPart ? 'step' : undefined} className={`px-3 py-2 min-h-10 rounded-lg text-xs border ${index === currentPart ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {index + 1}. {candidate.title}
              </button>
            ))}
          </div>
          <h3 ref={headingRef} tabIndex={-1} className="text-xl font-medium text-gray-900 mb-2 scroll-mt-28">{part.title}</h3>
          <p className="text-sm text-gray-500 mb-6">{part.description}</p>
          <div className="space-y-6">
            {part.questions.map((question, index) => {
              const scale = assessmentScales[question.kind];
              return (
                <fieldset key={question.id} className="bg-gray-50 rounded-xl px-4 pb-4 border border-gray-100">
                  <legend className="float-left w-full pt-4 mb-2 text-sm font-medium text-gray-900 leading-relaxed">{index + 1}. {question.text}</legend>
                  <div className="clear-both">
                    <p id={`hint-${question.id}`} className="text-xs text-gray-500 mb-3 leading-relaxed">{question.hint || scale.hint}</p>
                    <div className={`grid gap-2 ${scale.options.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-5'}`}>
                      {[...scale.options, { value: null, label: skippedAnswerLabel }].map(option => (
                        <label key={option.value ?? 'skip'} className={option.value === null ? 'col-span-2 sm:col-span-full cursor-pointer' : 'cursor-pointer'}>
                          <input type="radio" name={`assessment-${question.id}`} value={option.value ?? 'skip'} checked={answers[question.id] === option.value} aria-describedby={`hint-${question.id}`} onChange={() => setAnswers(previous => ({ ...previous, [question.id]: option.value }))} className="sr-only peer" />
                          <span className="flex items-center justify-center text-center min-h-11 px-2 py-2.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 peer-checked:bg-gray-900 peer-checked:text-white peer-checked:border-gray-900 peer-focus-visible:ring-2 peer-focus-visible:ring-gray-900 peer-focus-visible:ring-offset-2 hover:border-gray-400 transition-colors">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </fieldset>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-6 mb-3" aria-live="polite">{remainingInPart ? `Остават ${remainingInPart} избора в тази тема. Можеш да отбележиш и неприложим въпрос.` : 'Всички въпроси в тази тема са отбелязани.'}</p>
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => currentPart ? navigate(currentPart - 1) : setStarted(false)} className="px-4 sm:px-5 py-3 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">{currentPart ? 'Назад' : 'Въведение'}</button>
            <button type="button" onClick={next} disabled={remainingInPart > 0} className="px-4 sm:px-6 py-3 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">{currentPart < assessmentParts.length - 1 ? 'Напред' : complete ? 'Виж резултата' : 'Към останалите въпроси'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
