import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { usePageSeo } from '@/hooks/usePageSeo';

export default function AdminMfa() {
  usePageSeo({ title: 'Администрация — Втори фактор', description: 'Защитен административен вход.', noIndex: true });
  const { admin, loading, signOut } = useAdminAuth();
  const [factor, setFactor] = useState('');
  const [qr, setQr] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!admin || admin.mfaVerified) return;
    let active = true;
    supabase.auth.mfa.listFactors().then(({ data, error }) => {
      if (!active) return;
      if (error) setError('Факторите не могат да бъдат заредени. Опитайте отново.');
      else setFactor(data.totp.find(f => f.status === 'verified')?.id || '');
      setReady(true);
    });
    return () => { active = false; };
  }, [admin?.user.id, admin?.mfaVerified]);
  const enroll = async () => {
    setBusy(true); setError('');
    const factors = await supabase.auth.mfa.listFactors();
    if (factors.error) { setError('Неуспешно зареждане на факторите.'); setBusy(false); return; }
    for (const existing of factors.data.all) {
      if (existing.factor_type === 'totp' && existing.status === 'unverified') {
        const removed = await supabase.auth.mfa.unenroll({ factorId: existing.id });
        if (removed.error) { setError('Неуспешно възстановяване на настройката. Опитайте отново.'); setBusy(false); return; }
      }
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Будим се ${new Date().toISOString()}` });
    if (error) setError('Неуспешно добавяне на втори фактор. Опитайте отново.');
    else { setFactor(data.id); setQr(data.totp.qr_code); }
    setBusy(false);
  };
  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) { setError('Въведете шестцифрения код от приложението.'); return; }
    setBusy(true); setError('');
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor, code });
    if (error) setError('Кодът е невалиден или е изтекъл. Въведете нов код.');
    else { setQr(''); setCode(''); await supabase.auth.refreshSession(); }
    setBusy(false);
  };
  if (loading) return <p className="p-8" role="status">Проверка на достъпа…</p>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  if (admin.mfaVerified) return <Navigate to="/admin" replace />;
  return <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6"><section className="bg-white border rounded-xl p-8 w-full max-w-md space-y-5">
    <h1 className="text-xl font-semibold">Защитен административен вход</h1>
    <p className="text-sm text-gray-600">Необходим е код от приложение за удостоверяване. При първото влизане добавете показания QR код в своето приложение. Запазете възможност за възстановяване на устройството си.</p>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {!ready ? <p role="status">Зареждане…</p> : !factor ? <button disabled={busy} onClick={enroll} className="bg-gray-900 text-white rounded px-4 py-2">Добави втори фактор</button> : <form onSubmit={verify} className="space-y-4">
      {qr && <img src={qr} alt="QR код за добавяне в приложението за удостоверяване" className="w-48 h-48 mx-auto" />}
      <label className="block text-sm">Код от приложението<input autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g,''))} className="block w-full border rounded p-3 mt-2" /></label>
      <button disabled={busy} className="bg-gray-900 text-white rounded px-4 py-2">Потвърди кода</button>
    </form>}
    <button onClick={() => { setQr(''); setCode(''); void signOut(); }} className="text-sm underline">Изход</button>
  </section></main>;
}
