import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

export default function CenterPage() {
  usePageSeo({
    title: 'Център за медийна и дигитална грамотност БУДИМ СЕ',
    description: 'Център за медийна и дигитална грамотност БУДИМ СЕ — независима гражданска и образователна инициатива. Създаваме образователни материали, инструменти и програми за критично мислене и осъзнато използване на технологиите.',
    canonical: '/center',
    keywords: 'медийна грамотност, дигитална грамотност, дигитални навици, проверка на информация, Петте степени, БУДИМ СЕ',
    ogImage: 'https://readdy.ai/api/search-image?query=modern%20educational%20center%20interior%20minimalist%20design%20clean%20white%20walls%20wooden%20furniture%20group%20of%20people%20in%20workshop%20session%20natural%20light%20streaming%20through%20large%20windows%20collaborative%20learning%20environment%20professional%20photography&width=1200&height=630&seq=center-og-v1&orientation=landscape',
    schemaType: 'AboutPage',
    breadcrumbs: [
      { name: 'Начало', url: 'https://budimse.online' },
      { name: 'Център за медийна и дигитална грамотност', url: 'https://budimse.online/center' },
    ],
    schemaExtra: {
      dateModified: '2026-10-07',
      about: {
        '@type': 'EducationalOrganization',
        name: 'Център за медийна и дигитална грамотност БУДИМ СЕ',
        alternateName: 'Център БУДИМ СЕ',
        url: 'https://budimse.online',
        description: 'Независима гражданска и образователна инициатива за медийна и дигитална грамотност. Създава образователни материали, инструменти и програми, които помагат на хората да разбират дигиталната среда и да я използват по-осъзнато.',
        email: 'budimseonline@gmail.com',
        knowsAbout: [
          'Медийна грамотност',
          'Дигитална грамотност',
          'Дигитален суверенитет',
          'Дигитални навици',
          'Поведенчески дизайн',
          'Образователен детокс',
          'Дигитална хигиена',
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Програми за медийна и дигитална грамотност',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'EducationalOccupationalProgram',
                name: 'Образователен детокс — медийна грамотност за ученици',
                description: 'Структурирани програми за медийна и дигитална грамотност в учебна среда. Работа с учители и ученици за разпознаване на алгоритмични стимули.',
                provider: { '@type': 'EducationalOrganization', name: 'Център БУДИМ СЕ' },
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'EducationalOccupationalProgram',
                name: 'Програма за семейства — дигитална грамотност',
                description: 'Работа с родители и младежи за изграждане на осъзнати дигитални навици.',
                provider: { '@type': 'EducationalOrganization', name: 'Център БУДИМ СЕ' },
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Корпоративна дигитална хигиена',
                description: 'Пилотен формат за преглед на известията, срещите и очакванията за отговор в работна среда.',
                provider: { '@type': 'EducationalOrganization', name: 'Център БУДИМ СЕ' },
              },
            },
          ],
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'budimseonline@gmail.com',
          contactType: 'customer support',
          availableLanguage: 'Bulgarian',
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 md:pt-36 md:pb-20 md:px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-6 font-medium">
            Център БУДИМ СЕ
          </p>
          <h1 className="text-4xl md:text-7xl font-light text-gray-900 mb-6 md:mb-8 leading-none tracking-tight">
            Център за медийна и<br />
            <span className="font-medium">дигитална грамотност</span>
          </h1>
          <div className="w-16 h-px bg-gray-300 mb-8"></div>
          <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed max-w-2xl">
            Независима гражданска и образователна инициатива, създадена от малък екип с обща
            мисия — да помагаме на повече хора да разбират дигиталната среда и да я използват осъзнато.
          </p>
          <p className="text-sm text-gray-400 mt-6 leading-relaxed max-w-xl">
            <Link to="/digitalna-gramotnost" className="text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors">Медийна грамотност и дигитална грамотност</Link> за училища, семейства и корпоративни екипи —
            вдъхновени от авторската рамка „Петте степени".
          </p>
        </div>
      </section>

      {/* What is the Center */}
      <section className="py-12 px-4 md:py-20 md:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-medium">I. КАКВО</p>
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight">
                Какво представлява<br />
                <strong className="font-semibold">Центърът?</strong>
              </h2>
            </div>
            <div className="md:col-span-3 space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                БУДИМ СЕ е независима гражданска и образователна инициатива, създадена от малък екип
                от хора с обща мисия: да помагаме на повече хора да разбират дигиталната среда, да
                разпознават механизмите, които влияят върху вниманието и решенията им, и да използват
                технологиите по-осъзнато.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Технологиите могат да свързват, информират, образоват, забавляват и да разширяват човешките
                възможности. Същевременно начинът, по който са проектирани и използвани, може да влияе върху
                вниманието, навиците и решенията ни. Затова са ни необходими знания, критично мислене и
                практически умения, включително разумни ограничения, когато са необходими.
              </p>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-base text-gray-500 italic leading-relaxed">Разграничаваме какво знаем, какво предполагаме и какво още трябва да проверим.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 px-4 md:py-20 md:px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-10 font-medium">Екипът</p>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            БУДИМ СЕ е създаден от малък екип с обща мисия. Информация за отделните хора, които стоят
            зад инициативата, ще бъде публикувана, когато екипът е готов да я сподели публично.
          </p>
        </div>
      </section>

      {/* How we work */}
      <section className="py-12 px-4 md:py-20 md:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-medium">II. КАК</p>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight">
              Три програми,<br />
              <strong className="font-semibold">базирани на авторската рамка „Петте степени"</strong>
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl">Подготвяме пилотни образователни формати с организации. Уточняваме нуждите и съдържанието предварително. Книгата и упражненията могат да се използват и самостоятелно.</p>
          </div>

          <div className="space-y-px">
            {[
              {
                number: '01',
                title: 'Програма за училища',
                audience: 'За училища',
                icon: 'ri-graduation-cap-line',
                body: 'Подготвяме пилотни сесии с педагогически екипи: четене на различни текстове, проверка на източници, препоръки и лични данни. Задачите се съобразяват с възрастта и целите на училището.',
              },
              {
                number: '02',
                title: 'Програма за семейства',
                audience: 'За семейства',
                icon: 'ri-heart-pulse-line',
                body: 'Пилотни разговори и упражнения за полезната употреба, конфликтите около екраните и споделените правила. Отчитаме възрастта, нуждите и условията в семейството.',
              },
              {
                number: '03',
                title: 'Програма за компании',
                audience: 'За бизнеси',
                icon: 'ri-building-line',
                body: 'Пилотен формат за известията, срещите и очакванията за бърз отговор. Избираме конкретен въпрос и уговорен начин да прегледаме резултата, без предварително обещание за продуктивност.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group bg-white border border-gray-100 rounded-lg p-8 hover:border-gray-300 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="text-3xl font-light text-gray-200 group-hover:text-gray-400 transition-colors">
                      {item.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <Icon name={item.icon} size={16} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <span className="text-xs text-gray-400 border border-gray-200 rounded-full px-3 py-0.5 whitespace-nowrap">
                        {item.audience}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Field Examples */}
      <section className="py-12 px-4 md:py-20 md:px-6 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-medium">Примерни сценарии</p>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight">
              Как би изглеждала<br />
              <strong className="font-semibold">работата.</strong>
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl">
              Хипотетични сценарии, които илюстрират подхода ни. Те не описват реално проведени сесии
              и не съдържат измерени резултати.
            </p>
          </div>

          <div className="space-y-8">
            {/* Example 1 */}
            <div className="border border-gray-100 rounded-lg p-8 hover:border-gray-200 transition-colors">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="text-xs font-medium text-gray-500 border border-gray-200 rounded-full px-3 py-1 whitespace-nowrap">Програма за училища</span>
                <span className="text-xs text-gray-400">Примерен сценарий — клас</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Да разберем прочетеното</h3>
              <p className="text-gray-600 leading-relaxed mb-4">В условна училищна сесия учениците могат да прочетат кратък текст и да обяснят основната му идея. Ако отговорите се различават, обсъждаме трудните думи, предварителните знания, начина на четене и условията в стаята.</p>
              <p className="text-gray-600 leading-relaxed mb-4">След това могат да опитат друг начин: повторно четене, бележки или разговор по абзаци. Сравнението показва какво е помогнало в тази задача. То не доказва загубена способност за четене или траен ефект от една сесия.</p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 italic">
                  Този сценарий е хипотетичен и илюстрира възможен подход, а не проведена сесия.
                </p>
              </div>
            </div>

            {/* Example 2 */}
            <div className="border border-gray-100 rounded-lg p-8 hover:border-gray-200 transition-colors">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="text-xs font-medium text-gray-500 border border-gray-200 rounded-full px-3 py-1 whitespace-nowrap">Програма за семейства</span>
                <span className="text-xs text-gray-400">Примерен сценарий — семейство</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Какво стои зад семейното правило</h3>
              <p className="text-gray-600 leading-relaxed mb-4">Ако детето и родителите спорят за телефона вечер, първо могат да опишат какво прави всеки: учене, общуване, игра или почивка. Не определяме причината за конфликта предварително и не поставяме диагноза от екранното време.</p>
              <p className="text-gray-600 leading-relaxed mb-4">После могат да уговорят конкретна граница, нужните изключения и кога да я прегледат. Ако спорът остава, правилото или друга част от ситуацията може да се нуждаят от промяна. Образователният разговор не заменя необходимата професионална подкрепа.</p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 italic">
                  Този сценарий е хипотетичен и илюстрира възможен подход, а не проведена сесия.
                </p>
              </div>
            </div>

            {/* Example 3 */}
            <div className="border border-gray-100 rounded-lg p-8 hover:border-gray-200 transition-colors">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="text-xs font-medium text-gray-500 border border-gray-200 rounded-full px-3 py-1 whitespace-nowrap">Програма за компании</span>
                <span className="text-xs text-gray-400">Примерен сценарий — екип</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Среща с ясна цел</h3>
              <p className="text-gray-600 leading-relaxed mb-4">Ако срещите често се прекъсват, екипът може да разгледа продължителността, дневния ред и очакванията за отговор на други задачи. Устройствата са една възможна част от проблема; не доказват неспособност за внимание.</p>
              <p className="text-gray-600 leading-relaxed mb-4">Един възможен опит е по-кратка среща с ясна цел и предварително уговорени изключения за спешни задачи. После екипът проверява дали решенията са по-ясни и дали планът е изпълним. Резултатът може да е различен от очаквания.</p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 italic">
                  Този сценарий е хипотетичен и илюстрира възможен подход, а не проведена сесия.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 px-4 md:py-20 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-medium">III. КОГА</p>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight">Как се подготвя един пилотен формат</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gray-100"></div>

            <div className="space-y-10">
              {[
                {
                  period: 'Стъпка 1', label: 'РАЗГОВОР', status: 'current',
                  title: 'Нуждите и условията',
                  body: 'Обсъждаме какво затруднява участниците, какво вече им помага и какви са възможностите на организацията.',
                },
                {
                  period: 'Стъпка 2', label: 'ПОДГОТОВКА', status: 'upcoming',
                  title: 'Конкретна задача',
                  body: 'Уговаряме съдържание, продължителност, достъпност и начин за обратна връзка. Форматът се съобразява с възрастта и контекста.',
                },
                {
                  period: 'Стъпка 3', label: 'ПРЕГЛЕД', status: 'upcoming',
                  title: 'Опит и обратна връзка',
                  body: 'След пилотната сесия разглеждаме какво е било полезно, какво не е помогнало и какво трябва да се промени. Публикуваме резултати само с проверим контекст.',
                },
              ].map((item, i) => (
                <div key={i} className="relative pl-12 md:pl-20">
                  {/* Dot */}
                  <div className={`absolute left-2 md:left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    item.status === 'current'
                      ? 'border-gray-900 bg-gray-900'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {item.status === 'current' && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.period}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                      item.status === 'current'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed max-w-xl">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why now — the hard truth */}
      <section className="py-12 px-4 md:py-20 md:px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-medium">Защо сега</p>
              <h2 className="text-3xl md:text-4xl font-light text-white leading-tight">Конкретни въпроси от ежедневието</h2>
            </div>
            <div className="md:col-span-3 space-y-6">
              <p className="text-lg text-gray-300 leading-relaxed">Известия по време на урок, спор за телефона вечер, среща без ясен край — това са конкретни ситуации, които могат да се разгледат. Не е нужно да приемаме, че технологиите обясняват всички трудности на едно поколение.</p>
              <p className="text-lg text-gray-300 leading-relaxed">За някои хора промяната на дигитална настройка помага; за други по-важни са сънят, натоварването или организацията на деня. Подходът започва с наблюдение на ситуацията и избор на изпълним опит.</p>
              <div className="pt-6 border-t border-gray-700">
                <p className="text-xl text-white font-light leading-relaxed">
                  Първо уточняваме задачата. После преглеждаме какво е помогнало.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Media & Publications */}
      <section className="py-12 px-4 md:py-20 md:px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-medium">IV. МЕДИИ</p>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight">
              Медии и публикации
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl">
              Материали за журналисти, редактори и медийни партньори. Секцията се обновява с напредъка на кампанията.
            </p>
          </div>

          {/* Press kit notice */}
          <div className="border border-gray-200 rounded-lg p-8 mb-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full flex-shrink-0">
              <Icon name="ri-folder-line" size={20} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-1">Информация за медии — при запитване</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Можете да поискате информация за книгата, авторската рамка и източниците. Дати за събития и резултати от програми се публикуват след потвърждение.</p>
            </div>
            <span className="text-xs text-gray-400 border border-gray-200 rounded-full px-3 py-1 whitespace-nowrap flex-shrink-0">
              При запитване
            </span>
          </div>

          {/* Publications grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                type: 'При запитване', date: 'Книга и рамка',
                title: 'За „Петте степени“ и практиката „Будим се“', outlet: 'Информация за редакцията', icon: 'ri-book-open-line',
              },
              {
                type: 'При запитване', date: 'Източници',
                title: 'Какво подкрепят данните и какви са ограниченията', outlet: '17 бележки към книгата', icon: 'ri-article-line',
              },
              {
                type: 'При запитване', date: 'Пилотни формати',
                title: 'Разговор за образователен формат', outlet: 'Съобразен с организацията', icon: 'ri-mic-line',
              },
            ].map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <Icon name={item.icon} size={14} className="text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-400 border border-gray-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                    {item.type}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{item.date}</p>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 leading-snug">{item.title}</h4>
                <p className="text-xs text-gray-400">{item.outlet}</p>
              </div>
            ))}
          </div>

          {/* Media contact */}
          <div className="bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <Icon name="ri-mail-line" size={18} className="text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-0.5">Медийни запитвания</p>
              <p className="text-sm text-gray-500">
                За интервюта, коментари и прес-материали — използвайте формата за партньорство 
                и посочете „Медия" като вид организация.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section className="py-12 px-4 md:py-20 md:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-medium">Партньорства</p>
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 leading-tight">
                Работим с<br />
                <strong className="font-semibold">организации. Рамката — с всеки.</strong>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Ако представлявате училище, организация или бизнес и искате да разберете 
                как Центърът може да работи с вашия екип — свържете се с нас. 
                Не предлагаме стандартни пакети. Всяко партньорство е индивидуално.
              </p>
              <div className="space-y-4">
                {[
                  { icon: 'ri-school-line', text: 'Партньорски училища и образователни институции' },
                  { icon: 'ri-team-line', text: 'Организации за работа с младежи' },
                  { icon: 'ri-building-2-line', text: 'Корпоративни екипи и HR отдели' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <i className={`${item.icon} text-gray-400 text-sm`}></i>
                    </div>
                    <span className="text-sm text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-lg p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Запитване за партньорство</h3>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                  const statusEl = form.querySelector('#form-status') as HTMLElement;

                  submitBtn.disabled = true;
                  submitBtn.textContent = 'Изпращане...';
                  statusEl.textContent = '';

                  const organization = (form.querySelector('[name="organization"]') as HTMLInputElement).value.trim();
                  const type = (form.querySelector('[name="type"]') as HTMLSelectElement).value;
                  const email = (form.querySelector('[name="email"]') as HTMLInputElement).value.trim();
                  const message = (form.querySelector('[name="message"]') as HTMLTextAreaElement).value.trim();

                  if (message.length > 500) {
                    statusEl.textContent = 'Описанието е твърде дълго (макс. 500 символа).';
                    statusEl.className = 'text-sm text-red-600 mt-3';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Изпрати запитване';
                    return;
                  }

                  try {
                    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
                    const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

                    const res = await fetch(`${supabaseUrl}/functions/v1/submit-partnership`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseAnonKey}`,
                        'apikey': supabaseAnonKey,
                      },
                      body: JSON.stringify({ organization, type, email, message }),
                    });

                    const data = await res.json();

                    if (res.ok && data.success) {
                      statusEl.textContent = 'Запитването е изпратено. Ще се свържем с вас.';
                      statusEl.className = 'text-sm text-green-700 mt-3';
                      form.reset();
                    } else {
                      throw new Error(data.error || 'Грешка при изпращане.');
                    }
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Грешка при изпращане. Опитайте отново.';
                    statusEl.textContent = msg;
                    statusEl.className = 'text-sm text-red-600 mt-3';
                  } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Изпрати запитване';
                  }
                }}
              >
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Организация</label>
                  <input
                    type="text"
                    name="organization"
                    required
                    placeholder="Наименование на организацията"
                    className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Вид организация</label>
                  <select
                    name="type"
                    required
                    className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors cursor-pointer"
                  >
                    <option value="">Изберете...</option>
                    <option value="school">Училище / образователна институция</option>
                    <option value="ngo">НПО / организация за работа с младежи</option>
                    <option value="corporate">Бизнес / корпоративен екип</option>
                    <option value="media">Медия / журналист</option>
                    <option value="other">Друго</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Имейл за контакт</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="contact@organization.bg"
                    className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Кратко описание</label>
                  <textarea
                    name="message"
                    rows={3}
                    maxLength={500}
                    placeholder="Опишете накратко контекста и интереса си..."
                    className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white rounded-md py-3 text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Изпрати запитване
                </button>
                <p id="form-status" className="text-sm mt-3"></p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

