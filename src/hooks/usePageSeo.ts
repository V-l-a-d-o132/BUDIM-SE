import { createContext, useContext, useEffect } from 'react';
export interface PageSeoOptions {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  keywords?: string;
  breadcrumbs?: { name: string; url: string }[];
  schemaType?: 'WebPage' | 'Article' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'ItemPage';
  schemaExtra?: Record<string, unknown>;
}
const BASE_URL = 'https://budimse.online';
const SITE_NAME = 'Център БУДИМ СЕ';
const IMAGE = BASE_URL + '/brand/hero-1440.webp';
const LOGO = BASE_URL + '/brand/logo-192.png';
const FULL_NAME = 'Център за медийна и дигитална грамотност БУДИМ СЕ';
const SCHEMA_IDS = ['organization-schema-jsonld', 'website-schema-jsonld', 'person-schema-jsonld', 'page-schema-jsonld', 'page-breadcrumb-jsonld'];
export const metaAttribute = (name: string) => name.startsWith('og:') || name.startsWith('article:') ? 'property' : 'name';
export const SeoCaptureContext = createContext<((options: PageSeoOptions) => void) | null>(null);
export function buildSeo(options: PageSeoOptions) {
  const title = options.title.includes('БУДИМ СЕ') ? options.title : options.title + ' | ' + SITE_NAME;
  const url = BASE_URL + (options.canonical ?? '/');
  const image = new URL(options.ogImage || IMAGE, BASE_URL).href;
  const meta: Record<string, string> = {
    description: options.description,
    robots: options.noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    'og:title': title, 'og:description': options.description, 'og:url': url,
    'og:type': options.ogType || 'website', 'og:image': image, 'og:site_name': SITE_NAME, 'og:locale': 'bg_BG',
    'twitter:title': title, 'twitter:description': options.description,
    'twitter:image': image, 'twitter:card': 'summary_large_image',
  };
  if (options.schemaType === 'Article') {
    for (const [key, property] of [['article:published_time', 'datePublished'], ['article:modified_time', 'dateModified']]) {
      const value = options.schemaExtra?.[property];
      if (typeof value === 'string') meta[key] = value;
    }
    meta['article:author'] = BASE_URL + '/author';
  }
  const schemas: Record<string, object> = {
    'organization-schema-jsonld': {
      '@context': 'https://schema.org', '@type': 'EducationalOrganization', '@id': BASE_URL + '/#organization',
      name: FULL_NAME, alternateName: [SITE_NAME, 'БУДИМ СЕ'], url: BASE_URL + '/',
      logo: { '@type': 'ImageObject', url: LOGO, width: 192, height: 192 }, email: 'budimseonline@gmail.com',
      description: 'Център за медийна и дигитална грамотност в България. Гражданска и образователна инициатива с практически материали, упражнения за ученици и пилотни обучения за училища.',
      areaServed: { '@type': 'Country', name: 'България' },
      founder: { '@id': BASE_URL + '/author#person' },
      contactPoint: { '@type': 'ContactPoint', contactType: 'Запитвания за образователни занимания', email: 'budimseonline@gmail.com', url: BASE_URL + '/contact', availableLanguage: 'bg' },
    },
    'website-schema-jsonld': {
      '@context': 'https://schema.org', '@type': 'WebSite', '@id': BASE_URL + '/#website',
      url: BASE_URL + '/', name: SITE_NAME, alternateName: 'БУДИМ СЕ', inLanguage: 'bg',
      publisher: { '@id': BASE_URL + '/#organization' },
    },
    'person-schema-jsonld': {
      '@context': 'https://schema.org', '@type': 'Person', '@id': BASE_URL + '/author#person',
      name: 'Владимир Атанасов', url: BASE_URL + '/author',
    },
    'page-schema-jsonld': {
      '@context': 'https://schema.org', '@type': options.schemaType || 'WebPage',
      '@id': url + (options.schemaType === 'Article' ? '#article' : '#webpage'), name: title, description: options.description, url, inLanguage: 'bg', image,
      isPartOf: { '@id': BASE_URL + '/#website' },
      publisher: { '@id': BASE_URL + '/#organization' },
      ...options.schemaExtra,
    },
  };
  if (options.breadcrumbs?.length) schemas['page-breadcrumb-jsonld'] = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: options.breadcrumbs.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name,
      item: item.url.startsWith('https://') ? item.url : BASE_URL + item.url,
    })),
  };
  return { title, url, meta, schemas };
}
export function usePageSeo(options: PageSeoOptions) {
  const capture = useContext(SeoCaptureContext);
  if (capture) capture(options); // Build-time capture only; no browser state changes during render.
  const serialized = JSON.stringify(options);
  useEffect(() => {
    const seo = buildSeo(JSON.parse(serialized) as PageSeoOptions);
    document.title = seo.title;
    document.querySelector('meta[name="keywords"]')?.remove();
    for (const [name, content] of Object.entries(seo.meta)) {
      const attr = metaAttribute(name);
      let element = document.querySelector('meta[' + attr + '="' + name + '"]');
      if (!element) { element = document.createElement('meta'); element.setAttribute(attr, name); document.head.append(element); }
      element.setAttribute('content', content);
    }
    for (const name of ['article:published_time', 'article:modified_time', 'article:author']) {
      if (!(name in seo.meta)) document.querySelector('meta[property="' + name + '"]')?.remove();
    }
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.append(canonical); }
    canonical.setAttribute('href', seo.url);
    for (const id of SCHEMA_IDS) {
      document.getElementById(id)?.remove();
      if (!seo.schemas[id]) continue;
      const script = document.createElement('script');
      script.type = 'application/ld+json'; script.id = id; script.textContent = JSON.stringify(seo.schemas[id]);
      document.head.append(script);
    }
  }, [serialized]);
}
