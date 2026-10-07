import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Icon from '@/components/base/Icon';
import { RECAPTCHA_SITE_KEY } from '@/components/base/RecaptchaBadge';
import { checkedLanguageAnalysis, highlightedExcerpt, type LanguageAnalysis } from '@/lib/content-analysis-result';
import { existingLabToken } from '@/lib/classroom';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
const categories = [
  ['Емоционален език', 'Силно емоционални изрази. Те може да описват истинско преживяване и сами по себе си не доказват натиск.'],
  ['Внушение за спешност', 'Призиви за незабавна реакция. Важно е дали има реален срок или обосновано предупреждение.'],
  ['Социален натиск', 'Позоваване на група, одобрение или изключване като причина да се съгласиш.'],
  ['Поляризиращ език', 'Противопоставяне между групи и обезценяване на друга гледна точка.'],
  ['Подтик към бърза реакция', 'Призив за споделяне или реакция, преди да се разгледат източникът и контекстът.'],
];
const examples = [
  { name: 'Информационен пример', text: 'Работилницата за медийна грамотност започва в събота в 10:00. Програмата и източниците са публикувани на страницата на организатора.' },
  { name: 'Убеждаващ пример', text: 'Всички вече говорят за това! Сподели веднага, преди да е изчезнало. Ако не се включиш, ще останеш извън разговора.' },
];

export default function ContentAnalyzer() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<LanguageAnalysis | null>(null);
  const [analyzedText, setAnalyzedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const busy = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; controller.current?.abort(); };
  }, []);

  const changeText = (value: string) => {
    setText(value); setAnalysis(null); setAnalyzedText(''); setAnalysisError('');
  };
  const analyzeContent = async () => {
    if (busy.current) return;
    const excerpt = text.trim();
    if (excerpt.length < 10 || excerpt.length > 1500) { setAnalysisError('Въведи откъс от 10 до 1500 символа.'); return; }
    busy.current = true; setIsAnalyzing(true); setAnalysisError(''); setAnalysis(null);
    controller.current = new AbortController();
    let captchaTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (!recaptchaRef.current) throw new Error('Защитата на изпращането още се зарежда. Опитай след малко.');
      const recaptchaToken = await Promise.race([
        recaptchaRef.current.executeAsync(),
        new Promise<never>((_, reject) => { captchaTimer = setTimeout(() => reject(new Error('Проверката за изпращане се забави. Опитай отново.')), 30000); }),
      ]);
      if (captchaTimer) clearTimeout(captchaTimer);
      if (!recaptchaToken) throw new Error('Проверката за изпращане не беше успешна. Опитай отново.');
      if (!mounted.current || controller.current.signal.aborted) return;
      const response = await fetch(`${SUPABASE_URL}/functions/v1/tavora-content-analyzer`, {
        method: 'POST', signal: AbortSignal.any([controller.current.signal, AbortSignal.timeout(45000)]),
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ text: excerpt, recaptcha_token: recaptchaToken, access_token: existingLabToken() }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        if (response.status === 429) throw new Error('Достигнат е лимитът за анализ. Изчакай около минута и опитай отново.');
        if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' && data.error.length <= 800) throw new Error(data.error);
        throw new Error('Анализът временно не е достъпен. Опитай отново.');
      }
      if (!data || typeof data !== 'object' || !('success' in data) || data.success !== true || !('analysis' in data)) throw new Error('Получен е непълен отговор. Опитай отново.');
      const result = checkedLanguageAnalysis(data.analysis, excerpt);
      if (mounted.current) {
        setAnalysis(result); setAnalyzedText(excerpt);
        requestAnimationFrame(() => resultHeading.current?.focus({ preventScroll: true }));
      }
    } catch (error) {
      if (mounted.current) {
        setAnalysis(null);
        setAnalysisError(error instanceof Error && error.name !== 'TimeoutError' && error.name !== 'AbortError' ? error.message : 'Анализът се забави. Текстът е запазен в полето; можеш да опиташ отново.');
      }
    } finally {
      if (captchaTimer) clearTimeout(captchaTimer);
      busy.current = false; recaptchaRef.current?.reset();
      if (mounted.current) setIsAnalyzing(false);
    }
  };

  return <div className="max-w-3xl mx-auto" data-testid="content-analyzer">
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8">
      <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">AI помощник за четене</p>
      <h3 className="text-2xl font-medium text-gray-900 mb-3">Анализ на съдържание</h3>
      <p className="text-sm text-gray-600 leading-relaxed">Постави кратък откъс. Моделът ще предложи възможни езикови сигнали по пет авторски категории и ще посочи изразите, на които се опира.</p>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mt-4 mb-5 text-xs text-gray-600 leading-relaxed">
        <p>AI може да сгреши или да пропусне ирония, цитат и контекст. Анализът не проверява факти, източници или намерения и не установява действителното въздействие върху читателя.</p>
        <p className="mt-2">При „Анализирай“ откъсът се изпраща през Supabase към Groq, с Google reCAPTCHA за защита. Не въвеждай лични или поверителни данни. <Link to="/privacy" className="underline underline-offset-2">Обработка на данните</Link>.</p>
      </div>
      <details className="text-sm mb-6 border-b border-gray-100 pb-4"><summary className="cursor-pointer font-medium text-gray-700">Какво разглеждат петте категории</summary><ul className="mt-3 space-y-3 text-xs text-gray-600 leading-relaxed">{categories.map(([name, description]) => <li key={name}><strong className="text-gray-800">{name}</strong> — {description}</li>)}</ul></details>
      <label htmlFor="analysis-excerpt" className="block text-sm font-medium text-gray-800 mb-2">Текст за разглеждане</label>
      <textarea id="analysis-excerpt" value={text} onChange={event => changeText(event.target.value)} disabled={isAnalyzing} placeholder="Постави откъс с достатъчно контекст…" className="w-full min-h-40 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 resize-y text-sm disabled:opacity-70" maxLength={1500} aria-describedby="analysis-count analysis-privacy" />
      <div className="flex items-center justify-between gap-4 mt-2 text-xs text-gray-500"><span id="analysis-count">{text.length} / 1500 символа</span><span>Минимум 10 символа</span></div>
      <div className="flex flex-wrap gap-2 mt-4 mb-5">{examples.map(example => <button type="button" key={example.name} disabled={isAnalyzing} onClick={() => changeText(example.text)} className="text-xs text-gray-600 border border-gray-200 rounded-full px-3 py-2.5 hover:bg-gray-50 disabled:opacity-40">{example.name}</button>)}</div>
      <div className="flex flex-wrap items-center gap-4"><button type="button" onClick={analyzeContent} disabled={text.trim().length < 10 || isAnalyzing} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-sm">{isAnalyzing ? <><Icon name="ri-loader-4-line" size={16} className="animate-spin" aria-hidden="true" />Анализираме…</> : <><Icon name="ri-search-line" size={16} aria-hidden="true" />Анализирай</>}</button><p id="analysis-privacy" className="text-xs text-gray-500">Не запазваме откъса в нашата база данни.</p></div>
      {analysisError && <p role="alert" className="text-sm text-red-700 mt-4 leading-relaxed">{analysisError}</p>}
      <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} size="invisible" badge="bottomright" />
      {analysis && <div className="space-y-5 mt-8 pt-6 border-t border-gray-200" aria-live="polite">
        <div><h4 ref={resultHeading} tabIndex={-1} className="text-xl font-medium text-gray-900 mb-2">Какво предлага AI за обсъждане</h4><p className="text-sm text-gray-600 leading-relaxed">Дословните цитати позволяват да провериш къде е посочен израз. Значението му зависи от контекста; наличието му само по себе си не доказва манипулация.</p></div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4"><p className="text-xs font-medium text-gray-700 mb-2">Твоят откъс · отбелязани изрази</p><p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{highlightedExcerpt(analyzedText, analysis.vectorAnalysis.flatMap(row => row.evidence)).map((chunk, index) => chunk.highlighted ? <mark key={index} className="bg-amber-100 text-gray-900 rounded px-0.5">{chunk.text}</mark> : <span key={index}>{chunk.text}</span>)}</p></div>
        {analysis.vectorAnalysis.map(row => <section key={row.vector} className="border border-gray-200 rounded-xl p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-2 mb-3"><h5 className="text-sm font-medium text-gray-900">{row.vector}</h5><span className="text-xs text-gray-500 px-2.5 py-1 rounded-full bg-gray-100">{row.score > 0 ? 'Възможен езиков сигнал' : 'Не е отчетен израз'}</span></div><p className="text-sm text-gray-600 leading-relaxed">{row.description}</p>{row.evidence.length > 0 && <div className="mt-3"><p className="text-xs text-gray-500 mb-2">Посочени изрази от откъса</p>{row.evidence.map(quote => <blockquote key={quote} className="border-l-2 border-gray-300 pl-3 py-1 text-sm text-gray-800 break-words">„{quote}“</blockquote>)}</div>}</section>)}
        <div className="bg-gray-50 rounded-xl p-5"><h5 className="text-sm font-medium text-gray-900 mb-2">Обобщение на AI</h5><p className="text-sm text-gray-600 leading-relaxed">{analysis.cognitiveReaction}</p><p className="text-xs text-gray-500 mt-3 leading-relaxed">{analysis.limitations}</p></div>
        <div className="border border-gray-200 rounded-xl p-5"><h5 className="text-sm font-medium text-gray-900 mb-2">Следваща проверка</h5><p className="text-sm text-gray-600 leading-relaxed">{analysis.recommendation}</p><ul className="list-disc pl-5 text-xs text-gray-600 mt-3 space-y-2"><li>Отвори първоизточника и провери датата.</li><li>Прочети текста около цитата и потърси други възможни обяснения.</li><li>Съпостави фактическите твърдения с независим източник.</li></ul><Link to="/sources" className="inline-block text-xs text-gray-800 underline underline-offset-4 mt-4">Източници и ограничения на рамката</Link></div>
        <details className="text-xs text-gray-500 leading-relaxed"><summary className="cursor-pointer text-gray-700 font-medium">Метод и ограничения</summary><p className="mt-3">Пет авторски категории, оценени от езиков модел. Всяка положителна категория изисква проверим дословен цитат; всички пет категории трябва да присъстват в отговора. Сървърът проверява формата, диапазоните и цитатите, но тази проверка не доказва, че интерпретацията на AI е правилна.</p><p className="mt-2">Категориите нямат научна калибрация. Липсата на отчетен израз не доказва, че текстът е надежден. Повторен анализ може да даде друга интерпретация.</p><p className="mt-2">Модел: {analysis.source} · Метод: {analysis.methodVersion}</p></details>
      </div>}
    </div>
  </div>;
}

