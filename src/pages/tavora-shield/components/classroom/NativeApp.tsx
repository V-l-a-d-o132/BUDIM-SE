import { useEffect, useRef, useState, type ReactNode } from 'react';
import Icon from '@/components/base/Icon';
import { AppLogo, Avatar } from '../focus/Visuals';
import { orderedPosts, type LabApp, type LabPost, type PostKind } from '@/lib/classroom';
import type { FocusSettings, Platform } from '../focus/model';
import { useClassroom } from './ClassroomContext';
import PostCard, { Comments } from './PostCard';
import PostComposer from './PostComposer';
import Conversations from './Conversations';
import './classroom.css';

type Tab = { id: string; label: string; icon: string };
const tab = (id: string, label: string, icon: string): Tab => ({id,label,icon});
const navigation: Record<LabApp,Tab[]> = {
  instagram:[tab('home','Начало','ri-home-line'),tab('search','Търсене','ri-search-line'),tab('create','Създай','ri-add-line'),tab('reels','Reels','ri-video-line'),tab('profile','Профил','ri-user-line')],
  tiktok:[tab('home','Начало','ri-home-line'),tab('friends','Приятели','ri-team-line'),tab('create','Създай','ri-add-line'),tab('messages','Входящи','ri-inbox-line'),tab('profile','Профил','ri-user-line')],
  facebook:[tab('home','Начало','ri-home-line'),tab('reels','Reels','ri-video-line'),tab('friends','Хора','ri-team-line'),tab('market','Marketplace','ri-store-2-line'),tab('profile','Меню','ri-user-line')],
  youtube:[tab('home','Начало','ri-home-line'),tab('reels','Shorts','ri-video-line'),tab('create','Създай','ri-add-line'),tab('subscriptions','Абонаменти','ri-repeat-line'),tab('profile','Ти','ri-user-line')],
  x:[tab('home','Начало','ri-home-line'),tab('search','Търсене','ri-search-line'),tab('notifications','Известия','ri-notification-line'),tab('messages','Съобщения','ri-mail-line')],
  snapchat:[tab('map','Карта','ri-map-pin-line'),tab('messages','Чат','ri-chat-1-line'),tab('camera','Камера','ri-camera-line'),tab('stories','Истории','ri-team-line'),tab('reels','Spotlight','ri-video-line')],
  whatsapp:[tab('home','Чатове','ri-chat-1-line'),tab('updates','Актуализации','ri-repeat-line'),tab('communities','Общности','ri-team-line'),tab('calls','Обаждания','ri-phone-line')],
  gmail:[],
};
const names:Record<LabApp,string>={instagram:'Instagram',tiktok:'TikTok',facebook:'Facebook',youtube:'YouTube',x:'X',snapchat:'Snapchat',whatsapp:'WhatsApp',gmail:'Gmail'};
const appMemory = new Map<string,{tab:string; filter:string; query:string}>();
function PhoneSheet({ title, onClose, children }: {title:string;onClose:()=>void;children:ReactNode}) {
  const panel=useRef<HTMLDivElement>(null);
  useEffect(()=>{const opener=document.activeElement;panel.current?.focus();return()=>{if(opener instanceof HTMLElement && opener.isConnected)opener.focus();};},[]);
  return <div className="lab-sheet" ref={panel} tabIndex={-1} role="dialog" aria-label={title} aria-modal="false" onKeyDown={event=>{if(event.key==='Escape')onClose();}}><header><button type="button" aria-label="Назад към приложението" onClick={onClose}><Icon name="ri-arrow-left-line" size={23}/></button><strong>{title}</strong></header><div className="lab-sheet-body">{children}</div></div>;
}
export default function NativeApp({ appId, platform, settings, onDarkChange }: {
  appId:LabApp;platform:Platform;settings:FocusSettings;onDarkChange:(value:boolean)=>void;
}) {
  const lab=useClassroom()!;
  const memoryKey=lab.state.access?.member_id+':'+appId;
  const remembered=appMemory.get(memoryKey);
  const [active,setActive]=useState(remembered?.tab ?? (appId==='snapchat'?'camera':'home'));
  const [filter,setFilter]=useState(remembered?.filter ?? 'all');
  const [query,setQuery]=useState(remembered?.query ?? '');
  const [composer,setComposer]=useState<PostKind|null>(null);
  const [comments,setComments]=useState<string|null>(null);
  const [selectedProfile,setProfile]=useState<string|null>(null);
  const [showNotifications,setShowNotifications]=useState(false);
  const [clipIndex,setClipIndex]=useState(0);
  const [error,setError]=useState('');
  const [selectedStory,setSelectedStory]=useState<string|null>(null);
  const [initialFile,setInitialFile]=useState<File|undefined>();
  const clipSwipe=useRef(0);
  const clipWheel=useRef(0);
  const upload=useRef<HTMLInputElement>(null);
  const isClip=active==='reels' || (appId==='tiktok' && active==='home');
  const dark=isClip || (appId==='snapchat' && active==='camera');
  const room=lab.state.access!.room;
  const ownId=lab.state.access!.member_id;
  const followedIds=lab.state.app_follows ? lab.state.app_follows.filter(item=>item.app_id===appId).map(item=>item.target_id) : lab.state.follows;
  const all=orderedPosts(lab.state.posts.filter(post=>post.app_id===appId),room.sort_mode);
  const stories=all.filter(post=>post.kind==='story');
  const following=all.filter(post=>followedIds.includes(post.member_id) || post.member_id===ownId);
  const feed=(filter==='following'?following:all).filter(post=>post.kind!=='story' && post.kind!=='listing');
  const clips=feed.filter(post=>post.kind==='clip' || post.media?.mime_type.startsWith('video/') || appId==='tiktok');
  const selectedClip=clips.length ? clips[Math.min(clipIndex,clips.length-1)] : null;
  const notifications=lab.state.notifications.filter(item=>item.app_id===appId);
  const unread=notifications.filter(item=>!item.read).length;
  const busy=useRef(false);
  useEffect(()=>{appMemory.set(memoryKey,{tab:active,filter,query});},[memoryKey,active,filter,query]);
  useEffect(()=>{onDarkChange(dark);return()=>onDarkChange(false);},[dark,onDarkChange]);
  const execute=async (action:string,payload:Record<string,unknown>)=>{
    if(busy.current)return;busy.current=true;setError('');
    try{await lab.command(action,payload);}catch(err){setError(err instanceof Error?err.message:'Действието не е записано.');}
    finally{busy.current=false;}
  };
  const openNotifications=()=>{setShowNotifications(true);void execute('read_notifications',{app_id:appId});};
  const create=(kind:PostKind='post')=>{setComposer(kind);setInitialFile(undefined);};
  const author=(id:string)=>setProfile(id);
  const search=<label className="demo-search"><Icon name="ri-search-line" size={18}/><input aria-label="Търси в публикациите" value={query} placeholder="Търсене" onChange={event=>setQuery(event.target.value)}/></label>;
  const cards=(posts:LabPost[])=>posts.length ? posts.map(post=><PostCard key={post.id} post={post} onComments={item=>setComments(item.id)} onAuthor={author}/>) : <div className="lab-empty"><p>Още няма публикации тук.</p><button type="button" className="lab-primary" onClick={()=>create()}>Създай първата</button></div>;
  const people=<div className="lab-people"><h2 className="demo-section-title">{active==='subscriptions'?'Канали в заниманието':'Участници'}</h2>{lab.state.participants.filter(member=>member.id!==ownId).map(member=><div key={member.id}><button type="button" className="lab-contact" onClick={()=>author(member.id)}><Avatar name={member.alias}/><strong>{member.alias}</strong></button><button type="button" className="lab-follow" aria-pressed={followedIds.includes(member.id)} onClick={()=>{void execute('follow',{app_id:appId,target_id:member.id,active:!followedIds.includes(member.id)});}}>{followedIds.includes(member.id)?'Следваш':appId==='youtube'?'Абонирай се':'Следвай'}</button></div>)}</div>;
  const storyStrip=<div className="demo-stories"><button type="button" onClick={()=>create('story')}><span className="demo-story-ring"><Avatar name={lab.state.access!.alias}/></span><span>Твоята история +</span></button>{stories.map(post=><button type="button" key={post.id} onClick={()=>setSelectedStory(post.id)}><span className="demo-story-ring"><Avatar name={post.alias}/></span><span>{post.alias}</span></button>)}</div>;
  const notificationList=<div><h2 className="demo-section-title">Известия</h2>{settings.quietNotifications && <p className="lab-muted">Известията са тихи. Можеш да ги прочетеш тук.</p>}{notifications.length ? notifications.map(item=><article className="lab-notification" key={item.id}><Icon name="ri-notification-line" size={19}/><span>{item.content}<small>{new Date(item.created_at).toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'})}</small></span></article>) : <p className="lab-empty">Още няма известия.</p>}</div>;
  const profile=(id:string)=>{
    const person=lab.state.participants.find(member=>member.id===id);
    const posts=all.filter(post=>post.member_id===id);
    return <div><div className="demo-profile"><Avatar name={person?.alias??'Участник'}/><h2>{person?.alias}</h2><p>{room.name}</p><div className="demo-profile-counts"><span><b>{posts.length}</b> публикации в лентата</span>{id===ownId && <span><b>{followedIds.length}</b> следвани</span>}</div>{id!==ownId && <button type="button" className="lab-primary" onClick={()=>{void execute('follow',{app_id:appId,target_id:id,active:!followedIds.includes(id)});}}>{followedIds.includes(id)?'Спри да следваш':'Следвай'}</button>}</div>{id===ownId && <div className="demo-feed-tabs"><button type="button" onClick={()=>setFilter('all')} aria-pressed={filter!=='saved'}>Публикации</button><button type="button" onClick={()=>setFilter('saved')} aria-pressed={filter==='saved'}>Запазени</button></div>}{cards(filter==='saved'&&id===ownId ? all.filter(post=>post.saved) : posts)}</div>;
  };
  const content=()=>{
    if(active==='notifications')return notificationList;
    if(active==='profile')return profile(ownId);
    if(active==='messages' || appId==='gmail' || (appId==='whatsapp'&&active==='home'))return <Conversations key={appId} appId={appId}/>;
    if(active==='communities' && appId==='whatsapp')return <div><h2 className="demo-section-title">Общности</h2><button type="button" className="lab-primary" onClick={()=>setActive('home')}>{room.name}</button></div>;
    if(active==='friends' || active==='subscriptions' || active==='communities')return people;
    if(active==='calls')return <div><h2 className="demo-section-title">Обаждания</h2><p className="lab-muted">В това занимание общуваме с текст. Телефонни и видеообаждания не се извършват.</p><button type="button" className="lab-primary" onClick={()=>setActive('home')}>Отвори чатовете</button></div>;
    if(active==='search')return <>{search}{cards(all.filter(post=>(post.content+' '+post.alias).toLowerCase().includes(query.toLowerCase())))}</>;
    if(active==='market')return <><h2 className="demo-section-title">Marketplace</h2><p className="lab-muted">Учебни обяви в заниманието.</p><button type="button" className="lab-primary" onClick={()=>create('listing')}>Създай обява</button>{cards(all.filter(post=>post.kind==='listing'))}</>;
    if(active==='map')return <><h2 className="demo-section-title">Карта на участниците</h2><p className="lab-muted">Показваме участниците в заниманието, без местоположение.</p>{people}</>;
    if(active==='stories' || active==='updates')return <>{storyStrip}{cards(stories)}</>;
    if(active==='camera')return <div className="lab-camera-screen"><div><Icon name="ri-camera-line" size={70}/><p>Избери снимка или заснеми с устройството.</p></div><div className="demo-camera-modes"><button type="button" onClick={()=>create('clip')}>Клип</button><button type="button" aria-pressed="true">Снимка</button><button type="button" onClick={()=>create('story')}>История</button></div><button type="button" className="demo-shutter" aria-label="Избери или заснеми снимка" onClick={()=>upload.current?.click()}/><input ref={upload} hidden type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={event=>{const file=event.target.files?.[0];if(file){setInitialFile(file);setComposer('story');}event.target.value='';}}/></div>;
    if(isClip)return <div className="lab-reel" onTouchStart={event=>{clipSwipe.current=event.touches[0].clientY;}} onTouchEnd={event=>{const delta=clipSwipe.current-event.changedTouches[0].clientY;if(Math.abs(delta)>45)setClipIndex(index=>Math.max(0,Math.min(clips.length-1,index+(delta>0?1:-1))));}} onWheel={event=>{if(Date.now()-clipWheel.current>500&&Math.abs(event.deltaY)>15){clipWheel.current=Date.now();setClipIndex(index=>Math.max(0,Math.min(clips.length-1,index+(event.deltaY>0?1:-1))));}}}>
      <div className="lab-reel-top"><button type="button" aria-pressed={filter==='following'} onClick={()=>{setFilter('following');setClipIndex(0);}}>Следвани</button><button type="button" aria-pressed={filter!=='following'} onClick={()=>{setFilter('all');setClipIndex(0);}}>За теб</button><button type="button" aria-label="Търсене" onClick={()=>setActive('search')}><Icon name="ri-search-line" size={21}/></button></div>
      {selectedClip ? <PostCard key={selectedClip.id} post={selectedClip} clip onComments={item=>setComments(item.id)} onAuthor={author}/> : <div className="lab-empty"><p>Още няма клипове.</p><button type="button" className="lab-primary" onClick={()=>create('clip')}>Качи клип</button></div>}
      <div className="lab-reel-pagination"><button type="button" disabled={clipIndex===0} onClick={()=>setClipIndex(index=>Math.max(0,index-1))} aria-label="Предишен клип"><Icon name="ri-arrow-up-line" size={17}/></button><span>{clips.length ? Math.min(clipIndex+1,clips.length):0}/{clips.length}</span><button type="button" disabled={clipIndex>=clips.length-1} onClick={()=>setClipIndex(index=>Math.min(clips.length-1,index+1))} aria-label="Следващ клип"><Icon name="ri-arrow-down-line" size={17}/></button></div>
    </div>;
    return <>{(appId==='instagram'||appId==='facebook')&&storyStrip}{appId==='facebook'&&<button type="button" className="lab-feed-composer" onClick={()=>create()}><Avatar name={lab.state.access!.alias}/><span>Какво мислиш?</span><Icon name="ri-image-line" size={21}/></button>}<div className="demo-feed-tabs"><button type="button" aria-pressed={filter!=='following'} onClick={()=>setFilter('all')}>{appId==='x'?'За теб':'Всички'}</button><button type="button" aria-pressed={filter==='following'} onClick={()=>setFilter('following')}>{appId==='youtube'?'Абонаменти':'Следвани'}</button></div>{cards(feed)}</>;
  };
  let appTabs=navigation[appId];
  if(appId==='whatsapp' && platform==='ios')appTabs=[tab('updates','Актуализации','ri-repeat-line'),tab('calls','Обаждания','ri-phone-line'),tab('home','Чатове','ri-chat-1-line'),tab('communities','Общности','ri-team-line')];
  const sheetOpen=Boolean(composer||comments||selectedProfile||showNotifications||selectedStory);
  return <div className={'demo-app lab-native demo-app-'+appId+(dark?' dark':'')} data-testid={'app-'+appId}>
    {!dark&&<header className="demo-app-header" inert={sheetOpen}><div><button type="button" className="demo-icon-button" aria-label="Отвори своя профил" onClick={()=>setProfile(ownId)}><Avatar name={lab.state.access!.alias}/></button>{appId==='instagram'?<span className="demo-instagram-heading">Instagram</span>:appId==='facebook'?<span className="demo-facebook-heading">facebook</span>:appId==='x'?<span className="demo-x-heading">𝕏</span>:appId==='youtube'?<><span className="demo-header-logo"><AppLogo id="youtube"/></span><strong>YouTube</strong></>:<strong>{names[appId]}</strong>}</div><div>{!['gmail','whatsapp'].includes(appId)&&<button type="button" className="demo-icon-button" aria-label="Нова публикация" onClick={()=>create()}><Icon name="ri-add-line" size={23}/></button>}{!['gmail','youtube','whatsapp'].includes(appId)&&<button type="button" className="demo-icon-button" aria-label="Отвори съобщенията" onClick={()=>setActive('messages')}><Icon name="ri-send-plane-line" size={21}/></button>}<button type="button" className="demo-icon-button lab-notification-button" aria-label="Отвори известията" onClick={openNotifications}><Icon name="ri-notification-line" size={21}/>{unread>0&&!settings.quietNotifications&&<span>{unread}</span>}</button></div></header>}
    <div className={'demo-app-content '+(dark?'no-scroll':'')} inert={sheetOpen}>{content()}</div>
    {error&&<p role="alert" className="lab-error">{error}</p>}
    {appTabs.length>0&&<nav className="demo-app-nav" aria-label={'Раздели в '+names[appId]} inert={sheetOpen}>{appTabs.map(item=><button type="button" key={item.id} aria-pressed={active===item.id} onClick={()=>{if(item.id==='create')create(appId==='youtube'||appId==='tiktok'?'clip':'post');else {setActive(item.id);setQuery('');setFilter('all');setClipIndex(0);}}}><Icon name={item.icon} size={22}/><span>{item.label}</span></button>)}</nav>}
    {appId==='x'&&!sheetOpen&&<button type="button" className="lab-floating-create" aria-label="Напиши публикация в X" onClick={()=>create()}><Icon name="ri-add-line" size={25}/></button>}
    {composer&&<PhoneSheet title={composer==='story'?'Нова история':composer==='clip'?'Нов клип':composer==='listing'?'Нова обява':'Нова публикация'} onClose={()=>setComposer(null)}><PostComposer appId={appId} kind={composer} initialFile={initialFile} onClose={()=>setComposer(null)}/></PhoneSheet>}
    {comments&&<PhoneSheet title="Коментари" onClose={()=>setComments(null)}><Comments postId={comments}/></PhoneSheet>}
    {selectedProfile&&!comments&&!composer&&<PhoneSheet title="Профил" onClose={()=>setProfile(null)}>{profile(selectedProfile)}</PhoneSheet>}
    {showNotifications&&<PhoneSheet title="Известия" onClose={()=>setShowNotifications(false)}>{notificationList}</PhoneSheet>}
    {selectedStory&&!comments&&!composer&&<PhoneSheet title="История" onClose={()=>setSelectedStory(null)}>{cards(stories.filter(post=>post.id===selectedStory))}<p className="lab-muted">Историите се показват 24 часа.</p></PhoneSheet>}
  </div>;
}
