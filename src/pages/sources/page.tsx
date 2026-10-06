import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';
import { sourceReferences } from '@/lib/source-references';

interface Category {
  id: string;
  icon: string;
  label: string;
  title: string;
  description: string;
  links: string[];
}

const categories: Category[] = [
  {
    id: 'dopamine',
    icon: 'ri-brain-line',
    label: 'Невронаука',
    title: 'Допамин, мотивация и награда',
    description:
      "Berridge и Robinson разграничават харесването на награда от мотивационното желание за нея. Schultz и колеги изследват невронни сигнали при предвиждане на награда. Тези работи помагат за разбирането на мотивацията, но не доказват, че конкретно приложение причинява зависимост или че авторският модел на книгата е валидиран.",
    links: [
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC5171207/',
      'https://pubmed.ncbi.nlm.nih.gov/9054347/',
    ],
  },
  {
    id: 'habits',
    icon: 'ri-loop-right-line',
    label: 'Поведенческа психология',
    title: 'Навици и автоматично поведение',
    description:
      "Wood и Neal разглеждат как повторението в стабилен контекст свързва ситуации с обичайни реакции и как навиците взаимодействат с целите. Приложението към дигитални навици в книгата е авторска интерпретация; изследването не е изпитване на петстепенния подход.",
    links: [
      'https://pubmed.ncbi.nlm.nih.gov/17907866/',
      'https://dornsife.usc.edu/wendy-wood/wp-content/uploads/sites/183/2023/10/wood.neal_.2007psychrev_a_new_look_at_habits_and_the_interface_between_habits_and_goals.pdf',
    ],
  },
  {
    id: 'attention',
    icon: 'ri-focus-3-line',
    label: 'Когнитивна наука',
    title: 'Внимание и прекъсвания',
    description:
      "Mark и колеги изследват прекъсванията в работна среда: в експеримента участниците компенсират с по-бърза работа, но съобщават повече стрес и натоварване. Времето до връщане към задача не е универсално време за възстановяване на концентрацията. От тези резултати не следва обещание, че книга или определена пауза ще възстановят фокуса на всеки човек.",
    links: [
      'https://ics.uci.edu/~gmark/chi08-mark.pdf',
      'https://www.microsoft.com/en-us/research/wp-content/uploads/2016/10/p903-mark.pdf',
    ],
  },
  {
    id: 'selfcontrol',
    icon: 'ri-shield-check-line',
    label: 'Психология на волята',
    title: 'Самоконтрол и воля',
    description:
      "Моделът за изчерпване на самоконтрола е влиятелна хипотеза, а не установено обяснение за всеки случай на умора. Предварително регистрираната многолабораторна репликация на Hagger и колеги не възпроизвежда убедително първоначалния ефект. Carter и McCullough обсъждат публикационни пристрастия. Тази несигурност трябва да съпътства всяко позоваване на „изчерпване на волята“.",
    links: [
      'https://pubmed.ncbi.nlm.nih.gov/12605077/',
      'https://pubmed.ncbi.nlm.nih.gov/27474142/',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC4115664/',
    ],
  },
  {
    id: 'mentalhealth',
    icon: 'ri-mental-health-line',
    label: 'Психично здраве',
    title: 'Психично здраве и социални мрежи',
    description:
      "Изследванията разглеждат връзки между употребата на дигитални технологии и благосъстоянието, с различни методи и ограничения. Orben и Przybylski намират малки асоциации в анализираните масиви. Valkenburg и колеги обобщават разнородни резултати. Съвпадението във времето и корелацията не доказват причинност; данните на CDC за тенденции не определят индивидуална причина или диагноза.",
    links: [
      'https://journals.sagepub.com/doi/10.1177/2167702617723376',
      'https://www.nature.com/articles/s41562-018-0506-1',
      'https://www.cdc.gov/media/releases/2023/p0213-yrbs.html',
    ],
  },
  {
    id: 'disinfo',
    icon: 'ri-spam-2-line',
    label: 'Медийна грамотност',
    title: 'Когнитивни изкривявания и дезинформация',
    description:
      'Дезинформацията не работи само чрез лъжата — тя работи чрез повторението, шума и когнитивното претоварване. Hasher, Goldstein и Toppino документират ефекта на илюзорната истина: повтарянето на твърдение го прави да изглежда по-вярно, независимо от съдържанието му. Fazio и колеги показват, че дори хора с вярна предварителна информация са уязвими към този ефект. Sweller описва как ограниченията на работната памет правят мозъка по-склонен към евристики при информационно претоварване. Kahneman обобщава цялата тази динамика в рамката на Система 1 и Система 2 — бързото, автоматично мислене срещу бавното, аналитично.',
    links: [
      'https://www.sciencedirect.com/science/article/abs/pii/S0022537177800121',
      'https://www.apa.org/pubs/journals/features/xge-0000098.pdf',
      'https://www.sciencedirect.com/science/article/abs/pii/0364021388900237',
    ],
  },
  {
    id: 'apophenia',
    icon: 'ri-eye-line',
    label: 'Когнитивна наука',
    title: 'Апофения и разпознаване на модели',
    description:
      "Whitson и Galinsky експериментално изследват как усещането за липса на контрол може да повлияе на възприемането на несъществуващи модели. Friston предлага теоретична рамка за предсказване и обработка на информация. Това са различни научни подходи; нито един сам по себе си не доказва, че употребата на социални мрежи причинява конспиративно мислене.",
    links: [
      'https://pubmed.ncbi.nlm.nih.gov/18832647/',
      'https://www.nature.com/articles/nrn2787',
    ],
  },
  {
    id: 'neuroplasticity',
    icon: 'ri-refresh-line',
    label: 'Невронаука',
    title: 'Невропластичност и мрежа на покоя',
    description:
      "Menon прави обзор на мрежата на покоя, а Beaty и Poerio разглеждат връзки с творческото мислене и блуждаенето на ума. Тези публикации не доказват, че скуката или отказът от екран имат еднакъв възстановителен ефект за всички. Практическите предложения в книгата са авторски упражнения, без установена лечебна ефективност.",
    links: [
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC10524518/',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC4410786/',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC5490683/',
    ],
  },
  {
    id: 'phantom',
    icon: 'ri-smartphone-line',
    label: 'Телесни сигнали',
    title: 'Телесни ефекти (фантомни вибрации и др.)',
    description:
      "Обзорът на Deb и наблюдателните изследвания сред медицински обучаеми описват фантомни вибрации и звънене и някои връзки с употребата на смартфон. Ограничените извадки и наблюдателният дизайн не установяват универсална причина или заболяване. „Screen apnea“ не се представя тук като установена диагноза; изброените публикации не я доказват.",
    links: [
      'https://pubmed.ncbi.nlm.nih.gov/25408384/',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC6149296/',
      'https://pubmed.ncbi.nlm.nih.gov/36445195/',
    ],
  },
  {
    id: 'socialcomparison',
    icon: 'ri-user-follow-line',
    label: 'Социална психология',
    title: 'Социално сравнение',
    description:
      "Теорията на Festinger описва социалното сравнение като общ психологически процес. Обзорът на Valkenburg и колеги се отнася до социалните мрежи и психичното здраве, а не до доказване на отделен механизъм на сравнение във всеки потребител. Начинът на употреба и индивидуалният контекст имат значение; не определяме психологически профил от тези общи изследвания.",
    links: [
      'https://www2.psych.ubc.ca/~schaller/528Readings/Festinger1954.pdf',
      'https://pubmed.ncbi.nlm.nih.gov/34563980/',
    ],
  },
  {
    id: 'intimacy',
    icon: 'ri-heart-pulse-line',
    label: 'Интимност и поведение',
    title: 'Интимност и поведенчески сценарии',
    description:
      "Bridges и колеги анализират съдържанието на избрани популярни видеа за възрастни. Анализът описва сцени в тази извадка; не доказва сам по себе си как те влияят върху интимния живот на всеки зрител. Концепциите за сценарии и самонаблюдение в книгата са отделни интерпретативни рамки, а не резултат от посоченото изследване.",
    links: [
      'https://pubmed.ncbi.nlm.nih.gov/20980228/',
      'https://journals.sagepub.com/doi/10.1177/1077801210382866',
    ],
  },
  {
    id: 'algorithms',
    icon: 'ri-settings-4-line',
    label: 'Поведенчески дизайн',
    title: 'Алгоритми и attention economy',
    description:
      "Моделът на Fogg и книгата на Eyal са рамки за поведенчески и продуктов дизайн. Center for Humane Technology представя застъпническа перспектива. Тези източници имат различен статут от експериментално изследване и не доказват намерението или вредата от всеки конкретен алгоритъм.",
    links: [
      'https://behaviormodel.org/',
      'https://www.nirandfar.com/hooked/',
      'https://www.humanetech.com/',
    ],
  },
  {
    id: 'sharenting',
    icon: 'ri-camera-line',
    label: 'Дигитален отпечатък',
    title: 'AI, данни и дигитален отпечатък',
    description:
      "LAION-5B описва мащабен масив от връзки към изображения и текст. Изследването на Rocher и колеги оценява риск от повторна идентификация в набори с демографски атрибути; то не доказва, че всяка снимка може да бъде идентифицирана по същия начин. NIST оценява технологии за разпознаване на лица. Това са различни рискове и трябва да се разграничават при разговор за дигиталния отпечатък.",
    links: [
      'https://arxiv.org/abs/2210.08402',
      'https://pages.nist.gov/frvt/',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC6650473/',
    ],
  },
  {
    id: 'regulation',
    icon: 'ri-government-line',
    label: 'Регулации и политики',
    title: 'Регулации и платформи',
    description:
      "Digital Services Act съдържа задължения за оценяване и ограничаване на системни рискове при определените много големи платформи и търсачки. Официалният австралийски регулатор описва възрастовите ограничения за обхванатите социални платформи. Регулациите са нормативни решения; сами по себе си не валидират авторския модел или отделна научна хипотеза.",
    links: [
      'https://digital-strategy.ec.europa.eu/en/policies/digital-services-act',
      'https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng',
      'https://www.esafety.gov.au',
    ],
  },
];

const allLabels = Array.from(new Set(categories.map((c) => c.label)));

// Към коя част от авторската рамка се отнася всяка категория източници
const degreeMap: Record<string, string> = {
  dopamine: 'Степен 1 — Биологичният автоматизъм',
  habits: 'Степен 1 — Биологичният автоматизъм',
  attention: 'Степен 2 — Алгоритмичният прицел',
  selfcontrol: 'Степен 3 — Когнитивна свобода',
  mentalhealth: 'Степен 2 — Алгоритмичният прицел',
  disinfo: 'Степен 2 — Алгоритмичният прицел',
  apophenia: 'Степен 2 — Алгоритмичният прицел',
  neuroplasticity: 'Степен 4 — Завръщане и реинтеграция',
  phantom: 'Степен 1 — Биологичният автоматизъм',
  socialcomparison: 'Степен 2 — Алгоритмичният прицел',
  intimacy: 'Степен 4 — Завръщане и реинтеграция',
  algorithms: 'Степен 2 — Алгоритмичният прицел',
  sharenting: 'Степен 5 — Съзнателна свобода',
  regulation: 'Степен 5 — Съзнателна свобода',
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
      'Научните, психологическите и когнитивните източници, вдъхновяващи книгата „Петте степени": допамин, навици, внимание, самоконтрол, социални мрежи, дезинформация, невропластичност и платформена регулация.',
    canonical: '/sources',
    schemaType: 'CollectionPage',
    keywords:
      'допамин мотивация, навици поведенческа психология, внимание прекъсвания, самоконтрол воля, психично здраве социални мрежи подрастващи, дезинформация илюзорна истина, апофения разпознаване на модели, невропластичност, фантомни вибрации, социално сравнение Festinger, attention economy поведенчески дизайн, дигитален отпечатък AI, Digital Services Act регулации платформи, петте степени',
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
        { '@type': 'Thing', name: 'Невропластичност' },
        { '@type': 'Thing', name: 'Платформена регулация' },
      ],
      numberOfItems: 14,
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
            Методологична база
          </span>

          <h1 className="text-5xl md:text-6xl font-light text-white leading-[1.05] mb-6">
            На какво стъпва<br />
            <strong className="font-semibold">книгата</strong>
          </h1>

          <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed max-w-2xl mb-8">
            „Петте степени" е практическа рамка, изградена от опит, наблюдение и реална работа с хора.
            Тази страница показва изследванията, концепциите и регулаторните източници, които допълват модела.
          </p>

          <div className="border border-white/10 rounded-sm p-5 max-w-2xl bg-white/[0.03] mb-8">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-information-line text-white/30 text-sm" />
              </div>
              <p className="text-sm text-white/40 leading-relaxed">
                Това не е академична библиография и не твърди, че моделът е отделна научна теория.
                Това е карта на механизмите, върху които стъпва практическата рамка.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/25">
            <span>{categories.length} категории</span>
            <span className="w-px h-3 bg-white/10" />
            <span>{totalLinks} източника</span>
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
          {filteredCategories.map((cat, catIdx) => (
            <div key={cat.id}>
              {/* Category header */}
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-white/10">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 border border-white/10 rounded-sm">
                  <Icon name={cat.icon} size={18} className="text-white/50" />
                </div>
                <div>
                  <span className="text-xs tracking-[0.25em] text-white/25 uppercase font-medium block mb-1">
                    {String(catIdx + 1).padStart(2, '0')} — {cat.label}
                  </span>
                  {degreeMap[cat.id] && (
                    <span className="inline-block text-[11px] text-white/40 border border-white/10 rounded-sm px-2 py-0.5 mb-2 whitespace-nowrap">
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
                    <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors font-mono break-all leading-relaxed">
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
              Тези източници не „доказват" книгата като отделна научна теория. Те показват, че моделът
              стъпва върху реални, изследвани механизми:{' '}
              <strong className="text-white/75 font-medium">
                навици, мотивация, допаминова система, когнитивно претоварване, социално сравнение,
                невропластичност и платформена регулация.
              </strong>
            </p>

            <div className="border-t border-white/[0.08] pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <p className="text-sm text-white/40 leading-relaxed max-w-md">
                Книгата показва как тези механизми се преживяват в реалния живот — и как могат да бъдат прекъснати.
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
                    Биологичният автоматизъм
                  </div>
                  <div className="text-xs text-white/30 mt-1 leading-relaxed">
                    Допамин, навици, автоматично поведение
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
                    Алгоритмичният прицел
                  </div>
                  <div className="text-xs text-white/30 mt-1 leading-relaxed">
                    Внимание, прекъсвания, когнитивен поток
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
                    Когнитивна свобода
                  </div>
                  <div className="text-xs text-white/30 mt-1 leading-relaxed">
                    Воля, ego depletion, поведенчески дизайн
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
                    Завръщане и реинтеграция
                  </div>
                  <div className="text-xs text-white/30 mt-1 leading-relaxed">
                    Невропластичност, навици, контекст
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
                    Съзнателна свобода
                  </div>
                  <div className="text-xs text-white/30 mt-1 leading-relaxed">
                    Дигитална свобода, дългосрочна промяна
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
                Тази страница показва какво стои зад модела.{' '}
                <strong className="text-white font-medium">Книгата показва как да го приложиш.</strong>
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
