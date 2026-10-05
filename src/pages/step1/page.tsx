import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Breadcrumb from '@/components/feature/Breadcrumb';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function Step1() {
  usePageSeo({
    title: 'Степен 1: Биологичният автоматизъм | БУДИМ СЕ',
    description: 'Първата степен от авторската рамка „Петте степени" — Биологичният автоматизъм. Разпознаване на Автопилота и автоматичните реакции, преди да се превърнат в навик.',
    canonical: '/step-1',
    keywords: 'медийна грамотност, дигитална грамотност, дигитален суверенитет, поведенчески дизайн, алгоритмично влияние, БУДИМ СЕ, когнитивна свобода',
    ogType: 'article',
    schemaType: 'Article',
    schemaExtra: {
      headline: 'Степен 1: Биологичният автоматизъм',
      author: {
        '@type': 'Person',
        name: 'Владимир Атанасов',
        url: 'https://budimse.online/author',
      },
      datePublished: '2026-04-18',
      dateModified: '2026-04-28',
      keywords: 'медийна грамотност, дигитална грамотност, дигитален суверенитет, поведенчески дизайн, БУДИМ СЕ',
      articleSection: 'Рамка',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '.font-medium'],
      },
      mentions: [
        { '@type': 'Thing', name: 'Поведенчески дизайн' },
        { '@type': 'Thing', name: 'Attention Economy' },
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
    ogImage: 'https://readdy.ai/api/search-image?query=person%20staring%20at%20glowing%20smartphone%20screen%20in%20dark%20room%2C%20blue%20light%20illuminating%20face%2C%20surrounded%20by%20floating%20notification%20icons%20and%20algorithm%20symbols%2C%20minimalist%20digital%20art%2C%20high%20contrast%20black%20and%20white%20with%20subtle%20blue%20tones%2C%20conceptual%20illustration%20about%20digital%20addiction%20and%20passive%20consumption&width=1200&height=630&seq=step1-og-v1&orientation=landscape',
    breadcrumbs: [
      { name: 'БУДИМ СЕ', url: '/' },
      { name: 'Петте степени', url: '/#steps' },
      { name: 'Степен 1 — Биологичният автоматизъм', url: '/step-1' },
    ],
  });

  return (
    <>
      {/* Enhanced Minimalist Background Elements - Fixed Position */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Primary angular geometric shapes */}
        <div className="absolute top-20 left-10 w-1 h-32 bg-gray-200 rotate-12 opacity-40"></div>
        <div className="absolute top-40 right-20 w-24 h-1 bg-gray-200 opacity-30"></div>
        <div className="absolute bottom-40 left-1/4 w-1 h-20 bg-gray-200 -rotate-45 opacity-35"></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-1 bg-gray-200 rotate-45 opacity-25"></div>
        
        {/* Additional angular lines */}
        <div className="absolute top-60 left-1/3 w-1 h-16 bg-gray-200 rotate-30 opacity-30"></div>
        <div className="absolute bottom-60 right-1/4 w-20 h-1 bg-gray-200 -rotate-30 opacity-25"></div>
        <div className="absolute top-1/4 left-2/3 w-1 h-12 bg-gray-200 rotate-60 opacity-35"></div>
        <div className="absolute bottom-1/3 left-1/6 w-14 h-1 bg-gray-200 rotate-15 opacity-30"></div>
        
        {/* Corner elements */}
        <div className="absolute top-16 right-16 w-8 h-8 border-l border-t border-gray-200 opacity-25"></div>
        <div className="absolute bottom-16 left-16 w-6 h-6 border-r border-b border-gray-200 opacity-30"></div>
        <div className="absolute top-1/2 left-8 w-4 h-4 border-t border-r border-gray-200 opacity-35 rotate-45"></div>
        <div className="absolute top-3/4 right-8 w-5 h-5 border-l border-b border-gray-200 opacity-25 -rotate-12"></div>
        
        {/* Subtle triangular shapes */}
        <div className="absolute top-32 left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-6 border-transparent border-b-gray-200 opacity-20"></div>
        <div className="absolute bottom-32 right-1/3 w-0 h-0 border-l-3 border-r-3 border-t-5 border-transparent border-t-gray-200 opacity-25"></div>
        
        {/* Subtle circles */}
        <div className="absolute top-32 right-10 w-2 h-2 rounded-full bg-gray-200 opacity-30"></div>
        <div className="absolute bottom-32 left-16 w-1 h-1 rounded-full bg-gray-200 opacity-40"></div>
        <div className="absolute top-2/3 left-1/2 w-1.5 h-1.5 rounded-full bg-gray-200 opacity-25"></div>
        
        {/* Diagonal corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16">
          <div className="absolute top-4 left-4 w-8 h-1 bg-gray-200 opacity-20 rotate-45"></div>
          <div className="absolute top-6 left-2 w-1 h-8 bg-gray-200 opacity-20 rotate-45"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16">
          <div className="absolute bottom-4 right-4 w-8 h-1 bg-gray-200 opacity-20 -rotate-45"></div>
          <div className="absolute bottom-6 right-2 w-1 h-8 bg-gray-200 opacity-20 -rotate-45"></div>
        </div>
        
        {/* Minimal grid pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-8">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-gray-200 last:border-r-0"></div>
            ))}
          </div>
        </div>
        
        {/* Additional geometric accents */}
        <div className="absolute top-1/5 right-1/5 w-3 h-3 border border-gray-200 opacity-25 rotate-45"></div>
        <div className="absolute bottom-1/5 left-1/5 w-2 h-2 border border-gray-200 opacity-30 rotate-12"></div>
        <div className="absolute top-3/5 left-3/4 w-4 h-1 bg-gray-200 opacity-20 rotate-75"></div>
        <div className="absolute bottom-2/5 right-2/3 w-1 h-6 bg-gray-200 opacity-25 -rotate-20"></div>
        
        {/* New enhanced angular elements */}
        <div className="absolute top-10 left-1/2 w-12 h-1 bg-gray-200 opacity-30 rotate-30"></div>
        <div className="absolute bottom-10 right-1/2 w-1 h-12 bg-gray-200 opacity-25 -rotate-30"></div>
        <div className="absolute top-1/6 left-1/4 w-8 h-8 border-l-2 border-t-2 border-gray-200 opacity-20 rotate-45"></div>
        <div className="absolute bottom-1/6 right-1/4 w-6 h-6 border-r-2 border-b-2 border-gray-200 opacity-25 -rotate-45"></div>
        
        {/* Intersecting lines */}
        <div className="absolute top-1/4 right-10 w-16 h-1 bg-gray-200 opacity-15 rotate-60"></div>
        <div className="absolute top-1/4 right-10 w-1 h-16 bg-gray-200 opacity-15 rotate-30"></div>
        <div className="absolute bottom-1/4 left-10 w-12 h-1 bg-gray-200 opacity-20 -rotate-60"></div>
        <div className="absolute bottom-1/4 left-10 w-1 h-12 bg-gray-200 opacity-20 -rotate-30"></div>
        
        {/* Scattered geometric dots */}
        <div className="absolute top-1/8 left-3/4 w-1 h-1 bg-gray-200 opacity-40 rotate-45"></div>
        <div className="absolute top-3/8 right-1/8 w-1 h-1 bg-gray-200 opacity-35 rotate-45"></div>
        <div className="absolute bottom-1/8 right-3/4 w-1 h-1 bg-gray-200 opacity-30 rotate-45"></div>
        <div className="absolute bottom-3/8 left-1/8 w-1 h-1 bg-gray-200 opacity-35 rotate-45"></div>
        
        {/* Angular brackets */}
        <div className="absolute top-1/3 left-1/8 w-4 h-4">
          <div className="absolute top-0 left-0 w-2 h-1 bg-gray-200 opacity-25"></div>
          <div className="absolute top-0 left-0 w-1 h-2 bg-gray-200 opacity-25"></div>
        </div>
        <div className="absolute bottom-1/3 right-1/8 w-4 h-4">
          <div className="absolute bottom-0 right-0 w-2 h-1 bg-gray-200 opacity-25"></div>
          <div className="absolute bottom-0 right-0 w-1 h-2 bg-gray-200 opacity-25"></div>
        </div>
        
        {/* Subtle cross patterns */}
        <div className="absolute top-2/5 left-1/5 w-3 h-1 bg-gray-200 opacity-20 rotate-45"></div>
        <div className="absolute top-2/5 left-1/5 w-1 h-3 bg-gray-200 opacity-20 rotate-45"></div>
        <div className="absolute bottom-2/5 right-1/5 w-3 h-1 bg-gray-200 opacity-20 -rotate-45"></div>
        <div className="absolute bottom-2/5 right-1/5 w-1 h-3 bg-gray-200 opacity-20 -rotate-45"></div>
      </div>

      <div className="min-h-screen bg-white relative z-10">
        <Navbar />

        {/* Content */}
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb
              className="mb-8"
              items={[
                { name: 'БУДИМ СЕ', url: '/' },
                { name: 'Петте степени', url: '/#steps' },
                { name: 'Степен 1 — Биологичният автоматизъм' },
              ]}
            />
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl font-light text-gray-300 mb-4">01</div>
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
                Биологичният автоматизъм
              </h1>
              <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Разпознаване на Автопилота и автоматичните реакции.
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
                  Първото движение към екрана сутрин често не е съзнателно решение, а навик, изпълнен автоматично.
                </p>

                <p>
                  В това състояние човек може да функционира по-скоро като приемник на съдържание, отколкото като активен участник. Вниманието се разпределя на къси интервали, всеки от които е запълнен с приоритети, които не са наши собствени.
                </p>

                <p>
                  Мнозина откриват, че реагират на известия с чувство за спешност, което не отговаря на реалната им важност. Това усещане се поддържа от дизайна — червеният индикатор, звукът, вибрацията. Тези сигнали са проектирани да задействат тревожната реакция, защото тревожността удължава времето, прекарано в платформата.
                </p>

                <p>
                  В когнитивната наука това се описва като системно отвличане на вниманието — не просто разсейване, а постепенно изграждане на навици, които изключват доброволната концентрация. Нервната система, свикнала с непрекъснат поток от стимули, може да загуби комфорта с тишината. Тишината започва да изглежда неудобно. Почти застрашаваща.
                </p>

                <p>
                  Паметта може да се фрагментира не от биологични причини, а от поведенчески навик. При много хора изборите все по-рядко произтичат от собствените им ценности и намерения, а от алгоритми, тенденции и социално одобрение. Това не е морална присъда, а описание на система, в която мнозина попадат без съзнателно решение.
                </p>

                <p>
                  Системата е добре проектирана — по-добре, отколкото обичайно признаваме. Разпознаването на механизма е първата стъпка: когато виждаш стимула като стимул, той губи част от властта си над поведението.
                </p>

                <p className="font-medium text-gray-900">
                  Тази степен не е диагноза, а отправна точка. Да разпознаеш механизма означава, че вече не си изцяло в неговата власт.
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-16 pt-8 border-t border-gray-100">
              <div className="flex justify-between items-center mb-6">
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
