import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Breadcrumb from '@/components/feature/Breadcrumb';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function Step2() {
  usePageSeo({
    title: 'Степен 2: Да разбереш средата | БУДИМ СЕ',
    description: 'Втора степен: препоръки, известия, бизнес цели и проверка на информацията. Разграничаване на факт, предположение и влияние.',
    canonical: '/step-2',
    keywords: 'медийна грамотност, дигитални навици, внимание, Петте степени, Будим се',
    ogType: 'article',
    schemaType: 'Article',
    schemaExtra: {
      headline: 'Степен 2: Да разбереш средата',
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
    ogImage: 'https://readdy.ai/api/search-image?query=cracked%20glass%20screen%20with%20social%20media%20feed%20visible%20through%20fractures%2C%20emotional%20content%20fragments%20scattered%2C%20exhausted%20human%20silhouette%20reflected%20in%20broken%20digital%20mirror%2C%20minimalist%20conceptual%20art%2C%20dark%20background%20with%20sharp%20white%20cracks%2C%20metaphor%20for%20algorithmic%20trap%20and%20cognitive%20exhaustion&width=1200&height=630&seq=step2-og-v1&orientation=landscape',
    breadcrumbs: [
      { name: 'БУДИМ СЕ', url: '/' },
      { name: 'Петте степени', url: '/#steps' },
      { name: 'Степен 2 — Да разбереш средата', url: '/step-2' },
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
              { name: 'Степен 2 — Да разбереш средата' },
            ]}
          />
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl font-light text-gray-300 mb-4">02</div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Да разбереш средата</h1>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Как се подбират предложенията и какво можем да проверим?
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
              <p className="font-medium text-xl text-gray-900">Отваряш приложение за рецепта и след време четеш за нещо съвсем различно. Може да е полезно откритие. Може да е спор, в който не си искал да участваш. Втората степен разглежда как са подредени предложенията между първото търсене и мястото, до което си стигнал.</p>
              <p className="text-gray-800">Различните услуги използват различни системи. Те могат да отчитат какво гледаш, подминаваш, следваш или споделяш. От тези сигнали правят предположения за следващото предложение. Това не им дава пълен достъп до мислите и нуждите ти.</p>
              <p className="text-gray-800">Много платформи имат търговски интерес да се връщаме често и да оставаме по-дълго. Известията и автоматичното пускане могат да улеснят използването, но и да удължат престоя. Доколко това е проблем зависи от съдържанието, човека и ситуацията.</p>
              <p className="text-gray-800">В условния пример Пенка разглежда рецепти. Ако задържи вниманието си върху спор за храненето, може да получи още подобни материали. От това не следва, че непременно ще приеме позицията им. Тя може да провери източника, да подмине предложението или да потърси друга гледна точка.</p>
              <p className="text-gray-800">При силно твърдение провери кой го прави, какво точно е изследвано и дали други публикации повтарят един и същ първоизточник. Заглавие, което предизвиква гняв, не е доказателство нито за истинност, нито за измама.</p>
              <p className="text-gray-800">В книгата случаят с Meta през 2026 г. е представен като споразумение за пакет до 17,1 млрд. долара, с условия и плащания във времето. Това е различно от еднократна глоба, изплатена изцяло през годината. Размерът на сумата не доказва еднакъв ефект върху всички потребители. Официалните документи са посочени на страницата с източници.</p>
              <h2 className="text-2xl font-medium text-gray-900 mt-10">Един опит в ежедневието</h2>
              <p>Избери едно предложение или една новина. Отдели факта от тълкуването, намери първоизточника и запиши какво още не знаеш. После реши дали материалът заслужава вниманието или споделянето ти.</p>
              <p className="text-gray-600">Критичният прочит важи и за тази страница. Полезното обяснение трябва да допуска проверка и поправка.</p>
              <p className="text-base"><Link to="/sources" className="underline underline-offset-4">Източници и граници на изводите</Link></p>
            </div>
          </div>



          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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

