import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { requiredAdminPermission } from '@/lib/admin-permissions';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const navItems = [
  { path: '/admin', label: 'Обзор', icon: 'ri-dashboard-line', exact: true },
  { path: '/admin/inquiries', label: 'Запитвания', icon: 'ri-mail-line' },
  { path: '/admin/orders', label: 'Поръчки', icon: 'ri-shopping-bag-line' },
  { path: '/admin/news', label: 'Новини', icon: 'ri-newspaper-line' },
  { path: '/admin/social-posts', label: 'Игрови постове', icon: 'ri-gamepad-line' },
  { path: '/admin/comments', label: 'Коментари', icon: 'ri-chat-1-line' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { admin, signOut } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <Link to="/" className="text-base font-medium text-gray-900 whitespace-nowrap">
            Петте степени
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">Администрация</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.filter(item => requiredAdminPermission(item.path) === 'access' || admin?.permissions.includes(requiredAdminPermission(item.path))).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item)
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <i className={`${item.icon} text-base`}></i>
              </div>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full flex-shrink-0">
              <i className="ri-user-line text-gray-500 text-sm"></i>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{admin?.user.email}</p>
              <p className="text-xs text-gray-400">{admin?.role === 'super_admin' ? 'Супер администратор' : admin?.role === 'moderator' ? 'Модератор' : 'Редактор'}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-logout-box-line"></i>
            Изход
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center cursor-pointer text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
          <h1 className="text-base font-medium text-gray-900">{title}</h1>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
