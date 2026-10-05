import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { validAdminRole } from '@/lib/admin-permissions';
import type { AdminRole, AdminPermission } from '@/lib/admin-permissions';
import type { User, Session } from '@supabase/supabase-js';

export interface AdminUser {
  user: User;
  session: Session;
  role: AdminRole;
  mfaVerified: boolean;
  permissions: AdminPermission[];
}

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    let generation = 0;
    async function checkAdmin(session: Session | null) {
      const request = ++generation;
      if (!session) {
        if (mounted) { setAdmin(null); setLoading(false); }
        return;
      }
      try {
        const { data: { user }, error } = await supabase.auth.getUser(session.access_token);
        const access = error || !user ? null : await supabase.rpc('admin_access');
        if (!mounted || request !== generation) return;
        const record = access?.data;
        setAdmin(!access?.error && user && record && validAdminRole(record.role)
          ? { user, session, role: record.role, mfaVerified: record.mfa_verified === true,
            permissions: Array.isArray(record.permissions) ? record.permissions : [] }
          : null);
      } catch { if (mounted && request === generation) setAdmin(null); }
      finally { if (mounted && request === generation) setLoading(false); }
    }
    const refresh = () => { void supabase.auth.getSession().then(({ data }) => checkAdmin(data.session)); };
    refresh();
    // Run network calls outside the Auth callback to avoid holding its lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => { if (mounted) void checkAdmin(session); }, 0);
    });
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { mounted = false; generation++; subscription.unsubscribe(); window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  const signOut = () => supabase.auth.signOut();
  return { admin, loading, signOut };
}
