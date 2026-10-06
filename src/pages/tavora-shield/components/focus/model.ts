export type Platform = 'ios' | 'android';
export type AppId = 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'x' | 'snapchat' | 'whatsapp' | 'gmail' | 'chrome' | 'photos' | 'camera' | 'settings';
export interface FocusSettings { grayscale: boolean; quietNotifications: boolean; pauseSocial: boolean }
export const initialFocusSettings: FocusSettings = { grayscale: false, quietNotifications: false, pauseSocial: false };
export const demoApps: { id: AppId; name: string; social: boolean; badge: number }[] = [
  { id: 'instagram', name: 'Instagram', social: true, badge: 3 },
  { id: 'tiktok', name: 'TikTok', social: true, badge: 2 },
  { id: 'facebook', name: 'Facebook', social: true, badge: 1 },
  { id: 'youtube', name: 'YouTube', social: true, badge: 0 },
  { id: 'x', name: 'X', social: true, badge: 0 },
  { id: 'snapchat', name: 'Snapchat', social: true, badge: 1 },
  { id: 'whatsapp', name: 'WhatsApp', social: false, badge: 2 },
  { id: 'gmail', name: 'Gmail', social: false, badge: 1 },
  { id: 'chrome', name: 'Chrome', social: false, badge: 0 },
  { id: 'photos', name: 'Снимки', social: false, badge: 0 },
  { id: 'camera', name: 'Камера', social: false, badge: 0 },
  { id: 'settings', name: 'Настройки', social: false, badge: 0 },
];
export function appIsPaused(appId: AppId, settings: FocusSettings): boolean {
  return settings.pauseSocial && demoApps.some(app => app.id === appId && app.social);
}
export function visibleDemoBadge(appId: AppId, settings: FocusSettings): number {
  return settings.quietNotifications ? 0 : demoApps.find(app => app.id === appId)?.badge ?? 0;
}
export type SettingKey = keyof FocusSettings;
export const settingDefinitions: { id: SettingKey; title: string; description: string; icon: string }[] = [
  { id: 'grayscale', title: 'Сиви цветове', description: 'Променя цветовете. Съдържанието и достъпът остават същите.', icon: 'ri-contrast-2-line' },
  { id: 'quietNotifications', title: 'Тихи известия', description: 'Скрива примерните значки и заглушава демонстрационното известие.', icon: 'ri-notification-line' },
  { id: 'pauseSocial', title: 'Пауза на социалните приложения', description: 'Спира достъпа до шестте социални приложения в демото. Чатовете и пощата остават достъпни.', icon: 'ri-time-line' },
];
