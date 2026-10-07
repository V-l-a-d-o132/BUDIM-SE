import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';
import { sourceReferences } from '@/lib/source-references';

interface Category {
  id: string;
  noteNumber: number;
  icon: string;
  label: string;
  title: string;
  description: string;
  links: string[];
}

const categories: Category[] = [
  {
    "id": "habits",
    "noteNumber": 1,
    "icon": "ri-refresh-line",
    "label": "Навици",
    "title": "Как се изгражда навик",
    "description": "Проучването разглежда избрани всекидневни действия. Подкрепя предпазливостта към универсални срокове за навици; не изследва метод за прекратяване на проблемна употреба на смартфон.",
    "links": [
      "https://doi.org/10.1002/ejsp.674"
    ]
  },
  {
    "id": "dopamine",
    "noteNumber": 2,
    "icon": "ri-brain-line",
    "label": "Мотивация",
    "title": "Желание и удоволствие",
    "description": "Обзор върху различието между желание за награда и удоволствие. Отделните процеси не бива да се приравняват механично към „Автопилота“ и „Навигатора“ или да се използват за лична диагноза по обикновено наблюдение.",
    "links": [
      "https://doi.org/10.1037/amp0000059"
    ]
  },
  {
    "id": "selfcontrol",
    "noteNumber": 3,
    "icon": "ri-lightbulb-line",
    "label": "Самоконтрол",
    "title": "Волята като „батерия“",
    "description": "Многолабораторното повторение не намира убедителен ефект в изследвания протокол. Това е основание популярната идея за изчерпващ се ресурс на самоконтрола да не се представя като установен прост закон. Умората в ежедневието остава отделен, реален въпрос.",
    "links": [
      "https://doi.org/10.1177/1745691616652873"
    ]
  },
  {
    "id": "attention",
    "noteNumber": 4,
    "icon": "ri-smartphone-line",
    "label": "Внимание",
    "title": "Присъствието на смартфон",
    "description": "Обобщение на 56 изследвания със смесени резултати и методологични ограничения. Не подкрепя общото твърдение, че близостта на телефон неизбежно влошава всяка познавателна способност.",
    "links": [
      "https://doi.org/10.1080/15213269.2023.2286647"
    ]
  },
  {
    "id": "algorithms",
    "noteNumber": 5,
    "icon": "ri-file-list-3-line",
    "label": "Препоръки",
    "title": "Подреждане на лентата и убеждения",
    "description": "Експериментът е в конкретен американски изборен контекст. Промяна в потреблението не се превръща автоматично в измерима промяна на политическите нагласи. Резултатът не изчерпва ефектите на всяка платформа, тема или продължителност.",
    "links": [
      "https://www.gsb.stanford.edu/faculty-research/publications/how-do-social-media-feed-algorithms-affect-attitudes-behavior"
    ]
  },
  {
    "id": "disinfo",
    "noteNumber": 6,
    "icon": "ri-article-line",
    "label": "Медийна грамотност",
    "title": "Разпространение на неверни новини",
    "description": "Анализ на разпространението на проверени като верни или неверни истории в Twitter през 2006–2017 г. Изводите се отнасят до този масив и не означават, че всяка невярна публикация навсякъде ще се разпространява повече.",
    "links": [
      "https://doi.org/10.1126/science.aap9559"
    ]
  },
  {
    "id": "meta",
    "noteNumber": 7,
    "icon": "ri-government-line",
    "label": "Регулации",
    "title": "Споразумението с Meta",
    "description": "На 26 август 2026 г. щатски прокуратури обявяват споразумение с Meta. Подписаният документ предвижда пакет до 17,1 млрд. долара с гарантирани и условни плащания, включващ и претенции за поверителност. Щатите твърдят вреди от дизайна и представянето на платформите; споразумението не е признание на отговорност от Meta. То не доказва еднакъв причинен ефект при всеки потребител. За плащанията виж раздел VI и приложения B и E; за липсата на признание — X.C.",
    "links": [
      "https://coag.gov/press-releases/weiser-announces-historic-settlement-with-meta/",
      "https://oag.ca.gov/news/press-releases/attorney-general-bonta-secures-transformative-17-billion-settlement-meta",
      "https://oag.maryland.gov/News/pages/Attorney-General-Brown-Announces-Settlement-with-Big-Tech-Giant-Meta.aspx",
      "https://coag.gov/app/uploads/2026/08/01-Exhibit-1-MDL-Consent-Judgment-FINAL-Settlment-Agreement-Fully-Executed.pdf"
    ]
  },
  {
    "id": "settlement",
    "noteNumber": 8,
    "icon": "ri-time-line",
    "label": "Регулации",
    "title": "Одобрение и първа вноска",
    "description": "North Carolina Department of Justice съобщава за съдебно одобрение на 26 август 2026 г. и за първо плащане към този щат на 1 октомври. Следващите вноски са разсрочени до 2035 г. Първата вноска не означава, че целият пакет вече е изплатен. Това разграничение е важно при четене на заглавията за сумата.",
    "links": [
      "https://ncdoj.gov/attorney-general-jeff-jacksons-landmark-meta-settlement-goes-into-effect/",
      "https://ncdoj.gov/meta-pays-more-than-45-million-in-first-payment-to-nc-from-attorney-general-jacksons-landmark-settlement/"
    ]
  },
  {
    "id": "mentalhealth",
    "noteNumber": 9,
    "icon": "ri-heart-pulse-line",
    "label": "Благополучие",
    "title": "Социални медии и подрастващи",
    "description": "Обзор на ползи, рискове и пропуски в доказателствата. Различава общи заключения за населението от конкретни вредни преживявания. Особено полезни са резюмето и главата за връзките между социалните медии и здравето на подрастващите.",
    "links": [
      "https://doi.org/10.17226/27396"
    ]
  },
  {
    "id": "molly",
    "noteNumber": 10,
    "icon": "ri-heart-line",
    "label": "Благополучие",
    "title": "Случаят Моли Ръсел",
    "description": "Molly Rose Foundation: Molly’s Inquest възпроизвежда заключението от разследването. Документите се отнасят до конкретен трагичен случай; употребата им изисква внимание към установените обстоятелства и към близките.",
    "links": [
      "https://www.judiciary.uk/prevention-of-future-death-reports/molly-russell-prevention-of-future-deaths-report/",
      "https://mollyrosefoundation.org/mollys-inquest/"
    ]
  },
  {
    "id": "regulation",
    "noteNumber": 11,
    "icon": "ri-government-line",
    "label": "Регулации",
    "title": "Актът за цифровите услуги",
    "description": "Тези изисквания не са обещание за напълно „неутрално“ съдържание. Точният обхват зависи от услугата и приложимите разпоредби.",
    "links": [
      "https://eur-lex.europa.eu/eli/reg/2022/2065"
    ]
  },
  {
    "id": "australia",
    "noteNumber": 12,
    "icon": "ri-user-line",
    "label": "Регулации",
    "title": "Възрастови ограничения в Австралия",
    "description": "Периодът след въвеждането е ограничен към датата на тази редакция. Описанието на закона не представлява оценка, че дългосрочната му ефективност вече е доказана.",
    "links": [
      "https://www.esafety.gov.au/about-us/industry-regulation/social-media-age-restrictions"
    ]
  },
  {
    "id": "recommendations",
    "noteNumber": 13,
    "icon": "ri-settings-3-line",
    "label": "Настройки",
    "title": "Промяна на препоръките",
    "description": "Описание от доставчика на услугата. Новите препоръки отново се персонализират според взаимодействията. Функцията не е равнозначна на изтриване на всички лични данни. Наличността и интерфейсът могат да се променят.",
    "links": [
      "https://about.fb.com/news/2024/11/introducing-recommendations-reset-instagram/"
    ]
  },
  {
    "id": "privacy",
    "noteNumber": 14,
    "icon": "ri-lock-line",
    "label": "Поверителност",
    "title": "Какво прави „Инкогнито“",
    "description": "Официално обяснение какво се запазва на устройството и какво може да остава видимо за сайтове и мрежови доставчици. Режимът не гарантира анонимност или липса на персонализирано влияние.",
    "links": [
      "https://support.google.com/chrome/answer/95464?hl=en-GB"
    ]
  },
  {
    "id": "mobileinternet",
    "noteNumber": 15,
    "icon": "ri-smartphone-line",
    "label": "Внимание",
    "title": "Ограничаване на мобилния интернет",
    "description": "Рандомизирано изследване с ограничаване на мобилния интернет за две седмици. Обажданията, съобщенията и достъпът през други устройства остават възможни. Резултатите подкрепят изследването на такава промяна; не доказват, че пълното откъсване е необходимо или подходящо за всеки.",
    "links": [
      "https://doi.org/10.1093/pnasnexus/pgaf017"
    ]
  },
  {
    "id": "thinking",
    "noteNumber": 16,
    "icon": "ri-book-open-line",
    "label": "Почивка",
    "title": "Оставане насаме с мислите",
    "description": "Поредица от експерименти за преживяването при оставане насаме с мислите. Проучването не установява, че употребата на смартфон е причинила затрудненията на участниците.",
    "links": [
      "https://doi.org/10.1126/science.1250830"
    ]
  },
  {
    "id": "neuroplasticity",
    "noteNumber": 17,
    "icon": "ri-brain-line",
    "label": "Почивка",
    "title": "Мрежата по подразбиране",
    "description": "Основополагаща публикация за мозъчната активност при различни условия. Тя не установява универсален десетминутен „рестарт“ и не е изпитване на упражнението за пауза, предложено в книгата.",
    "links": [
      "https://doi.org/10.1073/pnas.98.2.676"
    ]
  }
];

const allLabels = Array.from(new Set(categories.map((c) => c.label)));

// Към коя част от авторската рамка се отнася всяка категория източници
const degreeMap: Record<string, string> = {
  "habits": "Степен 1 — Да забележиш навика",
  "dopamine": "Степен 1 — Да забележиш навика",
  "selfcontrol": "Степен 3 — Да опиташ промяна",
  "attention": "Степен 1 — Да забележиш навика",
  "algorithms": "Степен 2 — Да разбереш средата",
  "disinfo": "Степен 2 — Да разбереш средата",
  "meta": "Степен 2 — Да разбереш средата",
  "settlement": "Степен 2 — Да разбереш средата",
  "mentalhealth": "Степен 2 — Да разбереш средата",
  "molly": "Степен 2 — Да разбереш средата",
  "regulation": "Степен 2 — Да разбереш средата",
  "australia": "Степен 5 — Да поддържаш свободата си",
  "recommendations": "Степен 3 — Да опиташ промяна",
  "privacy": "Степен 5 — Да поддържаш свободата си",
  "mobileinternet": "Степен 3 — Да опиташ промяна",
  "thinking": "Степен 4 — Да върнеш място за живота",
  "neuroplasticity": "Степен 4 — Да върнеш място за живота"
};

function truncateUrl(url: string, maxLen = 60): string {
  try {
    const u = new URL(url);
    const display = u.hostname + u.pathname;
    if (display.length <= maxLen) return display;
    return display.slice(0, maxLen) + '…';
  } catch {
    return url.length > maxLen ? url.slice(0, maxLen) + '…' : url;
  }
}

export default function SourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  usePageSeo({
    title: 'Изследвания и източници — „Петте степени" | БУДИМ СЕ',
    description:
      '17 бележки към „Петте степени“: научни публикации, официални документи и описания на функции. Какво подкрепят източниците и къде свършва приложимостта им.',
    canonical: '/sources',
    schemaType: 'CollectionPage',
    keywords: 'Петте степени, източници, навици, внимание, медийна грамотност, Meta споразумение 2026, препоръки, лични данни',
    breadcrumbs: [
      { name: 'Начало', url: '/' },
      { name: 'Научни източници', url: '/sources' },
    ],
    schemaExtra: {
      about: [
        { '@type': 'Thing', name: 'Допамин и мотивация' },
        { '@type': 'Thing', name: 'Навици и поведенческа психология' },
        { '@type': 'Thing', name: 'Внимание и когнитивна наука' },
        { '@type': 'Thing', name: 'Самоконтрол и воля' },
        { '@type': 'Thing', name: 'Психично здраве и социални мрежи' },
        { '@type': 'Thing', name: 'Дезинформация и медийна грамотност' },
        { '@type': 'Thing', name: 'Почивка и мозъчна активност' },
        { '@type': 'Thing', name: 'Платформена регулация' },
      ],
      numberOfItems: categories.length,
      dateModified: '2026-10-07',
    },
  });

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return categories.filter((cat) => {
      if (activeFilter && cat.label !== activeFilter) return false;
      if (!q) return true;
      return (
        cat.title.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.label.toLowerCase().includes(q) ||
        cat.links.some((l) => l.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, activeFilter]);

  const totalLinks = categories.reduce((acc, c) => acc + c.links.length, 0);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-white last:border-r-0" />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              to="/order"
              className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              <Icon name="ri-arrow-left-line" size={12} />
              Вземи книгата
            </Link>
          </div>

          <span className="inline-block text-xs tracking-[0.3em] text-white/30 uppercase font-medium border border-white/10 px-3 py-1.5 rounded-sm mb-6">
            Бележки към книгата
          </span>

          <h1 className="text-5xl md:text-6xl font-light text-white leading-[1.05] mb-6">
            На какво стъпва<br />
            <strong className="font-semibold">книгата</strong>
          </h1>

          <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed max-w-2xl mb-8">
            Тук са 17-те бележки от книгата, с постоянните им номера. Посочваме какво подкрепя
            всеки източник и какви изводи не можем да направим от него. Проверено към 7 октомври 2026 г.
          </p>

          <div className="border border-white/10 rounded-sm p-5 max-w-2xl bg-white/[0.03] mb-8">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-information-line text-white/30 text-sm" />
              </div>
              <p className="text-sm text-white/40 leading-relaxed">
                Личните разкази и условните примери не са научни данни. „Петте степени“ и практиката
                „Будим се“ са авторска рамка; източниците не представляват нейно клинично изпитване.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/25">
            <span>{categories.length} бележки</span>
            <span className="w-px h-3 bg-white/10" />
            <span>{totalLinks} документа</span>
          </div>
        </div>
      </section>

      {/* ─── SEARCH + FILTER ─── */}
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-6">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-white/25 text-sm" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Търси по тема или категория..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-sm pl-10 pr-4 py-3 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center cursor-pointer"
              >
                <i className="ri-close-line text-white/30 text-sm hover:text-white/60 transition-colors" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-3 py-1.5 rounded-sm text-xs border transition-colors whitespace-nowrap cursor-pointer ${
                activeFilter === null
                  ? 'border-white/40 text-white/80 bg-white/[0.08]'
                  : 'border-white/10 text-white/30 hover:border-white/25 hover:text-white/50'
              }`}
            >
              Всички
            </button>
            {allLabels.map((label) => (
              <button
                key={label}
                onClick={() => setActiveFilter(activeFilter === label ? null : label)}
                className={`px-3 py-1.5 rounded-sm text-xs border transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === label
                    ? 'border-white/40 text-white/80 bg-white/[0.08]'
                    : 'border-white/10 text-white/30 hover:border-white/25 hover:text-white/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="mt-12 text-center text-white/25 text-sm">
              Няма намерени резултати за „{searchQuery}"
            </div>
          )}
        </div>
      </section>

      {/* ─── КАТЕГОРИИ ─── */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto space-y-14">
          {filteredCategories.map((cat) => (
            <div key={cat.id} id={cat.id} className="scroll-mt-28">
              {/* Category header */}
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/10">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 border border-white/10 rounded-sm">
                  <Icon name={cat.icon} size={18} className="text-white/50" />
                </div>
                <div>
                  <span className="text-xs tracking-[0.25em] text-white/25 uppercase font-medium block mb-1">
                    {String(cat.noteNumber).padStart(2, '0')} — {cat.label}
                  </span>
                  {degreeMap[cat.id] && (
                    <span className="inline-block text-[11px] text-white/40 border border-white/10 rounded-sm px-2 py-0.5 mb-2 leading-relaxed">
                      {degreeMap[cat.id]}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-3xl font-light text-white mb-3">
                    {cat.title}
                  </h2>
                  <p className="text-sm text-white/50 leading-relaxed max-w-xl">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Links list */}
              <div className="space-y-2 pl-0 md:pl-14">
                {cat.links.map((link, linkIdx) => (
                  <a
                    key={linkIdx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center gap-3 group py-2.5 px-4 rounded-sm border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all"
                  >
                    <span className="text-xs text-white/20 font-mono flex-shrink-0 w-4">
                      {String(linkIdx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm text-white/60 group-hover:text-white/90 transition-colors break-words leading-relaxed">
                      {sourceReferences[link] ?? truncateUrl(link)}
                    </span>
                    <span className="ml-auto w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <Icon name="ri-external-link-line" size={12} className="text-white/20 group-hover:text-white/50 transition-colors" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── СЕКЦИЯ 15: КАК ДА СЕ ЧЕТЕ ТАЗИ СТРАНИЦА ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="border border-white/10 rounded-sm p-8 md:p-12 bg-white/[0.02]">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 border border-white/10 rounded-sm">
                <Icon name="ri-book-open-line" size={14} className="text-white/40" />
              </div>
              <span className="text-xs tracking-[0.25em] text-white/25 uppercase font-medium mt-1.5">
                Как да се чете тази страница
              </span>
            </div>

            <p className="text-base md:text-lg text-white/55 leading-relaxed mb-6 max-w-2xl">
              Чети източника заедно с метода, извадката и ограниченията му. Различавай връзка
              между явления от установена причина, описание на функция от оценка на ефекта ѝ,
              обвинение от съдебно установен факт. Законите и настройките могат да се променят.
            </p>

            <div className="border-t border-white/[0.08] pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <p className="text-sm text-white/40 leading-relaxed max-w-md">
                Книгата предлага въпроси и упражнения за ежедневието. Практическите предложения са отделени от резултатите на изследванията.
              </p>
              <Link
                to="/order"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-sm hover:bg-gray-100 transition-colors whitespace-nowrap text-sm font-medium flex-shrink-0"
              >
                Вземи книгата
                <i className="ri-arrow-right-line ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ВЪТРЕШНИ ЛИНКОВЕ ─── */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="border-t border-white/10 pt-16">
            <span className="text-xs tracking-[0.3em] text-white/25 uppercase font-medium block mb-8">
              Изследвай рамката
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link
                to="/step-1"
                className="group flex items-start gap-3 p-4 border border-white/[0.08] rounded-sm bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all"
              >
                <span className="text-xs font-mono text-white/20 mt-0.5 flex-shrink-0">01</span>
                <div>
                  <div className="text-xs text-white/30 mb-0.5">Степен 1</div>
                  <div className="text-sm text-white/70 group-hover:text-white transition-colors font-medium leading-snug">
                    Да забележиш навика
                  </div>
                  <div className="text-xs text-white/30 mt-1 leading-relaxed">
                    Наблюдение на навика и неговия контекст
                  </div>
                </div>
                <span className="ml-auto w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="ri-arrow-right-line" size={12} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </span>
              </Link>

              <Link
                to="/step-2"
                className="group flex items-start gap-3 p-4 border border-white/[0.08] rounded-sm bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all"
              >
                <span className="text-xs font-mono text-white/20 mt-0.5 flex-shrink-0">02</span>
                <div>
                  <div className="text-xs text-white/30 mb-0.5">Степен 2</div>
                  <div className="text-sm text-white/70 group-hover:text-white transition-colors font-medium leading-snug">
                    Да разбереш средата
                  </div>
                  <div className="text-xs text-white/30 mt-1 leading-relaxed">
                    Препоръки, информация и проверка
                  </div>
                </div>
                <span className="ml-auto w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="ri-arrow-right-line" size={12} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </span>
              </Link>

              <Link
                to="/step-3"
                className="group flex items-start gap-3 p-4 border border-white/[0.08] rounded-sm bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all"
              >
                <span className="text-xs font-mono text-white/20 mt-0.5 flex-shrink-0">03</span>
                <div>
                  <div className="text-xs text-white/30 mb-0.5">Степен 3</div>
                  <div className="text-sm text-white/70 group-hover:text-white transition-colors font-medium leading-snug">
                    Да опиташ промяна
                  </div>
                  <div className="text-xs text-white/30 mt-1 leading-relaxed">
                    Изпълним опит и преглед на резултата
                  </div>
                </div>
                <span className="ml-auto w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="ri-arrow-right-line" size={12} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </span>
              </Link>

              <Link
                to="/step-4"
                className="group flex items-start gap-3 p-4 border border-white/[0.08] rounded-sm bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all"
              >
                <span className="text-xs font-mono text-white/20 mt-0.5 flex-shrink-0">04</span>
                <div>
                  <div className="text-xs text-white/30 mb-0.5">Степен 4</div>
                  <div className="text-sm text-white/70 group-hover:text-white transition-colors font-medium leading-snug">
                    Да върнеш място за живота
                  </div>
                  <div className="text-xs text-white/30 mt-1 leading-relaxed">
                    Общуване, занимания и почивка
                  </div>
                </div>
                <span className="ml-auto w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="ri-arrow-right-line" size={12} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </span>
              </Link>

              <Link
                to="/step-5"
                className="group flex items-start gap-3 p-4 border border-white/[0.08] rounded-sm bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all"
              >
                <span className="text-xs font-mono text-white/20 mt-0.5 flex-shrink-0">05</span>
                <div>
                  <div className="text-xs text-white/30 mb-0.5">Степен 5</div>
                  <div className="text-sm text-white/70 group-hover:text-white transition-colors font-medium leading-snug">
                    Да поддържаш свободата си
                  </div>
                  <div className="text-xs text-white/30 mt-1 leading-relaxed">
                    Гъвкави граници и лични данни
                  </div>
                </div>
                <span className="ml-auto w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="ri-arrow-right-line" size={12} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </span>
              </Link>

              <Link
                to="/analizator"
                className="group flex items-start gap-3 p-4 border border-white/[0.08] rounded-sm bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all"
              >
                <span className="text-xs font-mono text-white/20 mt-0.5 flex-shrink-0">
                  <i className="ri-shield-line text-white/20 text-xs" />
                </span>
                <div>
                  <div className="text-xs text-white/30 mb-0.5">Инструмент</div>
                  <div className="text-sm text-white/70 group-hover:text-white transition-colors font-medium leading-snug">
                    Анализатор на съдържание
                  </div>
                  <div className="text-xs text-white/30 mt-1 leading-relaxed">
                    Разпознаване на езикови и структурни похвати
                  </div>
                </div>
                <span className="ml-auto w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="ri-arrow-right-line" size={12} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed max-w-lg">
                Провери източниците и техните ограничения.{' '}
                <strong className="text-white font-medium">Избери въпрос, който има смисъл за теб.</strong>
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/order"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-sm hover:bg-gray-100 transition-colors whitespace-nowrap text-sm font-medium"
              >
                Вземи книгата
                <i className="ri-arrow-right-line ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

