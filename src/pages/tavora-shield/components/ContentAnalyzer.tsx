import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Icon from '@/components/base/Icon';
import { RECAPTCHA_SITE_KEY } from '@/components/base/RecaptchaBadge';
import { Link } from 'react-router-dom';

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

interface AnalysisResult {
  totalRisk: number;
  riskLevel: string;
  riskColor: string;
  riskCategory: string;
  cognitiveReaction: string;
  positiveNotes: string | null;
  auditExplanation: string;
  recommendation: string;
  vectorAnalysis: { vector: string; score: number; maxScore?: number; description: string; evidence?: string[] }[];
  detectedPatterns: string[];
  isDominant: boolean;
  dominantVector: string;
  socialBonus: number;
}

export default function ContentAnalyzer() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaError, setRecaptchaError] = useState('');

  const getRiskBorderColor = (color: string) => {
    if (color === 'red') return 'border-red-300';
    if (color === 'orange') return 'border-orange-300';
    if (color === 'yellow') return 'border-yellow-300';
    return 'border-gray-200';
  };

  const getRiskTextColor = (color: string) => {
    if (color === 'red') return 'text-red-600';
    if (color === 'orange') return 'text-orange-500';
    if (color === 'yellow') return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getRiskBarColor = (color: string) => {
    if (color === 'red') return 'bg-red-400';
    if (color === 'orange') return 'bg-orange-400';
    if (color === 'yellow') return 'bg-yellow-400';
    return 'bg-gray-300';
  };

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

  const analyzeContent = async () => {
    if (!text.trim()) return;

    setAnalysisError('');
    if (text.trim().length < 10) { setAnalysis(null); setAnalysisError('Въведи поне едно изречение — минимум 10 символа.'); return; }

    const recaptchaToken = await executeRecaptcha();
    if (!recaptchaToken) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/tavora-content-analyzer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ text, recaptcha_token: recaptchaToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = data?.error || `HTTP ${response.status}`;
        throw new Error(errMsg);
      }

      if (data.success && data.analysis) {
        setAnalysis({
          totalRisk: data.analysis.totalRisk || 0,
          riskLevel: data.analysis.riskLevel || 'НЕИЗВЕСТНО',
          riskColor: data.analysis.riskColor || 'gray',
          riskCategory: data.analysis.riskCategory || '',
          cognitiveReaction: data.analysis.cognitiveReaction || '',
          positiveNotes: data.analysis.positiveNotes || null,
          auditExplanation: data.analysis.auditExplanation || '',
          recommendation: data.analysis.recommendation || '',
          vectorAnalysis: data.analysis.vectorAnalysis || [],
          detectedPatterns: data.analysis.detectedPatterns || [],
          isDominant: data.analysis.isDominant || false,
          dominantVector: data.analysis.dominantVector || '',
          socialBonus: data.analysis.socialBonus || 0,
        });
      } else if (!data.success) {
        throw new Error(data.error || 'Неуспешен анализ');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестна грешка';
      if (message.includes('reCAPTCHA') || message.includes('Too many requests')) {
        setRecaptchaError(message);
      }
      setAnalysis(null);
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
      recaptchaRef.current?.reset();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        <div className="mb-6">
          <h3 className="text-xl font-medium text-gray-900 mb-2">Анализ на съдържание</h3>
          <p className="text-sm text-gray-500">
            Постави кратък откъс. AI предлага възможни езикови сигнали по пет авторски категории.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed mt-3">Това не е факт-проверка. Моделът може да сгреши, да пропусне ирония или контекст и не установява намеренията на автора. Индексът е авторски ориентир, без научна валидация. При „Анализирай“ текстът се изпраща през Supabase към Groq за обработка. Не въвеждай лични или поверителни данни. <Link to="/privacy" className="underline">Как се обработват данните</Link>.</p>

          <div className="mt-4 bg-gray-50 border border-gray-100 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Какво открива анализаторът</p>
            <ul className="space-y-2 text-xs text-gray-600 leading-relaxed">
              <li><strong className="text-gray-800">Емоционален език</strong> — силно емоционални думи; сами по себе си те не доказват натиск или манипулация.</li>
              <li><strong className="text-gray-800">Внушение за спешност</strong> — намек, че трябва да действаш незабавно, иначе ще „изпуснеш“ или ще „съжаляваш“.</li>
              <li><strong className="text-gray-800">Социален натиск</strong> — внушение, че „всички мислят така“ или че ще бъдеш изолиран, ако не се съгласиш.</li>
              <li><strong className="text-gray-800">Поляризиращ език</strong> — противопоставяне на „ние срещу тях“ и омаловажаване на други гледни точки.</li>
              <li><strong className="text-gray-800">Подтик към автоматична реакция</strong> — формули, които насърчават бързо споделяне или реагиране без размисъл.</li>
            </ul>
          </div>
        </div>

        <div className="mb-4">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (recaptchaError) setRecaptchaError('');
            }}
            placeholder='Пример: "СКАНДАЛ! Разкритие което ще ви шокира! 🔥 Споделете преди да изтрият!"'
            className={`w-full h-32 bg-gray-50 border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors resize-none text-sm ${recaptchaError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            maxLength={1500}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{text.length}/1500 символа</span>
            <button
              onClick={analyzeContent}
              disabled={!text.trim() || isAnalyzing}
              className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap cursor-pointer"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <Icon name="ri-loader-4-line" size={14} className="animate-spin" />
                  Анализ...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Icon name="ri-search-line" size={14} />
                  Анализирай
                </span>
              )}
            </button>
          </div>
          {recaptchaError && (
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
              <Icon name="ri-error-warning-line" size={12} />
              {recaptchaError}
            </p>
          )}
        </div>

        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          size="invisible"
          badge="bottomright"
        />

        {analysisError && <p role="alert" className="text-sm text-red-700 mt-4">{analysisError}</p>}
        {analysis && (
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-100">
            {/* Risk Score */}
            <div className={`border rounded-lg p-5 ${getRiskBorderColor(analysis.riskColor)}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-4xl font-light ${getRiskTextColor(analysis.riskColor)}`}>
                     {analysis.totalRisk}<span className="text-sm">/100</span>
                  </span>
                   <span className="text-xs text-gray-400 ml-2">авторски индекс на езиковите сигнали</span>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full bg-gray-50 ${getRiskTextColor(analysis.riskColor)}`}>
                  {analysis.riskLevel}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{analysis.auditExplanation}</p>

              {/* Risk bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full transition-all duration-700 rounded-full ${getRiskBarColor(analysis.riskColor)}`}
                  style={{ width: `${analysis.totalRisk}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                <span>Ниско</span>
                <span>Умерено</span>
                <span>Повишено</span>
                <span>Силно</span>
              </div>

              {analysis.cognitiveReaction && (
                <p className="text-sm text-gray-600 leading-relaxed">{analysis.cognitiveReaction}</p>
              )}
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gray-50 text-xs text-gray-500 leading-relaxed">
              <Icon name="ri-information-line" size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
              <p>
                Това не е вероятност за манипулация или вреда. Резултатът зависи от модела и откъса,
                може да се промени при повторен анализ и не проверява факти, източници или намерения.
              </p>
            </div>

            {/* Positive Notes */}
            {analysis.positiveNotes && analysis.positiveNotes !== 'Няма специфични качества за отбелязване.' && (
              <div className="border border-gray-100 rounded-lg p-5 bg-gray-50">
                <div className="flex items-start gap-3">
                  <Icon name="ri-checkbox-circle-line" size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Позитивни бележки</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{analysis.positiveNotes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Vector Analysis */}
            {analysis.vectorAnalysis.length > 0 && (
              <div className="border border-gray-100 rounded-lg p-5">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Детайлен анализ</h4>
                <p className="text-xs text-gray-400 mb-4">Засечени езикови и структурни похвати, наредени по сила на сигнала</p>
                <div className="space-y-4">
                  {analysis.vectorAnalysis.map((item, i) => {
                    const max = item.maxScore || 40;
                    const pct = Math.min(100, Math.round((item.score / max) * 100));
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-700 font-medium">{item.vector}</span>
                          <span className="text-xs text-gray-400 tabular-nums">{item.score} / {max}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-gray-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {item.description && item.description !== 'Не е засечено.' && item.description !== 'Не е засечен' && (
                          <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                        )}
                        {item.evidence?.map((quote,i)=><blockquote key={i} className="mt-2 pl-3 border-l-2 border-gray-200 text-xs text-gray-700">„{quote}“</blockquote>)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detected Patterns */}
            {analysis.detectedPatterns.length > 0 && (
              <div className="border border-gray-100 rounded-lg p-5">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Засечени похвати</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedPatterns.map((pattern, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            {analysis.recommendation && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <Icon name="ri-lightbulb-line" size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Препоръка</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{analysis.recommendation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
