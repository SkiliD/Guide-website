'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <span className="app-header-logo">Guide</span>
        <div className="app-header-right">
          <span className="app-header-user">
            {user.name}
            <span className="app-header-role">{user.role}</span>
          </span>
          <button onClick={handleLogout} className="app-header-logout">
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
