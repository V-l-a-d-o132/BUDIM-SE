import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

const faqs = [
  {
    q: 'Какво е дигитална грамотност?',
    a: 'Дигиталната грамотност е способността да разпознавате, анализирате и контролирате начина, по който дигиталните платформи влияят на вашето внимание, емоции и решения. Тя надхвърля умението да използвате технологии — включва разбиране на алгоритмичните механизми, механизмите на въздействие и поведенческия дизайн, вграден в социалните мрежи и приложенията.',
  },
  {
    q: 'Каква е разликата между медийна грамотност и дигитална грамотност?',
    a: 'Медийната грамотност се фокусира върху критичното четене и оценка на медийни съдържания — новини, реклами, пропаганда. Дигиталната грамотност е по-широка: включва разбиране на алгоритмите, платформената архитектура, поведенческия дизайн и личната дигитална хигиена. В Центъра БУДИМ СЕ работим и с двете — те са неразделни.',
  },
  {
    q: 'За каква възраст е подходяща дигиталната грамотност?',
    a: 'Рамката „Петте степени" е предназначена за различни възрасти: от ученици до работещи хора. Принципите са универсални — алгоритмите не правят разлика между тийнейджър и възрастен. Разликата е само в контекста и примерите.',
  },
  {
    q: 'Как да разбера дали имам нужда от обучение по дигитална грамотност?',
    a: 'Ако проверявате телефона рефлекторно без конкретна причина, ако трудно четете дълги текстове, ако се чувствате тревожни когато нямате достъп до интернет, или ако забелязвате, че прекарвате повече време онлайн отколкото сте планирали — това са ясни сигнали. Не е въпрос на воля, а на разбиране на механизмите.',
  },
  {
    q: 'Как работи Центърът БУДИМ СЕ с училища?',
    a: 'Подходът ни предвижда работа директно с педагогически екипи — не с презентации, а с практически сесии на живо. Програмата цели да демонстрира механизмите на скиминг културата, да провежда упражнения за дълбоко четене и фокус и да изгражда устойчиви навици, адаптирани към конкретното училище и възрастова група.',
  },
  {
    q: 'Дигиталната грамотност означава ли да спра да ползвам социални мрежи?',
    a: 'Не. Целта не е отказ, а волеви контрол. Дигиталната грамотност ви дава инструментите да разграничите кога използвате технологията с намерение и кога тя използва вас. Разликата е огромна — и напълно постижима.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Биологичният автоматизъм',
    desc: 'Разпознавате Автопилота и автоматичните реакции в дигиталната среда.',
    icon: 'ri-eye-line',
    link: '/step-1',
  },
  {
    num: '02',
    title: 'Алгоритмичният прицел',
    desc: 'Разбирате как емоционалната възбуда и препоръките влияят на вниманието ви.',
    icon: 'ri-lightbulb-line',
    link: '/step-2',
  },
  {
    num: '03',
    title: 'Когнитивна свобода',
    desc: 'Прилагате конкретни техники за прекъсване на автоматичните цикли.',
    icon: 'ri-refresh-line',
    link: '/step-3',
  },
  {
    num: '04',
    title: 'Завръщане и реинтеграция',
    desc: 'Възстановявате линейния фокус, сетивното присъствие и живия контакт.',
    icon: 'ri-focus-3-line',
    link: '/step-4',
  },
  {
    num: '05',
    title: 'Съзнателна свобода',
    desc: 'Преминавате към осъзнато използване на технологиите.',
    icon: 'ri-shield-check-line',
    link: '/step-5',
  },
];

const audiences = [
  {
    icon: 'ri-graduation-cap-line',
    title: 'Ученици и студенти',
    desc: 'Дигиталната грамотност за деца и младежи е важна — част от платформите използват механизми, които насърчават по-често взаимодействие. Програмата цели да помогне на учениците да разпознаят тези механизми и да изградят здравословни дигитални навици.',
    cta: 'Програма за училища',
    link: '/center',
  },
  {
    icon: 'ri-home-heart-line',
    title: 'Родители и семейства',
    desc: 'Конфликтите около екранното време рядко са за самия телефон — те са симптом на по-дълбока динамика. Подходът предвижда работа с цялото семейство, за да изградите споделено разбиране на механизмите, не просто правила.',
    cta: 'Семейни програми',
    link: '/center',
  },
  {
    icon: 'ri-building-line',
    title: 'Корпоративни екипи',
    desc: 'Информационното претоварване и постоянната реактивност са измерими проблеми за продуктивността. Корпоративната дигитална хигиена не е мода — тя може да допринесе за по-устойчива работна среда.',
    cta: 'Корпоративни програми',
    link: '/center',
  },
];

const stats = [
  { value: '5', label: 'Степени в авторската рамка', sub: 'От Автопилота до съзнателна свобода' },
  { value: '14', label: 'Категории източници', sub: 'Изследвания, вдъхновяващи рамката' },
  { value: '3', label: 'Типа програми', sub: 'За училища, семейства и екипи' },
  { value: 'BG', label: 'Фокус', sub: 'Инициатива в България' },
];

export default function DigitalnaGramotnostPage() {
  usePageSeo({
    title: 'Медийна и дигитална грамотност в България | БУДИМ СЕ',
    description: 'Медийна и дигитална грамотност за ученици, семейства и корпоративни екипи. Рамката „Петте степени" на Центъра БУДИМ СЕ — разпознаване на дезинформация, критично мислене и дигитални навици.',
    canonical: '/digitalna-gramotnost',
    keywords: 'дигитална грамотност, медийна грамотност, дигитална грамотност за деца, дигитална грамотност за ученици, медийна грамотност България, обучение дигитална грамотност, дигитална хигиена, алгоритмично влияние, когнитивна свобода, дигитален суверенитет',
    ogImage: 'https://readdy.ai/api/search-image?query=digital%20literacy%20education%20workshop%20Bulgaria%20students%20adults%20learning%20media%20critical%20thinking%20modern%20classroom%20minimalist%20clean%20design%20natural%20light&width=1200&height=630&seq=dg-og-v1&orientation=landscape',
    schemaType: 'WebPage',
    breadcrumbs: [
      { name: 'Начало', url: 'https://budimse.online' },
      { name: 'Дигитална грамотност', url: 'https://budimse.online/digitalna-gramotnost' },
    ],
    schemaExtra: {
      about: {
        '@type': 'EducationalOccupationalProgram',
        name: 'Дигитална грамотност — Рамка „Петте степени"',
        description: 'Образователна рамка за дигитална грамотност, вдъхновена от когнитивната психология и поведенческия дизайн. Подходяща за ученици, семейства и корпоративни екипи.',
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Център за медийна и дигитална грамотност БУДИМ СЕ',
          url: 'https://budimse.online',
        },
        educationalLevel: 'Всички възрасти',
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
            <p className="text-xl md:text-2xl text-white/75 font-light leading-relaxed max-w-2xl mb-10">
              Не просто умението да използвате технологии.<br />
              А способността да разбирате как те влияят на вниманието и решенията ви.
            </p>
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
              <p className="text-lg">
                <strong>Дигиталната грамотност</strong> е способността да разпознавате, анализирате и контролирате начина, по който дигиталните платформи влияят на вашето внимание, емоции и решения.
              </p>
              <p>
                Тя надхвърля умението да използвате технологии. Включва разбиране на алгоритмичните механизми, механизмите на въздействие и поведенческия дизайн, вграден в социалните мрежи, новинарските платформи и мобилните приложения.
              </p>
              <p>
                Платформи като TikTok, Instagram, YouTube и Facebook често използват принципи от поведенческата психология — вариабилно подкрепление, социално сравнение, страх от пропускане — за да удължат времето, прекарано в приложението. Това не е случайност, нито конспирация. Това е бизнес модел.
              </p>
              <p>
                <strong>Дигиталната грамотност</strong> не е антитехнологична позиция. Тя е инструментариум за волеви контрол — способността да разграничите кога използвате технологията с намерение и кога тя използва вас.
              </p>
              <p>
                В работата на Центъра с училища и корпоративни екипи се очертава един и същ модел: когато участниците разберат механизма зад дадена функция, те могат да започнат да я използват по-съзнателно — без да им бъде забранявана. Разбирането често е по-устойчиво от забраната.
              </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-base text-gray-500 italic">
                  „Проблемът не е в технологиите. Проблемът е в липсата на разбиране за това как те работят върху нас."
                  <span className="block mt-1 text-sm not-italic">— Рамка „Петте степени", Центъра БУДИМ СЕ</span>
                </p>
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
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight max-w-2xl">
              Защо дигиталната грамотност<br />
              <strong className="font-semibold">е спешна, не опционална</strong>
            </h2>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Обратният ефект на Флин</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Различни изследвания в областта на когнитивната наука документират тенденция към намаляване на когнитивните показатели при поколенията, израснали с дигитални устройства. Обратният ефект на Флин е наблюдаван в множество независими проучвания в различни страни — не като изолиран феномен, а като последователна тенденция.
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <div className="w-8 h-8 flex items-center justify-center mb-4">
                <i className="ri-book-open-line text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Скимингът като единствен режим</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Част от изследванията сочат, че хората, израснали с дигитални устройства, четат предимно в режим на сканиране — търсят ключови думи, прескачат абзаци, задържат по-малко информация. Дълбокото четене — способността да следвате сложен аргумент — е умение, което изисква активно поддържане.
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <div className="w-8 h-8 flex items-center justify-center mb-4">
                <i className="ri-emotion-sad-line text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Дигитална самота и тревожност</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                При много хора се наблюдава парадокс: колкото повече време прекарват онлайн, толкова по-самотни се чувстват. Алгоритмичното общуване — реакции, коментари, харесвания — често се свързва с усещане за свързаност, но без реално изграждане на връзка. Част от изследванията сочат връзка с нарастваща социална тревожност.
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <div className="w-8 h-8 flex items-center justify-center mb-4">
                <i className="ri-focus-2-line text-gray-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Фрагментирано внимание</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Част от проучванията в работна среда показват, че при много служители фокусът се прекъсва значително по-често, отколкото е осъзнато. Не от лошо отношение — от изградена навици, които изискват постоянен стимул.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 5 steps methodology */}
      <section className="py-12 px-4 md:py-20 md:px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-medium">Рамката</p>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight max-w-2xl">
              „Петте степени" —<br />
              <strong className="font-semibold">пътят към дигитална грамотност</strong>
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl leading-relaxed">
              Не списък от правила. Авторска образователна рамка, вдъхновена от когнитивната психология
              и поведенческия дизайн. Всяка степен надгражда предишната.
            </p>
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
                      <li className="flex items-start gap-2"><Icon name="ri-checkbox-circle-line" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />Разбиране на алгоритми</li>
                      <li className="flex items-start gap-2"><Icon name="ri-checkbox-circle-line" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />Поведенчески дизайн</li>
                      <li className="flex items-start gap-2"><Icon name="ri-checkbox-circle-line" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />Лична дигитална хигиена</li>
                      <li className="flex items-start gap-2"><Icon name="ri-checkbox-circle-line" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />Когнитивна свобода</li>
                    </ul>
                  </div>
                </div>
                <div className="p-5 bg-gray-50 border-t border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <strong>В Центъра БУДИМ СЕ работим и с двете.</strong> Медийната и дигиталната грамотност са неразделни — не можете да сте медийно грамотни без да разбирате как алгоритмите определят какво виждате.
                  </p>
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
              <p className="text-gray-300 leading-relaxed mb-8">
                Поставете текст — новина, публикация, реклама — и инструментът открива езикови и структурни сигнали, свързани с емоционален натиск, внушение за спешност, социален натиск, поляризация и подтик към автоматична реакция. Резултатът е ориентировъчен и има образователна функция.
              </p>
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
