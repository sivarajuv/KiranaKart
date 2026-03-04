import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please enter username and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  const fillDemo = (role) => {
    setForm(role === 'admin'
      ? { username: 'admin', password: 'Admin@123' }
      : { username: 'cashier', password: 'Cashier@123' }
    );
    setError('');
  };

  return (
    <div style={styles.bg}>
      {/* Left Panel */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logo}>🛍️</div>
          <h1 style={styles.brand}>KiranaKart</h1>
          <p style={styles.tagline}>Complete Grocery Management System</p>
          <div style={styles.features}>
            {['🛒 Point of Sale & Billing', '💰 Dynamic Pricing with AI', '📊 Real-time Reports & Analytics', '💳 Cash, Card & UPI Payments', '🤖 Claude AI Business Assistant', '👥 Role-based Access Control'].map((f, i) => (
              <div key={i} style={styles.feature}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div style={styles.right}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Welcome back</h2>
          <p style={styles.formSub}>Sign in to your KiranaKart account</p>

          {/* Demo Quick Fill */}
          <div style={styles.demoRow}>
            <span style={styles.demoLabel}>Quick demo:</span>
            <button style={styles.demoBtn} onClick={() => fillDemo('admin')}>👑 Admin</button>
            <button style={styles.demoBtn} onClick={() => fillDemo('cashier')}>🧑‍💼 Cashier</button>
          </div>

          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>👤</span>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  autoFocus
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  style={{ ...styles.input, paddingRight: 44 }}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" style={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={styles.error}>⚠️ {error}</div>
            )}

            <button style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={styles.creds}>
            <div style={styles.credTitle}>Default Credentials</div>
            <div style={styles.credRow}>
              <span style={styles.credBadge('#1a7a4a')}>ADMIN</span>
              <span style={styles.credText}>admin / Admin@123</span>
            </div>
            <div style={styles.credRow}>
              <span style={styles.credBadge('#3b82f6')}>CASHIER</span>
              <span style={styles.credText}>cashier / Cashier@123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif",
  },
  left: {
    flex: 1, background: 'linear-gradient(145deg, #0f2419 0%, #1a4a2a 50%, #0f2419 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px',
  },
  leftInner: { maxWidth: 420 },
  logo: { fontSize: 56, marginBottom: 16 },
  brand: { fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, color: '#fff', marginBottom: 8 },
  tagline: { fontSize: 16, color: '#a8c5b5', marginBottom: 40 },
  features: { display: 'flex', flexDirection: 'column', gap: 12 },
  feature: { color: '#d1e8dc', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 },
  right: {
    width: 480, background: '#f7f8f5',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px',
  },
  formCard: {
    width: '100%', background: '#fff', borderRadius: 20, padding: '40px 36px',
    boxShadow: '0 8px 40px rgba(15,36,25,0.10)', border: '1px solid #e2e8e4',
  },
  formTitle: { fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#1a2e1f', marginBottom: 6 },
  formSub: { color: '#6b7c6f', fontSize: 14, marginBottom: 24 },
  demoRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  demoLabel: { fontSize: 12, color: '#6b7c6f', fontWeight: 500 },
  demoBtn: {
    padding: '5px 14px', border: '1.5px solid #e2e8e4', borderRadius: 20,
    background: '#f7f8f5', cursor: 'pointer', fontSize: 12, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", color: '#1a2e1f',
    transition: 'all 0.2s',
  },
  formGroup: { marginBottom: 18 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#1a2e1f', marginBottom: 6 },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 },
  input: {
    width: '100%', padding: '12px 14px 12px 40px', border: '1.5px solid #e2e8e4',
    borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14,
    color: '#1a2e1f', outline: 'none', boxSizing: 'border-box', background: '#fafbfa',
    transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
  },
  error: {
    background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca',
    borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16,
  },
  submitBtn: {
    width: '100%', padding: '14px', background: '#1a7a4a', color: '#fff',
    border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    transition: 'background 0.2s', marginTop: 4,
  },
  creds: {
    marginTop: 28, background: '#f7f8f5', borderRadius: 12, padding: '16px 18px',
    border: '1px solid #e2e8e4',
  },
  credTitle: { fontSize: 11, fontWeight: 700, color: '#6b7c6f', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  credRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  credBadge: (bg) => ({
    background: bg, color: '#fff', borderRadius: 4, padding: '2px 8px',
    fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
  }),
  credText: { fontSize: 13, color: '#1a2e1f', fontFamily: 'monospace' },
};
