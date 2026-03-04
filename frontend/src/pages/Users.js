import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8080/api';

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user || { username: '', email: '', fullName: '', password: '', role: 'CASHIER' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.username || !form.email || !form.fullName || (!user && !form.password)) {
      setError('Please fill all required fields');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (user) {
        await axios.put(`${API}/users/${user.id}`, {
          fullName: form.fullName, email: form.email, role: form.role
        });
      } else {
        await axios.post(`${API}/users`, form);
      }
      onSave();
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Error saving user');
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">{user ? '✏️ Edit User' : '➕ Add New User'}</h2>

        {error && <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="ADMIN">👑 Admin</option>
              <option value="CASHIER">🧑‍💼 Cashier</option>
            </select>
          </div>
        </div>
        {!user && (
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="johndoe" />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@kiranakart.com" />
        </div>
        {!user && (
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" />
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
            {saving ? 'Saving...' : (user ? 'Save Changes' : 'Create User')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const { user: currentUser } = useAuth();

  const load = async () => {
    try {
      const res = await axios.get(`${API}/users`);
      setUsers(res.data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (id) => {
    await axios.patch(`${API}/users/${id}/toggle-status`);
    load();
  };

  const deleteUser = async (id, name) => {
    if (window.confirm(`Delete user "${name}"? This cannot be undone.`)) {
      await axios.delete(`${API}/users/${id}`);
      load();
    }
  };

  const roleColor = (role) => role === 'ADMIN' ? '#dcfce7' : '#dbeafe';
  const roleTextColor = (role) => role === 'ADMIN' ? '#166534' : '#1e40af';

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Manage staff accounts and permissions</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add User</button>
        </div>
      </div>

      <div className="page-content">
        {/* Role Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { icon: '👥', label: 'Total Users', value: users.length },
            { icon: '👑', label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length },
            { icon: '🧑‍💼', label: 'Cashiers', value: users.filter(u => u.role === 'CASHIER').length },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Role Permissions Table */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="chart-title">🔐 Role Permissions</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Feature</th>
                  <th style={{ textAlign: 'center', padding: '10px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>👑 Admin</th>
                  <th style={{ textAlign: 'center', padding: '10px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>🧑‍💼 Cashier</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Dashboard & Stats', true, false],
                  ['Point of Sale (POS)', true, true],
                  ['View Products', true, true],
                  ['Add/Edit/Delete Products', true, false],
                  ['Change Prices', true, false],
                  ['View Orders', true, true],
                  ['Reports & Analytics', true, false],
                  ['AI Assistant', true, false],
                  ['User Management', true, false],
                ].map(([feature, admin, cashier], i) => (
                  <tr key={i}>
                    <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{feature}</td>
                    <td style={{ textAlign: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                      {admin ? '✅' : '❌'}
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                      {cashier ? '✅' : '❌'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <h3 className="chart-title">👥 All Users</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: u.role === 'ADMIN' ? '#dcfce7' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                          {u.role === 'ADMIN' ? '👑' : '🧑‍💼'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{u.fullName}</div>
                          {u.username === currentUser?.username && (
                            <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600 }}>YOU</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{u.username}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.email}</td>
                    <td>
                      <span style={{ background: roleColor(u.role), color: roleTextColor(u.role), borderRadius: 4, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${u.enabled ? 'success' : 'danger'}`}>
                        {u.enabled ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-IN') : 'Never'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditUser(u)}>✏️</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => toggleStatus(u.id)}
                          disabled={u.username === currentUser?.username}>
                          {u.enabled ? '🔒' : '🔓'}
                        </button>
                        <button className="btn btn-danger btn-sm"
                          onClick={() => deleteUser(u.id, u.fullName)}
                          disabled={u.username === currentUser?.username}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(showAdd || editUser) && (
        <UserModal
          user={editUser}
          onClose={() => { setShowAdd(false); setEditUser(null); }}
          onSave={load}
        />
      )}
    </div>
  );
}
