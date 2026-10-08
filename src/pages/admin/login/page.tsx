import LegacyIcon from '@/components/base/LegacyIcon';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { usePageSeo } from '@/hooks/usePageSeo';

const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

interface LoginAttempts {
  count: number;
  lastAttempt: number;
}

function getAttempts(): LoginAttempts {
  try {
    const raw = localStorage.getItem('admin_login_attempts');
    if (!raw) return { count: 0, lastAttempt: 0 };
    return JSON.parse(raw) as LoginAttempts;
  } catch {
    return { count: 0, lastAttempt: 0 };
  }
}

function setAttempts(data: LoginAttempts) {
  localStorage.setItem('admin_login_attempts', JSON.stringify(data));
}

function isLockedOut(): { locked: boolean; remainingMs: number } {
  const attempts = getAttempts();
  if (attempts.count >= MAX_ATTEMPTS) {
    const elapsed = Date.now() - attempts.lastAttempt;
    if (elapsed < COOLDOWN_MS) {
      return { locked: true, remainingMs: COOLDOWN_MS - elapsed };
    }
    // Cooldown expired — reset counter
    setAttempts({ count: 0, lastAttempt: 0 });
  }
  return { locked: false, remainingMs: 0 };
}

function recordFailedAttempt() {
  const attempts = getAttempts();
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  setAttempts(attempts);
}

function clearAttempts() {
  localStorage.removeItem('admin_login_attempts');
}

function formatRemaining(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  return `${minutes} мин.`;
}

export default function AdminLogin() {
  usePageSeo({
    title: 'Администрация — Вход',
    description: 'Административен панел на Център БУДИМ СЕ.',
    noIndex: true,
  });

  const { admin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lockout, setLockout] = useState(isLockedOut());

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockout.locked) return;
    const interval = setInterval(() => {
      const current = isLockedOut();
      setLockout(current);
      if (!current.locked) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockout.locked]);

  useEffect(() => {
    if (!loading && admin) {
      navigate(admin?.mfaVerified ? '/admin' : '/admin/mfa', { replace: true });
    }
  }, [admin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check lockout
    const check = isLockedOut();
    if (check.locked) {
      setLockout(check);
      setError(`Твърде много неуспешни опити. Изчакайте ${formatRemaining(check.remainingMs)}.`);
      return;
    }

    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      recordFailedAttempt();
      const updated = isLockedOut();
      setLockout(updated);
      if (updated.locked) {
        setError(`Твърде много неуспешни опити. Изчакайте ${formatRemaining(updated.remainingMs)}.`);
      } else {
        const remaining = MAX_ATTEMPTS - getAttempts().count;
        setError(`Невалиден имейл или парола. Оставащи опити: ${remaining}.`);
      }
      setSubmitting(false);
      return;
    }

    // Check admin role
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      recordFailedAttempt();
      setError('Грешка при вход.');
      setSubmitting(false);
      return;
    }

    const { data: adminRecord, error: accessError } = await supabase.rpc('admin_access');

    if (accessError || !adminRecord) {
      await supabase.auth.signOut();
      recordFailedAttempt();
      setError('Нямате администраторски достъп.');
      setSubmitting(false);
      return;
    }

    // Success — clear attempts
    clearAttempts();
    setLockout({ locked: false, remainingMs: 0 });
    navigate(adminRecord.mfa_verified ? '/admin' : '/admin/mfa', { replace: true });
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 flex items-center justify-center">
          <LegacyIcon className="ri-loader-4-line animate-spin text-gray-400 text-2xl"></LegacyIcon>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-medium">Администрация</p>
          <h1 className="text-2xl font-medium text-gray-900">Петте степени</h1>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Имейл
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={lockout.locked}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Парола
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={lockout.locked}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || lockout.locked}
              className="w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><LegacyIcon className="ri-loader-4-line animate-spin"></LegacyIcon> Влизане...</>
              ) : lockout.locked ? (
                <><LegacyIcon className="ri-lock-line"></LegacyIcon> Заключено</>
              ) : (
                'Влез в панела'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Достъпът е ограничен само до администратори.
        </p>
      </div>
    </div>
  );
}