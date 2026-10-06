interface PrivacyConsent { version: number; marketing: boolean; updated_at: number }
declare global {
  interface Window {
    BudimPrivacy?: {
      get(): PrivacyConsent | null;
      save(marketing: boolean): void;
      open(): void;
      route(): void;
    };
  }
}
export const openPrivacySettings = () => window.BudimPrivacy?.open();
