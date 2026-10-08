import Icon from './Icon';
import type { HTMLAttributes } from 'react';
/** Existing icon class names rendered as bundled SVG; no external font required. */
export default function LegacyIcon({ className = '', ...props }: HTMLAttributes<SVGElement>) {
  const names = className.split(/\s+/);
  const name = names.find(value => value.startsWith('ri-')) || 'ri-information-line';
  return <Icon name={name} className={'legacy-icon ' + names.filter(value => !value.startsWith('ri-')).join(' ')} aria-hidden="true" {...props} />;
}
