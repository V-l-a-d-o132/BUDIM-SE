import { useEffect, useRef, useState } from 'react';
import { mediaTypes, uploadLabMedia, type LabApp, type PostKind } from '@/lib/classroom';
import { useClassroom } from './ClassroomContext';

export default function PostComposer({ appId, kind = 'post', initialFile, onClose }: {
  appId: LabApp; kind?: PostKind; initialFile?: File; onClose: () => void;
}) {
  const lab = useClassroom()!;
  const key = 'lab-draft:' + lab.state.access?.member_id + ':' + appId;
  const [text, setText] = useState(() => { try { return sessionStorage.getItem(key) ?? ''; } catch { return ''; } });
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const mediaId = useRef<{ file: File; id: string } | null>(null);
  const lock = useRef(false);
  const requestId = useRef(crypto.randomUUID());
  const maxLength = appId === 'x' ? 280 : 2000;
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => { try { sessionStorage.setItem(key, text); } catch { /* A draft is optional. */ } }, [key,text]);
  return <form className="lab-compose-form" onSubmit={async event => {
    event.preventDefault(); if (lock.current || !lab.allowed('simulators')) return;
    if (!text.trim() && !file) { setError('Добави текст, снимка или клип.'); return; }
    lock.current=true; setBusy(true); setError('');
    try {
      let id: string | undefined;
      if (file) {
        if (mediaId.current?.file === file) id=mediaId.current.id;
        else { id=await uploadLabMedia(file); mediaId.current={file,id}; }
      }
      await lab.command('publish', { app_id: appId, kind, content: text.trim(), request_id:requestId.current, ...(id ? {media_id:id} : {}) });
      try { sessionStorage.removeItem(key); } catch { /* Storage may be disabled. */ }
      onClose();
    } catch (err) { setError(err instanceof Error ? err.message : 'Публикацията не е записана.'); }
    finally { lock.current=false; setBusy(false); }
  }}>
    <label>Текст<textarea autoFocus aria-label="Текст на публикацията" value={text} maxLength={maxLength} disabled={busy} onChange={event => setText(event.target.value)} placeholder="Какво искаш да споделиш?" /></label>
    <small>{text.length}/{maxLength}</small>
    <label className="lab-file-label">Добави снимка или клип<input aria-label="Снимка или клип" type="file" disabled={busy} accept={mediaTypes.join(',')} onChange={event => {
      const selected=event.target.files?.[0] ?? null;
      if(selected && (!mediaTypes.includes(selected.type) || selected.size>12*1024*1024)) {setError('Избери JPG, PNG, WebP, MP4 или WebM до 12 MB.'); event.target.value=''; return;}
      setFile(selected); setError('');
    }} /></label>
    {file && <div className="lab-media-preview">{file.type.startsWith('video/') ? <video src={preview} controls playsInline /> : <img src={preview} alt="Преглед преди публикуване" />}<button type="button" disabled={busy} onClick={() => setFile(null)}>Премахни файла</button></div>}
    <p className="lab-muted">{lab.state.access?.room.moderate_posts ? 'Публикацията ще се покаже на останалите след одобрение.' : 'Публикацията ще се покаже на участниците в това занимание.'}</p>
    {error && <p role="alert" className="lab-error">{error}</p>}
    <button type="submit" className="lab-primary" disabled={busy || !lab.allowed('simulators')}>{busy ? 'Записване…' : kind==='story' ? 'Сподели история' : 'Публикувай'}</button>
  </form>;
}
