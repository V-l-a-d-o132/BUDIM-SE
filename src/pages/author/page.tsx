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
    keywords: 'медийна грамотност, дигитална грамотност, дигитални навици, проверка на информация, Петте степени, БУДИМ СЕ',
    schemaType: 'AboutPage',
    breadcrumbs: [
      { name: 'Начало', url: 'https://budimse.online' },
      { name: 'Авторът — Владимир Атанасов', url: 'https://budimse.online/author' },
    ],
    schemaExtra: {
      dateModified: '2026-10-07',
      about: {
        '@type': 'Person',
        '@id': 'https://budimse.online/author#person',
        name: 'Владимир Атанасов',
        jobTitle: 'Автор и създател',
        worksFor: {
          '@type': 'EducationalOrganization',
          '@id': 'https://budimse.online/#organization',
          name: 'Център за медийна и дигитална грамотност БУДИМ СЕ',
          url: 'https://budimse.online',
        },
        url: 'https://budimse.online/author',
        email: 'budimseonline@gmail.com',
        knowsAbout: [
          'Медийна грамотност',
          'Дигитална грамотност',
          'Дигитален суверенитет',
          'Дигитални навици',
          'Поведенчески дизайн',
        ],
        sameAs: ['https://budimse.online/author'],
        description: 'Практик и създател на инициативата БУДИМ СЕ. Автор на „Петте степени".',
      },
    },
  });

  return (
    <>
      {/* Enhanced Minimalist Background Elements - Fixed Position */}


      <div className="min-h-screen bg-white relative z-10">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="editorial-page">

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
                  <p className="text-gray-700 leading-relaxed mb-6">Книгата съчетава лични разкази, условни примери, въпроси и упражнения. Източниците са посочени с обхвата и ограниченията им. Петте степени и практиката „Будим се“ са авторска образователна рамка.</p>
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
                <p className="text-sm text-gray-600 leading-relaxed">Питаме какво търсим в този момент и какво получаваме. От значение са и дизайнът на услугата, съдържанието и условията около нас. Личното намерение е само част от картината.</p>
              </div>
              <div className="bg-white p-8 rounded-lg border border-gray-100">
                <div className="w-8 h-8 flex items-center justify-center mb-4">
                  <Icon name="ri-tools-line" size={20} className="text-gray-900" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Проверка преди извод</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Различаваме факт, предположение и личен опит. Четем източника и ограниченията му. Ако нови данни променят обяснението, трябва да променим и текста.</p>
              </div>
              <div className="bg-white p-8 rounded-lg border border-gray-100">
                <div className="w-8 h-8 flex items-center justify-center mb-4">
                  <Icon name="ri-user-line" size={20} className="text-gray-900" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Внимание към човека</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Един и същ съвет може да е полезен в една ситуация и неудобен в друга. Възрастта, работата, здравето, грижите и нуждата от подкрепа имат значение.</p>
              </div>
              <div className="bg-white p-8 rounded-lg border border-gray-100">
                <div className="w-8 h-8 flex items-center justify-center mb-4">
                  <Icon name="ri-repeat-line" size={20} className="text-gray-900" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Малък опит и преглед</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Избираме изпълнима промяна, опитваме я и гледаме резултата. Можем да я запазим, да я коригираме или да се откажем от нея. Няма обещан срок за нов навик.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-12 px-4 md:py-20 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="text-2xl md:text-3xl font-light text-gray-900 leading-relaxed mb-8">„Свободата, която ме интересува, трябва да издържа среща с умората, лошото настроение и непредвидения ден.“</blockquote>
            <cite className="text-gray-600">— Владимир Атанасов, „Петте степени“</cite>
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
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">Разгледайте въпросите от книгата</h2>
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

        </main>
        <Footer />
      </div>
    </>
  );
}

