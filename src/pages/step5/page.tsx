import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Breadcrumb from '@/components/feature/Breadcrumb';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function Step5() {
  usePageSeo({
    title: 'Степен 5: Да поддържаш свободата си | БУДИМ СЕ',
    description: 'Пета степен: поддържане и поправка на полезните граници при умора, трудни дни и нови обстоятелства. Свобода без изискване за съвършенство.',
    canonical: '/step-5',
    keywords: 'медийна грамотност, дигитални навици, внимание, Петте степени, Будим се',
    ogType: 'article',
    schemaType: 'Article',
    schemaExtra: {
      headline: 'Степен 5: Да поддържаш свободата си',
      author: {
        '@type': 'Person',
        name: 'Владимир Атанасов',
        url: 'https://budimse.online/author',
      },
      datePublished: '2026-04-18',
      dateModified: '2026-10-07',
      keywords: 'медийна грамотност, дигитални навици, внимание, Петте степени, Будим се',
      articleSection: 'Рамка',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '.font-medium'],
      },
      mentions: [
        { '@type': 'Thing', name: 'Дигитални навици' },
        { '@type': 'Thing', name: 'Медийна грамотност', sameAs: 'https://budimse.online/digitalna-gramotnost' },
      ],
      isBasedOn: {
        '@type': 'Book',
        name: 'Петте степени',
        author: { '@type': 'Person', name: 'Владимир Атанасов' },
        publisher: { '@type': 'Organization', name: 'БУДИМ СЕ' },
        url: 'https://budimse.online/order',
      },
    },
    ogImage: 'https://readdy.ai/api/search-image?query=person%20standing%20confidently%20outdoors%20in%20open%20landscape%2C%20smartphone%20in%20pocket%20not%20in%20hand%2C%20looking%20at%20horizon%20with%20clarity%20and%20freedom%2C%20golden%20hour%20light%2C%20minimalist%20composition%20with%20vast%20sky%2C%20symbolic%20representation%20of%20digital%20sovereignty%20and%20conscious%20freedom%2C%20cinematic%20wide%20shot%20with%20warm%20earth%20tones&width=1200&height=630&seq=step5-og-v1&orientation=landscape',
    breadcrumbs: [
      { name: 'БУДИМ СЕ', url: '/' },
      { name: 'Петте степени', url: '/#steps' },
      { name: 'Степен 5 — Да поддържаш свободата си', url: '/step-5' },
    ],
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Content */}
      <main id="main-content" tabIndex={-1} className="editorial-page pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb
            className="mb-8"
            items={[
              { name: 'БУДИМ СЕ', url: '/' },
              { name: 'Петте степени', url: '/#steps' },
              { name: 'Степен 5 — Да поддържаш свободата си' },
            ]}
          />
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl font-light text-gray-300 mb-4">05</div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Да поддържаш свободата си</h1>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Граници, които могат да се променят заедно с живота.
            </p>
          </div>

          {/* Рамков дисклеймър */}
          <div className="max-w-3xl mx-auto mb-12 bg-gray-50 border border-gray-100 rounded-lg p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="ri-information-line" size={16} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                „Петте степени“ е авторска рамка за наблюдение и промяна на дигитални навици. Степените описват задачи, към които можеш да се връщаш. Те не са диагнози, категории хора или гарантиран ред на развитие.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 leading-relaxed space-y-6 text-lg">
              <p className="font-medium text-xl text-gray-900">Човек, който никога не се разсейва, е привлекателен образ. Животът обаче включва умора, тревоги и непредвидени дни. Петата степен трябва да има място и за тях.</p>
              <p className="text-gray-800">Свободата тук е възможността да се връщаш към избора си и да поправяш правилата. Можеш да забележиш, че си останал в лентата, и да спреш по средата. Не е необходимо вече изгубеното време да решава как ще продължи вечерта.</p>
              <p className="text-gray-800">В условния пример Ива проверява повече служебни съобщения, докато замества отсъстващ колега. Това може да изисква разговор за приоритетите и временно по-малка лична граница. Не всяка трудност се решава с повече дисциплина у дома.</p>
              <p className="text-gray-800">В семейството правилата могат да са различни според възрастта, работата и нуждите. Полезно е причините да могат да се обяснят: сън, безопасност, време за разговор или достъпност за важни хора.</p>
              <p className="text-gray-800">Дори добрият показател може да се превърне в нова грижа. Ако постоянно следиш минутите и се обвиняваш за всяко увеличение, върни се към целта. Дълъг полезен разговор и нежелано разглеждане могат да изглеждат еднакво в общия отчет.</p>
              <p className="text-gray-800">Степените не са етикети за близките ти. Можеш да споделиш своя опит или да поставиш граница за разговор с прекъсвания. Не можеш да определиш нечия зрялост по начина, по който използва телефона.</p>
              <h2 className="text-2xl font-medium text-gray-900 mt-10">Един опит в ежедневието</h2>
              <p>Запиши какво искаш да пазиш, кои правила ти помагат и какво ще направиш в труден ден. Уточни кога ще ги прегледаш отново. Договорката трябва да служи на теб, включително когато нуждите ти се променят.</p>
              <p className="text-gray-600">Няма окончателен имунитет срещу разсейване. Има повече яснота за това как живееш и повече възможности да избираш следващото действие.</p>
              <p className="text-base"><Link to="/sources" className="underline underline-offset-4">Източници и граници на изводите</Link></p>
            </div>
          </div>



          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <Link
                to="/step-4"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icon name="ri-arrow-left-line" size={16} className="mr-2" />
                Четвърта степен
              </Link>
              <Link
                to="/order"
                className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                Вземи книгата
                <Icon name="ri-arrow-right-line" size={16} className="ml-2" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
              <Link to="/digitalna-gramotnost" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                <Icon name="ri-book-open-line" size={12} />Дигитална грамотност
              </Link>
              <Link to="/center" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                <Icon name="ri-building-line" size={12} />Програми за обучение
              </Link>
              <Link to="/testimonials" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                <Icon name="ri-chat-1-line" size={12} />Отзиви
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

