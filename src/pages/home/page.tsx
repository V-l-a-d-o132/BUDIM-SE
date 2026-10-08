import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, SlidersHorizontal } from 'lucide-react';
import PageLayout from '@/components/feature/PageLayout';
import { usePageSeo } from '@/hooks/usePageSeo';

const paths = [
  { icon: BookOpen, label: 'Разбери', title: 'Преди да повярваш и споделиш', text: 'Източник, доказателства, контекст. Ясно начало за проверка на информация и по-сигурно общуване онлайн.', to: '/digitalna-gramotnost', link: 'Започни с основите' },
  { icon: Users, label: 'Обсъди в клас', title: 'Уроци, които започват с въпрос', text: 'Практически задачи за новини, снимки и социални мрежи. За ученици и учители, с място за различни отговори.', to: '/mediyna-gramotnost-uchenici', link: 'Виж упражненията' },
  { icon: SlidersHorizontal, label: 'Изпробвай', title: 'Какво променя една реакция?', text: 'Учебни симулации за публикации, внимание и препоръки. Сравнявай резултати и обсъждай ограниченията на модела.', to: '/analizator', link: 'Към инструментите' },
];

export default function HomePage() {
  usePageSeo({
    title: 'Дигитална и медийна грамотност в България',
    description: 'БУДИМ СЕ: практически материали за дигитална и медийна грамотност, упражнения за ученици и пилотни обучения за училища. Проверявай, разбирай и избирай.',
    canonical: '/',
  });
  return <PageLayout>
    <section className="home-hero site-container">
      <div>
        <p className="eyebrow">Център БУДИМ СЕ · България</p>
        <h1>Повече разбиране.<br /><span>По-осъзнат избор.</span></h1>
        <p className="lead">Дигитална и медийна грамотност за всекидневието. Учим се да проверяваме информацията, да разбираме социалните мрежи и да използваме технологиите с ясна цел.</p>
        <div className="button-row"><Link className="button-primary" to="/digitalna-gramotnost">Започни оттук <ArrowRight size={18} aria-hidden="true" /></Link><Link className="button-secondary" to="/obucheniya-za-uchilishta">За училища и учители</Link></div>
      </div>
      <aside className="hero-note" aria-labelledby="before-sharing">
        <p className="eyebrow">Една полезна пауза</p><h2 id="before-sharing">Преди да споделиш</h2>
        <ol>
          <li><span>01</span><div><strong>Кой го казва?</strong><p>Потърси първоизточника, автора и датата.</p></div></li>
          <li><span>02</span><div><strong>На какво се основава?</strong><p>Провери доказателствата и липсващия контекст.</p></div></li>
          <li><span>03</span><div><strong>Какво още не знам?</strong><p>Сравни с независим източник. Можеш и да изчакаш.</p></div></li>
        </ol>
        <Link to="/news/proverka-na-fakti" className="text-link">Виж пример за проверка <ArrowRight size={16} aria-hidden="true" /></Link>
      </aside>
    </section>
    <section className="site-section section-tint">
      <div className="site-container"><div className="section-heading"><p className="eyebrow">Полезно още днес</p><h2>Избери откъде да започнеш</h2></div>
        <div className="resource-grid">{paths.map(({ icon: Icon, ...path }) => <article className="resource-card" key={path.to}>
          <div className="card-kicker"><Icon size={22} aria-hidden="true" /><span>{path.label}</span></div><h3>{path.title}</h3><p>{path.text}</p><Link className="text-link" to={path.to}>{path.link}<ArrowRight size={17} aria-hidden="true" /></Link>
        </article>)}</div>
      </div>
    </section>
    <section className="site-section site-container split-section">
      <div><p className="eyebrow">Начинът ни на работа</p><h2>Любопитство, проверка<br />и малки опити.</h2><p>Една публикация може да ни разгневи, разсмее или събере около кауза. Самата емоция не показва дали твърдението е вярно. А популярността има повече от едно обяснение.</p><Link className="text-link" to="/center">Как подхождаме към темите <ArrowRight size={17} aria-hidden="true" /></Link></div>
      <div className="example-box"><p className="eyebrow">Условен пример</p><h3>Два поста, една училищна кауза</h3><p>Единият обвинява: „На никого не му пука за двора.“ Другият кани: „В петък засаждаме три дървета. Кой ще помогне?“</p><p>Кой ще стигне до повече хора? Зависи от аудиторията, момента, връзките между участниците и начина на показване. Сравняваме при ясни условия, без да приемаме победител предварително.</p><Link to="/mediyna-gramotnost-uchenici#socialni-mrezhi" className="text-link">Опитай задачата в клас <ArrowRight size={17} aria-hidden="true" /></Link></div>
    </section>
    <section className="site-container"><div className="school-callout"><div><p className="eyebrow">За училища и групи</p><h2>Да превърнем въпросите в урок.</h2><p>Подготвяме пилотни занимания по медийна грамотност и социални мрежи. Форматът се уточнява според възрастта, времето и нуждите на групата.</p></div><Link to="/obucheniya-za-uchilishta" className="button-primary">Разгледай формата <ArrowRight size={18} aria-hidden="true" /></Link></div></section>
    <section className="site-section site-container book-strip" id="steps"><div><p className="eyebrow">Книгата „Петте степени“</p><h2>Място за собственото ти темпо.</h2><p>Авторска рамка за наблюдение на дигиталните навици и разумни промени. Степените са въпроси и задачи, към които можеш да се връщаш.</p></div><div className="book-links"><Link className="text-link" to="/order">За книгата <ArrowRight size={17} aria-hidden="true" /></Link><Link className="text-link" to="/step-1">Прочети първата степен <ArrowRight size={17} aria-hidden="true" /></Link></div></section>
  </PageLayout>;
}
