import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface PageSeoOptions {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  /** Meta keywords tag — comma-separated list of relevant keywords for this page */
  keywords?: string;
  breadcrumbs?: BreadcrumbItem[];
  /** Schema.org @type for the page JSON-LD. Defaults to 'WebPage'. Use 'Article' for article pages. */
  schemaType?: 'WebPage' | 'Article' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'ItemPage';
  /** Extra Schema.org fields to merge into the page JSON-LD */
  schemaExtra?: Record<string, unknown>;
}

const SITE_NAME = 'Център БУДИМ СЕ';
const BASE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? 'https://budimse.online';
const DEFAULT_IMAGE = 'https://static.readdy.ai/image/658b459fcf05a7723f8029c45615de2f/8c4d6cc5432264247b91f41184c4fe25.png';
const LOGO_URL = 'https://storage.readdy-site.link/project_files/f310a09a-6cb0-4fe3-a3ef-e12bf0036316/c92e355b-473f-4387-a3bb-8e40a8c53bde_DIGITAL-MEDIA-CENTRE-------.png?v=edaa6d50d88bec1dd7055e86d801cea5';

// Site-wide Organization / EducationalOrganization identity — injected on every page
// so search engines and AI crawlers consistently understand what the entity is.
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'EducationalOrganization'],
  name: 'Център за медийна и дигитална грамотност БУДИМ СЕ',
  alternateName: 'Център БУДИМ СЕ',
  url: BASE_URL,
  description:
    'Независима гражданска и образователна инициатива за медийна и дигитална грамотност в България. Създава образователни материали, инструменти и програми, които помагат на хората да разбират дигиталната среда и да я използват по-осъзнато.',
  email: 'budimseonline@gmail.com',
  knowsAbout: [
    'Медийна грамотност',
    'Дигитална грамотност',
    'Критично мислене',
    'Разпознаване на дезинформация',
    'Дигитален суверенитет',
    'Дигитална хигиена',
    'Поведенчески дизайн',
  ],
  logo: {
    '@type': 'ImageObject',
    url: LOGO_URL,
  },
};

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function injectJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

export function usePageSeo({
  title,
  description,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  noIndex = false,
  keywords,
  breadcrumbs,
  schemaType = 'WebPage',
  schemaExtra = {},
}: PageSeoOptions) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

    // Title
    document.title = fullTitle;

    // Meta description
    setMeta('description', description);

    // Meta keywords (optional, per-page)
    if (keywords) {
      setMeta('keywords', keywords);
    }

    // Robots
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large');

    // Canonical
    setLink('canonical', canonicalUrl);

    // Open Graph
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:type', ogType, 'property');
    setMeta('og:image', ogImage, 'property');
    setMeta('og:image:width', '1200', 'property');
    setMeta('og:image:height', '630', 'property');
    setMeta('og:site_name', SITE_NAME, 'property');

    // Twitter
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);
    setMeta('twitter:card', 'summary_large_image');

    // Page Schema.org JSON-LD
    const pageSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      name: fullTitle,
      description,
      url: canonicalUrl,
      inLanguage: 'bg',
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: BASE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: LOGO_URL,
        },
      },
      image: {
        '@type': 'ImageObject',
        url: ogImage,
        width: 1200,
        height: 630,
      },
      ...schemaExtra,
    };
    injectJsonLd('page-schema-jsonld', pageSchema);

    // Site-wide Organization / EducationalOrganization identity (injected once per page)
    injectJsonLd('organization-schema-jsonld', ORGANIZATION_SCHEMA);

    // Breadcrumb Schema.org JSON-LD
    if (breadcrumbs && breadcrumbs.length > 0) {
      injectJsonLd('page-breadcrumb-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
        })),
      });
    }

    // Cleanup on unmount
    return () => {
      document.title = `${SITE_NAME} — Медийна грамотност и дигитален суверенитет | budimse.online`;
      removeJsonLd('page-schema-jsonld');
      removeJsonLd('organization-schema-jsonld');
      removeJsonLd('page-breadcrumb-jsonld');
    };
  }, [title, description, canonical, ogImage, ogType, noIndex, breadcrumbs, schemaType, schemaExtra]);
}
