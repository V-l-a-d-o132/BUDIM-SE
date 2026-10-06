import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function PrivacyPage() {
  usePageSeo({
    title: 'Политика за поверителност — Център БУДИМ СЕ',
    description: 'Политика за поверителност на Център БУДИМ СЕ. Как събираме, използваме и защитаваме вашите лични данни съгласно GDPR.',
    canonical: '/privacy',
    schemaType: 'WebPage',
  });

  const lastUpdated = '19 април 2026 г.';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-8 px-6">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs tracking-[0.25em] text-gray-400 uppercase font-medium">Правна информация</span>
          <h1 className="text-4xl font-light text-gray-900 mt-4 mb-3 leading-tight">
            Политика за поверителност
          </h1>
          <p className="text-sm text-gray-400">Последна актуализация: {lastUpdated}</p>
        </div>
      </section>

      <section className="py-10 px-6">
        <div className="max-w-3xl mx-auto space-y-10 text-gray-700 leading-relaxed">

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Администратор на лични данни</h2>
            <p>
              Администратор на личните данни, събирани чрез уебсайта <strong>budimse.online</strong>, е:
            </p>
            <div className="mt-4 bg-gray-50 border border-gray-100 rounded-lg p-5 text-sm space-y-1">
              <p><strong>Център БУДИМ СЕ</strong></p>
              <p>Имейл: <a href="mailto:budimseonline@gmail.com" className="text-gray-900 underline">budimseonline@gmail.com</a></p>
              <p>Уебсайт: <a href="https://budimse.online" className="text-gray-900 underline">budimse.online</a></p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Какви данни събираме</h2>
            <p className="mb-3">Събираме следните категории лични данни:</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Данни от форми за контакт:</strong> Наименование на организация, вид организация, имейл адрес и съобщение — при изпращане на запитване за партньорство.</li>
              <li><strong>Данни от поръчки:</strong> Издание, количество, сума в EUR, статус на плащането, възстановявания и идентификатори на поръчката в Stripe. След потвърдено плащане се записват имейл и предоставено име; за физическата книга — също телефон, адрес, куриер и товарителница. За електронното издание се записват избраната версия, искането за незабавен достъп и издаването на линкове за изтегляне.</li>
              <li><strong>Личен достъп до поръчка:</strong> В браузъра се пази необходим за покупката ключ за достъп. На сървъра се пази неговият хеш. Личният линк дава достъп до статуса и, при потвърдена покупка, до електронното издание.</li>
              <li><strong>Технически данни:</strong> IP адрес, тип браузър, посетени страници и продължителност на посещението — чрез Google Analytics и Google Tag Manager.</li>
              <li><strong>Данни от образователната игрова среда:</strong> Публикувани текстове и псевдоними — съхранявани анонимно без обвързване с реална самоличност.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Цел и правно основание за обработка</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 border border-gray-100 font-semibold text-gray-900">Цел</th>
                    <th className="text-left p-3 border border-gray-100 font-semibold text-gray-900">Правно основание</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Обработка на запитвания за партньорство', 'Легитимен интерес (чл. 6, ал. 1, б. „е" GDPR)'],
                    ['Изпълнение на поръчки за книгата', 'Изпълнение на договор (чл. 6, ал. 1, б. „б" GDPR)'],
                    ['Анализ на трафика и подобряване на сайта', 'Съгласие (чл. 6, ал. 1, б. „а" GDPR)'],
                    ['Образователна игрова среда', 'Легитимен интерес — образователна цел'],
                  ].map(([purpose, basis], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="p-3 border border-gray-100">{purpose}</td>
                      <td className="p-3 border border-gray-100 text-gray-500">{basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Срок на съхранение</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Данни от запитвания за партньорство: до 2 години от последния контакт.</li>
              <li>Данни от поръчки: до 5 години съгласно счетоводното законодателство.</li>
              <li>Технически данни (Analytics): до 26 месеца.</li>
              <li>Данни от игровата среда: до 12 месеца или до изрично искане за изтриване.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Споделяне с трети страни</h2>
            <p className="mb-3">Личните ви данни могат да бъдат споделени с:</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Supabase Inc.</strong> — доставчик на база данни и инфраструктура (сървъри в ЕС).</li>
              <li><strong>Stripe Inc.</strong> — платежен процесор за поръчки на книгата.</li>
              <li><strong>Google LLC</strong> — Google Analytics и Google Tag Manager за анализ на трафика.</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500">
              Не продаваме и не предоставяме личните ви данни на трети страни за маркетингови цели.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Вашите права</h2>
            <p className="mb-3">Съгласно GDPR имате следните права:</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Право на достъп</strong> — да получите копие от данните, които съхраняваме за вас.</li>
              <li><strong>Право на коригиране</strong> — да поискате корекция на неточни данни.</li>
              <li><strong>Право на изтриване</strong> — да поискате изтриване на данните ви („право да бъдеш забравен").</li>
              <li><strong>Право на ограничаване</strong> — да ограничите обработката на данните ви.</li>
              <li><strong>Право на преносимост</strong> — да получите данните си в машинночетим формат.</li>
              <li><strong>Право на възражение</strong> — да се противопоставите на обработката въз основа на легитимен интерес.</li>
            </ul>
            <p className="mt-4 text-sm">
              За упражняване на правата си, моля, пишете на:{' '}
              <a href="mailto:budimseonline@gmail.com" className="text-gray-900 underline font-medium">budimseonline@gmail.com</a>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Имате право да подадете жалба до Комисията за защита на личните данни (КЗЛД) на адрес:{' '}
              <a href="https://www.cpdp.bg" target="_blank" rel="noopener noreferrer" className="underline">www.cpdp.bg</a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Бисквитки (Cookies)</h2>
            <p className="mb-3">Сайтът използва следните видове бисквитки:</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Технически бисквитки:</strong> Необходими за функционирането на сайта. Не изискват съгласие.</li>
              <li><strong>Аналитични бисквитки:</strong> Google Analytics — за анализ на трафика. Изискват съгласие.</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500">
              Можете да управлявате бисквитките чрез настройките на браузъра си.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Сигурност на данните</h2>
            <p className="text-sm">
              Прилагаме технически и организационни мерки за защита на личните данни, включително:
              криптирана HTTPS връзка, ограничен достъп до базата данни, и редовни прегледи на сигурността.
              Въпреки това, никоя система не е 100% защитена — при съмнение за нарушение, моля, уведомете ни незабавно.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Промени в политиката</h2>
            <p className="text-sm">
              Запазваме правото да актуализираме тази политика. При съществени промени ще публикуваме
              известие на сайта. Датата на последна актуализация е посочена в началото на документа.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <p className="text-sm text-gray-500">
              За въпроси относно тази политика:{' '}
              <a href="mailto:budimseonline@gmail.com" className="text-gray-900 underline">budimseonline@gmail.com</a>
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4">
          <Link
            to="/terms"
            className="inline-flex items-center gap-2 text-sm text-gray-700 border border-gray-200 px-5 py-2.5 rounded-md hover:border-gray-400 transition-colors whitespace-nowrap"
          >
          <Icon name="ri-file-text-line" size={14} className="inline mr-1" />
            Условия за ползване
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-sm text-gray-700 border border-gray-200 px-5 py-2.5 rounded-md hover:border-gray-400 transition-colors whitespace-nowrap"
          >
          <Icon name="ri-mail-line" size={14} className="inline mr-1" />
            Свържете се с нас
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
