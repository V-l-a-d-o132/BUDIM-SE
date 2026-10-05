import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function TestimonialsPage() {
  usePageSeo({
    title: 'Отзиви от участници — Център БУДИМ СЕ',
    description: 'Реална обратна връзка от участници и партньори на Център БУДИМ СЕ ще бъде публикувана след провеждането на първите инициативи.',
    canonical: '/testimonials',
    schemaType: 'WebPage',
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 md:pt-32 md:pb-16 md:px-6 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs tracking-[0.25em] text-gray-400 uppercase font-medium">Обратна връзка</span>
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mt-4 mb-6 leading-tight">
            Отзиви от<br />
            <span className="font-medium">участници и партньори</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
            Тази страница ще събере реална обратна връзка от участници и партньори, когато първите
            инициативи на Центъра бъдат проведени.
          </p>
        </div>
      </section>

      {/* Placeholder */}
      <section className="py-16 px-4 md:py-24 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-8 md:p-12 text-center border border-gray-100">
            <div className="w-14 h-14 flex items-center justify-center mx-auto mb-5 rounded-full bg-white border border-gray-100">
              <Icon name="ri-chat-1-line" size={24} className="text-gray-400" />
            </div>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
              Тук ще публикуваме реална обратна връзка от участници и партньори след провеждането
              на първите инициативи. Няма да използваме примерни или измислени препоръки.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 md:py-20 md:px-6 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Искате да работите с Центъра?
          </h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto leading-relaxed">
            Всяко партньорство е индивидуално. Свържете се с нас и ще обсъдим
            как рамката „Петте степени" може да работи за вашия контекст.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/center"
              className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap text-sm font-medium"
            >
              Виж програмите
              <Icon name="ri-arrow-right-line" size={16} className="ml-2" />
            </Link>
            <Link
              to="/step-1"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-200 text-gray-700 rounded-md hover:border-gray-900 transition-colors whitespace-nowrap text-sm"
            >
              <Icon name="ri-map-pin-line" size={16} className="mr-2" />
              Рамката „Петте степени"
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-200 text-gray-700 rounded-md hover:border-gray-900 transition-colors whitespace-nowrap text-sm"
            >
              <Icon name="ri-mail-line" size={16} className="mr-2" />
              Свържете се
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}