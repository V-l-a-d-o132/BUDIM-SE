import { useRef, useState } from 'react';
import Icon from '@/components/base/Icon';
import { Avatar } from '../focus/Visuals';
import { useClassroom } from './ClassroomContext';
import type { LabApp } from '@/lib/classroom';

export default function Conversations({ appId }: { appId: LabApp }) {
  const lab=useClassroom()!;
  const [recipient,setRecipient]=useState<string | null | undefined>(undefined);
  const [text,setText]=useState('');
  const [subject,setSubject]=useState('');
  const [query,setQuery]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const lock=useRef(false);
  const requestId=useRef(crypto.randomUUID());
  const members=lab.state.participants.filter(member => member.id!==lab.state.access?.member_id && member.alias.toLowerCase().includes(query.toLowerCase()));
  const messages=lab.state.messages.filter(message => message.app_id===appId);
  const recipientName=recipient ? lab.state.participants.find(member => member.id===recipient)?.alias : 'Група на заниманието';
  const conversation=messages.filter(message => recipient===null ? message.recipient_id===null
    : (message.member_id===recipient && message.recipient_id===lab.state.access?.member_id)
      || (message.member_id===lab.state.access?.member_id && message.recipient_id===recipient));
  if(recipient===undefined) return <div className="lab-conversations">
    <h2 className="demo-section-title">{appId==='gmail' ? 'Входяща поща' : 'Чатове'}</h2>
    <label className="demo-search"><Icon name="ri-search-line" size={16}/><input aria-label="Търси участник" placeholder="Търсене" value={query} onChange={event => setQuery(event.target.value)}/></label>
    <button type="button" className="lab-contact" onClick={() => setRecipient(null)}><Avatar name="Група"/><span><strong>Група на заниманието</strong><small>{messages.filter(message => message.recipient_id===null).at(-1)?.content ?? 'Напиши първото съобщение'}</small></span></button>
    {members.map(member => {const last=messages.filter(message => message.member_id===member.id || message.recipient_id===member.id).at(-1); return <button type="button" key={member.id} className="lab-contact" onClick={() => setRecipient(member.id)}><Avatar name={member.alias}/><span><strong>{member.alias}</strong><small>{appId==='gmail' && last?.subject ? last.subject : last?.content ?? 'Нов разговор'}</small></span></button>;})}
    <p className="lab-muted">Разговорите са в учебното занимание и могат да бъдат преглеждани от водещия.</p>
  </div>;
  return <div className={'lab-conversation ' + (appId==='whatsapp' ? 'whatsapp-chat' : '')}>
    <header><button type="button" aria-label="Назад към разговорите" onClick={() => setRecipient(undefined)}><Icon name="ri-arrow-left-line" size={21}/></button><Avatar name={recipientName ?? 'Група'}/><strong>{recipientName}</strong></header>
    <div className="lab-chat-scroll">{conversation.map(message => <article key={message.id} className={message.member_id===lab.state.access?.member_id ? 'own' : ''}><strong>{message.alias}{message.subject ? ' · '+message.subject : ''}</strong><p>{message.content}</p><small>{new Date(message.created_at).toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'})}</small></article>)}{!conversation.length && <p className="lab-empty">Още няма съобщения.</p>}</div>
    <form onSubmit={async event => {event.preventDefault();if(lock.current || !text.trim())return; lock.current=true;setBusy(true);setError('');
      try{await lab.command('message',{app_id:appId,recipient_id:recipient,content:text.trim(),subject,request_id:requestId.current});setText('');setSubject('');requestId.current=crypto.randomUUID();}
      catch(err){setError(err instanceof Error ? err.message : 'Съобщението не е изпратено.');}
      finally{lock.current=false;setBusy(false);}
    }}>{appId==='gmail' && <input aria-label="Тема на писмото" placeholder="Тема" value={subject} maxLength={100} onChange={event => setSubject(event.target.value)}/>}<div><textarea aria-label="Учебно съобщение" value={text} maxLength={2000} disabled={busy} onChange={event => setText(event.target.value)} placeholder={appId==='gmail' ? 'Текст на писмото' : 'Съобщение'}/><button type="submit" aria-label="Изпрати съобщението" disabled={busy || !text.trim() || !lab.allowed('simulators')}><Icon name="ri-send-plane-line" size={21}/></button></div></form>{error && <p role="alert" className="lab-error">{error}</p>}
  </div>;
}
