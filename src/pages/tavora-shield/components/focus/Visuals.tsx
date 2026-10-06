import Icon from '@/components/base/Icon';
import type { AppId, Platform } from './model';

export function AppLogo({ id, platform = 'ios' }: { id: AppId; platform?: Platform }) {
  if (id === 'instagram') return <span className="demo-logo logo-instagram"><Icon name="ri-instagram-line" size={31} strokeWidth={2} aria-hidden="true" /></span>;
  if (id === 'facebook') return <span className="demo-logo logo-facebook"><b>f</b></span>;
  if (id === 'x') return <span className="demo-logo logo-x"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 5h6l14 22h-6L6 5Zm20 0L6 27" fill="none" stroke="white" strokeWidth="2.2" /></svg></span>;
  if (id === 'tiktok') return <span className="demo-logo logo-tiktok"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M18 5v17a5 5 0 1 1-5-5m5-12c0 6 5 8 9 8" fill="none" stroke="#25f4ee" strokeWidth="4" transform="translate(-1 1)" /><path d="M18 5v17a5 5 0 1 1-5-5m5-12c0 6 5 8 9 8" fill="none" stroke="#fe2c55" strokeWidth="4" transform="translate(1 0)" /><path d="M18 5v17a5 5 0 1 1-5-5m5-12c0 6 5 8 9 8" fill="none" stroke="white" strokeWidth="3" /></svg></span>;
  if (id === 'youtube') return <span className="demo-logo logo-youtube"><svg viewBox="0 0 36 28" aria-hidden="true"><rect x="1" y="3" width="34" height="22" rx="7" fill="#ff0033" /><path d="m15 9 10 5-10 5Z" fill="white" /></svg></span>;
  if (id === 'whatsapp') return <span className="demo-logo logo-whatsapp"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 24 4 29l7-2a12 12 0 1 0-4-3Z" fill="none" stroke="white" strokeWidth="2" /><path d="m11 9-2 3c1 6 5 10 11 10l3-3-4-2-2 2c-3-1-5-3-6-5l2-2Z" fill="white" /></svg></span>;
  if (id === 'snapchat') return <span className="demo-logo logo-snapchat"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10 13V9a6 6 0 0 1 12 0v4l4 2-3 2c0 4 3 6 5 6l-4 2-3-1-5 3-5-3-3 1-4-2c2 0 5-2 5-6l-3-2Z" fill="white" stroke="#151515" strokeWidth="1.3" strokeLinejoin="round" /></svg></span>;
  if (id === 'gmail') return <span className="demo-logo logo-google"><svg viewBox="0 0 36 28" aria-hidden="true"><path d="M4 25V6l14 10L32 6v19" fill="none" stroke="#4285f4" strokeWidth="5" strokeLinejoin="round" /><path d="M4 25V6l14 10L32 6v19" fill="none" stroke="#34a853" strokeWidth="5" strokeDasharray="21 999" /><path d="m4 6 14 10L32 6" fill="none" stroke="#ea4335" strokeWidth="5" /><path d="M32 6v10" stroke="#fbbc04" strokeWidth="5" /></svg></span>;
  if (id === 'chrome') return <span className="demo-logo logo-google"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="#ea4335" /><path d="M16 16h14A14 14 0 0 1 7 27Z" fill="#34a853" /><path d="M16 16 7 4a14 14 0 0 1 23 12Z" fill="#fbbc04" /><circle cx="16" cy="16" r="6.5" fill="#4285f4" stroke="white" strokeWidth="1.4" /></svg></span>;
  if (id === 'photos' && platform === 'android') return <span className="demo-logo logo-google"><svg viewBox="0 0 36 36" aria-hidden="true"><path d="M18 18V2a8 8 0 0 1 0 16Z" fill="#ea4335" /><path d="M18 18h16a8 8 0 0 1-16 0Z" fill="#4285f4" /><path d="M18 18v16a8 8 0 0 1 0-16Z" fill="#34a853" /><path d="M18 18H2a8 8 0 0 1 16 0Z" fill="#fbbc05" /></svg></span>;
  if (id === 'photos') return <span className="demo-logo logo-google"><svg viewBox="0 0 36 36" aria-hidden="true">{['#ffb52d','#ff7b34','#f25771','#c264a5','#7a80c9','#5daed4','#63bcab','#abd06c'].map((color, index) => <ellipse key={color} cx="18" cy="9" rx="5" ry="8" fill={color} fillOpacity=".82" transform={`rotate(${index * 45} 18 18)`} />)}</svg></span>;
  return <span className={`demo-logo ${id === 'settings' ? 'logo-settings' : 'logo-camera'}`}><Icon name={id === 'settings' ? 'ri-settings-3-line' : 'ri-camera-fill'} size={30} strokeWidth={2} aria-hidden="true" /></span>;
}

// Local illustrative media. No remote image requests, video autoplay or tracking.
export function Scene({ variant = 0, portrait = false }: { variant?: number; portrait?: boolean }) {
  const palettes = [
    ['#dcefee', '#f6c57c', '#88ac91', '#496c59', '#c6d8be'],
    ['#eadfed', '#ffbe9b', '#bf97c1', '#716184', '#dbc5d8'],
    ['#e9e5cf', '#f4aa61', '#bbba8a', '#656d4f', '#d9d6b7'],
  ];
  const colors = palettes[variant % palettes.length];
  return <svg className="demo-scene" viewBox={portrait ? '0 0 400 650' : '0 0 400 400'} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Примерна илюстрация на природен пейзаж">
    <rect width="400" height="650" fill={colors[0]} />
    <circle cx={variant % 2 ? 120 : 285} cy="110" r="48" fill={colors[1]} />
    <path d="m0 300 105-150 110 105 85-90 100 130v355H0Z" fill={colors[2]} />
    <path d="M0 320q110-110 230-5t170 0v335H0Z" fill={colors[3]} />
    <path d="M170 650q95-220 5-285 140 55 20 285Z" fill={colors[4]} />
    <path d="m95 205 10-55 40 38-20-4-14 10Z" fill="#fff" opacity=".7" />
  </svg>;
}

export function Avatar({ name, index = 0 }: { name: string; index?: number }) {
  const colors = ['#e4b3a8', '#a4c3bd', '#a9b5d7', '#d8be95'];
  return <span className="demo-avatar" style={{ background: colors[index % colors.length] }} aria-hidden="true">{name.slice(0, 1)}</span>;
}
