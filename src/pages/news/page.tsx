import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchNewsListCached, fetchNewsDetailCached } from '@/lib/supabase';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import Breadcrumb from '@/components/feature/Breadcrumb';
import { mockNews } from '@/mocks/news';
import { usePageSeo } from '@/hooks/usePageSeo';
import Icon from '@/components/base/Icon';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  body: string;
  image_url: string | null;
  created_at: string;
  published: boolean;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  usePageSeo({
    title: 'Новини — Анализи и наблюдения от терен',
    description: 'Анализи, наблюдения от терен и материали за медийна грамотност от екипа на Център БУДИМ СЕ. Дигитален суверенитет, когнитивна свобода, поведенчески дизайн.',
    canonical: '/news',
    schemaType: 'CollectionPage',
    schemaExtra: {
      keywords: 'медийна грамотност, дигитален суверенитет, когнитивна свобода, новини, анализи, БУДИМ СЕ',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'БУДИМ СЕ', item: 'https://budimse.online' },
          { '@type': 'ListItem', position: 2, name: 'Новини', item: 'https://budimse.online/news' },
        ],
      },
    },
  });

  useEffect(() => {
    fetchNewsListCached().then((data) => {
      const items = (data as NewsItem[]) ?? [];
      setNews(items.length > 0 ? items : (mockNews as NewsItem[]));
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-medium">Новини</p>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 leading-tight mb-4">
              Актуално от<br />
              <span className="font-medium">Центъра</span>
            </h1>
            <p className="text-gray-500 max-w-xl leading-relaxed">
              Анализи, наблюдения от терен и материали за медийна грамотност от екипа на Център БУДИМ СЕ.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Icon name="ri-loader-4-line" size={24} className="text-gray-300 animate-spin" />
            </div>
          ) : (
            <div className="space-y-0">
              {news.map((item, idx) => (
                <Link
                  key={item.id}
                  to={`/news/${item.slug}`}
                  className="group flex flex-col sm:flex-row gap-6 py-10 border-b border-gray-100 hover:border-gray-300 transition-colors"
                >
                  {item.image_url && (
                    <div className="w-full sm:w-48 h-32 flex-shrink-0 rounded-sm overflow-hidden bg-gray-100">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <p className="text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleDateString('bg-BG', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      {idx === 0 && (
                        <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-sm whitespace-nowrap">
                          Последно
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                      {stripHtml(item.body).slice(0, 200)}...
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 mt-4 group-hover:text-gray-700 transition-colors">
                      Прочети
                      <Icon name="ri-arrow-right-line" size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Dynamic SEO — updates when item loads
  usePageSeo({
    title: item ? `${item.title} | Център БУДИМ СЕ` : 'Новина — Център БУДИМ СЕ',
    description: item
      ? stripHtml(item.body).replace(/\n/g, ' ').slice(0, 155).trim() + '...'
      : 'Анализи и наблюдения от терен — Център БУДИМ СЕ, медийна грамотност и дигитален суверенитет.',
    canonical: slug ? `/news/${slug}` : '/news',
    ogImage: item?.image_url ?? undefined,
    ogType: 'article',
  });

  // Schema.org Article structured data
  useEffect(() => {
    if (!item) return;
    const existingScript = document.getElementById('schema-article');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = 'schema-article';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: item.title,
      description: stripHtml(item.body).replace(/\n/g, ' ').slice(0, 155).trim() + '...',
      image: item.image_url ? [item.image_url] : [],
      datePublished: item.created_at,
      dateModified: item.created_at,
      author: {
        '@type': 'Person',
        name: 'Владимир Атанасов',
        url: 'https://budimse.online/author',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Център за медийна и дигитална грамотност БУДИМ СЕ',
        url: 'https://budimse.online',
        logo: {
          '@type': 'ImageObject',
          url: 'https://budimse.online/site.webmanifest',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://budimse.online/news/${item.slug}`,
      },
      url: `https://budimse.online/news/${item.slug}`,
      inLanguage: 'bg',
      keywords: 'медийна грамотност, дигитален суверенитет, БУДИМ СЕ, когнитивна свобода',
    });
    document.head.appendChild(script);

    return () => {
      const s = document.getElementById('schema-article');
      if (s) s.remove();
    };
  }, [item]);

  useEffect(() => {
    if (!slug) return;
    fetchNewsDetailCached(slug).then((data) => {
      if (data) {
        setItem(data as NewsItem);
      } else {
        const mock = mockNews.find((n) => n.slug === slug);
        if (mock) setItem(mock as NewsItem);
        else setNotFound(true);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Icon name="ri-loader-4-line" size={24} className="animate-spin text-gray-300" />
        </div>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-40 text-center text-gray-400">
          <p className="text-lg mb-4">Новината не е намерена.</p>
          <Link to="/news" className="text-sm text-gray-900 underline">
            Обратно към новините
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <Breadcrumb
            className="mb-6"
            items={[
              { name: 'БУДИМ СЕ', url: '/' },
              { name: 'Новини', url: '/news' },
              { name: item.title.length > 40 ? item.title.slice(0, 40) + '…' : item.title },
            ]}
          />

          <p className="text-xs text-gray-400 mb-4">
            {new Date(item.created_at).toLocaleDateString('bg-BG', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <h1 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight mb-10">
            {item.title}
          </h1>

          {item.image_url && (
            <div className="w-full h-64 md:h-80 rounded-sm overflow-hidden bg-gray-100 mb-12">
              <img
                src={item.image_url}
                alt={item.title}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-top"
              />
            </div>
          )}

          <div className="space-y-6">
            {item.body
              .split('\n')
              .filter(Boolean)
              .map((para, i) => (
                <p
                  key={i}
                  className="text-gray-700 leading-relaxed text-lg [&_a]:text-gray-900 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-gray-600 [&_a]:transition-colors"
                  dangerouslySetInnerHTML={{ __html: para }}
                />
              ))}
          </div>

          <div className="mt-14 pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Icon name="ri-arrow-left-line" size={16} />
                Обратно към новините
              </Link>
              <Link
                to="/center"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                За Центъра
                <Icon name="ri-arrow-right-line" size={16} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
              <Link
                to="/step-1"
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Icon name="ri-map-pin-line" size={12} />
                Рамката — Петте степени
              </Link>
              <Link
                to="/digitalna-gramotnost"
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Icon name="ri-book-open-line" size={12} />
                Дигитална грамотност
              </Link>
              <Link
                to="/analizator"
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Icon name="ri-shield-line" size={12} />
                Анализатор на съдържание
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export { NewsListPage, NewsDetailPage };