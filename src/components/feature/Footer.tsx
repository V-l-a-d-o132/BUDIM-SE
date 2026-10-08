import { Link } from 'react-router-dom';
import { openPrivacySettings } from '@/lib/privacy';

export default function Footer() {
  return <footer className="site-footer">
    <div className="site-container">
      <div className="footer-grid">
        <div>
          <Link to="/" className="footer-brand">БУДИМ СЕ</Link>
          <p>Гражданска и образователна инициатива за медийна и дигитална грамотност в България.</p>
          <a className="footer-email" href="mailto:budimseonline@gmail.com">budimseonline@gmail.com</a>
        </div>
        <div><h2>Учи и опитай</h2><ul>
          <li><Link to="/digitalna-gramotnost">Дигитална и медийна грамотност</Link></li>
          <li><Link to="/mediyna-gramotnost-uchenici">Упражнения за ученици</Link></li>
          <li><Link to="/obucheniya-za-uchilishta">Обучения за училища</Link></li>
          <li><Link to="/news">Материали</Link></li>
          <li><Link to="/analizator">Анализатор и симулатори</Link></li>
        </ul></div>
        <div><h2>За инициативата</h2><ul>
          <li><Link to="/center">Центърът и подходът ни</Link></li>
          <li><Link to="/author">Авторът</Link></li>
          <li><Link to="/order">Книгата „Петте степени“</Link></li>
          <li><Link to="/sources">Източници</Link></li>
          <li><Link to="/testimonials">Обратна връзка</Link></li>
          <li><Link to="/contact">Контакт</Link></li>
        </ul></div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} БУДИМ СЕ</span>
        <div><Link to="/privacy">Поверителност</Link><Link to="/terms">Условия</Link>
          <button type="button" onClick={openPrivacySettings}>Настройки на бисквитките</button></div>
      </div>
    </div>
  </footer>;
}
