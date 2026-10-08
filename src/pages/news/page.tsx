import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { fetchNewsListCached, fetchNewsDetailCached } from '@/lib/supabase';
import PageLayout, { PageIntro } from '@/components/feature/PageLayout';
import { usePageSeo } from '@/hooks/usePageSeo';

interface NewsItem {
  id: string; title: string; slug: string; body: string; image_url: string | null;
  created_at: string; updated_at?: string; published: boolean;
}
const plain = (text: string) => text.replace(/<[^>]*>/g, '').replace(/^##?\s+/gm, '').replace(/\s+/g, ' ').trim();
const date = (value: string) => new Date(value).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const filtered = news.filter(item => (item.title + ' ' + plain(item.body)).toLocaleLowerCase('bg').includes(query.toLocaleLowerCase('bg')));
  const totalPages = Math.max(1, Math.ceil(filtered.length / 6));
  const page = Math.min(totalPages, Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1));
  usePageSeo({
    title: 'Материали за медийна и дигитална грамотност',
    description: 'Кратки обяснения, практически въпроси и примери за проверка на информация, социални мрежи, лични данни и дигитални навици.',
    canonical: '/news', schemaType: 'CollectionPage', noIndex: Boolean(query),
    breadcrumbs: [{ name: 'Начало', url: '/' }, { name: 'Материали', url: '/news' }],
  });
  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError(false);
    fetchNewsListCached().then(data => { if (active) setNews((data as NewsItem[]) ?? []); })
      .catch(() => { if (active) setLoadError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  return <PageLayout>
    <PageIntro eyebrow="Материали" title="По-малко шум. Повече контекст."><p>Кратки обяснения и практически въпроси за информацията, социалните мрежи и дигиталните навици. Учебните примери са отделени от установените факти.</p></PageIntro>
    <section className="site-container pb-12">
      <div className="form-field max-w-xl mb-8"><label htmlFor="news-search">Търси тема или дума</label><input id="news-search" type="search" value={query} placeholder="Например: източници, социални мрежи, пароли" onChange={event => setParams(event.target.value ? { q: event.target.value } : {}, { replace: true })} /></div>
      {loading ? <p role="status" className="py-12">Зареждане на материалите…</p> : loadError ? <div role="alert" className="py-8"><p>Материалите временно не могат да бъдат заредени.</p><button className="button-secondary mt-4" onClick={() => setRetry(n => n + 1)}>Опитай отново</button></div> : <>
        <p role="status" className="mb-5">{filtered.length} {filtered.length === 1 ? 'материал' : 'материала'}{query ? ' по това търсене' : ''}</p>
        {filtered.length === 0 && <p className="py-8">{query ? 'Няма съвпадение. Опитай с по-кратка дума или друга тема.' : 'Все още няма публикувани материали.'}</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.slice((page - 1) * 6, page * 6).map(item => <article className="resource-card !p-0 overflow-hidden" key={item.id}>
            {item.image_url && <img src={item.image_url} alt="" loading="lazy" decoding="async" width={420} height={210} className="w-full h-40 object-cover" />}
            <div className="p-6 flex flex-col flex-1"><p className="!text-xs mb-3"><time dateTime={item.updated_at || item.created_at}>{item.updated_at ? 'Обновено: ' : ''}{date(item.updated_at || item.created_at)}</time></p>
              <h2 className="!text-xl"><Link to={'/news/' + item.slug} className="hover:underline underline-offset-4">{item.title}</Link></h2>
              <p className="line-clamp-3 !text-sm">{plain(item.body).slice(0, 190)}…</p><Link to={'/news/' + item.slug} className="text-link" aria-label={'Прочети: ' + item.title}>Прочети материала →</Link></div>
          </article>)}
        </div>
        {totalPages > 1 && <nav aria-label="Страници с материали" className="button-row justify-center mt-8">
          {Array.from({ length: totalPages }, (_, index) => <Link className={page === index + 1 ? 'button-primary' : 'button-secondary'} aria-current={page === index + 1 ? 'page' : undefined} key={index} to={'/news?' + new URLSearchParams({ ...(query ? { q: query } : {}), page: String(index + 1) })}>{index + 1}</Link>)}
        </nav>}
      </>}
    </section>
  </PageLayout>;
}

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  // Never show or mark up the previous article while a different slug is loading.
  const current = item?.slug === slug ? item : null;
  const missing = !loading && !loadError && !current;
  usePageSeo({
    title: current?.title || (missing ? 'Материалът не е намерен' : 'Материал от БУДИМ СЕ'),
    description: current ? plain(current.body).slice(0, 155) : 'Материали за медийна и дигитална грамотност от БУДИМ СЕ.',
    canonical: slug ? '/news/' + slug : '/news', ogImage: current?.image_url || undefined,
    ogType: current ? 'article' : 'website', schemaType: current ? 'Article' : 'WebPage', noIndex: missing,
    schemaExtra: current ? { headline: current.title, datePublished: current.created_at,
      dateModified: current.updated_at || current.created_at,
      author: { '@type': 'Person', name: 'Владимир Атанасов', url: 'https://budimse.online/author' } } : {},
    breadcrumbs: [{ name: 'Начало', url: '/' }, { name: 'Материали', url: '/news' }, ...(current ? [{ name: current.title, url: '/news/' + current.slug }] : [])],
  });
  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError(false); setItem(null);
    fetchNewsDetailCached(slug || '').then(data => { if (active) setItem((data as NewsItem | null) ?? null); })
      .catch(() => { if (active) setLoadError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug, retry]);
  return <PageLayout>
    {loading ? <div className="site-container site-section"><p role="status">Зареждане на материала…</p></div> : loadError ? <div role="alert" className="site-container site-section"><h1>Материалът временно не се зарежда.</h1><p className="mt-5">Провери връзката или опитай отново след малко.</p><button className="button-secondary mt-5" onClick={() => setRetry(n => n + 1)}>Опитай отново</button></div> : current ? <>
      <PageIntro eyebrow="Материали" title={current.title}><p className="!text-sm"><Link to="/author" className="underline">Владимир Атанасов</Link> · Публикувано: <time dateTime={current.created_at}>{date(current.created_at)}</time>{current.updated_at && <> · Обновено: <time dateTime={current.updated_at}>{date(current.updated_at)}</time></>}</p></PageIntro>
      <div className="site-container reading-layout"><article className="prose-content">
        {current.image_url && <img src={current.image_url} alt="" width={800} height={420} decoding="async" className="w-full max-h-80 object-cover rounded-lg mb-8" />}
        {current.body.split(/\n+/).filter(line => line.trim()).map((line, index) => {
          const heading = line.match(/^## (.*)$|^<strong>([^<>]+)<\/strong>$/);
          return heading ? <h2 key={index}>{heading[1] || heading[2]}</h2> : <p key={index} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(line, { ALLOWED_TAGS: ['a', 'b', 'strong', 'i', 'em', 'br'], ALLOWED_ATTR: ['href', 'title'] }) }} />;
        })}
        <div className="source-note"><p>Имаш въпрос или източник за корекция? <Link to="/contact">Пиши ни</Link> с конкретния откъс и линк.</p></div>
      </article><aside className="page-aside"><h2>Продължи с</h2><Link to="/digitalna-gramotnost">Основи на грамотността</Link><Link to="/mediyna-gramotnost-uchenici">Упражнения за ученици</Link><Link to="/news">Всички материали</Link></aside></div>
    </> : <div className="site-container site-section"><h1>Този материал не е наличен.</h1><p className="mt-5">Възможно е адресът да е променен или материалът да е свален.</p><Link to="/news" className="button-primary mt-6">Към материалите</Link></div>}
  </PageLayout>;
}
