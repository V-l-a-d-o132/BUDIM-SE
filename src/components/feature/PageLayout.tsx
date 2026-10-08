import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PageLayout({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={'site-page ' + className}><Navbar /><main id="main-content" tabIndex={-1}>{children}</main><Footer /></div>;
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <header className="page-intro site-container">
    <nav aria-label="Път до страницата" className="page-breadcrumb"><Link to="/">Начало</Link><span aria-hidden="true">/</span><span>{eyebrow}</span></nav>
    <p className="eyebrow">{eyebrow}</p><h1>{title}</h1><div className="lead">{children}</div>
  </header>;
}
