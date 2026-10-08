import { Link } from 'react-router-dom';
import PageLayout from '@/components/feature/PageLayout';
import { usePageSeo } from '@/hooks/usePageSeo';
export default function NotFound() {
  usePageSeo({ title: 'Страницата не е намерена', description: 'Този адрес не води до страница на БУДИМ СЕ.', noIndex: true });
  return <PageLayout><div className="site-container site-section"><p className="eyebrow">404</p><h1>Тази страница не е намерена.</h1><p className="lead mt-6">Адресът може да е променен или изписан неточно. Можеш да продължиш от началото или да разгледаш материалите.</p><div className="button-row"><Link to="/" className="button-primary">Към началото</Link><Link to="/news" className="button-secondary">Към материалите</Link></div></div></PageLayout>;
}
