import { Link } from 'react-router-dom';
import Icon from '@/components/base/Icon';

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center flex-wrap gap-1 text-xs text-gray-400 ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && (
              <Icon name="ri-arrow-right-s-line" size={12} className="text-gray-300 flex-shrink-0" />
            )}
            {item.url && !isLast ? (
              <Link
                to={item.url}
                className="hover:text-gray-700 transition-colors whitespace-nowrap"
              >
                {item.name}
              </Link>
            ) : (
              <span
                className={`whitespace-nowrap ${isLast ? 'text-gray-600 font-medium' : ''}`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.name}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
