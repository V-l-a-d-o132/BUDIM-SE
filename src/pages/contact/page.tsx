import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function ContactPage() {
  usePageSeo({
    title: 'Контакти — Център БУДИМ СЕ | budimse.online',
    description: 'Свържете се с Център БУДИМ СЕ. Имейл: budimseonline@gmail.com. Запитвания за партньорство, медийни контакти и въпроси относно книгата.',
    canonical: '/contact',
    ogImage: 'https://readdy.ai/api/search-image?query=Sofia%20Bulgaria%20city%20street%20urban%20architecture%20warm%20afternoon%20light%20professional%20contact%20page%20visual%20clean%20minimal%20composition%20with%20soft%20bokeh%20background%20representing%20communication%20and%20connection&width=1200&height=630&seq=contact-og-v1&orientation=landscape',
    schemaType: 'ContactPage',
    schemaExtra: {
      mainEntity: {
        '@type': 'Organization',
        name: 'Център БУДИМ СЕ',
        url: 'https://budimse.online',
        email: 'budimseonline@gmail.com',
        contactPoint: [
          {
            '@type': 'ContactPoint',
            email: 'budimseonline@gmail.com',
            contactType: 'customer support',
            availableLanguage: 'Bulgarian',
            areaServed: 'BG',
          },
          {
            '@type': 'ContactPoint',
            email: 'budimseonline@gmail.com',
            contactType: 'sales',
            availableLanguage: 'Bulgarian',
          },
        ],
      },
    },
  });

  const contactMethods = [
    {
      icon: 'ri-mail-line',
      title: 'Имейл',
      value: 'budimseonline@gmail.com',
      href: 'mailto:budimseonline@gmail.com',
      description: 'Отговаряме в рамките на 1–2 работни дни.',
    },
    {
      icon: 'ri-global-line',
      title: 'Уебсайт',
      value: 'budimse.online',
      href: 'https://budimse.online',
      description: 'Основен информационен ресурс.',
    },
  ];

  const topics = [
    { icon: 'ri-school-line', title: 'Образователни програми', desc: 'Запитвания от училища и образователни институции за провеждане на сесии.' },
    { icon: 'ri-building-line', title: 'Корпоративни партньорства', desc: 'Одит на дигиталните навици и протоколи за работна среда.' },
    { icon: 'ri-book-line', title: 'Книгата', desc: 'Въпроси относно поръчка, доставка или съдържание на „Петте степени".' },
    { icon: 'ri-mic-line', title: 'Медийни запитвания', desc: 'Интервюта, коментари и прес-материали — посочете „Медия" в съобщението.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 md:pt-32 md:pb-16 md:px-6">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs tracking-[0.25em] text-gray-400 uppercase font-medium">Контакти</span>
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mt-4 mb-6 leading-tight">
            Свържете се<br />
            <span className="font-medium">с Центъра</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
            За партньорства, медийни запитвания, въпроси относно книгата или програмите —
            използвайте имейл или формата за партньорство на страницата „Центърът".
          </p>
        </div>
      </section>

      {/* Contact methods */}
      <section className="py-8 px-4 md:py-10 md:px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {contactMethods.map((method, i) => (
              <a
                key={i}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex items-start gap-5 border border-gray-100 rounded-lg p-6 hover:border-gray-300 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-md flex-shrink-0 group-hover:bg-gray-100 transition-colors">
                  <Icon name={method.icon} size={18} className="text-gray-700" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-medium">{method.title}</div>
                  <div className="text-base font-medium text-gray-900 mb-1">{method.value}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Topics */}
          <div className="mb-16">
            <h2 className="text-2xl font-light text-gray-900 mb-8">За какво можете да пишете</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {topics.map((topic, i) => (
                <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <Icon name={topic.icon} size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-1">{topic.title}</div>
                    <div className="text-sm text-gray-500 leading-relaxed">{topic.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response time notice */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 flex items-start gap-4 mb-12">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <Icon name="ri-time-line" size={18} className="text-gray-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-1">Очаквано време за отговор</div>
              <div className="text-sm text-gray-500 leading-relaxed">
                Отговаряме на всички запитвания в рамките на <strong className="text-gray-700">1–2 работни дни</strong>.
                За спешни въпроси относно поръчки — посочете номера на поръчката в темата на имейла.
              </div>
            </div>
          </div>

          {/* Internal links — SEO */}
          <div className="border-t border-gray-100 pt-10">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-6 font-medium">Свързани страници</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Дигитална грамотност', link: '/digitalna-gramotnost', icon: 'ri-book-open-line' },
                { label: 'Рамката', link: '/step-1', icon: 'ri-map-pin-line' },
                { label: 'Центърът', link: '/center', icon: 'ri-building-line' },
                { label: 'Книгата', link: '/order', icon: 'ri-book-line' },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.link}
                  className="flex items-center gap-2.5 border border-gray-100 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors group"
                >
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-tight">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
