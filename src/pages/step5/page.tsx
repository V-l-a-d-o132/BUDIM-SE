import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Breadcrumb from '@/components/feature/Breadcrumb';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function Step5() {
  usePageSeo({
    title: 'Степен 5: Съзнателна свобода | БУДИМ СЕ',
    description: 'Петата степен от авторската рамка „Петте степени" — Съзнателна свобода. Преминаване от реактивно към осъзнато използване на технологиите.',
    canonical: '/step-5',
    keywords: 'дигитален суверенитет, когнитивна свобода, медийна грамотност, дигитална грамотност, волево внимание, БУДИМ СЕ, дигитална хигиена',
    ogType: 'article',
    schemaType: 'Article',
    schemaExtra: {
      headline: 'Степен 5: Съзнателна свобода',
      author: {
        '@type': 'Person',
        name: 'Владимир Атанасов',
        url: 'https://budimse.online/author',
      },
      datePublished: '2026-04-18',
      dateModified: '2026-04-28',
      keywords: 'дигитален суверенитет, когнитивна свобода, медийна грамотност, дигитална грамотност, БУДИМ СЕ',
      articleSection: 'Рамка',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '.font-medium'],
      },
      mentions: [
        { '@type': 'Thing', name: 'Дигитален суверенитет' },
        { '@type': 'Thing', name: 'Когнитивна свобода' },
        { '@type': 'Thing', name: 'Волево внимание' },
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
    ogImage: 'https://readdy.ai/api/search-image?query=person%20standing%20confidently%20outdoors%20in%20open%20landscape%2C%20smartphone%20in%20pocket%20not%20in%20hand%2C%20looking%20at%20horizon%20with%20clarity%20and%20freedom%2C%20golden%20hour%20light%2C%20minimalist%20composition%20with%20vast%20sky%2C%20symbolic%20representation%20of%20digital%20sovereignty%20and%20conscious%20freedom%2C%20cinematic%20wide%20shot%20with%20warm%20earth%20tones&width=1200&height=630&seq=step5-og-v1&orientation=landscape',
    breadcrumbs: [
      { name: 'БУДИМ СЕ', url: '/' },
      { name: 'Петте степени', url: '/#steps' },
      { name: 'Степен 5 — Съзнателна свобода', url: '/step-5' },
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
              { name: 'Степен 5 — Съзнателна свобода' },
            ]}
          />
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl font-light text-gray-300 mb-4">05</div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Съзнателна свобода
            </h1>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Преминаване от реактивно към осъзнато използване на технологиите.
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
                Телефонът се връща към функцията, която е разумно да има — инструмент, а не постоянен източник на разсейване.
              </p>

              <p>
                Дигиталният суверенитет не е идеология, нито отказ от технологиите, нито носталгия по аналоговото. Той е по-просто нещо: способността да се използват технологиите, без те да управляват поведението.
              </p>

              <p>
                Човек отново контролира вниманието си: влиза в мрежата с конкретна цел, върши си работата и излиза. Сесиите са кратки, съзнателни, с начало и край — не безкрайни пътешествия в съдържание, което никой не е търсил.
              </p>

              <p>
                Човек действа, вместо да реагира. Системата е оптимизирана за пасивно потребление, а съзнателната употреба е различен режим на поведение.
              </p>

              <p>
                Човекът е тук — в реалния свят, напълно присъстващ. Разговорите имат тежест, времето има текстура, а паметта изгражда история, не само хронология от изображения. Разликата между преживяване, случило се на човек, и преживяване, заснето за другите, става осезаема.
              </p>

              <p>
                Това е стъпката, в която човекът не просто живее — той знае, че живее. И това знание не идва от приложение, нито от съдържание, а от връзка със себе си, която никой екран не може да подмени.
              </p>

              <p className="font-medium text-gray-900">
                Свободата от екрана не е крайна дестинация, а навик — изграден съзнателно, поддържан ежедневно. Но веднъж построен, той е твой.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
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
