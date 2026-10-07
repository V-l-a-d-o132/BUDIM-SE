import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

const faqs = [
  {
    "q": "Какво е Център БУДИМ СЕ?",
    "a": "Независима гражданска и образователна инициатива за медийна и дигитална грамотност. Подготвяме материали, инструменти и пилотни формати за училища, семейства и екипи."
  },
  {
    "q": "За кого е книгата „Петте степени“?",
    "a": "За читатели, които искат да разгледат дигиталните си навици и да опитат промяна. Петте степени са задачи, към които можеш да се връщаш. При работа с деца примерите и правилата трябва да се съобразят с възрастта и нуждите им."
  },
  {
    "q": "Трябва ли да спра да използвам телефона?",
    "a": "Можеш да запазиш онова, което ти е полезно, и да промениш конкретна употреба, която ти пречи. Понякога има смисъл от ограничение, понякога от друга настройка или по-ясна уговорка."
  },
  {
    "q": "Как работи анализаторът?",
    "a": "Инструментът предлага възможни езикови сигнали за емоционален натиск, спешност, социален натиск, поляризация и подтик към реакция. Посочва откъси и обяснения, които трябва да прецениш в контекст. Може да греши; не проверява фактите и не установява намерението на автора."
  },
  {
    "q": "Как да обсъдим програма за училище или екип?",
    "a": "Използвайте формата на страницата „Центърът“ или пишете на budimseonline@gmail.com. Първо уточняваме нуждите, възрастта на участниците и възможния формат. Не обещаваме предварително измерен ефект."
  },
  {
    "q": "Научно изпитана методика ли е „Будим се“?",
    "a": "„Петте степени“ и практиката „Будим се“ са авторска образователна рамка. Източниците подкрепят отделни твърдения и показват ограниченията им. Те не са клинично изпитване на рамката. Книгата може да се чете самостоятелно, без регистрация в сайта."
  },
  {
    "q": "Как се обработват личните данни?",
    "a": "Политиката за поверителност описва данните, целите и услугите, които сайтът използва. Рекламните бисквитки се включват след съгласие. Можеш да откажеш или да промениш избора си от връзката „Настройки на бисквитките“ в края на страницата. За въпроси: budimseonline@gmail.com."
  }
];

const steps = [
  {
    "number": "01",
    "title": "Да забележиш навика",
    "description": "Забележи кога посягаш към телефона и какво търсиш в този момент.",
    "link": "/step-1",
    "tag": "Наблюдение"
  },
  {
    "number": "02",
    "title": "Да разбереш средата",
    "description": "Разгледай препоръките, известията и източниците на информация.",
    "link": "/step-2",
    "tag": "Разбиране"
  },
  {
    "number": "03",
    "title": "Да опиташ промяна",
    "description": "Избери една малка промяна и провери дали ти помага.",
    "link": "/step-3",
    "tag": "Опит"
  },
  {
    "number": "04",
    "title": "Да върнеш място за живота",
    "description": "Остави място за важните ти занимания, общуването и почивката.",
    "link": "/step-4",
    "tag": "Място"
  },
  {
    "number": "05",
    "title": "Да поддържаш свободата си",
    "description": "Преглеждай границите си и ги променяй според живота си.",
    "link": "/step-5",
    "tag": "Поддържане"
  }
];

const operations = [
  {
    icon: 'ri-school-line',
    title: 'Програма за училища',
    target: 'Училища и образователни институции',
    description:
      'Програмата цели да помогне на учениците да разпознават механизмите на дигиталната среда и да четат по-осъзнато. Подготвяме практически сесии с педагогически екипи в пилотен формат.',
    metrics: ['Пилотен формат', 'Адаптирано съдържание', 'Проследяваме резултата'],
  },
  {
    icon: 'ri-home-4-line',
    title: 'Програма за семейства',
    target: 'Семейства',
    description:
      'Разговор за нуждите на децата и родителите, полезната употреба и трудните моменти около екраните. Подготвяме пилотни формати за ясни правила и разумни граници, съобразени с възрастта.',
    metrics: ['Индивидуален подход', 'Родители + деца', 'Подготвяме пилотни групи'],
  },
  {
    icon: 'ri-building-line',
    title: 'Програма за компании',
    target: 'Организации и бизнес',
    description:
      'Програмата цели да намали информационния шум в работна среда и да подкрепи по-осъзнат фокус в екипите. Подготвяме пилотни формати с организации.',
    metrics: ['Пилотен формат', 'Запитване за партньорство', 'Проследяваме показатели'],
  },
];

export default function Home() {
  const [, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  usePageSeo({
    title: 'Медийна грамотност и критично мислене | Център БУДИМ СЕ',
    description: 'Медийна грамотност за ученици, семейства и екипи. Разпознаване на дезинформация, критично мислене и дигитални навици — авторската рамка „Петте степени".',
    canonical: '/',
    keywords: 'медийна грамотност, дигитална грамотност, дигитални навици, проверка на информация, Петте степени, БУДИМ СЕ',
    schemaType: 'WebPage',
    breadcrumbs: [
      { name: 'Начало', url: 'https://budimse.online' },
    ],
    schemaExtra: {
      dateModified: '2026-10-07',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'h2', 'blockquote'],
      },
      mentions: [
        { '@type': 'Thing', name: 'Медийна грамотност', sameAs: 'https://budimse.online/digitalna-gramotnost' },
        { '@type': 'Thing', name: 'Дигитална грамотност', sameAs: 'https://budimse.online/digitalna-gramotnost' },
        { '@type': 'Thing', name: 'Дигитален суверенитет', sameAs: 'https://budimse.online/step-5' },
        { '@type': 'Thing', name: 'Дигитални навици', sameAs: 'https://budimse.online/step-5' },
        { '@type': 'Thing', name: 'Поведенчески дизайн', sameAs: 'https://budimse.online/sources' },
        { '@type': 'Thing', name: 'Attention Economy', sameAs: 'https://budimse.online/sources' },
        { '@type': 'Person', name: 'Владимир Атанасов', url: 'https://budimse.online/author' },
      ],
      about: [
        { '@type': 'Thing', name: 'Медийна грамотност' },
        { '@type': 'Thing', name: 'Дигитална грамотност' },
        { '@type': 'Thing', name: 'Дигитални навици' },
        { '@type': 'Thing', name: 'Поведенчески дизайн' },
      ],
      mainEntity: {
        '@type': 'EducationalOrganization',
        name: 'Център за медийна и дигитална грамотност БУДИМ СЕ',
        url: 'https://budimse.online',
        description: 'Независима гражданска и образователна инициатива за медийна и дигитална грамотност в България.',
      },
    },
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[420px] md:min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://readdy.ai/api/search-image?query=abstract%20dark%20architectural%20concrete%20brutalist%20structure%20with%20geometric%20shadows%20and%20sharp%20lines%20minimal%20monochrome%20atmosphere%20cold%20light%20from%20above%20high%20contrast%20black%20and%20white%20photography%20style%20no%20people%20no%20text%20pure%20form%20and%20shadow&width=1440&height=900&seq=hero-budimse-01&orientation=landscape"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-white last:border-r-0"></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 w-full px-4 pt-24 pb-16 md:px-6 md:pt-32 md:pb-24">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <span className="inline-block text-xs tracking-[0.3em] text-white/50 uppercase font-medium border border-white/20 px-3 py-1.5 rounded-sm">
                Център БУДИМ СЕ — budimse.online
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-7xl font-light text-white leading-[1.05] mb-6 md:mb-8 max-w-4xl">
              Разбирай дигиталната среда.<br />
              <strong className="font-semibold">Избирай осъзнато.</strong>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-white/70 font-light leading-relaxed max-w-2xl mb-8 md:mb-12">
              Център БУДИМ СЕ е независима гражданска инициатива за медийна и дигитална грамотност. Създаваме образователни материали, практически инструменти и програми, които помагат на хората да разпознават механизмите на дигиталната среда и да използват технологиите с повече яснота и свобода.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link
                to="/step-1"
                className="inline-flex items-center justify-center px-6 md:px-8 py-3.5 md:py-4 bg-white text-gray-900 rounded-sm hover:bg-gray-100 transition-colors whitespace-nowrap text-sm font-medium tracking-wide min-h-[44px]"
              >
                Разгледай Петте степени
                <Icon name="ri-arrow-right-line" size={16} className="ml-2" />
              </Link>
              <Link
                to="/center"
                className="inline-flex items-center justify-center px-6 md:px-8 py-3.5 md:py-4 border border-white/40 text-white rounded-sm hover:border-white/80 transition-colors whitespace-nowrap text-sm font-medium tracking-wide min-h-[44px]"
              >
                За БУДИМ СЕ
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-40">
          <span className="text-white text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-white animate-pulse"></div>
        </div>
      </section>

      {/* ─── ДИГИТАЛНАТА СРЕДА НЕ Е НЕУТРАЛНА ─── */}
      <section className="py-12 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs tracking-[0.25em] text-gray-400 uppercase font-medium">
            Секция 01 — Как работи дигиталната среда
          </span>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-light text-gray-900 mt-4 mb-6 md:mb-8 leading-tight">
            Дигиталната среда не е неутрална.<br />
            <span className="font-medium">Но ние не сме безпомощни.</span>
          </h2>
          <div className="space-y-5 text-gray-600 leading-relaxed text-base md:text-lg">
            <p>
              Социалните мрежи, приложенията и системите с изкуствен интелект са създадени да бъдат
              полезни, лесни и привлекателни. Част от техния дизайн насърчава по-често взаимодействие,
              бързи реакции и продължително потребление.
            </p>
            <p>
              Това не прави технологиите враг. Означава, че трябва да разбираме как работят. Когато
              разпознаваме механизмите зад известията, препоръките, безкрайното превъртане и
              емоционално зареденото съдържание, можем да вземаме по-осъзнати решения.
            </p>
          </div>
        </div>
      </section>

      {/* ─── РАМКАТА — ПЕТТЕ СТЕПЕНИ ─── */}
      <section id="steps" className="py-12 md:py-24 px-4 md:px-6 bg-gray-950 text-white scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-xs tracking-[0.25em] text-white/40 uppercase font-medium">
              Секция 02 — Петте степени
            </span>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-light text-white mt-4 mb-5 md:mb-6 leading-tight">
              Петте степени —<br />
              <span className="font-medium">пет задачи за твоето ежедневие.</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl leading-relaxed">Да забележиш навика, да разбереш средата, да опиташ промяна и да оставиш място за важните неща. Степените не са диагнози или класация на хората. Можеш да започнеш от въпроса, който те засяга, и да се връщаш към него.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/10 rounded-sm overflow-hidden">
            {steps.map((step, index) => (
              <Link
                key={index}
                to={step.link}
                className="group bg-gray-950 p-6 hover:bg-gray-900 transition-colors cursor-pointer flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="text-4xl font-light text-white/15 group-hover:text-white/30 transition-colors">
                    {step.number}
                  </span>
                  <span className="text-xs text-white/30 border border-white/10 px-2 py-0.5 rounded-sm whitespace-nowrap">
                    {step.tag}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-white mb-3 leading-snug">{step.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed flex-1">{step.description}</p>
                <div className="mt-6 flex items-center gap-1 text-xs text-white/30 group-hover:text-white/60 transition-colors">
                  <span>Виж степента</span>
                  <Icon name="ri-arrow-right-line" size={14} />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/step-1"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-sm hover:bg-gray-100 transition-colors whitespace-nowrap text-sm font-medium"
            >
              Започни от степен 01
              <Icon name="ri-arrow-right-line" size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <section id="methodology" className="py-12 md:py-24 px-4 md:px-6 bg-gray-50 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <span className="text-xs tracking-[0.25em] text-gray-400 uppercase font-medium">Практиката „Будим се“</span>
            <h2 className="text-3xl md:text-5xl font-light text-gray-900 mt-4 mb-6 leading-tight">Една промяна, която можеш да провериш.</h2>
            <p className="text-gray-600 leading-relaxed">Това е авторският начин на работа от книгата: наблюдение, проверка, избор, опит и преглед. Можеш да се върнеш към всяка стъпка. Целта е да разбереш кое ти помага в конкретната ситуация.</p>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: 'Наблюдение', text: 'Какво правя, кога и какво ми носи? Опиши случката без оценка на себе си.' },
              { title: 'Проверка', text: 'Какво знам и какво предполагам? Провери източника и другите възможни обяснения.' },
              { title: 'Избор', text: 'Кое искам да променя? Запази полезните функции и избери изпълнима граница.' },
              { title: 'Опит', text: 'Изпробвай промяната за уговорен период. Предвиди нужните изключения.' },
              { title: 'Преглед', text: 'Какво се промени? Запази, коригирай или прекрати опита според резултата.' },
            ].map((item, i) => (
              <li key={item.title} className="border border-gray-200 bg-white rounded-sm p-5">
                <span className="text-xs font-mono text-gray-400">0{i + 1}</span>
                <h3 className="text-base font-medium text-gray-900 mt-3 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 max-w-3xl border-l-2 border-gray-400 pl-5 space-y-3 text-sm text-gray-600 leading-relaxed">
            <p><strong className="text-gray-900 font-medium">Условен пример.</strong> Ако Ива забележи, че видеата изместват четенето вечер, първо може да провери дали причината е навик, умора или липса на спокойно време. После да опита една седмица без видеоизвестия след вечеря, като остави важните обаждания.</p>
            <p>Накрая въпросът е дали има повече място за избраното занимание. Ако няма, тя може да промени плана. Примерът не описва проведена сесия или доказан резултат.</p>
          </div>
        </div>
      </section>

      {/* ─── ДЕЙСТВИЕ НА ТЕРЕН ─── */}
      <section className="py-12 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-xs tracking-[0.25em] text-gray-400 uppercase font-medium">
              Секция 03 — Нашата работа
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mt-4 mb-6 leading-tight">
              Нашата работа.<br />
              <span className="font-medium">Три програми, една мисия.</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              Три програми — за училища, семейства и компании. Всяка е структурирана около конкретни стъпки и практически сесии, насочени към разбиране на механизмите.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {operations.map((op, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-sm p-8 flex flex-col hover:border-gray-300 transition-colors"
              >
                <div className="w-10 h-10 flex items-center justify-center mb-6">
                  <Icon name={op.icon} size={20} className="text-gray-900" />
                </div>
                <div className="text-xs text-gray-400 tracking-widest uppercase mb-2">
                  {op.target}
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">{op.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-6">
                  {op.description}
                </p>
                <div className="border-t border-gray-100 pt-5 space-y-2">
                  {op.metrics.map((m, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0"></div>
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              to="/center"
              className="inline-flex items-center gap-2 text-sm text-gray-900 border border-gray-200 px-6 py-3 rounded-sm hover:border-gray-900 transition-colors whitespace-nowrap"
            >
              Виж всички програми
              <Icon name="ri-arrow-right-line" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── АНАЛИТИЧНА СРЕДА ─── */}
      <section className="py-12 md:py-24 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs tracking-[0.25em] text-gray-400 uppercase font-medium">
                Секция 04 — Инструменти
              </span>
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 mt-4 mb-6 leading-tight">
                Провери сам —<br />
                <span className="font-medium">какви похвати използва текстът.</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
                <p>Анализаторът предлага възможни езикови сигнали за натиск и бърза реакция. Посочва конкретни откъси и обяснява защо ги отбелязва. Преценката остава твоя: една и съща дума може да има различна роля в различен текст.</p>
                <p>
                  Резултатът е ориентировъчен и има образователна функция. Той не определя дали
                  съдържанието е вярно или невярно и не доказва намеренията на автора.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/analizator"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-sm hover:bg-gray-800 transition-colors whitespace-nowrap text-sm font-medium"
                >
                  Отвори инструмента
                  <Icon name="ri-arrow-right-line" size={16} className="ml-2" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-900 rounded-sm p-6 font-mono text-xs">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                  <div className="w-2 h-2 rounded-full bg-red-500/70"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/70"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/70"></div>
                  <span className="text-white/30 ml-2">Анализатор на съдържание</span>
                </div>
                <div className="space-y-5 text-white/70 leading-relaxed">
                  <p className="text-white/40 uppercase tracking-widest">Учебен пример</p>
                  <blockquote className="text-base text-white border-l border-white/30 pl-4">„Сподели веднага, преди да е късно.“</blockquote>
                  <div><p className="text-white font-medium mb-1">Възможен сигнал за спешност</p><p>„Веднага“ и „преди да е късно“ приканват към бързо действие. Липсва обяснение какво налага този срок.</p></div>
                  <div><p className="text-white font-medium mb-1">Какво да провериш</p><p>Кой е източникът? Има ли реална спешност и проверими основания? При предупреждение за опасност този език може да е уместен.</p></div>
                </div>
                <p className="mt-5 pt-4 border-t border-white/10 text-white/40 leading-relaxed">Илюстрация за четене на текст. Не е резултат от изпълнен анализ и не дава оценка за истинност.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ЦИТАТ / ПОЗИЦИЯ ─── */}
      <section className="py-12 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="border-l-2 border-gray-900 pl-8">
            <blockquote className="text-2xl md:text-3xl font-light text-gray-900 leading-relaxed mb-6">„Свободата, която ме интересува, трябва да издържа среща с умората, лошото настроение и непредвидения ден.“</blockquote>
            <cite className="text-sm text-gray-500 not-italic">— Владимир Атанасов, „Петте степени“</cite>
          </div>
        </div>
      </section>

      {/* ─── ОТЗИВИ — placeholder ─── */}
      <section className="py-12 md:py-24 px-4 md:px-6 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs tracking-[0.25em] text-white/40 uppercase font-medium">
            Секция 05 — Обратна връзка
          </span>
          <h2 className="text-4xl md:text-5xl font-light text-white mt-4 mb-6 leading-tight">
            Реални отзиви<br />
            <span className="font-medium">предстоят.</span>
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed mb-10">
            Тук ще публикуваме реална обратна връзка от участници и партньори след провеждането
            на първите инициативи. Няма да използваме примерни или измислени препоръки.
          </p>
          <Link
            to="/testimonials"
            className="inline-flex items-center gap-2 text-sm text-white/50 border border-white/20 px-6 py-3 rounded-sm hover:border-white/50 hover:text-white/80 transition-colors whitespace-nowrap"
          >
            Виж страницата с отзиви
            <Icon name="ri-arrow-right-line" size={16} />
          </Link>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-12 md:py-24 px-4 md:px-6 bg-white" aria-label="Често задавани въпроси">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <span className="text-xs tracking-[0.25em] text-gray-400 uppercase font-medium">
              Секция 06 — Въпроси
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mt-4 mb-4 leading-tight">
              Често задавани<br />
              <span className="font-medium">въпроси.</span>
            </h2>
          </div>
          <div className="space-y-0 divide-y divide-gray-100">
            {faqs.map((faq, i) => (
              <div key={i} className="py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-start justify-between gap-4 text-left cursor-pointer group min-h-[44px]"
                  aria-expanded={openFaq === i}
                >
                  <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-600 transition-colors leading-snug">
                    {faq.q}
                  </h3>
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name={openFaq === i ? 'ri-subtract-line' : 'ri-add-line'} size={16} className="text-gray-400 transition-transform duration-200" />
                  </div>
                </button>
                {openFaq === i && (
                  <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-2xl">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── КНИГАТА (ВТОРИЧЕН БЛОК) ─── */}
      <section className="py-10 md:py-16 px-4 md:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-36 flex-shrink-0">
              <img
                src="https://static.readdy.ai/image/658b459fcf05a7723f8029c45615de2f/7fd715118976d07fe2b11b1e6367a1e7.jpeg"
                alt="Петте степени — книга"
                className="w-full h-full object-cover rounded-sm"
              />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 tracking-widest uppercase mb-2">
                Авторската рамка в книжна форма
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                "Петте степени"
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xl">Книга за дигиталните навици, личната преценка и мястото на технологиите в ежедневието. С лични разкази, условни примери и упражнения, които можеш да приспособиш към себе си.</p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="text-xl font-medium text-gray-900">€14,99</div>
              <Link
                to="/order"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-900 text-gray-900 rounded-sm hover:bg-gray-900 hover:text-white transition-colors whitespace-nowrap text-sm"
              >
                <Icon name="ri-book-line" size={16} className="mr-2" />
                Поръчай книгата
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

