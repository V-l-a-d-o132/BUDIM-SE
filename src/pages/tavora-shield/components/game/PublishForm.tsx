import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { supabase } from '@/lib/supabase';
import { type GamePost, type Challenge } from './types';
import { getOwnerToken } from './gameApi';
import { containsProfanity, getProfanityMessage } from './profanityFilter';
import Icon from '@/components/base/Icon';
import { RECAPTCHA_SITE_KEY } from '@/components/base/RecaptchaBadge';

interface PublishFormProps {
  platform: 'instagram' | 'tiktok' | 'facebook';
  onPublish: (post: GamePost) => void;
  onClose: () => void;
  challenge?: Challenge | null;
  remaining?: number;
  onPostPublished?: () => void;
}

const placeholders: Record<string, string> = {
  instagram: 'Напиши подпис за снимката...',
  tiktok: 'Опиши видеото си...',
  facebook: 'Какво мислиш? Сподели нещо...',
};

export default function PublishForm({ platform, onPublish, onClose, challenge, remaining = 3, onPostPublished }: PublishFormProps) {
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [profanityError, setProfanityError] = useState('');
  const [result, setResult] = useState<{
    viral: boolean; score: number; label: string; likes: number; reason: string; post: GamePost;
  } | null>(null);
  const [shared, setShared] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaError, setRecaptchaError] = useState('');

  const handleContentChange = (val: string) => {
    setContent(val);
    if (profanityError) setProfanityError('');
    if (recaptchaError) setRecaptchaError('');
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

  const handleSubmit = async () => {
    if (!content.trim() || loading) return;
    if (remaining <= 0) return;

    if (containsProfanity(content)) {
      setProfanityError(getProfanityMessage());
      return;
    }

    const recaptchaToken = await executeRecaptcha();
    if (!recaptchaToken) return;

    setLoading(true);
    try {
      const finalUsername = username.trim() || 'Анонимен';

      const res = await supabase.functions.invoke('analyze-viral-post', {
        body: {
          content: content.trim(),
          platform,
          username: finalUsername,
          owner_token: getOwnerToken(),
          challenge_id: challenge?.id || null,
          recaptcha_token: recaptchaToken,
        },
      });
      if (res.error || res.data?.error || !res.data?.post) throw new Error(res.data?.error || 'Публикацията не е записана. Опитайте отново.');
      const data = res.data;
      setResult({
        viral: data.is_viral,
        score: data.viral_score,
        label: data.ai_label,
        likes: data.likes,
        reason: data.ai_reason || 'AI анализира съдържанието.',
        post: data.post,
      });
      onPublish(data.post);
      setRecaptchaError('');
      onPostPublished?.();
    } catch (e) {
      console.error(e);
      setRecaptchaError(e instanceof Error ? e.message : 'Грешка при публикуване. Опитайте отново.');
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset();
    }
  };

  // ... existing code continues from handleShare onwards
  const handleShare = async () => {
    if (!result) return;
    const text = `Публикувах в ${platform} и получих ${result.likes.toLocaleString()} лайка! ${result.viral ? '🔥 ВИРАЛЕН!' : '👻 Невидим...'} — Алгоритъмът на истината`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Алгоритъмът на истината', text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // ignore
    }
  };

  if (result) {
    return (
      <div className="absolute inset-0 z-50 bg-black/80 flex items-end">
        <div className="w-full bg-white rounded-t-2xl p-4 max-h-[90%] overflow-y-auto">
          <div className="text-center mb-3"><p className="text-xs text-gray-600 mb-2">Публикацията е записана и очаква модерация.</p>
            {result.viral ? (
              <>
                <div className="text-3xl mb-1" style={{ animation: 'bounce 0.5s ease-out' }}>🔥</div>
                <p className="text-sm font-bold text-red-600">ВИРАЛЕН!</p>
                <p className="text-xs text-gray-500 mt-0.5">{result.likes.toLocaleString()} симулирани харесвания</p>
              </>
            ) : (
              <>
                <div className="text-3xl mb-1">👻</div>
                <p className="text-sm font-bold text-gray-500">Невидим...</p>
                <p className="text-xs text-gray-400 mt-0.5">Само {result.likes} харесвания. Никой не го забеляза.</p>
              </>
            )}
          </div>

          {challenge && (
            <div className={`rounded-xl p-2.5 mb-3 text-center ${
              (challenge.goal === 'viral' && result.viral) || (challenge.goal === 'quality' && !result.viral)
                ? 'bg-green-50 border border-green-200'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <p className="text-[9px] font-bold text-gray-700">
                {(challenge.goal === 'viral' && result.viral) || (challenge.goal === 'quality' && !result.viral)
                  ? '🏆 Предизвикателството е изпълнено!'
                  : '😅 Предизвикателството не е изпълнено'}
              </p>
              <p className="text-[8px] text-gray-500 mt-0.5">
                Целта беше: {challenge.goal === 'viral' ? 'да станеш вирален' : 'да останеш качествен'}
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] text-gray-500 font-medium uppercase tracking-wide">AI Оценка</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${result.score >= 55 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{result.label}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${result.score >= 70 ? 'bg-red-500' : result.score >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${result.score}%` }}
              ></div>
            </div>
            <div className="flex justify-between">
              <span className="text-[7px] text-green-600">Качествено</span>
              <span className="text-[7px] text-gray-400">{result.score}/100</span>
              <span className="text-[7px] text-red-500">Манипулативно</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
            <p className="text-[9px] font-semibold text-amber-800 mb-1 flex items-center gap-1">
              <Icon name="ri-robot-line" size={12} /> Защо алгоритъмът реагира така?
            </p>
            <p className="text-[9px] text-amber-700 leading-relaxed">{result.reason}</p>
          </div>

          <button
            onClick={handleShare}
            className="w-full py-2 mb-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-xl cursor-pointer flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-colors"
          >
            <Icon name="ri-share-forward-line" size={14} className={shared ? 'text-green-600' : ''} />
            {shared ? 'Копирано!' : 'Сподели резултата'}
          </button>

          <button onClick={onClose} className="w-full py-2 bg-gray-900 text-white text-xs font-medium rounded-xl cursor-pointer">
            Затвори
          </button>
        </div>
      </div>
    );
  }

  // Limit reached screen
  if (remaining <= 0) {
    return (
      <div className="absolute inset-0 z-50 bg-black/70 flex items-end">
        <div className="w-full bg-white rounded-t-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-900">Лимит достигнат</span>
            <button onClick={onClose} className="cursor-pointer w-6 h-6 flex items-center justify-center">
              <Icon name="ri-close-line" size={16} className="text-gray-500" />
            </button>
          </div>
          <div className="text-center py-4">
            <div className="text-3xl mb-2">🚫</div>
            <p className="text-sm font-bold text-gray-800 mb-1">Достигна лимита за тази сесия</p>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Можеш да публикуваш максимум <strong>3 поста</strong> на сесия. Това предотвратява спам и дава шанс на всички да участват.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
              <p className="text-[9px] text-amber-700 leading-relaxed">
                <Icon name="ri-lightbulb-line" size={10} className="inline mr-1" />
                <strong>Реалността:</strong> В истинските социални мрежи алгоритъмът ограничава reach-а на акаунти, които публикуват твърде много. Качеството винаги побеждава количеството.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-full py-2 bg-gray-900 text-white text-xs font-medium rounded-xl cursor-pointer">
            Разбрах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-end">
      <div className="w-full bg-white rounded-t-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-900">Нова публикация</span>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {remaining} от 3 оставащи
            </span>
            <button onClick={onClose} className="cursor-pointer w-6 h-6 flex items-center justify-center">
              <Icon name="ri-close-line" size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {challenge && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 mb-3">
            <p className="text-[8px] font-bold text-amber-800 flex items-center gap-1 mb-0.5">
              <Icon name="ri-trophy-line" size={10} /> Предизвикателство: {challenge.title}
            </p>
            <p className="text-[8px] text-amber-700">{challenge.description}</p>
          </div>
        )}

        <div className="mb-2">
          <label className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mb-1 block">Твоят псевдоним</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Анонимен"
            maxLength={30}
            className="w-full text-[10px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder={challenge ? challenge.description : placeholders[platform]}
          className={`w-full text-[10px] bg-gray-50 border rounded-xl p-2.5 outline-none resize-none transition-colors ${profanityError || recaptchaError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-400'}`}
          rows={4}
          maxLength={500}
        />
        <div className="flex items-center justify-between mb-2">
          {profanityError || recaptchaError ? (
            <p className="text-[8px] text-red-600 flex items-center gap-1 flex-1 mr-2">
              <Icon name="ri-error-warning-line" size={10} className="flex-shrink-0 inline" />
              {profanityError || recaptchaError}
            </p>
          ) : (
            <span className="text-[7px] text-gray-400 flex items-center gap-1">
              <Icon name="ri-shield-check-line" size={10} className="text-green-500 inline" />
              Цензурата е активна
            </span>
          )}
          <span className="text-[7px] text-gray-300 flex-shrink-0">{content.length}/500</span>
        </div>

        {!challenge && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
            <p className="text-[8px] text-amber-700 leading-relaxed">
              <Icon name="ri-lightbulb-line" size={10} className="inline mr-1" />
              <strong>Игра:</strong> Напиши нещо качествено или провокативно — виж как алгоритъмът реагира!
            </p>
          </div>
        )}

        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          size="invisible"
          badge="bottomright"
        />

        <button
          onClick={handleSubmit}
          disabled={!content.trim() || loading}
          className="w-full py-2 bg-gray-900 text-white text-xs font-medium rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <><Icon name="ri-loader-4-line" size={14} className="animate-spin" />AI анализира...</>
          ) : 'Публикувай'}
        </button>
      </div>
    </div>
  );
}