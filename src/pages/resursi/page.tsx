import { Link } from 'react-router-dom';
import { Download, ArrowUpRight } from 'lucide-react';
import PageLayout, { PageIntro } from '@/components/feature/PageLayout';
import { usePageSeo } from '@/hooks/usePageSeo';
import { methodology } from '@/content/methodology';

export default function ResourcesPage() {
  usePageSeo({
    title: 'Ресурси по медийна и дигитална грамотност',
    description: 'Изтегли методологията „Будим се“: практичен наръчник с пет стъпки, примери, занятия за ученици и работни листове. PDF на български, без регистрация.',
    canonical: '/resursi',
    schemaType: 'CollectionPage',
    breadcrumbs: [{ name: 'Начало', url: '/' }, { name: 'Ресурси', url: '/resursi' }],
    schemaExtra: {
      hasPart: {
        '@type': 'LearningResource', '@id': 'https://budimse.online/resursi#metodologiya',
        name: methodology.title,
        description: 'Практически наръчник за медийна и дигитална грамотност с примери, занятия и пет работни листа.',
        inLanguage: 'bg', version: methodology.version, datePublished: methodology.publishedAt,
        isAccessibleForFree: true, learningResourceType: 'Практически наръчник',
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
            <p className="eyebrow">Практически наръчник · PDF</p>
            <h2 id="methodology-title">Методология „Будим се“</h2>
            <p>Пет стъпки за разглеждане на дигитална ситуация: наблюдение, проверка, избор, опит и преглед. С подробни примери, занятия и листове за разпечатване.</p>
            <p className="resource-file-meta">{methodology.pages} страници · {methodology.sizeLabel} · Български<br />Версия {methodology.version} · {methodology.dateLabel}</p>
            <div className="button-row">
              <a className="button-primary" href={methodology.href} download="metodologiya-budim-se-v1.pdf" type="application/pdf"><Download size={18} aria-hidden="true" />Изтегли наръчника</a>
              <a className="button-secondary" href={methodology.href} target="_blank" rel="noopener noreferrer" type="application/pdf">Прегледай PDF<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (в нов раздел)</span></a>
            </div>
            <p className="resource-access-note">Без регистрация. Може да се използва на хартия, без сайта и книгата.</p>
          </div>
        </section>

        <section id="v-narachnika"><h2>Какво има в наръчника</h2>
          <ul>
            <li>Петте стъпки, с въпроси, примери и чести затруднения.</li>
            <li>Проверка на новини, снимки, числа и съдържание, създадено с ИИ.</li>
            <li>Сравнение на постове за една кауза: емоция, видимост, реакции и участие.</li>
            <li>Учебна симулация с ясни правила и кратък опит за фокус.</li>
            <li>План за 40 минути и лаборатория за два учебни часа.</li>
            <li>Насоки за водещи, обратна връзка и пет работни листа на страници 23-27.</li>
          </ul>
        </section>

        <section id="pet-stapki"><h2>Как работи методологията?</h2>
          <p>Започваме с един конкретен въпрос. Стъпките помагат да го разгледаме, без да бързаме към общ извод.</p>
          <ol>{methodology.steps.map(step => <li key={step.name}><strong>{step.name}.</strong> {step.question}</li>)}</ol>
          <p>Можем да се връщаме назад и да променяме подхода. Стъпките описват работа по ситуация, а не степени на човешка стойност или „осъзнатост“.</p>
        </section>

        <section id="za-vodeshti"><h2>Откъде да започне един учител?</h2>
          <p>Избери един казус и съответния работен лист. За първи час е подходящ примерът с училищното съобщение на страница 12 и планът на страница 18. За постове и социални мрежи започни от страници 13-15.</p>
          <p>Съобрази езика, времето и сложността с групата. Упражненията могат да се изпълнят без лични профили, лични съобщения и публично публикуване от ученици.</p>
          <p>Авторската рамка се развива от <Link to="/author">Владимир Атанасов</Link> и център БУДИМ СЕ. Това е образователно предложение с посочени източници и ограничения; няма независимо доказан ефект като цялостна програма.</p>
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
        <a href="#oshte">Още материали</a>
      </aside>
    </div>
  </PageLayout>;
}
