import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Breadcrumb from '@/components/feature/Breadcrumb';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function Step4() {
  usePageSeo({
    title: 'Степен 4: Да върнеш място за живота | БУДИМ СЕ',
    description: 'Четвърта степен: място за четене, работа, разговори и почивка. Примери и упражнения, съобразени с времето и нуждите ти.',
    canonical: '/step-4',
    keywords: 'медийна грамотност, дигитални навици, внимание, Петте степени, Будим се',
    ogType: 'article',
    schemaType: 'Article',
    schemaExtra: {
      headline: 'Степен 4: Да върнеш място за живота',
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
    ogImage: 'https://readdy.ai/api/search-image?query=person%20reading%20physical%20book%20in%20calm%20sunlit%20room%2C%20focused%20and%20present%2C%20no%20screens%20visible%2C%20warm%20natural%20light%20streaming%20through%20window%2C%20plants%20and%20simple%20wooden%20furniture%2C%20peaceful%20atmosphere%20representing%20restored%20focus%20and%20neuroplasticity%2C%20minimalist%20interior%20photography%20style%20with%20soft%20warm%20tones&width=1200&height=630&seq=step4-og-v1&orientation=landscape',
    breadcrumbs: [
      { name: 'БУДИМ СЕ', url: '/' },
      { name: 'Петте степени', url: '/#steps' },
      { name: 'Степен 4 — Да върнеш място за живота', url: '/step-4' },
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
              { name: 'Степен 4 — Да върнеш място за живота' },
            ]}
          />
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl font-light text-gray-300 mb-4">04</div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Да върнеш място за живота</h1>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              За какво искаш повече време и внимание?
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
              <p className="font-medium text-xl text-gray-900">Да оставиш телефона освобождава ръката. Не подрежда автоматично деня. Може да си намалил едно занимание, без още да е станало по-лесно да се обърнеш към друго.</p>
              <p className="text-gray-800">Четвъртата степен е за онова, за което искаш място: книга, разговор, работа, движение или почивка. Няма задължителен списък от достойни дейности. Една по-спокойна вечер у дома е достатъчно ясна цел.</p>
              <p className="text-gray-800">В условния пример Ива иска отново да чете. Вместо да си поставя голям дневен обем, започва с кратък текст и час, в който обичайно има сили. Понякога я прекъсват. Понякога открива, че книгата не ѝ е интересна. Тези случаи изискват различни решения.</p>
              <p className="text-gray-800">За неясна работна задача може да помогне първо да уточниш следващото действие. За разговор — да обсъдиш какви прекъсвания са приемливи и кои обаждания са важни. Слабият резултат не трябва веднага да се обяснява с телефона.</p>
              <p className="text-gray-800">Ако се грижиш за друг човек или работиш на дежурства, границата може да е кратка и да допуска достъпност. Малкото време, което действително имаш, не е по-малко ценно от чуждия идеален режим.</p>
              <p className="text-gray-800">Можеш да използваш екран и за избрана почивка. Филм, игра или разговор през видео могат да бъдат част от живота, към който се връщаш. Въпросът е дали заниманието служи на намерението ти и как се чувстваш след него.</p>
              <h2 className="text-2xl font-medium text-gray-900 mt-10">Един опит в ежедневието</h2>
              <p>Избери едно занимание, което искаш да стане по-достъпно. Какво го затруднява освен телефона? Подготви най-малката възможна следваща стъпка и остави място да промениш плана.</p>
              <p className="text-gray-600">Почивката няма задължение да произвежда резултат. Промяната е ценна и когато просто оставя повече сили за избраното от теб.</p>
              <p className="text-base"><Link to="/sources" className="underline underline-offset-4">Източници и граници на изводите</Link></p>
            </div>
          </div>



          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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

