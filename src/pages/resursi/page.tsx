import { Link } from 'react-router-dom';
import { Download, ArrowUpRight } from 'lucide-react';
import PageLayout, { PageIntro } from '@/components/feature/PageLayout';
import { usePageSeo } from '@/hooks/usePageSeo';
import { methodology } from '@/content/methodology';

export default function ResourcesPage() {
  usePageSeo({
    title: 'Ресурси по медийна и дигитална грамотност',
    description: 'Изтегли методологията „Будим се“: образователна програма с цели, казуси, шест занятия, критерии за оценяване и работни листове. PDF на български, без регистрация.',
    canonical: '/resursi',
    schemaType: 'CollectionPage',
    breadcrumbs: [{ name: 'Начало', url: '/' }, { name: 'Ресурси', url: '/resursi' }],
    schemaExtra: {
      hasPart: {
        '@type': 'LearningResource', '@id': 'https://budimse.online/resursi#metodologiya',
        name: methodology.title,
        description: 'Образователна методология с цели, шест занятия, разгърнати казуси, оценяване и шест работни листа.',
        inLanguage: 'bg', version: methodology.version, datePublished: methodology.publishedAt,
        isAccessibleForFree: true, learningResourceType: 'Образователна методология',
        author: { '@id': 'https://budimse.online/author#person' },
        publisher: { '@id': 'https://budimse.online/#organization' },
        encoding: { '@type': 'MediaObject', encodingFormat: 'application/pdf',
          contentUrl: 'https://budimse.online' + methodology.href, contentSize: methodology.sizeLabel },
      },
    },
  });

  return <PageLayout>
    <PageIntro eyebrow="Ресурси" title="Материали, с които да работим">
      <p>Наръчник, упражнения и източници по медийна и дигитална грамотност. За самостоятелна работа, разговор в клас или занимание с група.</p>
    </PageIntro>
    <div className="site-container reading-layout">
      <article className="prose-content">
        <section id="metodologiya" aria-labelledby="methodology-title">
          <div className="methodology-download">
            <p className="eyebrow">Образователна методология · PDF</p>
            <h2 id="methodology-title">Методология „Будим се“</h2>
            <p>Пет стъпки за разглеждане на дигитална ситуация: наблюдение, проверка, избор, опит и преглед. С обяснени основания, учебна програма, разгърнати казуси и критерии за оценяване.</p>
            <p className="resource-file-meta">{methodology.pages} страници · {methodology.sizeLabel} · Български<br />Версия {methodology.version} · {methodology.dateLabel}</p>
            <div className="button-row">
              <a className="button-primary" href={methodology.href} download={methodology.href.split('/').pop()} type="application/pdf"><Download size={18} aria-hidden="true" />Изтегли наръчника</a>
              <a className="button-secondary" href={methodology.href} target="_blank" rel="noopener noreferrer" type="application/pdf">Прегледай PDF<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (в нов раздел)</span></a>
            </div>
            <p className="resource-access-note">Без регистрация. Може да се използва на хартия, без сайта и книгата.</p>
          </div>
        </section>

        <section id="v-narachnika"><h2>Какво включва методологията</h2>
          <ul>
            <li>Цели на обучението и връзка между всяка цел, задача и видим резултат.</li>
            <li>Петте стъпки, с обяснение кога продължаваме и кога се връщаме към проверката.</li>
            <li>Проверка на новини, снимки, числа и съдържание, създадено с ИИ.</li>
            <li>Сравнение на постове за една кауза: емоция, видимост, реакции и участие.</li>
            <li>Учебна симулация с ясни правила и кратък опит за фокус.</li>
            <li>Основна програма от шест занятия, отделни планове за 40 и 80 минути и последваща проверка.</li>
            <li>Критерии за оценяване, примерни отговори с разбор и план за пилотно прилагане.</li>
            <li>Шест работни листа за разпечатване на страници {methodology.worksheetPages}.</li>
          </ul>
        </section>

        <section id="pet-stapki"><h2>Как работи методологията?</h2>
          <p>Започваме с един конкретен въпрос. Стъпките помагат да го разгледаме, без да бързаме към общ извод.</p>
          <ol>{methodology.steps.map(step => <li key={step.name}><strong>{step.name}.</strong> {step.question}</li>)}</ol>
          <p>Можем да се връщаме назад и да променяме подхода. Стъпките описват работа по ситуация, а не степени на човешка стойност или „осъзнатост“.</p>
        </section>

        <section id="za-vodeshti"><h2>Откъде да започне един учител?</h2>
          <p>Започни с целите и подготовката на страници 3-8. Програмата от шест занятия е на страница {methodology.sections.course}. За отделен час използвай пакета документи на страници {methodology.sections.caseStudy} и плана на страница {methodology.sections.lesson}. Казусите за постове и видимост са на страници {methodology.sections.socialPosts}.</p>
          <p>Съобрази езика, времето и сложността с групата. Упражненията могат да се изпълнят без лични профили, лични съобщения и публично публикуване от ученици.</p>
          <p>Авторската рамка се развива от <Link to="/author">Владимир Атанасов</Link> и център БУДИМ СЕ. Версия 2.0 е разработена за пилотно прилагане. Стъпва върху проучени образователни подходи; ефектът на цялата програма и трудността на задачите предстои да се проверят.</p>
        </section>

        <section id="razrabotvane"><h2>Как е разработена?</h2>
          <p>Структурата свързва цели, учебни действия и оценяване. Използвани са ръководства на UNESCO за медийна и информационна грамотност, DigComp 3.0, подходи на IES за преподаване и оценка на програми и изследвания за странично четене.</p>
          <p>Петте стъпки, програмата и българските казуси са авторско предложение. В документа са посочени източниците, какво подкрепят и кои решения трябва да се проверят в пилот. Оценяваме конкретна работа и оказаната помощ, без да поставяме общ етикет на участника.</p>
        </section>

        <section id="oshte"><h2>Още материали за подготовка</h2>
          <ul>
            <li><Link to="/mediyna-gramotnost-uchenici">Три упражнения по медийна грамотност за ученици</Link> - заглавие, контекст на снимка и реакции към постове.</li>
            <li><Link to="/digitalna-gramotnost">Въведение в медийната и дигиталната грамотност</Link> - понятия и въпроси за ежедневни ситуации.</li>
            <li><Link to="/news">Статии и кратки материали</Link> - теми за проверка на информацията и дигиталните навици.</li>
            <li><Link to="/sources">Библиография</Link> - източници с пояснения за техния обхват.</li>
          </ul>
          <p>За работа с група можеш да разгледаш <Link to="/obucheniya-za-uchilishta">формата за училища</Link>. Ако използваш наръчника, <Link to="/contact">пиши ни</Link> кой въпрос е бил полезен и кое се нуждае от уточнение.</p>
        </section>
      </article>
      <aside className="page-aside"><h2>На тази страница</h2>
        <a href="#metodologiya">Изтегляне на наръчника</a>
        <a href="#v-narachnika">Съдържание</a>
        <a href="#pet-stapki">Петте стъпки</a>
        <a href="#za-vodeshti">За учители и водещи</a>
        <a href="#razrabotvane">Основания и разработване</a>
        <a href="#oshte">Още материали</a>
      </aside>
    </div>
  </PageLayout>;
}
