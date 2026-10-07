import { useCallback, useEffect, useRef, useState } from 'react';
import AdminGuard from '../components/AdminGuard';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { usePageSeo } from '@/hooks/usePageSeo';
import { supabase } from '@/lib/supabase';
import type { LabRoom } from '@/lib/classroom';

interface Member {id:string;alias:string;status:string;simulators:boolean;analyzer:boolean}
interface Content {id:string;alias:string;app_id?:string;content:string;approved?:boolean;likes?:number;shares?:number;views?:number;media?:{path:string;mime_type:string;url?:string}}
interface AdminState {selected_room:string|null;rooms:(LabRoom&{pending:number;created_at:string})[];members:Member[];posts:Content[];comments:Content[];messages:Content[]}
const empty:AdminState={selected_room:null,rooms:[],members:[],posts:[],comments:[],messages:[]};
export default function ClassroomsAdmin() {
  usePageSeo({title:'Учебни занимания — Администрация',description:'Достъп и модерация на учебните симулатори.',noIndex:true});
  const {admin}=useAdminAuth();
  const [state,setState]=useState<AdminState>(empty);
  const [selected,setSelected]=useState('');
  const [name,setName]=useState('');
  const [tab,setTab]=useState<'members'|'posts'|'comments'|'messages'>('members');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState('');
  const [loading,setLoading]=useState(true);
  const generation=useRef(0);
  const mutation=useRef(false);
  const mounted=useRef(true);
  const permitted=admin?.mfaVerified&&admin.permissions.includes('moderate');
  const request=useCallback(async(operation:string,details:Record<string,unknown>={})=>{
    const current=++generation.current;
    const {data,error:failure}=await supabase.rpc('lab_admin',{operation,details});
    if(!mounted.current||current!==generation.current)return;
    if(failure||!data||!Array.isArray(data.rooms))throw new Error('Заниманията не могат да бъдат заредени. Провери достъпа си и опитай отново.');
    const paths=data.posts.filter((post:Content)=>post.media?.path).map((post:Content)=>post.media!.path);
    if(paths.length){
      const previews=await supabase.storage.from('classroom-media').createSignedUrls(paths,300);
      if(!mounted.current||current!==generation.current)return;
      for(const post of data.posts)if(post.media)post.media.url=previews.data?.find(item=>item.path===post.media.path)?.signedUrl;
    }
    setState(data);if((!selected||operation==='create_room')&&data.selected_room)setSelected(data.selected_room);setError('');
  },[selected]);
  useEffect(()=>{
    mounted.current=true;
    if(!permitted)return;
    const refresh=()=>{if(mutation.current||document.visibilityState==='hidden')return;void request('list',selected?{room_id:selected}:{}).catch(err=>{if(mounted.current)setError(err.message);}).finally(()=>{if(mounted.current)setLoading(false);});};
    refresh();const timer=window.setInterval(refresh,10000);window.addEventListener('focus',refresh);
    return()=>{mounted.current=false;generation.current++;window.clearInterval(timer);window.removeEventListener('focus',refresh);};
  },[permitted,selected,request]);
  const act=async(operation:string,details:Record<string,unknown>,key:string)=>{
    if(mutation.current)return;mutation.current=true;setBusy(key);setError('');
    try{await request(operation,{room_id:selected,...details});}
    catch(err){setError(err instanceof Error?err.message:'Действието не е изпълнено.');}
    finally{mutation.current=false;setBusy('');}
  };
  const room=state.rooms.find(item=>item.id===selected);
  const roomSetting=(key:'simulators_enabled'|'analyzer_enabled'|'moderate_posts'|'moderate_comments',label:string)=><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(room?.[key])} disabled={Boolean(busy)} onChange={event=>{void act('update_room',{[key]:event.target.checked},key);}}/>{label}</label>;
  return <AdminGuard><AdminLayout title="Учебни занимания"><div className="max-w-6xl mx-auto space-y-6">
    <p className="text-sm text-gray-600">Създай занимание, дай кода на участниците и одобри заявките им. Разрешенията за симулатори и анализатор са отделни. Самооценката остава лична.</p>
    <form className="flex flex-wrap gap-3" onSubmit={event=>{event.preventDefault();void act('create_room',{name},'create');setName('');}}><input aria-label="Име на заниманието" required minLength={2} maxLength={80} value={name} onChange={event=>setName(event.target.value)} placeholder="Например: 8Б — разпространение на публикации" className="flex-1 min-w-56 border border-gray-300 rounded-lg px-4 py-3"/><button type="submit" disabled={Boolean(busy)||!permitted} className="bg-gray-900 text-white rounded-lg px-5 py-3 text-sm disabled:opacity-50">Ново занимание</button></form>
    {error&&<p role="alert" className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4">{error}</p>}
    {loading?<p role="status">Зареждане…</p>:state.rooms.length===0?<p className="text-gray-500">Още няма учебни занимания.</p>:<>
      <label className="block text-sm">Занимание<select aria-label="Избери занимание" value={selected} onChange={event=>setSelected(event.target.value)} className="block w-full mt-2 border border-gray-300 rounded-lg p-3">{state.rooms.map(item=><option key={item.id} value={item.id}>{item.name} · {item.status==='open'?'отворено':item.status==='paused'?'пауза':'приключило'}{item.pending?' · '+item.pending+' заявки':''}</option>)}</select></label>
      {room&&<section className="bg-white border border-gray-200 rounded-xl p-5 space-y-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs text-gray-500 mb-1">Код за влизане</p><strong className="text-2xl tracking-widest">{room.code}</strong><p className="text-xs text-gray-500 mt-2">До {new Date(room.expires_at).toLocaleString('bg-BG')}</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={Boolean(busy)} onClick={()=>{void act('update_room',{status:room.status==='open'?'paused':'open'},'status');}} className="border rounded-lg px-4 py-2 text-sm">{room.status==='open'?'Пауза':'Отвори'}</button><button type="button" disabled={Boolean(busy)} onClick={()=>{void act('update_room',{extend_hours:8},'extend');}} className="border rounded-lg px-4 py-2 text-sm">Още 8 часа</button><button type="button" disabled={Boolean(busy)} onClick={()=>{void act('update_room',{status:'closed'},'close');}} className="border rounded-lg px-4 py-2 text-sm">Приключи</button></div></div>
      <div className="grid sm:grid-cols-2 gap-4">{roomSetting('simulators_enabled','Разреши симулаторите в заниманието')}{roomSetting('analyzer_enabled','Разреши анализатора в заниманието')}{roomSetting('moderate_posts','Одобрение преди показване на постове')}{roomSetting('moderate_comments','Одобрение преди показване на коментари')}</div>
      <label className="block text-sm">Подредба на лентите<select value={room.sort_mode} disabled={Boolean(busy)} onChange={event=>{void act('update_room',{sort_mode:event.target.value},'sort');}} className="ml-3 border rounded-lg p-2"><option value="chronological">По време</option><option value="reactions">По общ брой реакции, коментари и споделяния</option></select></label><p className="text-xs text-gray-500">Броячите показват действията в това занимание. Подредбата е учебно правило и може да се променя между кръговете.</p></section>}
      <div className="flex flex-wrap gap-2">{([['members','Участници'],['posts','Публикации'],['comments','Коментари'],['messages','Учебни разговори']] as const).map(([id,label])=><button type="button" key={id} aria-pressed={tab===id} onClick={()=>setTab(id)} className={'rounded-lg px-4 py-2 text-sm '+(tab===id?'bg-gray-900 text-white':'border bg-white')}>{label} ({state[id].length})</button>)}</div>
      {tab==='members'?<div className="space-y-3">{state.members.map(member=><article key={member.id} className="bg-white border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"><div><strong>{member.alias}</strong><p className="text-xs text-gray-500 mt-1">{member.status==='pending'?'Чака одобрение':member.status==='revoked'?'Достъпът е отнет':'Одобрен'} · Симулатори: {member.simulators?'да':'не'} · Анализатор: {member.analyzer?'да':'не'}</p></div><div className="flex flex-wrap gap-2">{[['Само симулатори',true,false],['Само анализатор',false,true],['И двете',true,true]] .map(([label,simulators,analyzer])=><button type="button" key={String(label)} disabled={Boolean(busy)} onClick={()=>{void act('approve_member',{member_id:member.id,approved:true,simulators,analyzer},member.id);}} className="border rounded-lg px-3 py-2 text-xs">{label}</button>)}<button type="button" disabled={Boolean(busy)} onClick={()=>{void act('approve_member',{member_id:member.id,approved:false,simulators:false,analyzer:false},member.id);}} className="border rounded-lg px-3 py-2 text-xs text-red-700">Отнеми достъпа</button></div></article>)}{!state.members.length&&<p className="text-gray-500 text-sm">Участниците ще се появят тук след заявка с кода.</p>}</div>:<div className="space-y-3">{state[tab].map(item=><article className="bg-white border rounded-xl p-4" key={item.id}><div className="flex justify-between gap-3"><strong className="text-sm">{item.alias}{item.app_id?' · '+item.app_id:''}</strong>{typeof item.approved==='boolean'&&<span className="text-xs text-gray-500">{item.approved?'Показва се':'Изчаква одобрение'}</span>}</div><p className="text-sm whitespace-pre-wrap break-words my-3">{item.content||'Публикация с файл'}</p>{item.media?.url && (item.media.mime_type.startsWith('video/') ? <video src={item.media.url} controls playsInline className="max-h-72 my-3 rounded-lg" /> : <img src={item.media.url} alt="Файл към учебната публикация" className="max-h-72 my-3 rounded-lg" />)}{tab==='posts'&&<p className="text-xs text-gray-500 mb-3">{item.likes} реакции · {item.shares} споделяния · {item.views} участници с показване на екрана</p>}<div className="flex gap-3">{tab!=='messages'&&<button type="button" disabled={Boolean(busy)} onClick={()=>{void act(tab==='posts'?'moderate_post':'moderate_comment',{[tab==='posts'?'post_id':'comment_id']:item.id,approved:!item.approved},item.id);}} className="text-xs border rounded-lg px-3 py-2">{item.approved?'Скрий':'Одобри'}</button>}<button type="button" disabled={Boolean(busy)} onClick={()=>{if(window.confirm('Да изтрием ли този запис?'))void act(tab==='posts'?'delete_post':tab==='comments'?'delete_comment':'delete_message',{[tab==='posts'?'post_id':tab==='comments'?'comment_id':'message_id']:item.id},item.id);}} className="text-xs text-red-700 border rounded-lg px-3 py-2">Изтрий</button></div></article>)}</div>}
    </>}
  </div></AdminLayout></AdminGuard>;
}
