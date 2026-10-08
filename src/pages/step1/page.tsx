import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Breadcrumb from '@/components/feature/Breadcrumb';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function Step1() {
  usePageSeo({
    title: 'Степен 1: Да забележиш навика | БУДИМ СЕ',
    description: 'Първа степен: наблюдение на един дигитален навик, неговия контекст и последствията. С условен пример и въпроси за собствена проверка.',
    canonical: '/step-1',
    keywords: 'медийна грамотност, дигитални навици, внимание, Петте степени, Будим се',
    ogType: 'article',
    schemaType: 'Article',
    schemaExtra: {
      headline: 'Степен 1: Да забележиш навика',
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
    ogImage: 'https://readdy.ai/api/search-image?query=person%20staring%20at%20glowing%20smartphone%20screen%20in%20dark%20room%2C%20blue%20light%20illuminating%20face%2C%20surrounded%20by%20floating%20notification%20icons%20and%20algorithm%20symbols%2C%20minimalist%20digital%20art%2C%20high%20contrast%20black%20and%20white%20with%20subtle%20blue%20tones%2C%20conceptual%20illustration%20about%20digital%20addiction%20and%20passive%20consumption&width=1200&height=630&seq=step1-og-v1&orientation=landscape',
    breadcrumbs: [
      { name: 'БУДИМ СЕ', url: '/' },
      { name: 'Петте степени', url: '/#steps' },
      { name: 'Степен 1 — Да забележиш навика', url: '/step-1' },
    ],
  });

  return (
    <>
      {/* Enhanced Minimalist Background Elements - Fixed Position */}


      <div className="min-h-screen bg-white relative z-10">
        <Navbar />

        {/* Content */}
        <main id="main-content" tabIndex={-1} className="editorial-page pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb
              className="mb-8"
              items={[
                { name: 'БУДИМ СЕ', url: '/' },
                { name: 'Петте степени', url: '/#steps' },
                { name: 'Степен 1 — Да забележиш навика' },
              ]}
            />
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl font-light text-gray-300 mb-4">01</div>
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
                Да забележиш навика</h1>
              <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Какво искаше да направиш и какво се случи?
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
              <p className="font-medium text-xl text-gray-900">Събуждаш се и посягаш към телефона. Може да чакаш важен отговор, да проверяваш часа или просто да повтаряш познато движение. Отвън тези действия изглеждат еднакво. За теб разликата има значение.</p>
              <p className="text-gray-800">Първата степен започва с интерес към тази разлика. За какво отворих устройството? Какво направих след това? Доволен ли съм от резултата? Въпросите помагат да видиш конкретен навик, без да оценяваш целия си живот по времето пред екрана.</p>
              <p className="text-gray-800">Известието може да прекъсне задача. То може и да носи нещо необходимо. Проверяването на телефона не показва само по себе си зависимост, слаб характер или загуба на внимание. Важни са причината, условията и последствията.</p>
              <p className="text-gray-800">В условния пример Никола отваря телефона за часа, после прочита съобщение и остава в лентата. Няколко сутрини забелязва, че закуската се забавя. Вместо да забрани всяка употреба, пробва първо да приготви закуската и да остави важните обаждания включени.</p>
              <p className="text-gray-800">Тази промяна може да помогне в обикновен ден и да не е подходяща, когато чака спешна новина. Изключението дава информация за условията. Не е необходимо да го превръща в присъда над себе си.</p>
              <h2 className="text-2xl font-medium text-gray-900 mt-10">Един опит в ежедневието</h2>
              <p>Избери един повтарящ се момент и го наблюдавай в няколко обикновени дни. Запиши какво го предхожда, какво искаш да направиш и какво се случва. Кратко описание е достатъчно; не е нужен отчет за всяко действие.</p>
              <p className="text-gray-600">Наблюдението е полезно, когато ти помага да избереш какво да промениш. Ако започне да те кара непрекъснато да следиш и обвиняваш себе си, намали го.</p>
              <p className="text-base"><Link to="/sources" className="underline underline-offset-4">Източници и граници на изводите</Link></p>
            </div>
          </div>



            {/* Navigation */}
            <div className="mt-16 pt-8 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <Link
                  to="/digitalna-gramotnost"
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Icon name="ri-arrow-left-line" size={16} className="mr-2" />
                  Дигитална грамотност
                </Link>
                <Link
                  to="/step-2"
                  className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  Втора степен
                  <Icon name="ri-arrow-right-line" size={16} className="ml-2" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                <Link to="/center" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                  <Icon name="ri-building-line" size={12} />Програми за обучение
                </Link>
                <Link to="/order" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                  <Icon name="ri-book-line" size={12} />Книгата
                </Link>
                <Link to="/analizator" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                  <Icon name="ri-shield-line" size={12} />Анализатор
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

