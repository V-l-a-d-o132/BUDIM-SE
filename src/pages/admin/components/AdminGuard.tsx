import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { admin, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin/login', { replace: true });
    }
  }, [admin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-gray-400 text-2xl"></i>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return <>{children}</>;
}
