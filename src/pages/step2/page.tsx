import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Breadcrumb from '@/components/feature/Breadcrumb';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function Step2() {
  usePageSeo({
    title: 'Степен 2: Алгоритмичният прицел | БУДИМ СЕ',
    description: 'Втората степен от авторската рамка „Петте степени" — Алгоритмичният прицел. Разбиране на емоционалната възбуда, препоръките и икономиката на вниманието.',
    canonical: '/step-2',
    keywords: 'медийна грамотност, дигитална грамотност, когнитивно изтощение, email апнея, дигитални навици, БУДИМ СЕ, алгоритмично влияние',
    ogType: 'article',
    schemaType: 'Article',
    schemaExtra: {
      headline: 'Степен 2: Алгоритмичният прицел',
      author: {
        '@type': 'Person',
        name: 'Владимир Атанасов',
        url: 'https://budimse.online/author',
      },
      datePublished: '2026-04-18',
      dateModified: '2026-04-28',
      keywords: 'медийна грамотност, дигитална грамотност, когнитивно изтощение, email апнея, БУДИМ СЕ',
      articleSection: 'Рамка',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '.font-medium'],
      },
      mentions: [
        { '@type': 'Person', name: 'Линда Стоун', description: 'Изследовател, въвела термина email апнея' },
        { '@type': 'Thing', name: 'Email апнея' },
        { '@type': 'Thing', name: 'Когнитивно изтощение' },
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
    ogImage: 'https://readdy.ai/api/search-image?query=cracked%20glass%20screen%20with%20social%20media%20feed%20visible%20through%20fractures%2C%20emotional%20content%20fragments%20scattered%2C%20exhausted%20human%20silhouette%20reflected%20in%20broken%20digital%20mirror%2C%20minimalist%20conceptual%20art%2C%20dark%20background%20with%20sharp%20white%20cracks%2C%20metaphor%20for%20algorithmic%20trap%20and%20cognitive%20exhaustion&width=1200&height=630&seq=step2-og-v1&orientation=landscape',
    breadcrumbs: [
      { name: 'БУДИМ СЕ', url: '/' },
      { name: 'Петте степени', url: '/#steps' },
      { name: 'Степен 2 — Алгоритмичният прицел', url: '/step-2' },
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
              { name: 'Степен 2 — Алгоритмичният прицел' },
            ]}
          />
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl font-light text-gray-300 mb-4">02</div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Алгоритмичният прицел
            </h1>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Емоционалната възбуда, препоръките и икономиката на вниманието.
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
                При много хора се появява умора, която не е свързана с физическо усилие. Част от платформите са проектирани да държат вниманието колкото е възможно по-дълго.
              </p>

              <p>
                Мрежата често показва съдържание, което предизвиква страх, ядосване или възмущение — защото тези емоции задържат погледа най-дълго. Това не е случайност, а избор на дизайна. Системата разпознава кои съдържания предизвикват по-силна реакция — и ги предоставя непрекъснато.
              </p>

              <p>
                Губиш енергия в стотици малки решения дневно: да кликна ли, да отговоря ли, да споделя ли. Част от изследванията сочат, че тези решения изразходват ограничен ресурс на вниманието. При много хора се наблюдава, че до края на деня остават по-малко сили за нещата, които наистина имат значение.
              </p>

              <p>
                При много хора се наблюдава, че дигиталното потребление не води до по-добро разбиране, а до изтощение. Напускаме мрежата не по-информирани, а с усещане за загубено време и трудно назовавано раздразнение.
              </p>

              <p>
                Осъзнаването на това разминаване — между начина, по който прекарваме времето, и начина, по който искаме да го прекарваме — е неприятно, но необходимо. Без него промяната трудно би дошла.
              </p>

              <p>
                Изследователката Линда Стоун нарече едно от симптомите „имейл апнея" — несъзнателно задържане на дъха пред екрана. Малък физически сигнал за хронично напрежение. Тялото знае преди ума да е признал.
              </p>

              <p className="font-medium text-gray-900">
                Тази умора не е слабост, а сигнал. И най-важното, което може да се направи с нея, е да не бъде заглушена с още едно скролване.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <Link 
                to="/step-1" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icon name="ri-arrow-left-line" size={16} className="mr-2" />
                Първа степен
              </Link>
              <Link 
                to="/step-3" 
                className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                Трета степен
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
