import { useState, type ReactNode } from 'react';
import { useClassroom } from './ClassroomContext';
import type { LabScope } from '@/lib/classroom';

export function ClassroomAccess() {
  const lab = useClassroom();
  const [code, setCode] = useState('');
  const [alias, setAlias] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!lab) return null;
  const access = lab.state.access;
  return <section className="max-w-5xl mx-auto mb-8 border border-gray-200 rounded-2xl bg-gray-50 p-5" aria-label="Достъп до учебно занимание">
    {access ? <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-medium">{access.room.name}</h2><p className="text-sm text-gray-600 mt-1">{access.alias} · {access.status === 'pending' ? 'Чакаш одобрение от водещия.' : access.status === 'revoked' ? 'Достъпът е отнет.' : access.room.status === 'paused' ? 'Заниманието е на пауза.' : access.room.status === 'closed' || Date.parse(access.room.expires_at) <= Date.now() ? 'Заниманието е приключило.' : 'Достъпът е одобрен.'}</p></div><button type="button" onClick={lab.leave} className="text-sm underline underline-offset-4">Излез от заниманието</button></div>
      {access.status === 'approved' && <p className="text-xs text-gray-600 mt-3">Симулатори: {access.simulators && access.room.simulators_enabled ? 'разрешени' : 'не са разрешени'} · Анализатор: {access.analyzer && access.room.analyzer_enabled ? 'разрешен' : 'не е разрешен'}</p>}
    </div> : <form onSubmit={async event => { event.preventDefault(); if (submitting) return; setSubmitting(true); try { await lab.join(code, alias); } catch { /* The provider displays the error. */ } finally { setSubmitting(false); } }}>
      <h2 className="font-medium mb-2">Влез в учебно занимание</h2>
      <p className="text-sm text-gray-600 mb-4">Вземи кода от водещия и избери псевдоним. Той одобрява достъпа до симулаторите и анализатора поотделно. Публикациите и учебните разговори се записват и могат да бъдат преглеждани от водещия.</p>
      <div className="flex flex-col sm:flex-row gap-3"><label className="flex-1 text-xs text-gray-600">Код на заниманието<input required minLength={8} maxLength={12} value={code} onChange={event => setCode(event.target.value.toUpperCase())} autoComplete="off" className="block w-full mt-1 rounded-lg border border-gray-300 p-3 text-sm" /></label><label className="flex-1 text-xs text-gray-600">Псевдоним<input required minLength={2} maxLength={40} value={alias} onChange={event => setAlias(event.target.value)} autoComplete="off" className="block w-full mt-1 rounded-lg border border-gray-300 p-3 text-sm" /></label><button type="submit" disabled={submitting || lab.loading} className="sm:self-end rounded-lg bg-gray-900 px-5 py-3 text-sm text-white disabled:opacity-50">{submitting ? 'Изпращане…' : 'Заяви достъп'}</button></div>
    </form>}
    {lab.error && <p role="alert" className="mt-3 text-sm text-red-700">{lab.error} <button type="button" onClick={() => { void lab.refresh(); }} className="underline">Провери отново</button></p>}
  </section>;
}
export function ClassroomGate({ scope, children }: { scope: LabScope; children: ReactNode }) {
  const lab = useClassroom();
  if (lab?.allowed(scope)) return children;
  return <div className="max-w-3xl mx-auto border border-gray-200 rounded-2xl p-8 text-center" role="status"><h3 className="text-lg font-medium mb-3">{scope === 'analyzer' ? 'Анализът се включва от водещия' : 'Симулаторите се включват от водещия'}</h3><p className="text-sm text-gray-600">{lab?.loading ? 'Проверяваме разрешението…' : lab?.state.access ? 'След одобрение и включване на инструмента той ще се отвори тук.' : 'Въведи кода на заниманието и заяви достъп по-горе.'}</p></div>;
}
