import { useRouter } from 'next/router';
import { ReactNode } from 'react';

interface SocialLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function SocialLayout({ children, title }: SocialLayoutProps) {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = [
    { path: '/social', label: 'Hjem', icon: '🏠' },
    { path: '/social/compose', label: 'Ny', icon: '✏️' },
    { path: '/social/schedule', label: 'Plan', icon: '📅' },
    { path: '/social/platforms', label: 'Kontoer', icon: '🔗' },
  ];

  return (
    <div className="social-app">
      <header className="social-header">
        <h1 className="social-header-title">{title || 'SocialPoster'}</h1>
      </header>

      <main className="social-main">{children}</main>

      <nav className="social-tab-bar">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`tab-item ${currentPath === item.path ? 'active' : ''}`}
            onClick={() => router.push(item.path)}
          >
            <span className="tab-icon">{item.icon}</span>
            <span className="tab-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
