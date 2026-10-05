import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { RECAPTCHA_SITE_KEY } from '@/components/base/RecaptchaBadge';
import { gameCommand } from './gameApi';
import { type GamePost } from './types';

import { usePostLimit } from './usePostLimit';

interface RepostButtonProps {
  post: GamePost;
  targetPlatform: GamePost['platform'];
  onReposted: (newPost: GamePost) => void;
  iconSize?: string;
}

export default function RepostButton({ post, targetPlatform, onReposted, iconSize = 'text-base' }: RepostButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { canPost, remaining, incrementCount } = usePostLimit();

  const handleRepost = async () => {
    if (loading || done || !canPost) return;
    setLoading(true);

    try {
      setError('');
      const token = await recaptchaRef.current?.executeAsync();
      if (!token) throw new Error('Проверката за бот не беше успешна.');
      const data = await gameCommand('repost', { post_id: post.id, platform: targetPlatform, recaptcha_token: token });
      onReposted(data.post as GamePost);
      incrementCount();
      setDone(true);

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Споделянето не беше изпълнено.');
    } finally {
      recaptchaRef.current?.reset();
      setLoading(false);
    }
  };

  if (!canPost && !done) {
    return (
      <button
        disabled
        title="Достигна лимита от 3 поста"
        className="cursor-not-allowed opacity-40 flex items-center gap-0.5"
      >
        <i className={`ri-repeat-line text-gray-400 ${iconSize}`}></i>
      </button>
    );
  }

  return (
    <><ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} size="invisible" /><button
      onClick={handleRepost}
      disabled={loading || done}
      title={error || (done ? 'Записано — очаква модерация' : `Сподели на стената си (${remaining} оставащи)`)}
      className="cursor-pointer flex items-center gap-0.5 disabled:opacity-60 transition-all"
    >
      {loading ? (
        <i className={`ri-loader-4-line animate-spin text-gray-500 ${iconSize}`}></i>
      ) : done ? (
        <i className={`ri-repeat-fill text-green-500 ${iconSize}`}></i>
      ) : (
        <i className={`ri-repeat-line text-gray-800 ${iconSize}`}></i>
      )}
    </button>{error && <span role="alert" className="text-xs text-red-700">{error}</span>}</>
  );
}
