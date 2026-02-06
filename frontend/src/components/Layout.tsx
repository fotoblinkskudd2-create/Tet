import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { nb } from '../i18n/nb';

const navItems = [
  { path: '/', label: nb.nav.dashboard, icon: '\u{1F4CA}' },
  { path: '/transaksjoner', label: nb.nav.transactions, icon: '\u{1F4B3}' },
  { path: '/ny-transaksjon', label: nb.nav.addTransaction, icon: '\u{2795}' },
  { path: '/kontoer', label: nb.nav.accounts, icon: '\u{1F3E6}' },
  { path: '/budsjetter', label: nb.nav.budgets, icon: '\u{1F4CB}' },
  { path: '/rapporter', label: nb.nav.reports, icon: '\u{1F4C8}' },
  { path: '/innstillinger', label: nb.nav.settings, icon: '\u{2699}\u{FE0F}' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPage = navItems.find(item => item.path === location.pathname);

  return (
    <div className="app-layout">
      {/* Mobile header */}
      <div className="mobile-header">
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>
          &#9776;
        </button>
        <span style={{ fontWeight: 600 }}>{currentPage?.label || 'BergenBudget'}</span>
        <button className="hamburger" onClick={toggleTheme}>
          {theme === 'dark' ? '\u{2600}\u{FE0F}' : '\u{1F319}'}
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={() => setSidebarOpen(false)}>
            BergenBudget
            <small>Personlig okonomi</small>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-link-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {user?.name} ({user?.role})
          </div>
          <button
            className="nav-link"
            onClick={logout}
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <span className="nav-link-icon">{'\u{1F6AA}'}</span>
            {nb.nav.logout}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <div className="page-header">
          <h1>{currentPage?.label || ''}</h1>
          <div className="btn-group">
            <button className="btn btn-ghost btn-sm" onClick={toggleTheme}>
              {theme === 'dark' ? '\u{2600}\u{FE0F} Lys modus' : '\u{1F319} Mork modus'}
            </button>
          </div>
        </div>
        <div className="page-body">
          {children}
        </div>
      </main>
    </div>
  );
}
