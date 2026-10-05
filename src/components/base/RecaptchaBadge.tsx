import ReCAPTCHA from 'react-google-recaptcha';

const RECAPTCHA_SITE_KEY = '6Ldk4essAAAAACVM8lBvL0xtu5m-oOyM3mjKnNj4';

interface RecaptchaBadgeProps {
  className?: string;
}

export default function RecaptchaBadge({ className = '' }: RecaptchaBadgeProps) {
  return (
    <div className={`flex items-center gap-2 text-[10px] text-gray-400 ${className}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>Защитено от reCAPTCHA</span>
      <span className="text-gray-300">·</span>
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 transition-colors underline">Privacy</a>
      <span className="text-gray-300">·</span>
      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 transition-colors underline">Terms</a>
    </div>
  );
}

export { RECAPTCHA_SITE_KEY };