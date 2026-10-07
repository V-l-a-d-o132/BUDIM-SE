import { Link } from 'react-router-dom';
import { useState } from 'react';
import BookPurchasePanel from './BookPurchasePanel';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

const faqItems = [
  {
    "id": 1,
    "question": "Научно изпитана методика ли е?",
    "answer": "„Петте степени“ е авторска образователна рамка. Личните разкази и условните примери не са научни данни. Източниците подкрепят конкретни твърдения и посочват несигурността; не са клинично изпитване на рамката.",
    "sources": []
  },
  {
    "id": 2,
    "question": "Самото присъствие на телефон пречи ли на вниманието?",
    "answer": "Изследванията дават смесени резултати. Метаанализът на Parry обобщава 56 изследвания и описва методологични ограничения. От него не следва, че телефонът неизбежно влошава всяка познавателна способност.",
    "sources": [
      {
        "label": "Parry (2024) — метаанализ на присъствието на смартфон",
        "url": "https://doi.org/10.1080/15213269.2023.2286647"
      }
    ]
  },
  {
    "id": 3,
    "question": "Какво знаем за социалните мрежи и подрастващите?",
    "answer": "Обзорът на National Academies разглежда ползи, рискове и пропуски в доказателствата. Общите изводи за населението трябва да се различават от конкретни вредни преживявания. Времето пред екрана само по себе си не определя причината за нечие състояние.",
    "sources": [
      {
        "label": "National Academies (2024) — Social Media and Adolescent Health",
        "url": "https://doi.org/10.17226/27396"
      }
    ]
  },
  {
    "id": 4,
    "question": "Какво означава различието между желание и удоволствие?",
    "answer": "Желанието за награда и удоволствието от нея са различими процеси в обсъждания научен модел. Това е полезна отправна точка за въпрос, но не обяснява изцяло дигиталната употреба и не служи за лична диагноза.",
    "sources": [
      {
        "label": "Berridge & Robinson (2016) — Liking, Wanting",
        "url": "https://doi.org/10.1037/amp0000059"
      }
    ]
  },
  {
    "id": 5,
    "question": "Трябва ли да спра да използвам технологиите?",
    "answer": "Книгата предлага да разгледаш кое ти помага и кое измества важни неща. Можеш да запазиш полезните функции и да опиташ една конкретна промяна. Подходящите граници зависят от твоя живот.",
    "sources": []
  },
  {
    "id": 6,
    "question": "За колко време се изгражда нов навик?",
    "answer": "Няма универсален срок. Изследването на Lally и колеги показва различия при избрани всекидневни действия. То не изпитва метод за прекратяване на проблемна употреба на смартфон. Затова упражнението в книгата е опит с преглед, а не обещание за резултат в определен ден.",
    "sources": [
      {
        "label": "Lally et al. (2010) — How are habits formed",
        "url": "https://doi.org/10.1002/ejsp.674"
      }
    ]
  }
];

function FaqItem({ item }: { item: typeof faqItems[0] }) {
  const [open, setOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left cursor-pointer group min-h-[44px]"
      >
        <span className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors leading-relaxed">
          {item.question}
        </span>
        <span className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon name={`ri-${open ? 'subtract' : 'add'}-line`} size={18} className="text-gray-400" />
        </span>
      </button>

      {open && (
        <div className="pb-5 pr-12">
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{item.answer}</p>

          {item.sources.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setSourcesOpen(!sourcesOpen)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer border border-gray-200 hover:border-gray-400 rounded-full px-3 py-1 min-h-[32px]"
              >
                <Icon name="ri-links-line" size={12} className="text-gray-400" />
                {sourcesOpen ? 'Скрий изследванията' : 'Виж изследванията'}
              </button>

              {sourcesOpen && (
                <div className="mt-3 space-y-2">
                  {item.sources.map((src) => (
                    <a
                      key={src.url}
                      href={src.url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors group/link"
                    >
                      <Icon name="ri-external-link-line" size={12} className="text-gray-300 group-hover/link:text-gray-500 flex-shrink-0" />
                      <span className="underline underline-offset-2 decoration-gray-200 group-hover/link:decoration-gray-500">
                        {src.label}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const chapterItems = [
  {
    "num": "01",
    "title": "Да забележиш навика",
    "desc": "Забележи кога посягаш към телефона и какво търсиш в този момент.",
    "icon": "ri-eye-line"
  },
  {
    "num": "02",
    "title": "Да разбереш средата",
    "desc": "Разгледай препоръките, известията и източниците на информация.",
    "icon": "ri-lightbulb-line"
  },
  {
    "num": "03",
    "title": "Да опиташ промяна",
    "desc": "Избери една малка промяна и провери дали ти помага.",
    "icon": "ri-refresh-line"
  },
  {
    "num": "04",
    "title": "Да върнеш място за живота",
    "desc": "Остави място за важните ти занимания, общуването и почивката.",
    "icon": "ri-focus-3-line"
  },
  {
    "num": "05",
    "title": "Да поддържаш свободата си",
    "desc": "Преглеждай границите си и ги променяй според живота си.",
    "icon": "ri-shield-check-line"
  }
];

const benefitItems = [
  {
    icon: 'ri-time-line' as const,
    title: 'Наблюдавай времето си',
    desc: 'Проследи кога отваряш приложенията по навик и избери кои моменти искаш да организираш различно.',
  },
  {
    icon: 'ri-brain-line' as const,
    title: 'Опитай паузи без известия',
    desc: 'Експериментирай с периоди без прекъсвания и наблюдавай дали това помага на избрана задача.',
  },
  {
    icon: 'ri-group-line' as const,
    title: 'Обсъди дигиталните граници',
    desc: 'Използвай въпросите от книгата като повод за разговор за вниманието, устройствата и личните граници.',
  },
  {
    icon: 'ri-emotion-happy-line' as const,
    title: 'Разглеждай съдържанието критично',
    desc: 'Проверявай източника, контекста и основанията за твърденията. Книгата предлага упражнения, без обещание за психологически или здравен резултат.',
  },
];

export default function Order() {
  usePageSeo({
    title: 'Поръчай книгата „Петте степени" — Владимир Атанасов',
    description: 'Поръчай „Петте степени" от Владимир Атанасов. Книга за дигиталните навици, личната преценка и мястото на технологиите в ежедневието. С лични разкази, условни примери и упражнения, които можеш да приспособиш към себе си. Физическа книга €14,99, електронно издание €3,99.',
    canonical: '/order',
    ogType: 'product',
    schemaType: 'ItemPage',
    schemaExtra: {
      dateModified: '2026-10-07',
      keywords: 'медийна грамотност, дигитална грамотност, дигитални навици, проверка на информация, Петте степени, БУДИМ СЕ',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'БУДИМ СЕ', item: 'https://budimse.online' },
          { '@type': 'ListItem', position: 2, name: 'Поръчай книгата', item: 'https://budimse.online/order' },
        ],
      },
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            "name": "Петте степени",
            "author": { "@type": "Person", "name": "Владимир Атанасов" },
            "publisher": { "@type": "Organization", "name": "БУДИМ СЕ" },
            "isbn": "978-619-93777-0-3",
            "inLanguage": "bg",
            "bookEdition": "Първо издание, 2026",
            "description": "Книга за дигиталните навици, личната преценка и мястото на технологиите в ежедневието. С лични разкази, условни примери и упражнения, които можеш да приспособиш към себе си.",
            "genre": ["Медийна грамотност", "Дигитална грамотност", "Поведенчески дизайн"],
            "offers": {
              "@type": "Offer",
              "price": "14.99",
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock",
              "url": "https://budimse.online/order"
            }
          })
        }}
      />

      <div className="min-h-screen bg-white relative z-10">
        <Navbar />

        <main className="pb-12 md:pb-20 pt-20 md:pt-24">

          {/* ── Hero + Purchase Panel ── */}
          <section className="px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">

                {/* LEFT — Book Visual */}
                <div className="order-2 lg:order-1">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-40 h-56 sm:w-48 sm:h-72 flex-shrink-0 mx-auto sm:mx-0">
                      <img
                        src="https://static.readdy.ai/image/658b459fcf05a7723f8029c45615de2f/7fd715118976d07fe2b11b1e6367a1e7.jpeg"
                        alt="Петте степени — корица"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">Владимир Атанасов</p>
                      <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-3 leading-tight">
                        Петте степени
                      </h1>
                      <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                        Авторски приложен труд за вниманието, дигиталните навици и петстепенния път от
                        автоматична реакция към по-осъзнато използване на технологиите.
                      </p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <Icon name="ri-book-line" size={12} className="text-gray-500" />
                          Издател: БУДИМ СЕ
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <Icon name="ri-calendar-line" size={12} className="text-gray-500" />
                          Първо издание, 2026
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <Icon name="ri-barcode-line" size={12} className="text-gray-500" />
                          ISBN 978-619-93777-0-3
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="mt-8 md:mt-10 bg-gray-50 rounded-lg p-5 md:p-6">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <Icon name="ri-double-quotes-l" size={20} className="text-gray-300" />
                      </div>
                      <div>
                        <blockquote className="text-gray-700 leading-relaxed text-sm md:text-base italic">„Свободата, която ме интересува, трябва да издържа среща с умората, лошото настроение и непредвидения ден.“</blockquote>
                        <cite className="text-sm text-gray-400 mt-2 block not-italic">— Владимир Атанасов, „Петте степени“</cite>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-1 lg:order-2">
                  <BookPurchasePanel />
                </div>
              </div>
            </div>
          </section>

          {/* ── За книгата ── */}
          <section className="px-4 md:px-6 mt-16 md:mt-24">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8 md:mb-10">
                <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">За книгата</p>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900">Какво ще намерите в нея</h2>
              </div>
              <div className="space-y-5 text-gray-700 leading-relaxed text-base md:text-lg">
                <p className="font-medium text-xl text-gray-900">Защо понякога отваряме телефона без ясна цел? Кога препоръките ни помагат и кога ни отвеждат другаде? Как можем да поставим граница, която има място в обикновения ни ден?</p>
                <p>„Петте степени“ от Владимир Атанасов разглежда дигиталните навици, проверката на информация и личните граници. Личните разкази са отделени от условните примери, а научните публикации — от авторските изводи.</p>
                <p>Петте степени са пет задачи, към които можем да се връщаме: да забележим навика, да разберем средата, да опитаме промяна, да оставим място за живота и да поддържаме свободата си. Те не подреждат хората в категории и не изискват безупречна дисциплина.</p>
                <p>Практиката „Будим се“ предлага наблюдение, проверка, избор, опит и преглед на резултата. Примерите отчитат работата, семейството, умората и полезното онлайн общуване. Можеш да използваш книгата самостоятелно, без регистрация или програма в сайта.</p>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 italic leading-relaxed">
                    Книгата използва метафори, опростени модели и авторски интерпретации с образователна цел.
                    Тя не е академично изследване и не предоставя медицински, психологически или терапевтични съвети.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Benefits ── */}
          <section className="px-4 md:px-6 mt-16 md:mt-24">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">Защо тази книга</p>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900">Какво можеш да изследваш и опиташ</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {benefitItems.map((b) => (
                  <div key={b.title} className="bg-gray-50 rounded-xl p-5 md:p-6 text-center">
                    <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-xl bg-white border border-gray-100">
                      <Icon name={b.icon} size={24} className="text-gray-700" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">{b.title}</h3>
                    <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── What's Inside ── */}
          <section className="px-4 md:px-6 mt-16 md:mt-24">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">Съдържание</p>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900">Пет задачи, към които можеш да се връщаш</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {chapterItems.map((item) => (
                  <div
                    key={item.num}
                    className="border border-gray-100 rounded-xl p-5 md:p-6 hover:border-gray-200 transition-colors bg-white"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 flex-shrink-0">
                        <Icon name={item.icon} size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-400">{item.num}</span>
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        </div>
                        <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Отзиви — placeholder ── */}
          <section className="px-4 md:px-6 mt-16 md:mt-24">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8 md:mb-10">
                <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">Отзиви</p>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900">Обратна връзка от читатели</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 md:p-10 text-center">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-full bg-white border border-gray-100">
                  <Icon name="ri-chat-1-line" size={24} className="text-gray-400" />
                </div>
                <p className="text-base text-gray-600 leading-relaxed max-w-xl mx-auto">
                  Тук ще публикуваме реална обратна връзка от читатели след разпространението на книгата.
                  Няма да използваме примерни или измислени препоръки.
                </p>
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="px-4 md:px-6 mt-16 md:mt-24">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">Контекст и източници</p>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-3">
                  Въпроси за книгата и подхода
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">Въпросите по-долу разграничават научните данни от практическите предложения в книгата. Пълните 17 бележки посочват какво подкрепя всеки източник и къде свършва приложимостта му.</p>
              </div>

              <div className="divide-y divide-gray-100 border-t border-gray-100">
                {faqItems.map((item) => (
                  <FaqItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section className="px-4 md:px-6 mt-16 md:mt-24">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-gray-50 rounded-xl p-6 md:p-10">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-xl bg-white border border-gray-100">
                  <Icon name="ri-book-open-line" size={24} className="text-gray-700" />
                </div>
                <p className="text-base text-gray-600 leading-relaxed mb-2">Разгледай въпросите, примерите и източниците.</p>
                <p className="text-base text-gray-900 font-medium mb-6 md:mb-8">Избери онова, което има смисъл за твоя живот.</p>
                <button
                  type="button"
                  onClick={() => document.getElementById('book-purchase')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Icon name="ri-shopping-bag-line" size={20} />
                  Избери издание
                </button>
              </div>
            </div>
          </section>

          {/* ── Navigation ── */}
          <section className="px-4 md:px-6 mt-12 md:mt-16">
            <div className="max-w-6xl mx-auto pt-8 border-t border-gray-100">
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                <Link to="/" className="text-gray-400 hover:text-gray-700 transition-colors text-sm flex items-center gap-1.5">
                  <Icon name="ri-arrow-left-line" size={12} className="text-gray-400" />
                  Начална страница
                </Link>
                <Link
                  to="/step-1"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Icon name="ri-map-pin-line" size={12} className="text-gray-400" />
                  Рамката
                </Link>
                <Link
                  to="/digitalna-gramotnost"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Icon name="ri-book-open-line" size={12} className="text-gray-400" />
                  Дигитална грамотност
                </Link>
                <Link
                  to="/author"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Icon name="ri-user-line" size={12} className="text-gray-400" />
                  За автора
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

