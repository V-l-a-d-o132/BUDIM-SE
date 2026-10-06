import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Icon from '@/components/base/Icon';
import { RECAPTCHA_SITE_KEY } from '@/components/base/RecaptchaBadge';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

type Scale = { label: string; value: number; score: number }[];

const frequencyNegative: Scale = [
  { label: 'Никога', value: 0, score: 0 },
  { label: 'Рядко', value: 1, score: 1 },
  { label: 'Понякога', value: 2, score: 2 },
  { label: 'Често', value: 3, score: 4 },
  { label: 'Постоянно', value: 4, score: 6 },
];
const frequencyProtective: Scale = [
  { label: 'Никога', value: 0, score: 0 },
  { label: 'Рядко', value: 1, score: 1 },
  { label: 'Понякога', value: 2, score: 2 },
  { label: 'Често', value: 3, score: 3 },
  { label: 'Постоянно', value: 4, score: 4 },
];
const binaryAwareness: Scale = [
  { label: 'Не, не мога', value: 0, score: 4 },
  { label: 'Рядко осъзнавам', value: 1, score: 3 },
  { label: 'Понякога', value: 2, score: 2 },
  { label: 'Често осъзнавам', value: 3, score: 1 },
  { label: 'Да, напълно', value: 4, score: 0 },
];
const intensityNegative: Scale = [
  { label: 'Изобщо не', value: 0, score: 0 },
  { label: 'Леко', value: 1, score: 1 },
  { label: 'Умерено', value: 2, score: 3 },
  { label: 'Силно', value: 3, score: 5 },
  { label: 'Много силно', value: 4, score: 7 },
];
const stateNegative: Scale = [
  { label: 'Изобщо не', value: 0, score: 0 },
  { label: 'Рядко', value: 1, score: 2 },
  { label: 'Понякога', value: 2, score: 4 },
  { label: 'Често', value: 3, score: 6 },
  { label: 'Почти винаги', value: 4, score: 8 },
];
const stateProtective: Scale = [
  { label: 'Изобщо не', value: 0, score: 0 },
  { label: 'Рядко', value: 1, score: 2 },
  { label: 'Понякога', value: 2, score: 4 },
  { label: 'Често', value: 3, score: 6 },
  { label: 'Да, напълно', value: 4, score: 8 },
];

type QuestionMeta = { text: string; type: string; scoring: string };
type Part = {
  title: string;
  subtitle: string;
  questions: (string | QuestionMeta)[];
  type: string;
  scoring: string;
};

const quizParts: Part[] = [
  {
    title: 'ЧАСТ 1: Как реагираш',
    subtitle: 'Посягаш ли към телефона преди да си помислил?',
    questions: [
      'Първото ти действие сутрин е към екрана на телефона?',
      'Случвало ли се е да се събудиш с телефона в ръка, без да помниш как си го взел?',
      'Забравяш ли понякога защо си отключил телефона си?',
      'Колко често проверяваш устройството си без известие?',
      'Усещаш ли „фантомни вибрации"?',
      'Изпитваш ли паника, ако излезеш без телефон?',
      'Колко често гледаш съдържание, което не помниш след 10 минути?',
    ],
    type: 'frequency',
    scoring: 'negative',
  },
  {
    title: 'ЧАСТ 2: Как се чувстваш',
    subtitle: 'Скролването те зарежда или изтощава?',
    questions: [
      'Чувстваш ли се емоционално празен след скролване?',
      'Изпитваш ли срам, че не можеш да спреш дигиталната консумация?',
      'Гледаш ли видео само защото алгоритъмът го пусна автоматично?',
      'Завиждаш ли на хора, които изглеждат щастливи онлайн?',
      'Изпитваш ли безпокойство (FOMO), когато си офлайн?',
      'Харесваш ли съдържание, което всъщност презираш?',
      'Гледаш ли чужди животи, за да избегнеш своя?',
    ],
    type: 'frequency',
    scoring: 'negative',
  },
  {
    title: 'ЧАСТ 3: Офлайн навици',
    subtitle: 'Можеш ли да бъдеш без телефон — и как се чувстваш тогава?',
    questions: [
      'Имаш ли часове през деня, в които умишлено си офлайн?',
      'Оставяш ли телефона в друга стая, когато работиш?',
      'Можеш ли да бъдеш сам без технологии за 30 минути?',
      'Четеш ли дълги текстове без да проверяваш телефона?',
      'Можеш ли да слушаш човек за 10 минути без да погледнеш екрана?',
      'Поставяш ли си дигитални граници, които другите не разбират?',
      'Изпитваш ли радост от бавни дейности без технология?',
    ],
    type: 'frequency',
    scoring: 'protective',
  },
  {
    title: 'ЧАСТ 4: Твои ли са мислите ти',
    subtitle: 'Мислиш ли сам или повтаряш това, което алгоритъмът ти е показал?',
    questions: [
      { text: 'Разграничаваш ли своите мисли от тези на алгоритъма?', type: 'awareness', scoring: 'binary' },
      { text: 'Изтрил ли си публикация, защото не е автентична?', type: 'behavior', scoring: 'protective' },
      { text: 'Смяташ ли, че говориш с „чужди думи" от мрежата?', type: 'awareness', scoring: 'negative' },
      { text: 'Знаеш ли кога живееш според своите ценности, а не според трендовете?', type: 'awareness', scoring: 'binary' },
      { text: 'Мислиш ли по-ясно след 24 часа офлайн?', type: 'behavior', scoring: 'protective' },
      { text: 'Искал ли си да изчезнеш от мрежата, но те е страх да не изпуснеш нещо?', type: 'awareness', scoring: 'negative' },
      { text: 'Виждаш ли телефона като инструмент, а не като част от теб?', type: 'awareness', scoring: 'binary' },
    ],
    type: 'mixed',
    scoring: 'mixed',
  },
  {
    title: 'ЧАСТ 5: Общата картина',
    subtitle: 'Как изглежда животът ти с технологиите — честно?',
    questions: [
      { text: 'Животът ти на автопилот ли е?', type: 'state', scoring: 'negative' },
      { text: 'Сравненията в мрежата натоварват ли те психически?', type: 'intensity', scoring: 'negative' },
      { text: 'Гледаш ли съдържание без никаква реална полза?', type: 'frequency', scoring: 'negative' },
      { text: 'Изпитваш ли физическа умора, но продължаваш да скролваш?', type: 'frequency', scoring: 'negative' },
      { text: 'Влизаш ли в социални мрежи напълно механично?', type: 'frequency', scoring: 'negative' },
      { text: 'Изпитваш ли вина, когато си изключен от потока информация?', type: 'intensity', scoring: 'negative' },
      { text: 'Притежаваш ли пълна свобода над вниманието си сега?', type: 'state', scoring: 'protective' },
    ],
    type: 'mixed',
    scoring: 'mixed',
  },
];

function getScale(partIndex: number, questionIndex: number): Scale {
  const part = quizParts[partIndex];
  if (part.type === 'frequency') {
    return part.scoring === 'negative' ? frequencyNegative : frequencyProtective;
  }
  const q = part.questions[questionIndex] as QuestionMeta;
  if (q.type === 'awareness' && q.scoring === 'binary') return binaryAwareness;
  if (q.type === 'behavior' && q.scoring === 'protective') return frequencyProtective;
  if (q.type === 'awareness' && q.scoring === 'negative') return frequencyNegative;
  if (q.type === 'intensity' && q.scoring === 'negative') return intensityNegative;
  if (q.type === 'state' && q.scoring === 'negative') return stateNegative;
  if (q.type === 'state' && q.scoring === 'protective') return stateProtective;
  if (q.type === 'frequency' && q.scoring === 'negative') return frequencyNegative;
  return frequencyNegative;
}

function getQuestionText(partIndex: number, qi: number): string {
  const q = quizParts[partIndex].questions[qi];
  return typeof q === 'string' ? q : q.text;
}

const indicatorMeta: Record<
  string,
  {
    label: string;
    short: string;
    higherIsBetter: boolean;
    measures: string;
    howToRead: string;
    reflection: string;
    actions: string[];
    degreeLink: string;
    degreeName: string;
  }
> = {
  pci: {
    label: 'Съобщена автоматична реактивност',
    short: 'АР',
    higherIsBetter: false,
    measures: 'Честотата на автоматични реакции спрямо устройството, която съобщаваш в тези седем отговора.',
    howToRead: 'По-нисък сбор означава по-рядко съобщени автоматични реакции по тези въпроси.',
    reflection: 'Кога за последен път посягаше към телефона с конкретна причина, а не по навик?',
    actions: ['Постави телефона извън обсега си за 30 минути, докато работиш.', 'Преди да отключиш, запитай се: какво точно искам да направя сега?'],
    degreeLink: '/step-1',
    degreeName: 'Биологичният автоматизъм',
  },
  eei: {
    label: 'Съобщена дигитална умора',
    short: 'ДУ',
    higherIsBetter: false,
    measures: 'Честотата на умора и други описани затруднения, която съобщаваш в тези седем отговора.',
    howToRead: 'По-нисък сбор означава по-рядко съобщена умора по тези въпроси.',
    reflection: 'След колко време пред екрана започваш да се чувстваш празен, а не зареден?',
    actions: ['Планирай една конкретна офлайн почивка в деня си.', 'Забележи кое съдържание те изтощава и го ограничи съзнателно.'],
    degreeLink: '/step-2',
    degreeName: 'Алгоритмичният прицел',
  },
  cri: {
    label: 'Съобщени офлайн навици',
    short: 'ОН',
    higherIsBetter: true,
    measures: 'Честотата на описаните офлайн навици според тези седем отговора.',
    howToRead: 'По-висок сбор означава по-често съобщени офлайн навици; не измерва психологическа устойчивост.',
    reflection: 'Къде в деня си имаш (или можеш да създадеш) пространство без екран?',
    actions: ['Определи един „час без екран“ всеки ден.', 'Остави телефона в друга стая по време на хранене.'],
    degreeLink: '/step-3',
    degreeName: 'Когнитивна свобода',
  },
  asi: {
    label: 'Трудности с дигиталната самостоятелност',
    short: 'ДС',
    higherIsBetter: false,
    measures: 'Сборът от съобщените затруднения и обърнатите отговори за защитни навици в тази част. Той не установява произхода на мислите или влиянието на алгоритмите.',
    howToRead: 'По-нисък сбор означава по-рядко съобщени затруднения със самостоятелността по тези въпроси.',
    reflection: 'Коя своя мисъл през последните дни не идва от това, което си гледал онлайн?',
    actions: ['Остави си 10 минути на ден в тишина, без стимул.', 'Запиши една своя идея, преди да отвориш социалните мрежи.'],
    degreeLink: '/step-4',
    degreeName: 'Завръщане и реинтеграция',
  },
};

export default function SelfAssessment() {
  const [started, setStarted] = useState(false);
  const [currentPart, setCurrentPart] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [neuralGapEnabled, setNeuralGapEnabled] = useState(true);
  const [showNeuralGap, setShowNeuralGap] = useState(false);
  const [neuralGapProgress, setNeuralGapProgress] = useState(0);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaError, setRecaptchaError] = useState('');

  useEffect(() => {
    if (showNeuralGap && neuralGapProgress < 100) {
      const t = setTimeout(() => setNeuralGapProgress((p) => Math.min(p + 10, 100)), 100);
      return () => clearTimeout(t);
    }
    if (neuralGapProgress === 100) {
      const t = setTimeout(() => {
        setShowNeuralGap(false);
        setNeuralGapProgress(0);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [showNeuralGap, neuralGapProgress]);

  const withNeuralGap = (fn: () => void) => {
    if (neuralGapEnabled) {
      setShowNeuralGap(true);
      setTimeout(fn, 1000);
    } else {
      fn();
    }
  };

  const [selectedValues, setSelectedValues] = useState<Record<string, number>>({});

  const handleAnswer = (qi: number, value: number) => {
    const scale = getScale(currentPart, qi);
    const score = scale.find((s) => s.value === value)?.score ?? 0;
    const key = `${currentPart}-${qi}`;
    withNeuralGap(() => {
      setAnswers((prev) => ({ ...prev, [key]: score }));
      setSelectedValues((prev) => ({ ...prev, [key]: value }));
    });
  };

  const isPartComplete = () =>
    quizParts[currentPart].questions.every((_, i) => selectedValues[`${currentPart}-${i}`] !== undefined);

  const executeRecaptcha = async (): Promise<string | null> => {
    setRecaptchaError('');
    if (!recaptchaRef.current) {
      setRecaptchaError('reCAPTCHA не е зареден. Моля, опитай отново.');
      return null;
    }
    try {
      const token = await recaptchaRef.current.executeAsync();
      if (!token) {
        setRecaptchaError('reCAPTCHA валидацията не беше успешна.');
        return null;
      }
      return token;
    } catch {
      setRecaptchaError('reCAPTCHA грешка. Моля, презареди страницата.');
      return null;
    }
  };

  const submitToSupabase = async (recaptchaToken: string) => {
    try {
      setSubmitError(null);
      const res = await fetch(`${SUPABASE_URL}/functions/v1/tavora-shield-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ answers, recaptcha_token: recaptchaToken }),
      });
      if (!res.ok) throw new Error('Грешка при изпращане');
      const data = await res.json();
      if (data.success) {
        setResultData(data.result);
        return true;
      }
      throw new Error(data.error || 'Неизвестна грешка');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Грешка');
      return false;
    }
  };

  const nextPart = () => {
    withNeuralGap(async () => {
      if (currentPart < quizParts.length - 1) {
        setCurrentPart((p) => p + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const recaptchaToken = await executeRecaptcha();
        if (!recaptchaToken) return;
        setIsAnalyzing(true);
        const ok = await submitToSupabase(recaptchaToken);
        setIsAnalyzing(false);
        if (ok) {
          setShowResults(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  };

  const prevPart = () => {
    if (currentPart > 0) {
      setCurrentPart((p) => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const reset = () => {
    setStarted(false);
    setCurrentPart(0);
    setAnswers({});
    setSelectedValues({});
    setShowResults(false);
    setIsAnalyzing(false);
    setResultData(null);
    setSubmitError(null);
    setRecaptchaError('');
    recaptchaRef.current?.reset();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      {/* Neural Gap Overlay */}
      {showNeuralGap && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                <circle
                  cx="40" cy="40" r="32"
                  stroke="#111827" strokeWidth="6" fill="none"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - neuralGapProgress / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-900 text-lg font-light">{(neuralGapProgress / 100).toFixed(1)}s</span>
              </div>
            </div>
            <p className="text-gray-900 font-medium text-sm">Пауза за размисъл</p>
            <p className="text-gray-400 text-xs mt-1">Осъзнат избор</p>
          </div>
        </div>
      )}

      {!started ? (
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
            <Icon name="ri-brain-line" size={28} className="text-gray-600" />
          </div>
           <h3 className="text-xl font-medium text-gray-900 mb-2">Разгледай дигиталните си навици</h3>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-8">
             35 въпроса в 5 части. Получаваш ориентир за размисъл в авторската рамка на книгата.
             Въпросникът няма психометрична валидация и не измерва зависимост, психично здраве или място сред други хора.
           </p>
           <p className="text-xs text-gray-600 leading-relaxed max-w-xl mx-auto mb-6">При изпращане отговорите се обработват на сървъра за изчисляване на резултата. В текущата версия не се записват в базата данни. Използваме Google reCAPTCHA за защита на изпращането. <Link to="/privacy" className="underline">Обработка на данните</Link>.</p>
          <div className="flex items-center justify-center gap-6 sm:gap-8 mb-8 text-center">
            {[['35', 'въпроса'], ['5', 'части'], ['10', 'минути']].map(([n, l]) => (
              <div key={l}>
                <div className="text-2xl font-light text-gray-900">{n}</div>
                <div className="text-xs text-gray-400">{l}</div>
              </div>
            ))}
          </div>

          {/* Neural gap toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-sm text-gray-500">Рефлективни паузи</span>
            <button
              onClick={() => setNeuralGapEnabled(!neuralGapEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${neuralGapEnabled ? 'bg-gray-900' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${neuralGapEnabled ? 'left-5' : 'left-0.5'}`}></div>
            </button>
            <span className="text-xs text-gray-400">{neuralGapEnabled ? 'Включени' : 'Изключени'}</span>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-medium whitespace-nowrap cursor-pointer"
          >
            Започни
            <Icon name="ri-arrow-right-line" size={16} className="inline ml-2" />
          </button>
        </div>
      ) : showResults ? (
        <div className="space-y-4">
          {submitError && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}

          {resultData && (
            <>
              {/* Дисклеймър */}
              <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-lg p-4">
                <Icon name="ri-information-line" size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  Този резултат е образователна самооценка, основана на отговорите ти в момента.
                   Той не представлява медицинска, психологическа или клинична диагноза.
                   Тежестите, скалите и границите са авторски избор; няма публикувана оценка за надеждност,
                   валидност или норми за сравнение с населението.
                </p>
              </div>

              <details className="bg-white border border-gray-200 rounded-lg p-4 text-xs text-gray-600"><summary className="cursor-pointer font-medium">Как се изчислява резултатът</summary><p className="mt-3 leading-relaxed">{resultData.methodology}</p><p className="mt-2">Точките са дял от максимума на авторската скала, а не процент риск или сравнение с други хора. Високите стойности за офлайн навици имат различна посока от тези за затрудненията.</p></details>
              {/* Главна карта — профилът */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-10 text-center">
                 <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Обобщение на избраните отговори</p>
                <div className="text-5xl sm:text-7xl font-light text-gray-200 mb-2 leading-none">0{resultData.stepNumber}</div>
                <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-1">{resultData.profileName}</h3>
                <p className="text-sm text-gray-400 mb-6">
                   Авторски ориентир към Степен {resultData.stepNumber} — {resultData.stepName}
                </p>

                {/* Общ дигитален баланс — визуална лента */}
                <div className="max-w-sm mx-auto mb-6">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>По-осъзнато</span>
                    <span>По-автоматично</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all duration-700"
                      style={{ width: `${resultData.dependencyIndex}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1.5">
                    <span>Степен 5</span>
                     <span className="font-medium text-gray-700">Авторски индекс {resultData.dependencyIndex}/100</span>
                    <span>Степен 1</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  {resultData.stepDescription}
                </p>

                <p className="text-xs text-gray-400 leading-relaxed max-w-xl mx-auto mt-4">
                  Това не е постоянен етикет. Резултатът може да се променя според навиците, средата
                  и настоящото състояние на човека.
                </p>
              </div>

              {/* Детайлен профил по показатели */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-8">
                <h4 className="text-base font-medium text-gray-900 mb-1">Разбивка по показатели</h4>
                <p className="text-xs text-gray-400 mb-5">Какво обобщава всеки авторски показател</p>
                <div className="space-y-4">
                  {(['pci', 'eei', 'cri', 'asi'] as const).map((key) => {
                    const data = resultData.radarData[key];
                    const meta = indicatorMeta[key];
                    if (!data || !meta) return null;
                    const isProtective = meta.higherIsBetter;
                    return (
                      <div key={key} className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{meta.short}</span>
                            <span className="text-sm text-gray-700 font-medium">{meta.label}</span>
                            <span className="text-xs text-gray-400">({isProtective ? 'по-висок сбор: по-чести офлайн навици' : 'по-нисък сбор: по-рядко съобщени затруднения'})</span>
                          </div>
                           <span className="text-sm font-medium text-gray-900">{data.value}/{data.max} точки</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isProtective ? 'bg-gray-500' : 'bg-gray-800'}`}
                            style={{ width: `${data.percentage}%` }}
                          />
                        </div>
                        <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
                          <div>
                            <span className="text-gray-400 uppercase tracking-wide">Какво обобщава: </span>
                            {meta.measures}
                          </div>
                          <div>
                            <span className="text-gray-400 uppercase tracking-wide">Как да разчетеш: </span>
                            {meta.howToRead}
                          </div>
                          <div>
                            <span className="text-gray-400 uppercase tracking-wide">Въпрос за размисъл: </span>
                            <span className="italic">{meta.reflection}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 uppercase tracking-wide">Практически стъпки: </span>
                            <ul className="list-disc list-inside mt-1">
                              <li>{meta.actions[0]}</li>
                              <li>{meta.actions[1]}</li>
                            </ul>
                          </div>
                          <div>
                            <span className="text-gray-400 uppercase tracking-wide">Свързана степен: </span>
                            <Link to={meta.degreeLink} className="text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors">
                              {meta.degreeName}
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Анализ и препоръка */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Какво означава това за теб</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Къде има най-много място за промяна</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{resultData.dominantWeaknessLabel}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Как се справяш с офлайн времето</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{resultData.resilienceLevel}</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Откъде да започнеш</p>
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">{resultData.stepAction}</p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={reset}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer"
                >
                  <Icon name="ri-restart-line" size={16} className="inline mr-2" />
                  Направи отново
                </button>
              </div>
            </>
          )}
        </div>
      ) : isAnalyzing ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Изчисляваме сбора от отговорите...</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-8">
          {/* Quiz header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-medium text-gray-900">{quizParts[currentPart].title}</h3>
              <span className="text-xs text-gray-400">{currentPart + 1} / {quizParts.length}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">{quizParts[currentPart].subtitle}</p>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 transition-all duration-300"
                style={{ width: `${((currentPart + 1) / quizParts.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4 mb-6">
            {quizParts[currentPart].questions.map((_, qi) => {
              const key = `${currentPart}-${qi}`;
              const scale = getScale(currentPart, qi);
              const text = getQuestionText(currentPart, qi);
              return (
                <div key={qi} className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                  <p className="text-sm text-gray-800 mb-3">{qi + 1}. {text}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {scale.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(qi, opt.value)}
                        className={`py-2 px-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                          selectedValues[key] === opt.value
                            ? 'bg-gray-900 text-white font-medium'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevPart}
              disabled={currentPart === 0}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap cursor-pointer"
            >
              <Icon name="ri-arrow-left-line" size={14} className="inline mr-1.5" />
              Назад
            </button>
            <button
              onClick={nextPart}
              disabled={!isPartComplete()}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap cursor-pointer"
            >
              {currentPart === quizParts.length - 1 ? (
                <><Icon name="ri-check-line" size={14} className="inline mr-1.5" />Завърши</>
              ) : (
                <>Напред<Icon name="ri-arrow-right-line" size={14} className="inline ml-1.5" /></>
              )}
            </button>
          </div>

          {recaptchaError && (
            <p className="text-xs text-red-600 mt-3 flex items-center gap-1">
              <Icon name="ri-error-warning-line" size={12} />
              {recaptchaError}
            </p>
          )}

          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            size="invisible"
            badge="bottomright"
          />
        </div>
      )}
    </div>
  );
}
