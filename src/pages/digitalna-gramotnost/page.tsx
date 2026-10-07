import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

const faqs = [
  {
    "q": "Какво е дигитална грамотност?",
    "a": "Умения да използваш технологиите, да намираш и проверяваш информация, да общуваш и създаваш съдържание, да пазиш данните си и да преценяваш собствената си употреба. Разбирането на препоръките и рекламите е част от тези умения."
  },
  {
    "q": "Как се свързва с медийната грамотност?",
    "a": "Медийната грамотност помага да преценяваме източници, твърдения, доказателства и начина, по който е представено съдържанието. Дигиталната грамотност включва и работа с устройства и услуги, безопасност и лични данни. Двете области се допълват."
  },
  {
    "q": "За каква възраст са подходящи упражненията?",
    "a": "Примерите, продължителността и правилата се съобразяват с възрастта, нуждите и възможностите на участниците. За деца е важна подкрепата на родители и учители. „Петте степени“ не е проверена методика за всяка възраст."
  },
  {
    "q": "Какво мога да разгледам в собствената си употреба?",
    "a": "Избери конкретен момент: например известията по време на работа или видеата преди сън. Попитай се какво ти дават и какво изместват. Умората и затруднената концентрация могат да имат много причини; едно наблюдение не поставя диагноза."
  },
  {
    "q": "Какъв формат се подготвя за училища?",
    "a": "Пилотни практически сесии с педагогически екипи: четене на различни текстове, проверка на източник, разговор за препоръките и настройките за поверителност. Съдържанието и начинът за преглед на резултата се уточняват с конкретното училище."
  },
  {
    "q": "Трябва ли да се откажа от социалните мрежи?",
    "a": "Можеш да запазиш полезното общуване и информацията, която цениш. Промяната може да е ограничение на една функция, друг начин на четене или ясна граница за определен час. Подходящият избор зависи от твоята ситуация."
  }
];

const steps = [
  {
    "num": "01",
    "title": "Да забележиш навика",
    "desc": "Забележи кога посягаш към телефона и какво търсиш в този момент.",
    "icon": "ri-eye-line",
    "link": "/step-1"
  },
  {
    "num": "02",
    "title": "Да разбереш средата",
    "desc": "Разгледай препоръките, известията и източниците на информация.",
    "icon": "ri-lightbulb-line",
    "link": "/step-2"
  },
  {
    "num": "03",
    "title": "Да опиташ промяна",
    "desc": "Избери една малка промяна и провери дали ти помага.",
    "icon": "ri-refresh-line",
    "link": "/step-3"
  },
  {
    "num": "04",
    "title": "Да върнеш място за живота",
    "desc": "Остави място за важните ти занимания, общуването и почивката.",
    "icon": "ri-focus-3-line",
    "link": "/step-4"
  },
  {
    "num": "05",
    "title": "Да поддържаш свободата си",
    "desc": "Преглеждай границите си и ги променяй според живота си.",
    "icon": "ri-shield-check-line",
    "link": "/step-5"
  }
];

const audiences = [
  {
    "icon": "ri-graduation-cap-line",
    "title": "Ученици и студенти",
    "desc": "Упражнения за проверка на източници, разбиране на препоръките и защита на личните данни. Подготвяме пилотни формати, съобразени с възрастта и учебната среда.",
    "cta": "Програма за училища",
    "link": "/center"
  },
  {
    "icon": "ri-home-heart-line",
    "title": "Родители и семейства",
    "desc": "Разговор за това какво е полезно онлайн, какво пречи на съня и общуването и кои граници са разумни. Правилата трябва да отчитат нуждите на децата и възрастните.",
    "cta": "Семейни програми",
    "link": "/center"
  },
  {
    "icon": "ri-building-line",
    "title": "Работни екипи",
    "desc": "Пилотни формати за известията, срещите и очакванията за бърз отговор. Първо разглеждаме организацията на работата и избираме конкретен въпрос, който може да се проследи.",
    "cta": "Програми за екипи",
    "link": "/center"
  }
];

const stats = [
  {
    "value": "5",
    "label": "Задачи в авторската рамка",
    "sub": "Можеш да се връщаш към всяка"
  },
  {
    "value": "17",
    "label": "Бележки към книгата",
    "sub": "Източници с обхват и ограничения"
  },
  {
    "value": "3",
    "label": "Пилотни направления",
    "sub": "Училища, семейства и екипи"
  },
  {
    "value": "BG",
    "label": "Фокус",
    "sub": "Инициатива в България"
  }
];

export default function DigitalnaGramotnostPage() {
  usePageSeo({
    title: 'Медийна и дигитална грамотност в България | БУДИМ СЕ',
    description: 'Медийна и дигитална грамотност за ученици, семейства и корпоративни екипи. Рамката „Петте степени" на Центъра БУДИМ СЕ — разпознаване на дезинформация, критично мислене и дигитални навици.',
    canonical: '/digitalna-gramotnost',
    keywords: 'медийна грамотност, дигитална грамотност, дигитални навици, проверка на информация, Петте степени, БУДИМ СЕ',
    ogImage: 'https://readdy.ai/api/search-image?query=digital%20literacy%20education%20workshop%20Bulgaria%20students%20adults%20learning%20media%20critical%20thinking%20modern%20classroom%20minimalist%20clean%20design%20natural%20light&width=1200&height=630&seq=dg-og-v1&orientation=landscape',
    schemaType: 'WebPage',
    breadcrumbs: [
      { name: 'Начало', url: 'https://budimse.online' },
      { name: 'Дигитална грамотност', url: 'https://budimse.online/digitalna-gramotnost' },
    ],
    schemaExtra: {
      dateModified: '2026-10-07',
      about: {
        '@type': 'EducationalOccupationalProgram',
        name: 'Дигитална грамотност — Рамка „Петте степени"',
        description: 'Авторска рамка за наблюдение на дигитални навици и проверка на информация. Подготвят се пилотни формати за училища, семейства и екипи.',
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Център за медийна и дигитална грамотност БУДИМ СЕ',
          url: 'https://budimse.online',
        },
        educationalLevel: 'Форматът се съобразява с възрастта на участниците',
        inLanguage: 'bg',
        availableLanguage: 'Bulgarian',
      },
      mainEntity: {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[420px] md:min-h-[580px] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=abstract%20dark%20architectural%20concrete%20brutalist%20structure%20geometric%20shadows%20sharp%20lines%20minimal%20monochrome%20atmosphere%20cold%20light%20high%20contrast%20black%20and%20white%20no%20people%20no%20text%20pure%20form%20shadow&width=1440&height=800&seq=dg-hero-dark-v1&orientation=landscape"
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/45"></div>
        </div>

        <div className="relative w-full px-4 pt-28 pb-16 md:px-6 md:pt-36 md:pb-24">
          <div className="max-w-5xl mx-auto">
            <nav aria-label="breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-xs text-white/50">
                <li><Link to="/" className="hover:text-white/80 transition-colors">Начало</Link></li>
                <li><span>/</span></li>
                <li className="text-white/70 font-medium">Дигитална грамотност</li>
              </ol>
            </nav>

            <p className="text-xs text-white/50 uppercase tracking-widest mb-5 font-medium">
              Център БУДИМ СЕ — България
            </p>
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-light text-white mb-6 md:mb-8 leading-none tracking-tight max-w-4xl">
              Медийна и<br />
              <strong className="font-semibold">дигитална грамотност</strong>
            </h1>
            <p className="text-xl md:text-2xl text-white/75 font-light leading-relaxed max-w-2xl mb-10">Умения за работа с технологии, проверка на информация и защита на личните данни. И място да прецените кое ви е полезно в ежедневието.</p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/center"
                className="bg-white text-gray-900 px-8 py-3.5 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Програми за обучение
              </Link>
              <Link
                to="/step-1"
                className="border border-white/50 text-white px-8 py-3.5 rounded-md text-sm font-medium hover:border-white hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
              >
                Рамката „Петте степени"
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What is digital literacy — long-form */}
      <section className="py-12 px-4 md:py-20 md:px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-5 gap-14 items-start">
            <div className="md:col-span-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-medium">Определение</p>
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight">
                Какво е<br />
                <strong className="font-semibold">дигитална грамотност?</strong>
              </h2>
            </div>
            <div className="md:col-span-3 space-y-5 text-gray-700 leading-relaxed">
              <p className="text-lg">Дигиталната грамотност включва работа с технологии, търсене и проверка на информация, общуване, създаване на съдържание и защита на личните данни.</p>
              <p>Тук разглеждаме и въпросите на книгата: какво ни води към екрана, как се подреждат препоръките и как можем да опитаме промяна, без да изгубим полезните функции.</p>
              <p>Известията и препоръките могат да улесняват намирането на съдържание и да насърчават още взаимодействия. Техният ефект зависи от услугата, настройките, съдържанието и човека. Разбирането на търговските цели помага да задаваме по-добри въпроси.</p>
              <p>Можем едновременно да ценим технологията и да поставяме граници. Онлайн общуването, ученето и забавлението са реална част от живота; въпросът е какво място им отреждаме.</p>
              <p>Пилотните формати на БУДИМ СЕ се подготвят с тази цел: конкретни упражнения и разговор за резултата. Не представяме условните примери като проведени обучения или доказателство за ефективност.</p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-base text-gray-500 italic">Практиката „Будим се“: наблюдаваме, проверяваме, избираме, опитваме и преглеждаме резултата.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why it matters — data section */}
      <section className="py-12 px-4 md:py-20 md:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-medium">Контекстът</p>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight max-w-2xl">Какво си струва да разгледаме</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
            {stats.map((s, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-lg p-6">
                <div className="text-3xl font-light text-gray-900 mb-2">{s.value}</div>
                <p className="text-sm font-semibold text-gray-800 mb-1 leading-snug">{s.label}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <div className="w-8 h-8 flex items-center justify-center mb-4">
                <i className="ri-brain-line text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Проверка на информацията</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Популярна публикация може да съдържа грешка, пропуснат контекст или вярно предупреждение. Проверяваме първоначалния източник, датата и доказателствата, преди да споделим.</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <div className="w-8 h-8 flex items-center justify-center mb-4">
                <i className="ri-book-open-line text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Различни начини на четене</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Сканирането е полезно за намиране на информация. Сложният аргумент понякога изисква повече време и връщане към текста. Избираме начина на четене според задачата и проверяваме какво сме разбрали.</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <div className="w-8 h-8 flex items-center justify-center mb-4">
                <i className="ri-emotion-sad-line text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Общуване и благополучие</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Онлайн връзките могат да носят подкрепа, а определени преживявания — натиск или вреда. Общото време пред екрана не описва всичко. Важни са съдържанието, отношенията и обстоятелствата на човека.</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <div className="w-8 h-8 flex items-center justify-center mb-4">
                <i className="ri-focus-2-line text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Прекъсвания в ежедневието</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Известията са една възможна причина за прекъсване. Други са натоварването, умората и очакванията в екипа. Вместо да обвиняваме човека, можем да разгледаме конкретната задача и организацията около нея.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The 5 steps methodology */}
      <section className="py-12 px-4 md:py-20 md:px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-medium">Рамката</p>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight max-w-2xl">„Петте степени“ — въпроси и упражнения</h2>
            <p className="text-gray-500 mt-4 max-w-xl leading-relaxed">Авторска рамка с пет задачи за наблюдение и промяна. Те могат да се преплитат и да се повтарят. Не определят на кое ниво е човекът и не обещават еднакъв резултат.</p>
          </div>
          <div className="space-y-px">
            {steps.map((step, i) => (
              <Link
                key={i}
                to={step.link}
                className="group flex items-start gap-6 bg-white border border-gray-100 rounded-lg p-7 hover:border-gray-300 transition-all duration-200 cursor-pointer"
              >
                <div className="flex-shrink-0 text-3xl font-light text-gray-200 group-hover:text-gray-400 transition-colors w-10">
                  {step.num}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className={`${step.icon} text-gray-400 text-sm`}></i>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Степен {step.num}: {step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="ri-arrow-right-line" size={14} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/step-1"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Започнете от Степен 1
              <i className="ri-arrow-right-line text-sm"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* For whom */}
      <section className="py-12 px-4 md:py-20 md:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-medium">Програми</p>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight">
              Дигитална грамотност<br />
              <strong className="font-semibold">за всеки контекст</strong>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {audiences.map((a, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-lg p-8 flex flex-col">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full mb-5">
                  <Icon name={a.icon} size={20} className="text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{a.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-6">{a.desc}</p>
                <Link
                  to={a.link}
                  className="text-sm font-medium text-gray-900 flex items-center gap-1.5 hover:gap-2.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  {a.cta}
                <Icon name="ri-arrow-right-line" size={14} className="ml-1.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media literacy vs digital literacy */}
      <section className="py-12 px-4 md:py-20 md:px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-5 gap-14 items-start">
            <div className="md:col-span-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-medium">Разграничение</p>
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight">
                Медийна vs.<br />
                <strong className="font-semibold">дигитална грамотност</strong>
              </h2>
            </div>
            <div className="md:col-span-3 space-y-6">
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="p-5 border-r border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-medium">Медийна грамотност</p>
                    <ul className="space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><Icon name="ri-checkbox-circle-line" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />Критично четене на новини</li>
                      <li className="flex items-start gap-2"><Icon name="ri-checkbox-circle-line" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />Разпознаване на дезинформация</li>
                      <li className="flex items-start gap-2"><Icon name="ri-checkbox-circle-line" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />Анализ на рекламни послания</li>
                      <li className="flex items-start gap-2"><Icon name="ri-checkbox-circle-line" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />Оценка на медийни източници</li>
                    </ul>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-medium">Дигитална грамотност</p>
                    <ul className="space-y-2.5 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><Icon name="ri-checkbox-circle-line" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />Работа с устройства и услуги</li>
                      <li className="flex items-start gap-2"><Icon name="ri-checkbox-circle-line" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />Общуване и създаване на съдържание</li>
                      <li className="flex items-start gap-2"><Icon name="ri-checkbox-circle-line" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />Безопасност и лични данни</li>
                      <li className="flex items-start gap-2"><Icon name="ri-checkbox-circle-line" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />Преценка на собствената употреба</li>
                    </ul>
                  </div>
                </div>
                <div className="p-5 bg-gray-50 border-t border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">Двете области се допълват. Добре е да проверим както самото твърдение, така и условията, при които е стигнало до нас: препоръка, реклама, търсене или споделяне от познат.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Анализатор promo */}
      <section className="py-12 px-4 md:py-20 md:px-6 bg-gray-900 text-white border-t border-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-medium">Инструмент</p>
              <h2 className="text-2xl md:text-3xl font-light text-white leading-tight mb-5">
                Анализатор на съдържание —<br />
                <strong className="font-semibold">разпознайте похватите</strong>
              </h2>
              <p className="text-gray-300 leading-relaxed mb-8">Поставете текст и разгледайте възможните сигнали за натиск, спешност или подтик към реакция. Инструментът посочва откъси и обяснения. Може да пропуска или да отбелязва погрешно; преценете контекста и проверете фактите отделно.</p>
              <Link
                to="/analizator"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-7 py-3 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Опитайте безплатно
                <i className="ri-arrow-right-line text-sm"></i>
              </Link>
            </div>
            <div className="border border-gray-700 rounded-lg p-8 space-y-4">
              {[
                { icon: 'ri-emotion-line', label: 'Емоционален натиск', val: 'Сигнал' },
                { icon: 'ri-alarm-warning-line', label: 'Внушение за спешност', val: 'Сигнал' },
                { icon: 'ri-group-line', label: 'Социален натиск', val: 'Сигнал' },
                { icon: 'ri-contrast-2-line', label: 'Поляризиращ език', val: 'Сигнал' },
                { icon: 'ri-flashlight-line', label: 'Подтик към автоматична реакция', val: 'Сигнал' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Icon name={item.icon} size={14} className="text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-400">{item.label}</span>
                  </div>
                  <span className="text-xs text-gray-300 border border-gray-700 rounded-full px-2.5 py-0.5 whitespace-nowrap">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 px-4 md:py-20 md:px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-medium">Въпроси</p>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight">
              Често задавани въпроси<br />
              <strong className="font-semibold">за дигиталната грамотност</strong>
            </h2>
          </div>
          <div className="space-y-px">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Internal links — SEO */}
      <section className="py-10 md:py-16 px-4 md:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-8 font-medium">Свързани теми</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { label: 'Научни източници', link: '/sources', icon: 'ri-flask-line' },
              { label: 'Центърът БУДИМ СЕ', link: '/center', icon: 'ri-building-line' },
              { label: 'Степен 1: Разпознаване', link: '/step-1', icon: 'ri-eye-line' },
              { label: 'Степен 5: Суверенитет', link: '/step-5', icon: 'ri-shield-check-line' },
              { label: 'Анализатор', link: '/analizator', icon: 'ri-radar-line' },
              { label: 'Новини', link: '/news', icon: 'ri-newspaper-line' },
              { label: 'Авторът', link: '/author', icon: 'ri-user-line' },
              { label: 'Книгата', link: '/order', icon: 'ri-book-line' },
            ].map((item, i) => (
              <Link
                key={i}
                to={item.link}
                className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-400 transition-colors group cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <Icon name={item.icon} size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-tight">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 md:py-20 md:px-6 border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-5 font-medium">Следваща стъпка</p>
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 leading-tight">
            Готови ли сте да разберете<br />
            <strong className="font-semibold">как работи дигиталното влияние?</strong>
          </h2>
          <p className="text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto">
            Рамката „Петте степени" е безплатна за четене. Започнете от Степен 1 — не е нужна регистрация.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/step-1"
              className="bg-gray-900 text-white px-8 py-3.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              Започнете от Степен 1
            </Link>
            <Link
              to="/center"
              className="border border-gray-300 text-gray-700 px-8 py-3.5 rounded-md text-sm font-medium hover:border-gray-500 transition-colors cursor-pointer whitespace-nowrap"
            >
              Свържете се с Центъра
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-7 py-5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <h4 className="text-sm font-semibold text-gray-900 pr-4 leading-snug">{q}</h4>
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          <i className={`ri-${open ? 'subtract' : 'add'}-line text-gray-400 text-base transition-transform`}></i>
        </div>
      </button>
      {open && (
        <div className="px-7 pb-6 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

