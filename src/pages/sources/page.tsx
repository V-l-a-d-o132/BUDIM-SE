import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageLayout, { PageIntro } from '@/components/feature/PageLayout';
import { usePageSeo } from '@/hooks/usePageSeo';
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

export default function SourcesPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const { hash } = useLocation();
  const shown = categories.filter(cat => (!filter || cat.label === filter) && (cat.title + ' ' + cat.description + ' ' + cat.label).toLocaleLowerCase('bg').includes(query.toLocaleLowerCase('bg')));
  usePageSeo({ title: 'Източници и бележки към „Петте степени“', description: '17 бележки с първични източници, обхват и ограничения: навици, внимание, медийна грамотност и социални мрежи.', canonical: '/sources', schemaType: 'CollectionPage' });
  return <PageLayout><PageIntro eyebrow="Източници" title="Какво знаем и докъде стигат данните."><p>17 бележки към „Петте степени“. Всяка посочва какво подкрепя източникът и кои изводи не следват от него. Изследванията на отделни явления не са изпитване на авторската рамка като цяло.</p></PageIntro>
    <div className="site-container pb-12">
      <div className="grid sm:grid-cols-2 gap-5 max-w-3xl"><div className="form-field"><label htmlFor="source-search">Търси в бележките</label><input id="source-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Например: внимание" /></div><div className="form-field"><label htmlFor="source-filter">Тема</label><select id="source-filter" value={filter} onChange={event => setFilter(event.target.value)}><option value="">Всички теми</option>{allLabels.map(label => <option key={label}>{label}</option>)}</select></div></div>
      <p role="status" className="!text-sm my-4">{shown.length} от {categories.length} бележки</p>
      <div className="faq-list max-w-4xl">{shown.map(cat => <details id={cat.id} key={cat.id} open={Boolean(query) || hash === '#' + cat.id}>
        <summary><span className="text-gray-500 mr-3">{String(cat.noteNumber).padStart(2, '0')}</span>{cat.title}</summary>
        <div className="prose-content pl-4"><p>{cat.description}</p><p className="!text-sm">{degreeMap[cat.id]}</p><ul>{cat.links.map(url => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className="break-words">{sourceReferences[url] || url}</a></li>)}</ul></div>
      </details>)}</div>
      <div className="callout max-w-4xl"><h2 className="!text-xl mb-3">Забеляза неточност?</h2><p>Посочи бележката и изпрати документ или публикация, с които я сравняваш. Публичните правила и функциите на платформите могат да се променят.</p><Link className="text-link mt-3" to="/contact">Изпрати предложение за корекция</Link></div>
    </div>
  </PageLayout>;
}
