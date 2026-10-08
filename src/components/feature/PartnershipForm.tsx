import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

export default function PartnershipForm() {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => { request.current?.abort(); request.current = null; }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const url = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
    const key = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setStatus({ ok: false, message: 'Формата временно не е достъпна. Можеш да ни пишеш на budimseonline@gmail.com.' });
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 15000);
    setPending(true);
    setStatus(null);
    try {
      const response = await fetch(url + '/functions/v1/submit-partnership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key, apikey: key },
        body: JSON.stringify(Object.fromEntries(data.entries())),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) throw new Error(response.status === 429 ? 'rate-limit' : 'request');
      if (request.current !== controller) return;
      form.reset();
      setStatus({ ok: true, message: 'Получихме запитването. Ще се свържем с теб на посочения имейл, за да уточним възможностите.' });
    } catch (error) {
      if (request.current !== controller) return;
      setStatus({ ok: false, message: error instanceof Error && error.message === 'rate-limit'
        ? 'Има твърде много заявки. Изчакай малко и опитай отново. Текстът ти е запазен във формата.'
        : 'Не успяхме да потвърдим изпращането. Провери връзката и опитай отново или ни пиши по имейл. Текстът ти остава във формата.' });
    } finally {
      window.clearTimeout(timer);
      if (request.current === controller) { request.current = null; setPending(false); }
    }
  }

  return <form className="contact-form" id="form" onSubmit={submit} aria-busy={pending}>
    <h2>Изпрати запитване</h2>
    <div className="form-field"><label htmlFor="contact-organization">Име или организация</label><input id="contact-organization" name="organization" required minLength={2} maxLength={200} autoComplete="organization" /></div>
    <div className="form-field"><label htmlFor="contact-type">За кого е запитването?</label><select id="contact-type" name="type" defaultValue="school"><option value="school">Училище или учител</option><option value="ngo">Организация</option><option value="corporate">Екип или компания</option><option value="media">Медия</option><option value="other">Друго / личен въпрос</option></select></div>
    <div className="form-field"><label htmlFor="contact-email">Имейл за отговор</label><input type="email" id="contact-email" name="email" required maxLength={200} autoComplete="email" inputMode="email" /></div>
    <div className="form-field"><label htmlFor="contact-message">Как можем да помогнем?</label><textarea id="contact-message" name="message" required maxLength={500} rows={5} aria-describedby="contact-message-help" /><span className="form-help" id="contact-message-help">До 500 знака. За училище посочи възрастова група, приблизителен брой участници и тема. Не изпращай лични данни на ученици.</span></div>
    <p className="form-help">Използваме тези данни, за да отговорим на запитването. <Link to="/privacy" className="underline">Политика за поверителност</Link>.</p>
    <button type="submit" className="button-primary" disabled={pending}>{pending ? 'Изпращане…' : 'Изпрати запитването'}</button>
    <div role="status" aria-live="polite" aria-atomic="true">{status && <p className={'form-status ' + (status.ok ? '' : 'form-error')}>{status.message}</p>}</div>
  </form>;
}
