import { Link } from 'react-router-dom';
import Icon from '@/components/base/Icon';

const steps = [
  { path: '/step-1', title: 'Биологичният автоматизъм' },
  { path: '/step-2', title: 'Алгоритмичният прицел' },
  { path: '/step-3', title: 'Когнитивна свобода' },
  { path: '/step-4', title: 'Завръщане и реинтеграция' },
  { path: '/step-5', title: 'Съзнателна свобода' },
];

export default function Footer() {
  return (
    <footer className="py-10 md:py-14 px-4 md:px-6 bg-gray-950 text-white/40 safe-pb">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-10 mb-8 md:mb-10">
          {/* Brand + Contact */}
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="https://storage.readdy-site.link/project_files/f310a09a-6cb0-4fe3-a3ef-e12bf0036316/c92e355b-473f-4387-a3bb-8e40a8c53bde_DIGITAL-MEDIA-CENTRE-------.png?v=edaa6d50d88bec1dd7055e86d801cea5"
                alt="Digital Media Centre лого"
                className="h-8 md:h-10 w-auto object-contain flex-shrink-0"
              />
              <div>
                <div className="text-white font-medium text-sm md:text-base leading-tight">Център БУДИМ СЕ</div>
                <div className="text-xs mt-0.5">budimse.online</div>
              </div>
            </div>
            <p className="text-xs leading-relaxed mb-4">
              Център БУДИМ СЕ е независима гражданска и образователна инициатива за медийна и
              дигитална грамотност. Не сме срещу технологиите. Работим за по-добро разбиране,
              критично мислене и осъзнат избор.
            </p>
            <div className="space-y-2 text-xs">
              <a
                href="mailto:budimseonline@gmail.com"
                className="flex items-center gap-2 hover:text-white/70 transition-colors min-h-[44px]"
              >
                <Icon name="ri-mail-line" size={14} className="text-white/30" />
                budimseonline@gmail.com
              </a>
            </div>
            <p className="text-[11px] leading-relaxed text-white/25 mt-4">
              Съдържанието има образователна цел и не представлява медицинска или психологическа консултация.
            </p>
          </div>

          {/* Nav columns */}
          <div className="flex flex-col sm:flex-row gap-8 md:gap-10 w-full md:w-auto">
            <div>
              <div className="text-xs tracking-widest uppercase text-white/25 mb-3 md:mb-4 font-medium">Степените</div>
              <div className="space-y-2 md:space-y-2.5 text-sm">
                {steps.map((s) => (
                  <Link key={s.path} to={s.path} className="block hover:text-white/70 transition-colors py-1">
                    {s.title}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs tracking-widest uppercase text-white/25 mb-3 md:mb-4 font-medium">Центърът</div>
              <div className="space-y-2 md:space-y-2.5 text-sm">
                <Link to="/center" className="block hover:text-white/70 transition-colors py-1">За нас</Link>
                <Link to="/news" className="block hover:text-white/70 transition-colors py-1">Новини</Link>
                <Link to="/analizator" className="block hover:text-white/70 transition-colors py-1">Анализатор</Link>
                <Link to="/author" className="block hover:text-white/70 transition-colors py-1">Авторът</Link>
                <Link to="/order" className="block hover:text-white/70 transition-colors py-1">Книгата</Link>
                <Link to="/testimonials" className="block hover:text-white/70 transition-colors py-1">Отзиви</Link>
                <Link to="/sources" className="block hover:text-white/70 transition-colors py-1">Източници</Link>
                <Link to="/digitalna-gramotnost" className="block hover:text-white/70 transition-colors py-1">Дигитална грамотност</Link>
                <Link to="/contact" className="block hover:text-white/70 transition-colors py-1">Контакти</Link>
              </div>
            </div>
            <div>
              <div className="text-xs tracking-widest uppercase text-white/25 mb-3 md:mb-4 font-medium">Правна информация</div>
              <div className="space-y-2 md:space-y-2.5 text-sm">
                <Link to="/privacy" className="block hover:text-white/70 transition-colors py-1">Политика за поверителност</Link>
                <Link to="/terms" className="block hover:text-white/70 transition-colors py-1">Условия за ползване</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 md:pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <span>© {new Date().getFullYear()} Център БУДИМ СЕ. Всички права запазени.</span>
          <div className="flex items-center gap-4 text-white/20">
            <Link to="/privacy" className="hover:text-white/40 transition-colors">Поверителност</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-white/40 transition-colors">Условия</Link>
            <span>·</span>
            <span>budimse.online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}