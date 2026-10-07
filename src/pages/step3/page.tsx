import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Breadcrumb from '@/components/feature/Breadcrumb';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function Step3() {
  usePageSeo({
    title: 'Степен 3: Да опиташ промяна | БУДИМ СЕ',
    description: 'Трета степен: избор на малка промяна, запазване на полезните функции и преглед на резултата. Без универсален режим или обещан срок.',
    canonical: '/step-3',
    keywords: 'медийна грамотност, дигитални навици, внимание, Петте степени, Будим се',
    ogType: 'article',
    schemaType: 'Article',
    schemaExtra: {
      headline: 'Степен 3: Да опиташ промяна',
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
    ogImage: 'https://readdy.ai/api/search-image?query=human%20hand%20resisting%20reaching%20for%20smartphone%20placed%20face%20down%20on%20wooden%20table%2C%20tension%20and%20willpower%20concept%2C%20minimalist%20composition%20with%20clean%20white%20background%2C%20dramatic%20side%20lighting%20casting%20sharp%20shadows%2C%20metaphor%20for%20digital%20detox%20and%20building%20pause%20muscle%2C%20black%20and%20white%20photography%20style&width=1200&height=630&seq=step3-og-v1&orientation=landscape',
    breadcrumbs: [
      { name: 'БУДИМ СЕ', url: '/' },
      { name: 'Петте степени', url: '/#steps' },
      { name: 'Степен 3 — Да опиташ промяна', url: '/step-3' },
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
              { name: 'Степен 3 — Да опиташ промяна' },
            ]}
          />
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl font-light text-gray-300 mb-4">03</div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Да опиташ промяна</h1>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Един ограничен опит, съобразен с твоя ден.
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
              <p className="font-medium text-xl text-gray-900">Можеш да разбираш един навик и пак вечерта да отвориш същото приложение. Намерението трябва да намери място в конкретния ден: къде стои телефонът, как си почиваш и за кого е необходимо да останеш достъпен.</p>
              <p className="text-gray-800">За начало избери една трудност. Ако видеата редовно отлагат съня, промяната може да засяга вечерното гледане. Не е нужно да се отказваш и от картите, банковото приложение или разговорите с близки.</p>
              <p className="text-gray-800">В условния пример Пенка гледа предварително избрано видео извън леглото и после оставя телефона да се зарежда. Важните обаждания остават включени. След седмица проверява часа на лягане и дали е доволна от почивката си.</p>
              <p className="text-gray-800">В някои вечери това помага. В друга тя продължава да разглежда от компютъра. Тогава въпросът е какво още търси: компания, занимание, отлагане или почивка. Преместването на устройството не може само да отговори на всички тези нужди.</p>
              <p className="text-gray-800">Скуката и неспокойствието могат да се появят, но не са задължителен етап или доказателство за абстиненция. Можеш да опиташ разговор, движение или друго занимание. Не е нужно да издържаш определен брой минути, за да получиш обещан мозъчен „рестарт“.</p>
              <p className="text-gray-800">Полезният опит допуска изключения и поправка. Ако създава повече неудобства, отколкото полза, промени условията или избери друга намеса.</p>
              <h2 className="text-2xl font-medium text-gray-900 mt-10">Един опит в ежедневието</h2>
              <p>Опиши какво ще пробваш, кои функции ще запазиш и кога ще прегледаш резултата. Избери един показател, близък до целта: час на лягане, прекъсвания на задача или усещане след избрана почивка.</p>
              <p className="text-gray-600">Прегледът не е изпит по дисциплина. Той показва дали конкретното решение ти помага при конкретни условия.</p>
              <p className="text-base"><Link to="/sources" className="underline underline-offset-4">Източници и граници на изводите</Link></p>
            </div>
          </div>



          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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

