import { useAdminAuth } from '@/hooks/useAdminAuth';
import { requiredAdminPermission } from '@/lib/admin-permissions';
import { Navigate, useLocation, Link } from 'react-router-dom';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdminAuth();
  const { pathname } = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center" role="status">Проверка на достъпа…</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  if (!admin.mfaVerified) return <Navigate to="/admin/mfa" replace />;
  const permission = requiredAdminPermission(pathname);
  if (permission !== 'access' && !admin.permissions.includes(permission)) {
    return <div className="min-h-screen flex flex-col gap-4 items-center justify-center"><p>Нямате права за тази страница.</p><Link to="/admin">Към обзора</Link></div>;
  }
  return <>{children}</>;
}
