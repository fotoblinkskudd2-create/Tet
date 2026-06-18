import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../lib/api';
import { PublicUser } from '../lib/types';

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    apiFetch<PublicUser>('/api/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecked(true));
  }, [router.pathname]);

  const handleLogout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <div className="app-shell">
      <nav className="navbar">
        <Link href="/" className="brand">
          Byggeprosjekter
        </Link>
        <div className="nav-links">
          <Link href="/">Prosjekter</Link>
          <Link href="/projects/new">Nytt prosjekt</Link>
          {checked && user && (
            <>
              <span className="nav-user">{user.username}</span>
              <button onClick={handleLogout}>Logg ut</button>
            </>
          )}
          {checked && !user && <Link href="/auth/login">Logg inn</Link>}
        </div>
      </nav>
      <main className="content">{children}</main>
    </div>
  );
}
