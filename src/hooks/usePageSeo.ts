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
const IMAGE = 'https://static.readdy.ai/image/658b459fcf05a7723f8029c45615de2f/8c4d6cc5432264247b91f41184c4fe25.png';
const LOGO = 'https://storage.readdy-site.link/project_files/f310a09a-6cb0-4fe3-a3ef-e12bf0036316/c92e355b-473f-4387-a3bb-8e40a8c53bde_DIGITAL-MEDIA-CENTRE-------.png?v=edaa6d50d88bec1dd7055e86d801cea5';
export const SeoCaptureContext = createContext<((options: PageSeoOptions) => void) | null>(null);
export function buildSeo(options: PageSeoOptions) {
  const title = options.title.includes('БУДИМ СЕ') ? options.title : options.title + ' | ' + SITE_NAME;
  const url = BASE_URL + (options.canonical ?? '/');
  const image = options.ogImage || IMAGE;
  const meta: Record<string, string> = {
    description: options.description,
    robots: options.noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    'og:title': title, 'og:description': options.description, 'og:url': url,
    'og:type': options.ogType || 'website', 'og:image': image, 'og:site_name': SITE_NAME, 'og:locale': 'bg_BG',
    'twitter:title': title, 'twitter:description': options.description,
    'twitter:image': image, 'twitter:card': 'summary_large_image',
  };
  const schemas: Record<string, object> = {
    'organization-schema-jsonld': {
      '@context': 'https://schema.org', '@type': 'Organization', '@id': BASE_URL + '/#organization',
      name: SITE_NAME, url: BASE_URL, logo: LOGO, email: 'budimseonline@gmail.com',
      description: 'Гражданска и образователна инициатива за медийна и дигитална грамотност в България.',
    },
    'page-schema-jsonld': {
      '@context': 'https://schema.org', '@type': options.schemaType || 'WebPage',
      name: title, description: options.description, url, inLanguage: 'bg', image,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: BASE_URL },
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
      const attr = name.startsWith('og:') ? 'property' : 'name';
      let element = document.querySelector('meta[' + attr + '="' + name + '"]');
      if (!element) { element = document.createElement('meta'); element.setAttribute(attr, name); document.head.append(element); }
      element.setAttribute('content', content);
    }
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.append(canonical); }
    canonical.setAttribute('href', seo.url);
    for (const id of ['organization-schema-jsonld', 'page-schema-jsonld', 'page-breadcrumb-jsonld']) {
      document.getElementById(id)?.remove();
      if (!seo.schemas[id]) continue;
      const script = document.createElement('script');
      script.type = 'application/ld+json'; script.id = id; script.textContent = JSON.stringify(seo.schemas[id]);
      document.head.append(script);
    }
  }, [serialized]);
}
