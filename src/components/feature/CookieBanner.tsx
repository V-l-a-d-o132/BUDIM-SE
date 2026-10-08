import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const choose = (marketing: boolean) => { window.BudimPrivacy?.save(marketing); setVisible(false); };
  if (!visible) return null;
  return <section className="cookie-notice" aria-label="Избор за бисквитките">
    <div className="site-container cookie-content">
      <p>Запазваме необходимите настройки. С твое съгласие използваме и бисквитки за измерване на реклами. При отказ сайтът остава достъпен. <Link to="/privacy">Подробности</Link>. Можеш да промениш избора от „Настройки на бисквитките“ в края на страницата.</p>
      <div className="cookie-actions"><button type="button" onClick={() => choose(false)}>Не одобрявам</button><button type="button" onClick={() => choose(true)}>Одобрявам</button></div>
    </div>
  </section>;
}
