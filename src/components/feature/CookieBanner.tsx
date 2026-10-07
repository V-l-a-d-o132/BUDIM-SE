import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/base/Icon';
import '@/lib/privacy';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!window.BudimPrivacy?.get());
    const open = () => setVisible(true);
    const changed = () => setVisible(!window.BudimPrivacy?.get());
    window.addEventListener('budimse:privacy-open', open);
    window.addEventListener('budimse:privacy-changed', changed);
    return () => {
      window.removeEventListener('budimse:privacy-open', open);
      window.removeEventListener('budimse:privacy-changed', changed);
    };
  }, []);

  const accept = () => {
    window.BudimPrivacy?.save(true);
    setVisible(false);
  };

  const decline = () => {
    window.BudimPrivacy?.save(false);
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
          <p className="text-sm text-white/70 leading-relaxed">
            Сайтът запазва необходимите настройки. С твое
            съгласие включваме и бисквитки за измерване на реклами. Можеш да откажеш
            и да продължиш да използваш сайта. Повече в{' '}
            <Link to="/privacy" className="text-white/70 underline hover:text-white transition-colors">
              Политиката за поверителност
            </Link>. Изборът може да се промени от „Настройки на бисквитките“ в края на страницата.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="text-sm min-h-[44px] bg-white text-gray-900 px-5 py-2 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer font-medium"
          >
            Не одобрявам
          </button>
          <button
            onClick={accept}
            className="text-sm min-h-[44px] bg-white text-gray-900 px-5 py-2 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer font-medium"
          >
            Одобрявам
          </button>
        </div>
      </div>
    </div>
  );
}
