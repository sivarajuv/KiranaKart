import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Reports from './pages/Reports';
import AIAssistant from './pages/AIAssistant';
import Users from './pages/Users';
import Login from './pages/Login';
import './App.css';

const NAV_ADMIN = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'pos', label: 'Point of Sale', icon: '🛒' },
  { id: 'products', label: 'Products', icon: '📦' },
  { id: 'reports', label: 'Reports', icon: '📈' },
  { id: 'ai', label: 'AI Assistant', icon: '🤖' },
  { id: 'users', label: 'Users', icon: '👥' },
];

const NAV_CASHIER = [
  { id: 'pos', label: 'Point of Sale', icon: '🛒' },
  { id: 'products', label: 'View Products', icon: '📦' },
];

function AppShell() {
  const { user, loading, logout, isAdmin } = useAuth();
  const [page, setPage] = useState(isAdmin() ? 'dashboard' : 'pos');
  const [showProfile, setShowProfile] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f7f8f5' }}>
        <div className="loading-dots"><span/><span/><span/></div>
      </div>
    );
  }

  if (!user) return <Login />;

  const nav = isAdmin() ? NAV_ADMIN : NAV_CASHIER;

  // If cashier lands on an admin-only page, redirect
  const allowedPages = nav.map(n => n.id);
  const activePage = allowedPages.includes(page) ? page : nav[0].id;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'pos': return <POS />;
      case 'products': return <Products />;
      case 'reports': return <Reports />;
      case 'ai': return <AIAssistant />;
      case 'users': return <Users />;
      default: return <POS />;
    }
  };

  return (
    <CartProvider>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-icon">🛍️</span>
            <div>
              <div className="brand-name">KiranaKart</div>
              <div className="brand-sub">Grocery Management</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {nav.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User profile section */}
          <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: showProfile ? 'rgba(255,255,255,0.06)' : 'transparent', transition: 'background 0.2s' }}
              onClick={() => setShowProfile(v => !v)}
            >
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: user.role === 'ADMIN' ? '#22a05e' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {user.role === 'ADMIN' ? '👑' : '🧑‍💼'}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.fullName}</div>
                <div style={{ color: '#a8c5b5', fontSize: 11 }}>{user.role}</div>
              </div>
              <span style={{ color: '#a8c5b5', fontSize: 12 }}>{showProfile ? '▲' : '▼'}</span>
            </div>

            {showProfile && (
              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginTop: 6 }}>
                <div style={{ color: '#a8c5b5', fontSize: 12, marginBottom: 8 }}>@{user.username}</div>
                <div style={{ color: '#a8c5b5', fontSize: 11, marginBottom: 12 }}>{user.email}</div>
                <button
                  onClick={logout}
                  style={{ width: '100%', padding: '8px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="main-content">
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Logged in as</span>
              <span style={{ background: user.role === 'ADMIN' ? '#dcfce7' : '#dbeafe', color: user.role === 'ADMIN' ? '#166534' : '#1e40af', borderRadius: 4, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                {user.role === 'ADMIN' ? '👑' : '🧑‍💼'} {user.role}
              </span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{user.fullName}</span>
            </div>
          </div>
          {renderPage()}
        </main>
      </div>
    </CartProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

