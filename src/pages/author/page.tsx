import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function Author() {
  usePageSeo({
    title: 'Владимир Атанасов — автор и създател на инициативата БУДИМ СЕ',
    description: 'Владимир Атанасов е автор и създател на инициативата БУДИМ СЕ. „Петте степени" е негова авторска образователна и интерпретативна рамка за вниманието и дигиталните навици.',
    canonical: '/author',
    keywords: 'Владимир Атанасов, медийна грамотност, дигитална грамотност, БУДИМ СЕ, когнитивна свобода, дигитален суверенитет',
    schemaType: 'AboutPage',
    breadcrumbs: [
      { name: 'Начало', url: 'https://budimse.online' },
      { name: 'Авторът — Владимир Атанасов', url: 'https://budimse.online/author' },
    ],
    schemaExtra: {
      about: {
        '@type': 'Person',
        name: 'Владимир Атанасов',
        jobTitle: 'Автор и създател',
        worksFor: {
          '@type': 'EducationalOrganization',
          name: 'Център за медийна и дигитална грамотност БУДИМ СЕ',
          url: 'https://budimse.online',
        },
        url: 'https://budimse.online/author',
        email: 'budimseonline@gmail.com',
        knowsAbout: [
          'Медийна грамотност',
          'Дигитална грамотност',
          'Дигитален суверенитет',
          'Когнитивна свобода',
          'Поведенчески дизайн',
          'Инхибиторен контрол',
          'Невропластичност',
        ],
        sameAs: ['https://budimse.online/author'],
        description: 'Практик и създател на инициативата БУДИМ СЕ. Автор на „Петте степени".',
      },
    },
  });

  return (
    <>
      {/* Enhanced Minimalist Background Elements - Fixed Position */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Primary angular geometric shapes */}
        <div className="absolute top-20 left-10 w-1 h-32 bg-gray-200 rotate-12 opacity-40"></div>
        <div className="absolute top-40 right-20 w-24 h-1 bg-gray-200 opacity-30"></div>
        <div className="absolute bottom-40 left-1/4 w-1 h-20 bg-gray-200 -rotate-45 opacity-35"></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-1 bg-gray-200 rotate-45 opacity-25"></div>
        
        {/* Additional angular lines */}
        <div className="absolute top-60 left-1/3 w-1 h-16 bg-gray-200 rotate-30 opacity-30"></div>
        <div className="absolute bottom-60 right-1/4 w-20 h-1 bg-gray-200 -rotate-30 opacity-25"></div>
        <div className="absolute top-1/4 left-2/3 w-1 h-12 bg-gray-200 rotate-60 opacity-35"></div>
        <div className="absolute bottom-1/3 left-1/6 w-14 h-1 bg-gray-200 rotate-15 opacity-30"></div>
        
        {/* Corner elements */}
        <div className="absolute top-16 right-16 w-8 h-8 border-l border-t border-gray-200 opacity-25"></div>
        <div className="absolute bottom-16 left-16 w-6 h-6 border-r border-b border-gray-200 opacity-30"></div>
        <div className="absolute top-1/2 left-8 w-4 h-4 border-t border-r border-gray-200 opacity-35 rotate-45"></div>
        <div className="absolute top-3/4 right-8 w-5 h-5 border-l border-b border-gray-200 opacity-25 -rotate-12"></div>
        
        {/* Subtle triangular shapes */}
        <div className="absolute top-32 left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-6 border-transparent border-b-gray-200 opacity-20"></div>
        <div className="absolute bottom-32 right-1/3 w-0 h-0 border-l-3 border-r-3 border-t-5 border-transparent border-t-gray-200 opacity-25"></div>
        
        {/* Subtle circles */}
        <div className="absolute top-32 right-10 w-2 h-2 rounded-full bg-gray-200 opacity-30"></div>
        <div className="absolute bottom-32 left-16 w-1 h-1 rounded-full bg-gray-200 opacity-40"></div>
        <div className="absolute top-2/3 left-1/2 w-1.5 h-1.5 rounded-full bg-gray-200 opacity-25"></div>
        
        {/* Diagonal corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16">
          <div className="absolute top-4 left-4 w-8 h-1 bg-gray-200 opacity-20 rotate-45"></div>
          <div className="absolute top-6 left-2 w-1 h-8 bg-gray-200 opacity-20 rotate-45"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16">
          <div className="absolute bottom-4 right-4 w-8 h-1 bg-gray-200 opacity-20 -rotate-45"></div>
          <div className="absolute bottom-6 right-2 w-1 h-8 bg-gray-200 opacity-20 -rotate-45"></div>
        </div>
        
        {/* Minimal grid pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-8">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-gray-200 last:border-r-0"></div>
            ))}
          </div>
        </div>
        
        {/* Additional geometric accents */}
        <div className="absolute top-1/5 right-1/5 w-3 h-3 border border-gray-200 opacity-25 rotate-45"></div>
        <div className="absolute bottom-1/5 left-1/5 w-2 h-2 border border-gray-200 opacity-30 rotate-12"></div>
        <div className="absolute top-3/5 left-3/4 w-4 h-1 bg-gray-200 opacity-20 rotate-75"></div>
        <div className="absolute bottom-2/5 right-2/3 w-1 h-6 bg-gray-200 opacity-25 -rotate-20"></div>
      </div>

      <div className="min-h-screen bg-white relative z-10">
        <Navbar />

        {/* Author Hero Section */}
        <section className="pt-28 pb-12 px-4 md:pt-32 md:pb-16 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12 items-start">
              <div className="md:col-span-1">
                <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-6">
                  <img 
                    src="https://static.readdy.ai/image/658b459fcf05a7723f8029c45615de2f/346ce47665cbfed8a19738496609c6ac.jpeg"
                    alt="Владимир Атанасов - автор"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
                  Владимир Атанасов
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Автор. Създател на инициативата БУДИМ СЕ.
                </p>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Владимир Атанасов е автор и създател на инициативата БУДИМ СЕ. Работата му съчетава
                    практически опит в комуникациите с образователни формати за критично мислене и
                    дигитална автономност. „Петте степени" е негова авторска образователна и
                    интерпретативна рамка.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Рамката използва идеи, метафори и практически подходи, вдъхновени от медийната
                    грамотност, когнитивната психология, поведенческия дизайн и невронауката. Тя не
                    представлява медицинска, психологическа или терапевтична методика.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Проверима информация за биографията, опита и публикациите на автора ще бъде добавена
                    тук, когато е готова за публично споделяне.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* За авторската рамка */}
        <section className="py-10 md:py-16 px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-8 font-medium text-center">За авторската рамка</p>
            <div className="border border-gray-100 rounded-lg p-8 text-center max-w-2xl mx-auto">
              <p className="text-gray-600 leading-relaxed text-sm">
                „Петте степени" е авторска образователна и интерпретативна рамка на Владимир Атанасов.
                Проверима информация за неговата биография, опит и публикации ще бъде публикувана, когато
                е готова за публично споделяне. Не публикуваме непроверени твърдения за резултати.
              </p>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-10 md:py-16 px-4 md:px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-medium">Как работи</p>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-10">
              Четири принципа
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-lg border border-gray-100">
                <div className="w-8 h-8 flex items-center justify-center mb-4">
                  <Icon name="ri-focus-3-line" size={20} className="text-gray-900" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Намерение преди действие
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Технологиите не са нито добри, нито лоши — качеството им се определя от намерението 
                  зад употребата. На терен това е първото нещо, което се работи: разграничаване на 
                  рефлекторното от волевото действие.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg border border-gray-100">
                <div className="w-8 h-8 flex items-center justify-center mb-4">
                  <Icon name="ri-tools-line" size={20} className="text-gray-900" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Само това, което работи
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Всяка концепция трябва да намери израз в конкретно действие. Ако не може да се 
                  приложи в реална ситуация — не влиза в рамката. Без теория заради теорията.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg border border-gray-100">
                <div className="w-8 h-8 flex items-center justify-center mb-4">
                  <Icon name="ri-user-line" size={20} className="text-gray-900" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Работа с хора, не с аудитория
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Рамката е насочена към реални хора — ученици, родители и екипи. Фокусът е върху
                  разбиране на механизмите и практически подходи, а не върху абстрактни категории.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg border border-gray-100">
                <div className="w-8 h-8 flex items-center justify-center mb-4">
                  <Icon name="ri-repeat-line" size={20} className="text-gray-900" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Малки стъпки, трайна промяна
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Трайната промяна не идва от радикални решения. Идва от последователни, малки 
                  поведенчески корекции — изградени върху разбиране на механизмите, не върху воля.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-12 px-4 md:py-20 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="text-2xl md:text-3xl font-light text-gray-900 leading-relaxed mb-8">
              "Когнитивната свобода не означава да се откажем от технологиите. 
              Тя означава да разберем достатъчно добре собственото си мислене, 
              за да ги използваме по начин, който служи на живота ни — а не го формира."
            </blockquote>
            <cite className="text-gray-600">— Владимир Атанасов</cite>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-10 md:py-16 px-4 md:px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-8">
              Свържете се
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              За въпроси относно книгата, изследванията или възможности за сътрудничество — 
              моля, използвайте следните канали:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="mailto:budimseonline@gmail.com" 
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Icon name="ri-mail-line" size={16} className="mr-2" />
                Имейл
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-full hover:bg-gray-900 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
              >
                <Icon name="ri-linkedin-line" size={16} className="mr-2" />
                LinkedIn
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10 md:py-16 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
              Започнете пътя към когнитивна свобода
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Открийте петте степени от авторската рамка
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/step-1" 
                className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                Разгледай рамката
                <Icon name="ri-arrow-right-line" size={16} className="ml-2" />
              </Link>
              <Link 
                to="/order" 
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-full hover:bg-gray-900 hover:text-white transition-colors whitespace-nowrap"
              >
                <Icon name="ri-book-line" size={16} className="mr-2" />
                Поръчай книгата
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
