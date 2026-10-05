import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Breadcrumb from '@/components/feature/Breadcrumb';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function Step3() {
  usePageSeo({
    title: 'Степен 3: Когнитивна свобода | БУДИМ СЕ',
    description: 'Третата степен от авторската рамка „Петте степени" — Когнитивна свобода. Прекъсване на автоматичните цикли и изграждане на структурно триене.',
    canonical: '/step-3',
    keywords: 'медийна грамотност, дигитална грамотност, инхибиторен контрол, дигитална абстиненция, Default Mode Network, БУДИМ СЕ, когнитивна свобода',
    ogType: 'article',
    schemaType: 'Article',
    schemaExtra: {
      headline: 'Степен 3: Когнитивна свобода',
      author: {
        '@type': 'Person',
        name: 'Владимир Атанасов',
        url: 'https://budimse.online/author',
      },
      datePublished: '2026-04-18',
      dateModified: '2026-04-28',
      keywords: 'медийна грамотност, дигитална грамотност, инхибиторен контрол, дигитална абстиненция, БУДИМ СЕ',
      articleSection: 'Рамка',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '.font-medium'],
      },
      mentions: [
        { '@type': 'Thing', name: 'Инхибиторен контрол' },
        { '@type': 'Thing', name: 'Default Mode Network' },
        { '@type': 'Thing', name: 'Дигитална абстиненция' },
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
    ogImage: 'https://readdy.ai/api/search-image?query=human%20hand%20resisting%20reaching%20for%20smartphone%20placed%20face%20down%20on%20wooden%20table%2C%20tension%20and%20willpower%20concept%2C%20minimalist%20composition%20with%20clean%20white%20background%2C%20dramatic%20side%20lighting%20casting%20sharp%20shadows%2C%20metaphor%20for%20digital%20detox%20and%20building%20pause%20muscle%2C%20black%20and%20white%20photography%20style&width=1200&height=630&seq=step3-og-v1&orientation=landscape',
    breadcrumbs: [
      { name: 'БУДИМ СЕ', url: '/' },
      { name: 'Петте степени', url: '/#steps' },
      { name: 'Степен 3 — Когнитивна свобода', url: '/step-3' },
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
              { name: 'Степен 3 — Когнитивна свобода' },
            ]}
          />
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl font-light text-gray-300 mb-4">03</div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Когнитивна свобода
            </h1>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Прекъсване на автоматичните цикли и изграждане на структурно триене.
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
                Идва момент, в който мнозина решават да оставят телефона в другата стая. Звучи просто — на практика често не е.
              </p>

              <p>
                При много хора се появява реален дискомфорт, включително усещане за „фантомни вибрации" — сигнал на нервна система, настроена да очаква известия, които вече не идват. Ръцете търсят нещо да правят, а тишината изведнъж изглежда по-голяма.
              </p>

              <p>
                Това прилича на абстиненция, защото нервната система изпитва отнемане на хроничен стимул. Импулсът да се провери устройството „само за секунда" е истински и не е повод за срам — той е очаквана част от процеса.
              </p>

              <p>
                Тук се учи нещо фундаментално: да не се бяга от скуката. Скуката е неудобна, защото е пространство без стимул — и мозъкът, свикнал всеки вакуум да се запълва незабавно, се съпротивлява.
              </p>

              <p>
                Но именно в този вакуум се случва нещо важно. Част от изследванията сочат, че периодите без стимул могат да активират системите за размисъл и обработка на паметта. Скуката не е провал. Тя е част от процеса. Мозъкът ти се нуждае от нея, за да обработи всичко, което е преживял.
              </p>

              <p>
                Всяка минута, в която човек издържа без да посяга към екрана за успокоение, е тренировъчен акт — изгражда се способността за пауза и съзнателен избор. Точно както всеки друг мускул: чрез повторение и дискомфорт.
              </p>

              <p className="font-medium text-gray-900">
                Тази стъпка често е най-трудната — не поради интензивност, а поради продължителност. Ако се изтрае, се печели нещо рядко: способността да бъдеш сам със себе си, без да е необходимо да бягаш от това.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <Link 
                to="/step-2" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icon name="ri-arrow-left-line" size={16} className="mr-2" />
                Втора степен
              </Link>
              <Link 
                to="/step-4" 
                className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                Четвърта степен
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
              <Link to="/analizator" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                <Icon name="ri-shield-line" size={12} />Анализатор
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
