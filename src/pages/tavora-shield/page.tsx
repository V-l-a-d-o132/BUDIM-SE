import { Link } from 'react-router-dom';
import { useState } from 'react';
import ContentAnalyzer from './components/ContentAnalyzer';
import GrayscaleGuide from './components/GrayscaleGuide';
import SelfAssessment from './components/SelfAssessment';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';
import RecaptchaBadge from '@/components/base/RecaptchaBadge';
import { ClassroomProvider } from './components/classroom/ClassroomContext';
import { ClassroomAccess, ClassroomGate } from './components/classroom/ClassroomAccess';

type Module = 'analyzer' | 'grayscale' | 'assessment';

const modules: { id: Module; label: string; icon: string; description: string }[] = [
  {
    id: 'analyzer',
    label: 'Анализ на съдържание',
    icon: 'ri-shield-check-line',
    description: 'Разпознаване на езикови и структурни похвати в текст',
  },
  {
    id: 'grayscale',
    label: 'Режим на фокус',
    icon: 'ri-contrast-2-line',
    description: 'Учебни прототипи iOS и Android с отделни настройки за цветове, известия и приложения',
  },
  {
    id: 'assessment',
    label: 'Самооценка',
    icon: 'ri-brain-line',
    description: '35 авторски въпроса с прозрачна карта на отговорите',
  },
];

export default function TavoraShield() {
  const [activeModule, setActiveModule] = useState<Module>('grayscale');
  const [visitedModules, setVisitedModules] = useState<Module[]>(['grayscale']);
  const selectModule = (module: Module) => {
    setActiveModule(module);
    setVisitedModules(previous => previous.includes(module) ? previous : [...previous, module]);
  };

  usePageSeo({
    title: 'Анализатор на съдържание | БУДИМ СЕ',
    description: 'Образователен инструмент за разпознаване на езикови и структурни похвати в дигиталното съдържание — емоционален натиск, внушение за спешност, поляризация, социален натиск и подтик към автоматична реакция.',
    canonical: '/analizator',
    schemaType: 'WebPage',
    schemaExtra: {
      keywords: 'медийна грамотност, анализатор на съдържание, разпознаване на похвати, дигитална грамотност, БУДИМ СЕ',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'БУДИМ СЕ', item: 'https://budimse.online' },
          { '@type': 'ListItem', position: 2, name: 'Анализатор на съдържание', item: 'https://budimse.online/analizator' },
        ],
      },
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: 'Анализатор на съдържание',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        description: 'Образователен инструмент за разпознаване на езикови и структурни похвати в дигиталното съдържание.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
        },
      },
    },
  });

  return (
    <ClassroomProvider><div className="min-h-screen bg-white">
      <Navbar />
      <main id="main-content" tabIndex={-1}>

      {/* Hero */}
      <section className="pt-24 pb-8 px-4 md:pt-28 md:pb-10 md:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-4 font-medium">Анализатор на съдържание — Образователен инструмент</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-5 leading-tight">
            Разпознай похватите<br />
            <span className="font-medium">в дигиталното съдържание.</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
            Разгледай възможни езикови сигнали в текст, изпробвай настройки за фокус
            и направи самооценка на дигиталните си навици. Всеки инструмент показва
            какво може да обобщи и какви са ограниченията му.
          </p>
        </div>
      </section>

      {/* Module selector */}
      <section className="pb-6 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {modules.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={activeModule === m.id}
                aria-controls={`module-${m.id}`}
                onClick={() => selectModule(m.id)}
                className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${
                  activeModule === m.id
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={m.icon} size={18} className={activeModule === m.id ? 'text-white' : 'text-gray-500'} />
                  <span className="text-sm font-medium">{m.label}</span>
                </div>
                <p className={`text-xs leading-relaxed ${activeModule === m.id ? 'text-gray-300' : 'text-gray-400'}`}>
                  {m.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Active module */}
      <section className="pb-12 px-4 md:pb-20 md:px-6">
        <div className="max-w-6xl mx-auto">
          <ClassroomAccess />
          {visitedModules.includes('analyzer') && <div id="module-analyzer" hidden={activeModule !== 'analyzer'}><ClassroomGate scope="analyzer"><ContentAnalyzer /></ClassroomGate></div>}
          {visitedModules.includes('grayscale') && <div id="module-grayscale" hidden={activeModule !== 'grayscale'}><ClassroomGate scope="simulators"><GrayscaleGuide /></ClassroomGate></div>}
          {visitedModules.includes('assessment') && <div id="module-assessment" hidden={activeModule !== 'assessment'}><SelfAssessment /></div>}
        </div>
      </section>

      {/* Security Banner */}
      {activeModule === 'analyzer' && <section className="py-4 px-4 md:py-6 md:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Анализатор на съдържание</p>
              <p className="text-xs text-gray-400">Инструментът е защитен от Google reCAPTCHA</p>
            </div>
          </div>
          <RecaptchaBadge />
        </div>
      </section>}

      {/* CTA */}
      <section className="py-10 md:py-16 px-4 md:px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
            Рамката в пълна форма.
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Книгата представя авторската рамка и практики за наблюдение на дигиталните навици.
            Инструментите тук са образователни примери; резултатите им не доказват научна
            валидност на рамката.
          </p>
          <Link
            to="/order"
            className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap font-medium"
          >
            <Icon name="ri-book-line" size={16} className="mr-2" />
            Вземи книгата
          </Link>
        </div>
      </section>

      </main>
      <Footer />
    </div></ClassroomProvider>
  );
}

