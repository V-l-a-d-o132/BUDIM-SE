import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/base/Icon';
import { Avatar } from '../focus/Visuals';
import type { LabPost } from '@/lib/classroom';
import { useClassroom } from './ClassroomContext';

export function PostMedia({ post, playable = true, autoplay = false }: { post: LabPost; playable?: boolean; autoplay?: boolean }) {
  if (!post.media?.url) return null;
  return post.media.mime_type.startsWith('video/')
    ? <video src={post.media.url} controls={playable} autoPlay={autoplay} muted playsInline loop preload="metadata" className="lab-post-media" />
    : <img src={post.media.url} alt={post.content.slice(0,120) || 'Снимка към публикация'} className="lab-post-media" loading="lazy" />;
}
export default function PostCard({ post, clip = false, onComments, onAuthor }: {
  post: LabPost; clip?: boolean; onComments: (post: LabPost) => void; onAuthor: (id: string) => void;
}) {
  const lab = useClassroom()!;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reactions, setReactions] = useState(false);
  const card = useRef<HTMLElement>(null);
  const viewed = useRef(false);
  const lock = useRef(false);
  const doAction = async (action: string, payload: Record<string,unknown>) => {
    if(lock.current) return; lock.current=true; setBusy(true); setError('');
    try { await lab.command(action,{post_id:post.id,...payload}); }
    catch(err) { setError(err instanceof Error ? err.message : 'Действието не е записано.'); }
    finally { lock.current=false; setBusy(false); }
  };
  useEffect(() => {
    if (!post.approved || !card.current || typeof IntersectionObserver === 'undefined') return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(entries => {
      clearTimeout(timer);
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio>=0.5) && !viewed.current) {
        timer=setTimeout(() => {
          viewed.current=true;
          void lab.command('view',{post_id:post.id}).catch(() => {viewed.current=false;});
        },700);
      }
    },{threshold:[0,0.5,1]});
    observer.observe(card.current);
    return () => {clearTimeout(timer);observer.disconnect();};
  }, [post.id,post.approved]);
  const likeIcon = post.app_id==='facebook' || post.app_id==='youtube' ? 'ri-thumb-up-line' : 'ri-heart-line';
  return <article ref={card} className={'lab-post-card ' + (clip ? 'lab-clip-card' : '')} data-post-id={post.id}>
    {!clip && <div className="demo-post-author"><button type="button" onClick={() => onAuthor(post.member_id)} aria-label={'Профил на '+post.alias}><Avatar name={post.alias} /></button><span><button type="button" onClick={() => onAuthor(post.member_id)}><strong>{post.alias}</strong></button><small>{new Date(post.created_at).toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'})}{!post.approved ? ' · Изчаква одобрение' : ''}</small></span>{post.member_id===lab.state.access?.member_id && <button type="button" aria-label="Изтрий своята публикация" disabled={busy} onClick={() => {if(window.confirm('Да изтрием ли тази публикация?')) void doAction('delete_post',{});}} className="demo-icon-button"><Icon name="ri-delete-bin-line" size={17}/></button>}</div>}
    <PostMedia post={post} autoplay={clip} />
    <div className={clip ? 'lab-clip-caption' : 'lab-post-copy'}>{clip && <button type="button" onClick={() => onAuthor(post.member_id)}><strong>@{post.alias}</strong></button>}<p>{post.content}</p>{clip && !post.media && <small>Текстова публикация</small>}</div>
    <div className={clip ? 'lab-clip-actions' : 'lab-actions'}>
      <button type="button" className="demo-icon-button" aria-label={post.reaction ? 'Премахни реакцията' : 'Харесай публикацията'} aria-pressed={Boolean(post.reaction)} disabled={busy || !post.approved} onClick={() => {void doAction('react',{reaction:post.reaction ? null : 'like'});}}><Icon name={likeIcon} size={23}/><span>{post.likes}</span></button>
      <button type="button" className="demo-icon-button" aria-label="Отвори коментарите" disabled={!post.approved} onClick={() => onComments(post)}><Icon name="ri-chat-1-line" size={23}/><span>{post.comments}</span></button>
      <button type="button" className="demo-icon-button" aria-label={post.shared ? 'Премахни споделянето' : 'Сподели в заниманието'} aria-pressed={post.shared} disabled={busy || !post.approved} onClick={() => {void doAction('share',{active:!post.shared});}}><Icon name="ri-repeat-line" size={23}/><span>{post.shares}</span></button>
      <button type="button" className="demo-icon-button" aria-label={post.saved ? 'Премахни от запазените' : 'Запази публикацията'} aria-pressed={post.saved} disabled={busy || !post.approved} onClick={() => {void doAction('save',{active:!post.saved});}}><Icon name="ri-bookmark-line" size={22}/></button>
    </div>
    {post.app_id==='facebook' && <div className="lab-facebook-reactions"><button type="button" disabled={!post.approved || busy} onClick={() => setReactions(!reactions)}>Избери реакция</button>{reactions && <div>{[['like','👍'],['love','❤️'],['wow','😮'],['sad','😢'],['angry','😠']].map(([value,label]) => <button type="button" key={value} aria-label={'Реакция '+value} disabled={busy} onClick={() => {setReactions(false); void doAction('react',{reaction:value});}}>{label}</button>)}</div>}</div>}
    {!clip && <small className="lab-views">Показана на {post.views} участници</small>}
    {error && <p role="alert" className="lab-error">{error}</p>}
  </article>;
}
export function Comments({ postId }: { postId: string }) {
  const lab=useClassroom()!;
  const [text,setText]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const lock=useRef(false);
  const requestId=useRef(crypto.randomUUID());
  const comments=lab.state.comments.filter(comment => comment.post_id===postId);
  return <div className="lab-comments"><div>{comments.length ? comments.map(comment => <article key={comment.id}><Avatar name={comment.alias}/><div><strong>{comment.alias}</strong><p>{comment.content}</p>{!comment.approved && <small>Изчаква одобрение</small>}</div></article>) : <p className="lab-empty">Още няма коментари.</p>}</div><form onSubmit={async event => {
    event.preventDefault();if(lock.current || !text.trim())return;lock.current=true;setBusy(true);setError('');
    try {await lab.command('comment',{post_id:postId,content:text.trim(),request_id:requestId.current});setText('');requestId.current=crypto.randomUUID();}
    catch(err){setError(err instanceof Error ? err.message : 'Коментарът не е записан.');}
    finally{lock.current=false;setBusy(false);}
  }}><label className="sr-only" htmlFor="lab-comment">Твоят коментар</label><textarea id="lab-comment" placeholder="Добави коментар…" value={text} maxLength={1000} disabled={busy} onChange={event => setText(event.target.value)}/><button type="submit" disabled={busy || !text.trim() || !lab.allowed('simulators')}>{busy ? '…' : 'Изпрати'}</button></form>{error && <p role="alert" className="lab-error">{error}</p>}</div>;
}
