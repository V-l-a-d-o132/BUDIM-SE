import { useEffect, useRef, useState, type ReactNode } from 'react';
import Icon from '@/components/base/Icon';
import { AppLogo, Avatar, Scene } from './Visuals';
import { demoApps, settingDefinitions, type AppId, type FocusSettings, type Platform, type SettingKey } from './model';
import { useClassroom } from '../classroom/ClassroomContext';
import NativeApp from '../classroom/NativeApp';
import NativeUtilities from '../classroom/NativeUtilities';
import type { LabApp } from '@/lib/classroom';

type Tab = { id: string; label: string; icon: string };
const tabs: Partial<Record<AppId, Tab[]>> = {
  instagram: [
    { id: 'home', label: 'Начало', icon: 'ri-home-line' }, { id: 'reels', label: 'Reels', icon: 'ri-video-line' },
    { id: 'messages', label: 'Съобщения', icon: 'ri-send-plane-line' }, { id: 'search', label: 'Търсене', icon: 'ri-search-line' }, { id: 'profile', label: 'Профил', icon: 'ri-user-line' },
  ],
  tiktok: [
    { id: 'home', label: 'Начало', icon: 'ri-home-line' }, { id: 'friends', label: 'Приятели', icon: 'ri-team-line' },
    { id: 'create', label: 'Създай', icon: 'ri-add-line' }, { id: 'messages', label: 'Входящи', icon: 'ri-inbox-line' }, { id: 'profile', label: 'Профил', icon: 'ri-user-line' },
  ],
  facebook: [
    { id: 'home', label: 'Начало', icon: 'ri-home-line' }, { id: 'reels', label: 'Reels', icon: 'ri-video-line' },
    { id: 'friends', label: 'Приятели', icon: 'ri-team-line' }, { id: 'market', label: 'Marketplace', icon: 'ri-store-2-line' }, { id: 'profile', label: 'Профил', icon: 'ri-user-line' },
  ],
  youtube: [
    { id: 'home', label: 'Начало', icon: 'ri-home-line' }, { id: 'reels', label: 'Shorts', icon: 'ri-video-line' },
    { id: 'create', label: 'Създай', icon: 'ri-add-line' }, { id: 'subscriptions', label: 'Абонаменти', icon: 'ri-repeat-line' }, { id: 'profile', label: 'Ти', icon: 'ri-user-line' },
  ],
  x: [
    { id: 'home', label: 'Начало', icon: 'ri-home-line' }, { id: 'search', label: 'Търсене', icon: 'ri-search-line' },
    { id: 'notifications', label: 'Известия', icon: 'ri-notification-line' }, { id: 'messages', label: 'Съобщения', icon: 'ri-mail-line' },
  ],
  snapchat: [
    { id: 'map', label: 'Карта', icon: 'ri-map-pin-line' }, { id: 'messages', label: 'Чат', icon: 'ri-chat-1-line' },
    { id: 'camera', label: 'Камера', icon: 'ri-camera-line' }, { id: 'stories', label: 'Истории', icon: 'ri-team-line' }, { id: 'reels', label: 'Spotlight', icon: 'ri-video-line' },
  ],
};
const contacts = [
  { name: 'Алекс · демо', message: 'Ще се видим в 18:00?', time: '09:40', unread: true },
  { name: 'Мила · демо', message: 'Благодаря за споделената книга.', time: '09:12', unread: false },
  { name: 'Клуб за четене · демо', message: 'Срещата ни е в събота.', time: 'Вчера', unread: true },
  { name: 'Ива · демо', message: 'Чудесна идея за разходка.', time: 'Вчера', unread: false },
];

function SmallButton({ label, icon, onClick, pressed, children }: { label: string; icon?: string; onClick: () => void; pressed?: boolean; children?: ReactNode }) {
  return <button type="button" className="demo-icon-button" aria-label={label} aria-pressed={pressed} onClick={onClick}>{icon && <Icon name={icon} size={21} aria-hidden="true" />}{children}</button>;
}
function Stories({ onSelect }: { onSelect: (name: string) => void }) {
  return <div className="demo-stories">{['Ти', 'Алекс', 'Мила', 'Ива'].map((name, index) => <button type="button" key={name} onClick={() => onSelect(name)}><span className="demo-story-ring"><Avatar name={name} index={index} /></span><span>{name}</span></button>)}</div>;
}
function PhotoGrid({ onSelect, count = 9 }: { onSelect: (index: number) => void; count?: number }) {
  return <div className="demo-photo-grid">{Array.from({ length: count }, (_, index) => <button type="button" key={index} onClick={() => onSelect(index)} aria-label={`Отвори примерна снимка ${index + 1}`}><Scene variant={index} /></button>)}</div>;
}

type AppProps = { appId: AppId; platform: Platform; settings: FocusSettings; onSettingChange: (key: SettingKey) => void; onDarkChange: (dark: boolean) => void };
export default function AppDemo(props: AppProps) {
  const lab=useClassroom();
  if(lab) return ['instagram','tiktok','facebook','youtube','x','snapchat','whatsapp','gmail'].includes(props.appId)
    ? <NativeApp {...props} appId={props.appId as LabApp}/>
    : <NativeUtilities {...props}/>;
  return <LocalAppDemo {...props}/>;
}
function LocalAppDemo({ appId, platform, settings, onSettingChange, onDarkChange }: AppProps) {
  const [selectedTab, setActiveTab] = useState(appId === 'snapchat' ? 'camera' : 'home');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState('Всички');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<{ title: string; content: ReactNode } | null>(null);
  const [clearScreen, setClearScreen] = useState(false);
  const [clipIndex, setClipIndex] = useState(0);
  const [cameraMode, setCameraMode] = useState('Снимка');
  const [cameraZoom, setCameraZoom] = useState(1);
  const noticeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!notice) return;
    const opener = document.activeElement;
    noticeRef.current?.focus();
    return () => { if (opener instanceof HTMLElement && opener.isConnected) opener.focus(); };
  }, [notice]);
  const appName = demoApps.find(app => app.id === appId)?.name ?? '';
  const demoNotice = (title: string, description: string) => setNotice({ title, content: <p>{description}</p> });
  const photoNotice = (index: number) => setNotice({ title: 'Примерна снимка', content: <><Scene variant={index} /><p>Локална илюстрация в учебния прототип.</p></> });
  const messageList = () => <div className="demo-message-list">{contacts.filter(contact =>
    (filter !== 'Непрочетени' || contact.unread) && (filter !== 'Групи' || contact.name.startsWith('Клуб')) && contact.name.toLowerCase().includes(query.toLowerCase())
  ).map((contact, index) => <button type="button" key={contact.name} onClick={() => setNotice({ title: contact.name, content: <div className="demo-conversation"><p className="demo-chat-bubble">{contact.message}</p><p className="demo-chat-bubble own">Да, ще се видим!</p><p className="demo-caption">Това е примерен разговор. Не се изпращат съобщения.</p></div> })}>
    <Avatar name={contact.name} index={index} /><span className="demo-message-text"><strong>{contact.name}</strong><span>{contact.message}</span></span><span className="demo-message-meta">{contact.time}{contact.unread && !settings.quietNotifications && <b>1</b>}</span>
  </button>)}</div>;
  const chips = (values: string[]) => <div className="demo-chips">{values.map(value => <button type="button" key={value} onClick={() => setFilter(value)} aria-pressed={filter === value} className={filter === value ? 'selected' : ''}>{value}</button>)}</div>;
  const search = (placeholder = 'Търсене в демото') => <label className="demo-search"><Icon name="ri-search-line" size={17} aria-hidden="true" /><input aria-label={placeholder} placeholder={placeholder} value={query} onChange={event => setQuery(event.target.value)} /></label>;
  const interactionRow = (isFacebook = false) => <div className="demo-post-actions">
    <SmallButton label={liked ? 'Премахни демо харесването' : 'Харесай демо публикацията'} icon={isFacebook ? 'ri-thumb-up-line' : 'ri-heart-line'} pressed={liked} onClick={() => setLiked(!liked)} />
    <SmallButton label="Примерни коментари" icon="ri-chat-1-line" onClick={() => demoNotice('Примерни коментари', 'Мила · демо: „Красив пейзаж!“ Всеки текст в тази демонстрация е примерен.')} />
    <SmallButton label="Пример за споделяне" icon="ri-send-plane-line" onClick={() => demoNotice('Споделяне', 'В истинското приложение тук избираш получател. Демото не публикува и не изпраща нищо.')} />
    <SmallButton label={saved ? 'Премахни от запазените в демото' : 'Запази в демото'} icon="ri-bookmark-line" pressed={saved} onClick={() => setSaved(!saved)} />
  </div>;
  const profile = () => <div className="demo-profile"><Avatar name="Демо" /><h2>Демо профил</h2><p>Примерни данни · локален прототип</p><div className="demo-profile-counts"><span><b>9</b> публикации</span><span><b>24</b> последователи</span><span><b>18</b> следвани</span></div><PhotoGrid onSelect={photoNotice} /></div>;
  const clip = () => <div className="demo-clip">
    <Scene portrait variant={clipIndex} />
    {!clearScreen && <><div className="demo-clip-tabs"><span>{appId === 'youtube' ? 'Shorts' : appId === 'instagram' ? 'Reels' : 'За теб'}</span><button type="button" onClick={() => { setClipIndex(index => index + 1); setLiked(false); }}>Следващ пример</button></div><div className="demo-clip-actions">
      <SmallButton label="Харесай примерния клип" icon="ri-heart-line" pressed={liked} onClick={() => setLiked(!liked)} />
      <SmallButton label="Коментари към примерния клип" icon="ri-chat-1-line" onClick={() => demoNotice('Коментари', 'Примерен екран за обсъждане на клип. Няма реална публикация.')} />
      <SmallButton label="Споделяне на примерния клип" icon="ri-share-forward-line" onClick={() => demoNotice('Споделяне', 'Тази демонстрация не изпраща данни към платформата.')} />
    </div><div className="demo-clip-caption"><b>@demo_nature</b><p>Един пейзаж, различни цветове.</p><span>Илюстрация · без видео и звук</span></div></>}
    <button type="button" className="demo-clear-screen" aria-pressed={clearScreen} onClick={() => setClearScreen(!clearScreen)}>{clearScreen ? 'Покажи контролите' : 'Скрий контролите'}</button>
  </div>;
  const camera = () => <div className="demo-camera">
    <div className="demo-camera-view"><div style={{ transform: `scale(${cameraZoom})` }}><Scene portrait /></div><div className="demo-camera-grid" aria-hidden="true" /><span className="demo-camera-label">Учебен визьор · без достъп до камера</span><button type="button" className="demo-zoom" onClick={() => setCameraZoom(zoom => zoom === 1 ? 2 : 1)}>{cameraZoom}×</button></div>
    <div className="demo-camera-modes">{['Видео', 'Снимка', 'Портрет'].map(mode => <button type="button" key={mode} aria-pressed={cameraMode === mode} onClick={() => setCameraMode(mode)}>{mode}</button>)}</div>
    <div className="demo-camera-controls"><SmallButton label="Примерна галерия" icon="ri-image-line" onClick={() => photoNotice(0)} /><button type="button" className="demo-shutter" aria-label={`Демонстрирай заснемане: ${cameraMode}`} onClick={() => demoNotice('Демо заснемане', 'Няма достъп до камерата и не се създава файл. Визьорът показва локална илюстрация.')} /><SmallButton label="Смени примерния изглед" icon="ri-refresh-line" onClick={() => setCameraZoom(zoom => zoom === 1 ? 2 : 1)} /></div>
  </div>;

  let appTabs = tabs[appId] ?? [];
  if (appId === 'whatsapp') appTabs = platform === 'ios' ? [
    { id: 'updates', label: 'Актуализации', icon: 'ri-repeat-line' }, { id: 'calls', label: 'Обаждания', icon: 'ri-phone-line' },
    { id: 'home', label: 'Чатове', icon: 'ri-chat-1-line' }, { id: 'settings', label: 'Настройки', icon: 'ri-settings-3-line' },
  ] : [
    { id: 'home', label: 'Чатове', icon: 'ri-chat-1-line' }, { id: 'updates', label: 'Актуализации', icon: 'ri-repeat-line' },
    { id: 'communities', label: 'Общности', icon: 'ri-team-line' }, { id: 'calls', label: 'Обаждания', icon: 'ri-phone-line' },
  ];
  if (appId === 'photos') appTabs = [
    { id: 'home', label: platform === 'ios' ? 'Библиотека' : 'Снимки', icon: 'ri-image-line' }, { id: 'collections', label: 'Колекции', icon: 'ri-folder-line' },
    ...(platform === 'android' ? [{ id: 'create', label: 'Създай', icon: 'ri-add-line' }] : []), { id: 'search', label: 'Търсене', icon: 'ri-search-line' },
  ];
  const activeTab = appTabs.some(tab => tab.id === selectedTab) ? selectedTab : 'home';
  const isClip = activeTab === 'reels' || (appId === 'tiktok' && activeTab === 'home');
  const isCamera = appId === 'camera' || activeTab === 'camera' || (activeTab === 'create' && appId !== 'photos');
  const dark = isClip || isCamera;
  useEffect(() => { onDarkChange(dark); return () => onDarkChange(false); }, [dark, onDarkChange]);

  const content = () => {
    if (appId === 'photos' && activeTab === 'create') return <><h2 className="demo-section-title">Създай</h2><p className="demo-caption">Примерен център за творчески инструменти. Не използваме AI или лични снимки.</p>{['Колаж', 'Анимация', 'Видео'].map((name, index) => <button type="button" className="demo-email" key={name} onClick={() => photoNotice(index)}><Icon name="ri-image-line" size={24} aria-hidden="true" /><strong>{name} · пример</strong></button>)}</>;
    if (isClip) return clip();
    if (isCamera) return camera();
    if (activeTab === 'profile') return profile();
    if (activeTab === 'messages') return <><h2 className="demo-section-title">{appId === 'instagram' ? 'Съобщения' : 'Входящи'}</h2>{search('Търси примерен разговор')}{messageList()}</>;
    if (activeTab === 'friends' || activeTab === 'subscriptions' || activeTab === 'communities') return <><h2 className="demo-section-title">{activeTab === 'subscriptions' ? 'Твоите канали' : activeTab === 'communities' ? 'Общности' : 'Приятели'}</h2><p className="demo-caption">Примерен списък в прототипа.</p>{messageList()}</>;
    if (activeTab === 'notifications') return <><h2 className="demo-section-title">Известия</h2><p className="demo-caption">{settings.quietNotifications ? 'Известията в демото са заглушени.' : 'Примерни известия — без реални акаунти.'}</p>{!settings.quietNotifications && messageList()}</>;
    if (activeTab === 'map') return <div className="demo-map"><div className="demo-map-road" /><span className="demo-map-pin"><Icon name="ri-map-pin-line" size={30} aria-hidden="true" /></span><p>Примерна карта</p><small>Не използваме местоположението ти.</small></div>;
    if (activeTab === 'market') return <><h2 className="demo-section-title">Marketplace</h2>{search('Търси в примерния Marketplace')}<PhotoGrid count={4} onSelect={index => demoNotice('Примерна обява', `Илюстрация ${index + 1}. Това е учебен изглед, без продавачи, цени или покупки.`)} /></>;
    if (activeTab === 'search') return <>{search()}{query && <p className="demo-caption">Примерни резултати за „{query}“</p>}<PhotoGrid onSelect={photoNotice} /></>;
    if (activeTab === 'updates' || activeTab === 'stories') return <><h2 className="demo-section-title">Актуализации</h2><Stories onSelect={name => photoNotice(name.length)} /><PhotoGrid count={6} onSelect={photoNotice} /></>;
    if (activeTab === 'calls') return <><h2 className="demo-section-title">Обаждания</h2><p className="demo-caption">Примерен списък. Не се извършват обаждания.</p>{messageList()}</>;
    if (appId === 'settings' || activeTab === 'settings') return <div className="demo-settings-page"><h2>Настройки</h2><p>Само за този прототип</p><div className="demo-settings-group">{settingDefinitions.map(setting => <button type="button" role="switch" aria-checked={settings[setting.id]} key={setting.id} onClick={() => onSettingChange(setting.id)}><span><Icon name={setting.icon} size={20} aria-hidden="true" /></span><strong>{setting.title}</strong><span className={`demo-switch ${settings[setting.id] ? 'on' : ''}`} aria-hidden="true" /></button>)}</div><p className="demo-caption">Тези контроли не променят настройките на устройството ти.</p></div>;
    if (appId === 'whatsapp') return <><h2 className="demo-section-title">Чатове</h2>{search('Търси примерен чат')}{chips(['Всички', 'Непрочетени', 'Групи'])}{messageList()}<button type="button" className="demo-compose" aria-label="Пример за нов чат" onClick={() => demoNotice('Нов чат', 'В истинското приложение тук избираш контакт. Демото използва само примерни разговори.')}><Icon name="ri-chat-1-line" size={22} aria-hidden="true" /></button></>;
    if (appId === 'gmail') {
      const mails = [
        { sender: 'Клуб за четене · демо', subject: 'Следващата ни среща', text: 'Да изберем тема за събота.', color: 0 },
        { sender: 'Алекс · демо', subject: 'Снимки от разходката', text: 'Ето един красив пейзаж.', color: 1 },
        { sender: 'Мила · демо', subject: 'План за седмицата', text: 'Имаш ли време утре?', color: 2 },
      ];
      return <>{search('Търси в примерната поща')}{chips(['Всички', 'Основни', 'Социални'])}<p className="demo-caption">Примерна входяща поща</p>{filter === 'Социални' ? <p className="demo-empty">Няма примерни писма в тази категория.</p> : mails.filter(mail => `${mail.sender} ${mail.subject}`.toLowerCase().includes(query.toLowerCase())).map(mail => <button type="button" key={mail.subject} className="demo-email" onClick={() => setNotice({ title: mail.subject, content: <><p>{mail.sender}</p><p>{mail.text}</p><p className="demo-caption">Примерно писмо · няма изпращане.</p></> })}><Avatar name={mail.sender} index={mail.color} /><span><b>{mail.sender}</b><strong>{mail.subject}</strong><small>{mail.text}</small></span><Icon name="ri-star-line" size={18} aria-hidden="true" /></button>)}<button type="button" className="demo-compose gmail" onClick={() => demoNotice('Ново писмо', 'Учебен изглед на входяща поща. Не изпращаме имейли от този прототип.')}><Icon name="ri-edit-line" size={20} aria-hidden="true" />Напиши</button></>;
    }
    if (appId === 'chrome') return <div className="demo-browser"><div className="demo-google-word" aria-label="Google">{'Google'.split('').map((letter, index) => <span key={index} style={{ color: ['#4285f4', '#ea4335', '#fbbc05', '#4285f4', '#34a853', '#ea4335'][index] }}>{letter}</span>)}</div><form onSubmit={event => { event.preventDefault(); demoNotice('Примерно търсене', `Заявката „${query || 'природа'}“ остава в браузъра. Прототипът не изпраща търсене към Google.`); }}>{search('Търси в демото на Chrome')}<button type="submit" className="demo-text-button">Покажи пример</button></form><div className="demo-browser-shortcuts">{['Четене', 'Природа', 'Наука', 'Изкуство'].map((name, index) => <button type="button" key={name} onClick={() => photoNotice(index)}><span><Icon name="ri-global-line" size={21} aria-hidden="true" /></span>{name}</button>)}</div><h3>Discover · пример</h3><button type="button" className="demo-discover-card" onClick={() => photoNotice(0)}><Scene /><strong>Наблюдение на природата</strong><small>Учебна илюстрация</small></button></div>;
    if (appId === 'photos') return <><h2 className="demo-section-title">{activeTab === 'collections' ? 'Колекции' : 'Библиотека'}</h2><p className="demo-caption">Локални илюстрации · няма достъп до снимките ти</p><PhotoGrid onSelect={photoNotice} /></>;
    if (appId === 'x') return <><div className="demo-feed-tabs"><button type="button" aria-pressed={filter !== 'Следвани'} onClick={() => setFilter('За теб')}>За теб</button><button type="button" aria-pressed={filter === 'Следвани'} onClick={() => setFilter('Следвани')}>Следвани</button></div>{['Кратка разходка и нова гледна точка.', 'Днес избрах време за четене.'].map((text, index) => <article className="demo-x-post" key={text}><Avatar name={index ? 'Мила' : 'Алекс'} index={index} /><div><strong>{index ? 'Мила' : 'Алекс'} · демо</strong><small>@demo_account · 1 ч.</small><p>{text}</p>{index === 0 && <Scene variant={index} />}{interactionRow()}</div></article>)}</>;
    if (appId === 'youtube') return <>{chips(['Всички', 'Музика', 'Обучение'])}{[0, 1].map(index => <article key={index} className="demo-video-card"><button type="button" onClick={() => photoNotice(index)} aria-label="Отвори примерна видео картина"><Scene variant={index} /><span>4:32</span></button><div><Avatar name="Демо" /><span><strong>{filter === 'Обучение' ? 'Как наблюдаваме един пейзаж' : filter === 'Музика' ? 'Пейзаж и тишина' : 'Малка разходка, нова перспектива'}</strong><small>Демо канал · примерни данни</small></span></div></article>)}</>;
    return <>{(appId === 'instagram' || appId === 'facebook') && <Stories onSelect={name => photoNotice(name.length)} />}<article className="demo-social-post"><div className="demo-post-author"><Avatar name="Алекс" /><span><strong>{appId === 'instagram' ? 'demo_nature' : 'Алекс · демо'}</strong><small>Примерна публикация</small></span><SmallButton label="Информация за примерната публикация" icon="ri-more-line" onClick={() => demoNotice('Учебна публикация', 'Изображенията, имената и реакциите в този екран са примерни. Няма реална публикация или алгоритъм за препоръки.')} /></div>{appId === 'facebook' && <p className="demo-post-text">Кратка разходка. Два погледа към един пейзаж.</p>}<button type="button" className={appId === 'facebook' ? 'demo-post-photo facebook-grid' : 'demo-post-photo'} onClick={() => photoNotice(0)} aria-label="Разгледай илюстрацията"><Scene />{appId === 'facebook' && <Scene variant={1} />}</button>{interactionRow(appId === 'facebook')}<p className="demo-post-text"><strong>{liked ? '25' : '24'} примерни харесвания</strong><br />{appId === 'instagram' && <><b>demo_nature</b> Един пейзаж, различни цветове.</>}<small>Учебни данни · без реален обхват</small></p></article></>;
  };

  return <div className={`demo-app ${dark ? 'dark' : ''} demo-app-${appId}`} data-testid={`app-${appId}`}>
    {!dark && <header className="demo-app-header" inert={Boolean(notice)}><div>{appId === 'x' ? <span className="demo-x-heading">𝕏</span> : appId === 'instagram' ? <span className="demo-instagram-heading">Instagram</span> : appId === 'facebook' ? <span className="demo-facebook-heading">facebook</span> : appId === 'youtube' ? <><span className="demo-header-logo"><AppLogo id="youtube" /></span><strong>YouTube</strong></> : <strong>{appName}</strong>}</div><div><SmallButton label="За този учебен екран" icon="ri-information-line" onClick={() => demoNotice('Учебен прототип', 'Опростена примерна подредба. Реалният интерфейс може да се различава по версия, регион, акаунт и устройство.')} />{['instagram', 'facebook', 'youtube', 'x'].includes(appId) && <SmallButton label="Примерни известия" icon="ri-notification-line" onClick={() => demoNotice('Известия', settings.quietNotifications ? 'Примерните известия са заглушени.' : 'Алекс · демо: нова примерна публикация. Не е реално известие.')} />}</div></header>}
    <div className={`demo-app-content ${dark ? 'no-scroll' : ''}`} inert={Boolean(notice)}>{content()}</div>
    {appTabs.length > 0 && <nav inert={Boolean(notice)} aria-label={`Раздели в демото на ${appName}`} className={`demo-app-nav ${appId === 'photos' && platform === 'ios' ? 'floating' : ''}`}>{appTabs.map(tab => <button type="button" key={tab.id} aria-pressed={activeTab === tab.id} onClick={() => { setActiveTab(tab.id); setQuery(''); setFilter('Всички'); setClearScreen(false); }}><Icon name={tab.icon} size={21} aria-hidden="true" /><span>{tab.label}</span></button>)}</nav>}
    {notice && <div ref={noticeRef} tabIndex={-1} onKeyDown={event => { if (event.key === 'Escape') setNotice(null); }} className="demo-modal" role="dialog" aria-modal="false" aria-label={notice.title}><div className="demo-modal-header"><strong>{notice.title}</strong><SmallButton label="Затвори примерния екран" icon="ri-close-line" onClick={() => setNotice(null)} /></div><div className="demo-modal-body">{notice.content}</div><button type="button" onClick={() => setNotice(null)} className="demo-text-button">Назад към приложението</button></div>}
  </div>;
}

