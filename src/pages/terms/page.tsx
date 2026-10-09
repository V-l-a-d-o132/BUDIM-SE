import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function TermsPage() {
  usePageSeo({
    title: 'Условия за ползване — Център БУДИМ СЕ',
    description: 'Условия за ползване на уебсайта budimse.online и услугите на Център БУДИМ СЕ.',
    canonical: '/terms',
    schemaType: 'WebPage',
  });

  const lastUpdated = '6 октомври 2026 г.';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="editorial-page">

      <section className="pt-32 pb-8 px-6">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs tracking-[0.25em] text-gray-400 uppercase font-medium">Правна информация</span>
          <h1 className="text-4xl font-light text-gray-900 mt-4 mb-3 leading-tight">
            Условия за ползване
          </h1>
          <p className="text-sm text-gray-400">Последна актуализация: {lastUpdated}</p>
        </div>
      </section>

      <section className="py-10 px-6">
        <div className="max-w-3xl mx-auto space-y-10 text-gray-700 leading-relaxed">

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Приемане на условията</h2>
            <p>
              С достъпа до и използването на уебсайта <strong>budimse.online</strong> вие приемате
              настоящите Условия за ползване. Ако не сте съгласни с тях, моля, не използвайте сайта.
              Условията се прилагат за всички посетители, потребители и лица, достъпващи услугите на Центъра.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Описание на услугите</h2>
            <p className="mb-3">Уебсайтът предоставя:</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Образователно съдържание по медийна и дигитална грамотност.</li>
              <li>Анализатор на съдържание — образователен инструмент за разпознаване на езикови и структурни похвати в текст.</li>
              <li>Учебни симулатори за изследване на публикации, реакции и разпространение.</li>
              <li>Информация за програмите и услугите на Центъра.</li>
              <li>Форма за запитвания за партньорство.</li>
              <li>Поръчка на книгата „Петте степени".</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Интелектуална собственост</h2>
            <p className="mb-3">
              Авторските текстове, рамка, графики, лого и структура на Център БУДИМ СЕ
              са защитени от авторското право. Цитираните изследвания, чуждите материали
              и марките принадлежат на съответните правоносители.
            </p>
            <p className="text-sm">
              Разрешено е цитиране на части от съдържанието с изрично посочване на източника
              (<strong>budimse.online</strong>). Авторската методология, учебните казуси и
              работните листове в „Ресурси“ могат да се разпечатват, копират и споделят
              за нетърговски учебни занимания с посочени „Будим се“, версия и източник.
              Адаптациите се обозначават. Това разрешение не включва платената книга,
              чужди публикации или права върху марки. За търговско използване на авторските
              материали е нужно писмено разрешение.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Образователна игрова среда</h2>
            <p className="mb-3">При използване на образователната игрова среда потребителят се съгласява:</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Да не публикува съдържание, което е обидно, дискриминационно или незаконно.</li>
              <li>Да не използва реални лични данни на трети лица без тяхното съгласие.</li>
              <li>Да не се опитва да манипулира или злоупотребява с AI системата.</li>
              <li>Публикуваното съдържание може да бъде прегледано и модерирано от администратори.</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500">
              Центърът си запазва правото да премахва съдържание, нарушаващо тези условия.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Поръчки и плащания</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Поръчките за книгата се обработват чрез защитена платежна система (Stripe).</li>
              <li>Цените са само в евро (EUR): физическа книга — €14,99 за брой; електронно издание — €3,99 за едно копие за лично ползване.</li>
              <li>Плащането се потвърждава на сървъра от Stripe. Платежна сесия, която още се обработва, не дава достъп до електронното издание и не разрешава изпращане на физическата книга.</li>
              <li>Физическата книга се изпраща на адреса, посочен при плащането. Статусът, куриерът и товарителницата се виждат чрез личния линк към поръчката.</li>
              <li>Електронното издание се предоставя в PDF след потвърдено плащане и изрично искане за незабавен достъп. То е за лично ползване; покупката не разрешава препродажба или публично разпространение.</li>
              <li>Запазете личния линк към поръчката. Той дава достъп до статуса и, при покупка на електронно издание, до защитено изтегляне. При изгубен линк пишете на адреса по-долу с номера на поръчката и имейла от плащането.</li>
              <li>При проблем с поръчката, моля, свържете се с нас на <a href="mailto:budimseonline@gmail.com" className="text-gray-900 underline">budimseonline@gmail.com</a>.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Право на отказ и връщане</h2>
            <p className="text-sm">
              Съгласно Закона за защита на потребителите, имате право да се откажете от поръчката
              в рамките на <strong>14 дни</strong> от получаването на физическата книга, без да посочвате причина.
              За електронното издание срокът започва от сключването на договора. Искането за незабавен
              достъп в тази покупка запазва приложимото право на отказ.
              За упражняване на правото на отказ, моля, пишете на{' '}
              <a href="mailto:budimseonline@gmail.com" className="text-gray-900 underline">budimseonline@gmail.com</a>{' '}
              с посочване на номера на поръчката. Разходите за връщане на физическа книга са за сметка на потребителя.
              При пълно възстановяване на сумата за електронно издание достъпът до нови линкове за изтегляне се прекратява.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Ограничаване на отговорността</h2>
            <p className="text-sm mb-3">
              Съдържанието на сайта е с образователна цел. Центърът не носи отговорност за:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Решения, взети въз основа на информацията в сайта.</li>
              <li>Временна недостъпност на сайта поради технически причини.</li>
              <li>Съдържание на външни сайтове, към които водят линкове от нашия сайт.</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500">
              Книгата, самооценката и AI анализаторът са образователни материали и не предоставят
              индивидуална диагностика, лечение или психологическа консултация. Участието на
              психолог в екипа не превръща тези инструменти в клинично валидирани методи.
              При нужда от психологическа помощ потърсете квалифициран специалист.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Приложимо право</h2>
            <p className="text-sm">
              Настоящите условия се уреждат от законодателството на Република България.
              При спорове, страните ще се стремят към извънсъдебно решение. При невъзможност —
              компетентен е съответният български съд.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Промени в условията</h2>
            <p className="text-sm">
              Центърът си запазва правото да актуализира тези условия. Продължаването на използването
              на сайта след публикуване на промените се счита за приемане на новите условия.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Контакт</h2>
            <p className="text-sm">
              За въпроси относно тези условия:{' '}
              <a href="mailto:budimseonline@gmail.com" className="text-gray-900 underline font-medium">budimseonline@gmail.com</a>
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4">
          <Link
            to="/privacy"
            className="inline-flex items-center gap-2 text-sm text-gray-700 border border-gray-200 px-5 py-2.5 rounded-md hover:border-gray-400 transition-colors whitespace-nowrap"
          >
          <Icon name="ri-shield-line" size={14} className="inline mr-1" />
            Политика за поверителност
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

      </main>
      <Footer />
    </div>
  );
}
