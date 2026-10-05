import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '@/components/base/Icon';

const steps = [
  { path: '/step-1', number: '01', title: 'Биологичният автоматизъм', subtitle: 'Автопилотът и автоматичните реакции' },
  { path: '/step-2', number: '02', title: 'Алгоритмичният прицел', subtitle: 'Емоции и икономика на вниманието' },
  { path: '/step-3', number: '03', title: 'Когнитивна свобода', subtitle: 'Прекъсване на автоматичните цикли' },
  { path: '/step-4', number: '04', title: 'Завръщане и реинтеграция', subtitle: 'Линеен фокус и живо присъствие' },
  { path: '/step-5', number: '05', title: 'Съзнателна свобода', subtitle: 'Осъзнато използване' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStepsOpen, setIsStepsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isStepActive = steps.some((s) => location.pathname === s.path);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsStepsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsStepsOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50 safe-pt">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img
              src="https://storage.readdy-site.link/project_files/f310a09a-6cb0-4fe3-a3ef-e12bf0036316/c92e355b-473f-4387-a3bb-8e40a8c53bde_DIGITAL-MEDIA-CENTRE-------.png?v=edaa6d50d88bec1dd7055e86d801cea5"
              alt="Digital Media Centre лого"
              className="h-7 md:h-8 w-auto object-contain flex-shrink-0"
            />
            <span className="hidden xl:block text-sm font-medium text-gray-900 leading-tight whitespace-nowrap">
              Център за медийна и дигитална грамотност БУДИМ СЕ
            </span>
            <span className="hidden lg:block xl:hidden text-sm font-medium text-gray-900 whitespace-nowrap">БУДИМ СЕ</span>
            <span className="lg:hidden text-sm font-medium text-gray-900">БУДИМ СЕ</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5 lg:gap-6 flex-shrink-0">
            {/* Steps dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsStepsOpen((v) => !v)}
                className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer whitespace-nowrap h-9 px-2 ${
                  isStepActive ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Степените
                <span className={`transition-transform duration-200 ${isStepsOpen ? 'rotate-180' : ''}`}>
                  <Icon name="ri-arrow-down-s-line" size={16} />
                </span>
              </button>

              {isStepsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-lg">
                  {steps.map((step) => (
                    <Link
                      key={step.path}
                      to={step.path}
                      className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group min-h-[44px] ${
                        location.pathname === step.path ? 'bg-gray-50' : ''
                      }`}
                    >
                      <span className="text-xl font-light text-gray-200 group-hover:text-gray-400 transition-colors w-8 flex-shrink-0">
                        {step.number}
                      </span>
                      <div>
                        <p className={`text-sm font-medium leading-tight ${
                          location.pathname === step.path ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{step.subtitle}</p>
                      </div>
                      {location.pathname === step.path && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gray-900 flex-shrink-0"></div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/news"
              className={`text-sm transition-colors whitespace-nowrap h-9 flex items-center px-2 ${
                location.pathname.startsWith('/news')
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Новини
            </Link>

            <Link
              to="/digitalna-gramotnost"
              className={`text-sm transition-colors whitespace-nowrap h-9 flex items-center px-2 ${
                location.pathname === '/digitalna-gramotnost'
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Грамотност
            </Link>

            <Link
              to="/center"
              className={`text-sm transition-colors whitespace-nowrap h-9 flex items-center px-2 ${
                location.pathname === '/center'
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Центърът
            </Link>

            <Link
              to="/analizator"
              className={`text-sm transition-colors whitespace-nowrap h-9 flex items-center px-2 ${
                location.pathname === '/analizator'
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Анализатор
            </Link>

            <Link
              to="/order"
              className={`text-sm transition-colors whitespace-nowrap h-9 flex items-center px-2 ${
                location.pathname === '/order'
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Вземи книгата
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden cursor-pointer w-11 h-11 flex items-center justify-center -mr-1"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Меню"
          >
            {isMobileMenuOpen ? (
              <Icon name="ri-close-line" size={22} />
            ) : (
              <Icon name="ri-menu-line" size={22} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 pb-4 border-t border-gray-100 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col pt-2">
              {/* Steps group */}
              <div className="mb-1">
                <p className="text-xs text-gray-400 uppercase tracking-widest px-3 py-2 mb-1 font-medium">
                  Степените
                </p>
                {steps.map((step) => (
                  <Link
                    key={step.path}
                    to={step.path}
                    className={`flex items-center gap-3 py-3 px-3 min-h-[44px] transition-colors ${
                      location.pathname === step.path
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-sm font-light text-gray-300 w-6">{step.number}</span>
                    <span className="text-sm">{step.title}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-2 mt-1 flex flex-col">
                <Link
                  to="/news"
                  className={`text-sm py-3 px-3 min-h-[44px] flex items-center transition-colors ${
                    location.pathname.startsWith('/news') ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}
                >
                  Новини
                </Link>
                <Link
                  to="/digitalna-gramotnost"
                  className={`text-sm py-3 px-3 min-h-[44px] flex items-center transition-colors ${
                    location.pathname === '/digitalna-gramotnost' ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}
                >
                  Дигитална грамотност
                </Link>
                <Link
                  to="/center"
                  className={`text-sm py-3 px-3 min-h-[44px] flex items-center transition-colors ${
                    location.pathname === '/center' ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}
                >
                  Център за медийна грамотност
                </Link>
                <Link
                  to="/author"
                  className={`text-sm py-3 px-3 min-h-[44px] flex items-center transition-colors ${
                    location.pathname === '/author' ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}
                >
                  Авторът
                </Link>
                <Link
                  to="/sources"
                  className={`text-sm py-3 px-3 min-h-[44px] flex items-center transition-colors ${
                    location.pathname === '/sources' ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}
                >
                  Източници
                </Link>
                <Link
                  to="/analizator"
                  className={`text-sm py-3 px-3 min-h-[44px] flex items-center transition-colors ${
                    location.pathname === '/analizator' ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}
                >
                  Анализатор
                </Link>
                <Link
                  to="/order"
                  className={`text-sm py-3 px-3 min-h-[44px] flex items-center transition-colors ${
                    location.pathname === '/order' ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}
                >
                  Вземи книгата
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}