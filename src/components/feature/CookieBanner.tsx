import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/base/Icon';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay so it doesn't flash on first render
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950 border-t border-white/10 px-6 py-5"
      role="dialog"
      aria-label="Известие за бисквитки"
      aria-live="polite"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-5">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon name="ri-shield-check-line" size={14} className="text-white/40" />
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            Използваме аналитични бисквитки (Google Analytics) за подобряване на сайта.
            Личните ви данни се обработват съгласно{' '}
            <Link to="/privacy" className="text-white/70 underline hover:text-white transition-colors">
              Политиката за поверителност
            </Link>{' '}
            и GDPR. Можете да откажете аналитичните бисквитки — сайтът ще продължи да работи нормално.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="text-xs text-white/40 hover:text-white/70 transition-colors whitespace-nowrap cursor-pointer px-3 py-2"
          >
            Само необходими
          </button>
          <button
            onClick={accept}
            className="text-xs bg-white text-gray-900 px-5 py-2 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer font-medium"
          >
            Приемам всички
          </button>
        </div>
      </div>
    </div>
  );
}
