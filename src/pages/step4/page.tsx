import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Breadcrumb from '@/components/feature/Breadcrumb';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function Step4() {
  usePageSeo({
    title: 'Степен 4: Завръщане и реинтеграция | БУДИМ СЕ',
    description: 'Четвъртата степен от авторската рамка „Петте степени" — Завръщане и реинтеграция. Възстановяване на линейния фокус, сетивното присъствие и живия контакт.',
    canonical: '/step-4',
    keywords: 'медийна грамотност, дигитална грамотност, невропластичност, префронтален кортекс, Система 2, Канеман, БУДИМ СЕ, когнитивна свобода',
    ogType: 'article',
    schemaType: 'Article',
    schemaExtra: {
      headline: 'Степен 4: Завръщане и реинтеграция',
      author: {
        '@type': 'Person',
        name: 'Владимир Атанасов',
        url: 'https://budimse.online/author',
      },
      datePublished: '2026-04-18',
      dateModified: '2026-04-28',
      keywords: 'медийна грамотност, дигитална грамотност, невропластичност, Система 2, БУДИМ СЕ',
      articleSection: 'Рамка',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '.font-medium'],
      },
      mentions: [
        { '@type': 'Person', name: 'Даниел Канеман', description: 'Психолог, автор на концепцията Система 1 и Система 2' },
        { '@type': 'Thing', name: 'Невропластичност' },
        { '@type': 'Thing', name: 'Префронтален кортекс' },
        { '@type': 'Thing', name: 'Медийна грамотност', sameAs: 'https://budimse.online/digitalna-gramotnost' },
      ],
      isPartOf: {
        '@type': 'Book',
        name: 'Петте степени',
        author: { '@type': 'Person', name: 'Владимир Атанасов' },
        publisher: { '@type': 'Organization', name: 'БУДИМ СЕ' },
        url: 'https://budimse.online/order',
      },
    },
    ogImage: 'https://readdy.ai/api/search-image?query=person%20reading%20physical%20book%20in%20calm%20sunlit%20room%2C%20focused%20and%20present%2C%20no%20screens%20visible%2C%20warm%20natural%20light%20streaming%20through%20window%2C%20plants%20and%20simple%20wooden%20furniture%2C%20peaceful%20atmosphere%20representing%20restored%20focus%20and%20neuroplasticity%2C%20minimalist%20interior%20photography%20style%20with%20soft%20warm%20tones&width=1200&height=630&seq=step4-og-v1&orientation=landscape',
    breadcrumbs: [
      { name: 'БУДИМ СЕ', url: '/' },
      { name: 'Петте степени', url: '/#steps' },
      { name: 'Степен 4 — Завръщане и реинтеграция', url: '/step-4' },
    ],
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb
            className="mb-8"
            items={[
              { name: 'БУДИМ СЕ', url: '/' },
              { name: 'Петте степени', url: '/#steps' },
              { name: 'Степен 4 — Завръщане и реинтеграция' },
            ]}
          />
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl font-light text-gray-300 mb-4">04</div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Завръщане и реинтеграция
            </h1>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Възстановяване на линейния фокус, сетивното присъствие и живия контакт.
            </p>
          </div>

          {/* Рамков дисклеймър */}
          <div className="max-w-3xl mx-auto mb-12 bg-gray-50 border border-gray-100 rounded-lg p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="ri-information-line" size={16} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                „Петте степени" е авторска рамка за разбиране на вниманието, навиците и
                взаимодействието с дигиталната среда. Тя използва идеи, метафори и практически
                подходи, вдъхновени от медийната грамотност, когнитивната психология,
                поведенческия дизайн и невронауката. Не представлява медицинска, психологическа
                или терапевтична методика.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 leading-relaxed space-y-6 text-lg">
              <p className="font-medium text-xl text-gray-900">
                Мозъкът постепенно се възстановява от претоварването — не мигновено, а стъпка по стъпка.
              </p>

              <p>
                В някой обичаен ден мнозина забелязват, че са прочели двадесет страници от книга, без да усетят нужда да проверят телефона. Това изглежда дребно, но е показателен сигнал за възстановяващ се фокус.
              </p>

              <p>
                Част от изследванията сочат, че намалената дигитална стимулация за период от няколко седмици може да допринесе за подобрения в концентрацията и способността за дълбоко мислене. Точните срокове варират — тенденцията често се повтаря. Мозъкът е способен да се промени, ако му дадеш условие за това.
              </p>

              <p>
                Скуката вече не напряга — тя се трансформира в пространство. Пространство, в което се появяват собствени, оригинални мисли: не препредадени мнения, не реакции на чуждо съдържание, а идеи, родени от собствен размисъл, без алгоритъм, който да ги е поставил там.
              </p>

              <p>
                При много хора се забелязва разликата между мнение, формирано от личен размисъл, и мнение, наложено от социалния поток. Разликата става осезаема, когато има пространство за сравнение.
              </p>

              <p>
                Технологиите не са изчезнали от живота ти. Но са заели ново място — инструмент, използван с намерение, а не навик, търсен без причина. Влизаш в мрежата с цел. Вършиш работата. Излизаш. Сесиите са кратки и конкретни. Ти определяш кога и защо.
              </p>

              <p className="font-medium text-gray-900">
                Тази стъпка е възстановяване — не на тяло, а на внимание. И вниманието, върнато обратно, е може би най-ценният ресурс, с който разполагаме.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <Link 
                to="/step-3" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icon name="ri-arrow-left-line" size={16} className="mr-2" />
                Трета степен
              </Link>
              <Link 
                to="/step-5" 
                className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                Пета степен
                <Icon name="ri-arrow-right-line" size={16} className="ml-2" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
              <Link to="/digitalna-gramotnost" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                <Icon name="ri-book-open-line" size={12} />Дигитална грамотност
              </Link>
              <Link to="/sources" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                <Icon name="ri-flask-line" size={12} />Научни източници
              </Link>
              <Link to="/order" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                <Icon name="ri-book-line" size={12} />Книгата
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
