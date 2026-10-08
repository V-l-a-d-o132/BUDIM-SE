import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const links = [
  { to: '/digitalna-gramotnost', label: 'Грамотност' },
  { to: '/obucheniya-za-uchilishta', label: 'За училища' },
  { to: '/news', label: 'Материали' },
  { to: '/analizator', label: 'Инструменти' },
  { to: '/center', label: 'За центъра' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const { pathname, hash } = useLocation();

  useEffect(() => { setOpen(false); }, [pathname, hash]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
    };
    const onPointer = (event: PointerEvent) => {
      if (!nav.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Към съдържанието</a>
      <nav className="site-container" aria-label="Основна навигация" ref={nav}>
        <div className="nav-row">
          <Link to="/" className="brand" aria-label="БУДИМ СЕ — начало">
            <img src="https://storage.readdy-site.link/project_files/f310a09a-6cb0-4fe3-a3ef-e12bf0036316/c92e355b-473f-4387-a3bb-8e40a8c53bde_DIGITAL-MEDIA-CENTRE-------.png?v=edaa6d50d88bec1dd7055e86d801cea5" width={40} height={40} alt="" className="brand-logo" />
            <span>БУДИМ СЕ<span className="brand-caption">Медийна и дигитална грамотност</span></span>
          </Link>
          <div className="desktop-nav">
            {links.map(link => <NavLink key={link.to} to={link.to}>{link.label}</NavLink>)}
            <Link to="/contact" className="nav-contact">Свържи се</Link>
          </div>
          <button className="menu-toggle" ref={toggle} type="button" aria-expanded={open}
            aria-controls="mobile-navigation" aria-label={open ? 'Затвори менюто' : 'Отвори менюто'}
            onClick={() => setOpen(value => !value)}>
            {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
        <div id="mobile-navigation" className="mobile-nav" hidden={!open}>
          {links.map(link => <NavLink key={link.to} to={link.to}>{link.label}</NavLink>)}
          <Link to="/mediyna-gramotnost-uchenici">Упражнения за ученици</Link>
          <Link to="/order">Книгата „Петте степени“</Link>
          <Link to="/contact">Свържи се</Link>
        </div>
      </nav>
    </header>
  );
}
