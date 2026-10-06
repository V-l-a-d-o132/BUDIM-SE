// Deterministic, local inventory of the author's original 35 questions.
// Responses are grouped by their actual scale, never inverted or cross-scored.
export const ASSESSMENT_VERSION = 'habits-map-v3';
export type AssessmentAnswer = number | null;
export type AssessmentAnswers = Record<string, AssessmentAnswer>;
export type ScaleKind = 'frequency' | 'degree' | 'intensity' | 'event';
export interface AssessmentQuestion { id: string; text: string; kind: ScaleKind; hint?: string }
export interface AssessmentPart { id: string; title: string; description: string; action: string; questions: AssessmentQuestion[] }

export const assessmentScales: Record<ScaleKind, { title: string; hint: string; options: { value: number; label: string }[] }> = {
  frequency: { title: 'Честота', hint: 'Помисли за последните 7 дни.', options: [
    { value: 0, label: 'Никога' }, { value: 1, label: 'Рядко' }, { value: 2, label: 'Понякога' },
    { value: 3, label: 'Често' }, { value: 4, label: 'Почти винаги' },
  ] },
  degree: { title: 'Собствена преценка', hint: 'Отговори според опита и преценката си сега.', options: [
    { value: 0, label: 'Изобщо не' }, { value: 1, label: 'По-скоро не' }, { value: 2, label: 'Отчасти' },
    { value: 3, label: 'В голяма степен' }, { value: 4, label: 'Напълно' },
  ] },
  intensity: { title: 'Сила на преживяването', hint: 'Помисли за последните 7 дни.', options: [
    { value: 0, label: 'Изобщо не' }, { value: 1, label: 'Леко' }, { value: 2, label: 'Умерено' },
    { value: 3, label: 'Силно' }, { value: 4, label: 'Много силно' },
  ] },
  event: { title: 'Конкретен опит', hint: 'Случвало ли ти се е? Ако не публикуваш, избери „Не се отнася / не мога да преценя“.', options: [
    { value: 0, label: 'Не' }, { value: 1, label: 'Да' },
  ] },
};

export const assessmentParts: AssessmentPart[] = [
  { id: 'reactions', title: 'Как реагираш', description: 'Реакции и навици около телефона.',
    action: 'Можеш да изпробваш да избираш конкретна цел преди отключване и да затваряш приложението след нея.',
    questions: [
      { id: '0-0', text: 'Първото ти действие сутрин е към екрана на телефона?', kind: 'frequency' },
      { id: '0-1', text: 'Случвало ли се е да се събудиш с телефона в ръка, без да помниш как си го взел?', kind: 'frequency' },
      { id: '0-2', text: 'Забравяш ли понякога защо си отключил телефона си?', kind: 'frequency' },
      { id: '0-3', text: 'Колко често проверяваш устройството си без известие?', kind: 'frequency' },
      { id: '0-4', text: 'Усещаш ли „фантомни вибрации"?', kind: 'frequency' },
      { id: '0-5', text: 'Изпитваш ли паника, ако излезеш без телефон?', kind: 'frequency' },
      { id: '0-6', text: 'Колко често гледаш съдържание, което не помниш след 10 минути?', kind: 'frequency' },
    ] },
  { id: 'feelings', title: 'Как се чувстваш', description: 'Преживявания, които сам забелязваш.',
    action: 'Можеш да наблюдаваш как се чувстваш преди и след една сесия и какъв контекст или съдържание има значение за теб.',
    questions: [
      { id: '1-0', text: 'Чувстваш ли се емоционално празен след скролване?', kind: 'frequency' },
      { id: '1-1', text: 'Изпитваш ли срам, че не можеш да спреш дигиталната консумация?', kind: 'frequency' },
      { id: '1-2', text: 'Гледаш ли видео само защото алгоритъмът го пусна автоматично?', kind: 'frequency' },
      { id: '1-3', text: 'Завиждаш ли на хора, които изглеждат щастливи онлайн?', kind: 'frequency' },
      { id: '1-4', text: 'Изпитваш ли безпокойство (FOMO), когато си офлайн?', kind: 'frequency' },
      { id: '1-5', text: 'Харесваш ли съдържание, което всъщност презираш?', kind: 'frequency' },
      { id: '1-6', text: 'Гледаш ли чужди животи, за да избегнеш своя?', kind: 'frequency' },
    ] },
  { id: 'offline', title: 'Офлайн навици', description: 'Дейности и възможности извън екрана.',
    action: 'Ако ти е полезно, избери реалистичен момент за офлайн дейност според работата, достъпността и ежедневието си.',
    questions: [
      { id: '2-0', text: 'Имаш ли часове през деня, в които умишлено си офлайн?', kind: 'frequency' },
      { id: '2-1', text: 'Оставяш ли телефона в друга стая, когато работиш?', kind: 'frequency' },
      { id: '2-2', text: 'Можеш ли да бъдеш сам без технологии за 30 минути?', kind: 'degree' },
      { id: '2-3', text: 'Четеш ли дълги текстове без да проверяваш телефона?', kind: 'frequency' },
      { id: '2-4', text: 'Можеш ли да слушаш човек за 10 минути без да погледнеш екрана?', kind: 'degree' },
      { id: '2-5', text: 'Поставяш ли си дигитални граници, които другите не разбират?', kind: 'frequency' },
      { id: '2-6', text: 'Изпитваш ли радост от бавни дейности без технология?', kind: 'frequency' },
    ] },
  { id: 'autonomy', title: 'Дигитална самостоятелност', description: 'Собствена преценка за изборите и влиянията.',
    action: 'Избери един пример от ежедневието си и разгледай какво си искал да направиш, какво се е случило и какви други обяснения са възможни.',
    questions: [
      { id: '3-0', text: 'Разграничаваш ли своите мисли от тези на алгоритъма?', kind: 'degree', hint: 'Това е собствената ти преценка; въпросът не установява произхода на мислите.' },
      { id: '3-1', text: 'Изтрил ли си публикация, защото не е автентична?', kind: 'event' },
      { id: '3-2', text: 'Смяташ ли, че говориш с „чужди думи" от мрежата?', kind: 'degree' },
      { id: '3-3', text: 'Знаеш ли кога живееш според своите ценности, а не според трендовете?', kind: 'degree' },
      { id: '3-4', text: 'Мислиш ли по-ясно след 24 часа офлайн?', kind: 'degree', hint: 'Ако нямаш такъв опит, избери „Не се отнася / не мога да преценя“.' },
      { id: '3-5', text: 'Искал ли си да изчезнеш от мрежата, но те е страх да не изпуснеш нещо?', kind: 'frequency' },
      { id: '3-6', text: 'Виждаш ли телефона като инструмент, а не като част от теб?', kind: 'degree' },
    ] },
  { id: 'overview', title: 'Общата картина', description: 'По-общи наблюдения за ежедневието ти.',
    action: 'Избери ситуация, която искаш да промениш. Изпробвай една малка промяна и сравни наблюденията си при следваща самооценка.',
    questions: [
      { id: '4-0', text: 'Животът ти на автопилот ли е?', kind: 'degree' },
      { id: '4-1', text: 'Сравненията в мрежата натоварват ли те психически?', kind: 'intensity' },
      { id: '4-2', text: 'Гледаш ли съдържание без никаква реална полза?', kind: 'frequency' },
      { id: '4-3', text: 'Изпитваш ли физическа умора, но продължаваш да скролваш?', kind: 'frequency' },
      { id: '4-4', text: 'Влизаш ли в социални мрежи напълно механично?', kind: 'frequency' },
      { id: '4-5', text: 'Изпитваш ли вина, когато си изключен от потока информация?', kind: 'intensity' },
      { id: '4-6', text: 'Притежаваш ли пълна свобода над вниманието си сега?', kind: 'degree' },
    ] },
];

export const assessmentQuestions = assessmentParts.flatMap(part => part.questions);
export const skippedAnswerLabel = 'Не се отнася / не мога да преценя';

export function hasAssessmentAnswer(answers: AssessmentAnswers, question: AssessmentQuestion): boolean {
  return Object.hasOwn(answers, question.id) && (answers[question.id] === null ||
    assessmentScales[question.kind].options.some(option => option.value === answers[question.id]));
}

export function validCurrentAssessmentAnswers(value: unknown): value is AssessmentAnswers {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const answers = value as AssessmentAnswers;
  return Object.keys(answers).length === assessmentQuestions.length &&
    assessmentQuestions.every(question => hasAssessmentAnswer(answers, question));
}

export function assessmentAnswerLabel(question: AssessmentQuestion, answer: AssessmentAnswer): string {
  return answer === null ? skippedAnswerLabel :
    assessmentScales[question.kind].options.find(option => option.value === answer)?.label ?? '';
}

export function calculateSelfAssessment(answers: AssessmentAnswers) {
  if (!validCurrentAssessmentAnswers(answers)) throw new Error('Необходими са 35 валидни отговора.');
  const parts = assessmentParts.map(part => {
    const answered = part.questions.filter(question => answers[question.id] !== null);
    const kinds = [...new Set(part.questions.map(question => question.kind))];
    return {
      id: part.id, title: part.title, answeredCount: answered.length,
      skippedCount: part.questions.length - answered.length, totalCount: part.questions.length,
      groups: kinds.map(kind => {
        const included = answered.filter(question => question.kind === kind);
        return { kind, title: assessmentScales[kind].title, answeredCount: included.length,
          choices: assessmentScales[kind].options.map(option => ({ ...option,
            count: included.filter(question => answers[question.id] === option.value).length,
          })),
        };
      }),
    };
  });
  return {
    methodVersion: ASSESSMENT_VERSION, parts,
    answeredCount: parts.reduce((sum, part) => sum + part.answeredCount, 0),
    skippedCount: parts.reduce((sum, part) => sum + part.skippedCount, 0),
    totalCount: assessmentQuestions.length,
  };
}
