import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AdminUser {
  user: User;
  session: Session;
  role: 'super_admin' | 'editor';
}

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin(session: Session | null) {
      if (!session) {
        if (mounted) { setAdmin(null); setLoading(false); }
        return;
      }
      const { data } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (mounted) {
        if (data) {
          setAdmin({ user: session.user, session, role: data.role as AdminUser['role'] });
        } else {
          setAdmin(null);
        }
        setLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAdmin(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdmin(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = () => supabase.auth.signOut();

  return { admin, loading, signOut };
}
