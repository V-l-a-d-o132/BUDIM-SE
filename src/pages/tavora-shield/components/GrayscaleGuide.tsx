import { useState } from 'react';
import Icon from '@/components/base/Icon';
import AppDemo from './focus/AppDemo';
import { AppLogo } from './focus/Visuals';
import { demoApps, settingDefinitions, initialFocusSettings, appIsPaused, visibleDemoBadge,
  type AppId, type FocusSettings, type Platform, type SettingKey } from './focus/model';
import './focus/focus.css';
import { useClassroom } from './classroom/ClassroomContext';

type Instructions = { title: string; steps: string[]; note: string; url: string; source: string };
const guides: Record<Platform, Record<SettingKey, Instructions>> = {
  ios: {
    grayscale: { title: 'Сиви цветове в iOS',
      steps: ['Отвори Settings → Accessibility → Display & Text Size.', 'Отвори Color Filters, включи филтрите и избери Grayscale.', 'За бърз достъп добави Color Filters в Accessibility Shortcut, ако устройството го поддържа.'],
      note: 'Филтърът променя цветовете на дисплея. Настройките за Focus и ограниченията на приложения се управляват отделно.',
      url: 'https://support.apple.com/en-us/111773', source: 'Apple: цветни филтри' },
    quietNotifications: { title: 'Известия и Focus в iOS',
      steps: ['Отвори Settings → Focus и избери или създай профил.', 'В People и Apps избери кои известия да допускаш или заглушаваш.', 'Провери Options за скриване на значките. Активирай профила от Control Center → Focus.'],
      note: 'Настройките за значки, обаждания и важни известия са отделни. Провери изключенията за хората и приложенията, които са ти нужни.',
      url: 'https://support.apple.com/guide/iphone/set-up-a-focus-iphd6288a67f/ios', source: 'Apple: настройване на Focus' },
    pauseSocial: { title: 'Ограничения за приложения в iOS',
      steps: ['Отвори Settings → Screen Time.', 'В iOS 27 използвай Time Allowances и Screen Time Schedule. В по-стари версии потърси App Limits и Downtime.', 'Избери приложения, време и изключения. Провери Always Allowed за нужните контакти и приложения.'],
      note: 'Демото спира шест примерни приложения веднага. На устройството настройваш отделно график или времеви лимит; Focus сам по себе си не блокира приложенията.',
      url: 'https://support.apple.com/guide/iphone/set-schedules-and-time-allowances-iphb0c7313c9/27/ios/27', source: 'Apple: Screen Time' },
  },
  android: {
    grayscale: { title: 'Сиви цветове на Samsung Galaxy',
      steps: ['Отвори Settings → Modes and Routines → Sleep.', 'В настройките на режима добави Grayscale и избери кога да се включва.', 'Активирай режима и провери цветовете. Do not disturb се настройва отделно в Stay focused.'],
      note: 'Пътят е за Samsung Galaxy. Опциите и преводът на менютата зависят от модела и версията на One UI.',
      url: 'https://www.samsung.com/us/support/answer/ANS10001357/', source: 'Samsung: Digital Wellbeing и Sleep' },
    quietNotifications: { title: 'Известия и режими в Android',
      steps: ['В Settings потърси Modes, Do Not Disturb или „Не безпокойте“.', 'Избери кои хора, приложения и типове известия да се допускат.', 'Провери графика, визуалните известия и значките. Те може да имат отделни настройки в Notifications или в стартовия екран.'],
      note: 'Focus mode в Digital Wellbeing поставя избрани приложения на пауза. Do Not Disturb управлява известията; двата режима имат различна функция.',
      url: 'https://support.google.com/android/answer/9346420', source: 'Google: Digital Wellbeing' },
    pauseSocial: { title: 'Пауза на приложения в Android',
      steps: ['Отвори Settings → Digital Wellbeing → App timers.', 'Избери приложенията и добави график или времеви лимит.', 'В Modes and Routines можеш да създадеш отделен режим. Провери ограниченията и нужните ти изключения.'],
      note: 'Наличността и имената зависят от устройството. Пауза, дневен лимит и заглушаване на известия са отделни настройки.',
      url: 'https://www.samsung.com/us/support/answer/ANS10001357/', source: 'Samsung: таймери за приложения' },
  },
};

export default function GrayscaleGuide() {
  const lab = useClassroom();
  const [platform, setPlatform] = useState<Platform>('ios');
  const [settings, setSettings] = useState<FocusSettings>({ ...initialFocusSettings });
  const [openApp, setOpenApp] = useState<AppId | null>(null);
  const [appDark, setAppDark] = useState(false);
  const [guideKey, setGuideKey] = useState<SettingKey>('grayscale');
  const [notificationShown, setNotificationShown] = useState(false);
  const guide = guides[platform][guideKey];
  const platformName = platform === 'ios' ? 'iPhone · iOS' : 'Samsung Galaxy · Android';
  const paused = openApp !== null && appIsPaused(openApp, settings);
  const toggle = (key: SettingKey) => {
    setSettings(previous => ({ ...previous, [key]: !previous[key] }));
    setGuideKey(key);
  };

  return <div className="focus-lab max-w-5xl mx-auto" data-testid="focus-lab">
    <div className="mb-6 max-w-3xl">
      <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">Интерактивен учебен прототип</p>
      <h3 className="text-2xl font-medium text-gray-900 mb-3">Режим на фокус</h3>
      <p className="text-sm text-gray-600 leading-relaxed">Изпробвай как изглеждат три отделни настройки: сиви цветове, тихи известия и пауза на приложения. Отвори приложение и сравни същия екран, като променяш по една настройка.</p>
      <p className="text-xs text-gray-500 leading-relaxed mt-3">{lab ? 'Публикуването, реакциите и разговорите са между участниците в заниманието. Изгледите следват познатите приложения на iPhone и Samsung; отделни менюта може да се различават по версия. Настройките за фокус променят само учебния телефон.' : 'Прототипите са локални имитации с примерни данни. Подредбите са опростени и може да се различават от реалните приложения според версия, регион и устройство. Нито един бутон тук не променя настройките на телефона ти.'}</p>
    </div>
    <div className="grid lg:grid-cols-[minmax(0,390px)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="inline-flex bg-gray-100 rounded-full p-1" aria-label="Операционна система на прототипа">
            {(['ios', 'android'] as const).map(value => <button type="button" key={value} aria-pressed={platform === value} onClick={() => setPlatform(value)} className={`px-5 py-2 min-h-10 rounded-full text-sm transition-colors ${platform === value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>{value === 'ios' ? 'iOS' : 'Android'}</button>)}
          </div>
          <button type="button" onClick={() => setOpenApp(null)} className="inline-flex items-center gap-1.5 px-3 py-2 min-h-11 text-xs text-gray-600 border border-gray-200 rounded-full"><Icon name="ri-home-line" size={15} aria-hidden="true" />Начален екран</button>
        </div>
        <label className="flex items-center gap-3 text-xs text-gray-600 mb-4">Приложение
          <select aria-label="Избери демо приложение" value={openApp ?? ''} onChange={event => setOpenApp(event.target.value ? event.target.value as AppId : null)} className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800">
            <option value="">Начален екран</option>{demoApps.map(app => <option key={app.id} value={app.id}>{app.name}</option>)}
          </select>
        </label>
        <div className={`demo-phone ${platform}`} role="group" aria-label={`${platformName}: учебен телефон`}>
          <span className="demo-side-button" aria-hidden="true" />
          <div className={`demo-phone-screen ${settings.grayscale ? 'grayscale' : ''}`} data-testid="phone-screen">
            <div className={`demo-status-bar ${openApp ? 'in-app' : ''} ${appDark && !paused ? 'dark' : ''}`}>
              <span>9:41</span><span className="demo-camera-cutout" aria-hidden="true" /><div>{settings.quietNotifications && <Icon name="ri-focus-3-line" size={12} aria-label="Тихи известия" />}<Icon name="ri-bar-chart-line" size={13} aria-hidden="true" /><Icon name="ri-wifi-line" size={14} aria-hidden="true" /><Icon name="ri-battery-line" size={19} aria-hidden="true" /></div>
            </div>
            <div className="demo-phone-workspace">
              {openApp ? paused ? <div className="demo-paused"><AppLogo id={openApp} /><h4>Приложението е на пауза</h4><p>Пауза само в тази демонстрация. Цветният и сивият режим не променят това ограничение.</p><button type="button" className="demo-text-button" onClick={() => toggle('pauseSocial')}>Разреши приложенията в демото</button><button type="button" className="demo-text-button secondary" onClick={() => setOpenApp(null)}>Към началния екран</button></div> : <AppDemo key={openApp} appId={openApp} platform={platform} settings={settings} onSettingChange={toggle} onDarkChange={setAppDark} /> : <div className="demo-home">
                <div className="demo-home-widgets"><div className="demo-date-widget"><span>Вторник</span><strong>6</strong><span>Октомври · демо</span></div><div className="demo-weather-widget"><span className="demo-weather-sun" aria-hidden="true" /><strong>21°</strong><span>Примерна прогноза</span></div></div>
                <div className="demo-app-grid">{demoApps.map(app => {
                  const badge = lab ? (settings.quietNotifications ? 0 : lab.state.notifications.filter(item => item.app_id === app.id && !item.read).length) : visibleDemoBadge(app.id, settings);
                  return <button type="button" key={app.id} aria-label={`Отвори демото на ${app.name}`} onClick={() => setOpenApp(app.id)} className={appIsPaused(app.id, settings) ? 'app-paused' : ''}><span className="demo-home-icon"><AppLogo id={app.id} platform={platform} />{badge > 0 && <span className="demo-badge" aria-hidden="true">{badge}</span>}{appIsPaused(app.id, settings) && <span className="demo-paused-badge" aria-hidden="true"><Icon name="ri-time-line" size={12} /></span>}</span><span>{app.name}</span></button>;
                })}</div>
                <span className="demo-home-search"><Icon name="ri-search-line" size={12} aria-hidden="true" />{platform === 'ios' ? 'Начален екран' : 'Учебен прототип'}</span>
                <div className="demo-home-dock">{(['whatsapp', 'chrome', 'camera', 'settings'] as const).map(id => <button type="button" key={id} aria-label={`Отвори ${demoApps.find(app => app.id === id)?.name} от дока`} onClick={() => setOpenApp(id)}><AppLogo id={id} platform={platform} /></button>)}</div>
              </div>}
              {notificationShown && <div className="demo-system-notification" role="status"><div><Icon name={settings.quietNotifications ? 'ri-focus-3-line' : 'ri-notification-line'} size={18} aria-hidden="true" /><strong>{settings.quietNotifications ? 'Известието е заглушено' : 'Примерно известие'}</strong><button type="button" aria-label="Затвори примерното известие" onClick={() => setNotificationShown(false)}><Icon name="ri-close-line" size={17} aria-hidden="true" /></button></div><p>{settings.quietNotifications ? 'В демото е активна настройката „Тихи известия“.' : 'Мила · демо: Ще се видим по-късно?'}</p></div>}
            </div>
            <button type="button" className={`demo-home-gesture ${appDark && !paused ? 'dark' : ''}`} aria-label="Начален екран на учебния телефон" onClick={() => setOpenApp(null)}><span aria-hidden="true" /></button>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed" aria-live="polite">{platformName} · {settings.grayscale ? 'сиви цветове' : 'цветен екран'} · {settings.quietNotifications ? 'тихи известия' : 'примерни известия'}{settings.pauseSocial ? ' · приложения на пауза' : ''}</p>
      </div>
      <div className="min-w-0">
        <h4 className="text-base font-medium text-gray-900 mb-4">Промени една настройка</h4>
        <div className="space-y-3">{settingDefinitions.map(setting => <button type="button" key={setting.id} role="switch" aria-checked={settings[setting.id]} aria-label={setting.title} onClick={() => toggle(setting.id)} className="w-full flex items-start gap-3 p-4 text-left bg-white border border-gray-200 rounded-xl hover:border-gray-400"><span className="p-2 bg-gray-100 rounded-lg text-gray-700"><Icon name={setting.icon} size={19} aria-hidden="true" /></span><span className="flex-1"><span className="block text-sm font-medium text-gray-900">{setting.title}</span><span className="block text-xs text-gray-500 leading-relaxed mt-1">{setting.description}</span></span><span className={`demo-switch ${settings[setting.id] ? 'on' : ''}`} aria-hidden="true" /></button>)}</div>
        <div className="flex flex-wrap gap-2 my-4"><button type="button" onClick={() => setNotificationShown(true)} className="text-xs px-4 py-3 border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50">Покажи пример за известие</button><button type="button" onClick={() => { setSettings({ ...initialFocusSettings }); setNotificationShown(false); }} className="text-xs px-4 py-3 text-gray-600 underline underline-offset-4">Нулирай настройките</button></div>
        {lab && <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4"><h4 className="text-sm font-medium mb-2">{lab.state.access?.room.name}</h4><p className="text-xs text-gray-600 leading-relaxed">Лентите са подредени {lab.state.access?.room.sort_mode === 'reactions' ? 'по общ брой реакции, коментари и споделяния' : 'по време на публикуване'}. Това е видимо учебно правило. Броячите показват действията в заниманието; показването на екрана не доказва, че текстът е прочетен.</p><button type="button" onClick={() => { void lab.refresh(); }} className="mt-3 text-xs underline">Обнови заниманието</button></div>}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6"><h4 className="text-sm font-medium text-gray-900 mb-2">Какво показва сравнението</h4><p className="text-sm text-gray-600 leading-relaxed">Сивият филтър променя цветовете, но запазва текста, подредбата и съдържанието. Ефектът върху вниманието и използването е индивидуален. Можеш да наблюдаваш времето и прекъсванията си при една промяна, без да очакваш гарантиран резултат.</p></div>
        <section className="border border-gray-200 rounded-xl p-5">
          <h4 className="text-sm font-medium text-gray-900 mb-4">На истинското устройство</h4>
          <div className="flex flex-wrap gap-2 mb-5" aria-label="Вид инструкции">{settingDefinitions.map(setting => <button type="button" key={setting.id} aria-pressed={guideKey === setting.id} onClick={() => setGuideKey(setting.id)} className={`px-3 py-2 rounded-full border text-xs ${guideKey === setting.id ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600'}`}>{setting.id === 'grayscale' ? 'Цветове' : setting.id === 'quietNotifications' ? 'Известия' : 'Приложения'}</button>)}</div>
          <h5 className="text-sm font-medium text-gray-800 mb-4">{guide.title}</h5>
          <ol className="space-y-4">{guide.steps.map((step, index) => <li key={step} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed"><span className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-full text-xs text-gray-700">{index + 1}</span><span>{step}</span></li>)}</ol>
          <p className="text-xs text-gray-500 leading-relaxed mt-5">{guide.note} Менютата може да са преведени според езика на телефона.</p>
          <a className="inline-flex items-center gap-1 text-xs text-gray-800 underline underline-offset-4 mt-4" href={guide.url} target="_blank" rel="noopener noreferrer">{guide.source}<Icon name="ri-external-link-line" size={12} aria-hidden="true" /></a>
        </section>
      </div>
    </div>
  </div>;
}

