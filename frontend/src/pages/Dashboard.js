import React, { useEffect, useState } from 'react';
import { orderAPI } from '../services/api';

const CATEGORY_EMOJI = {
  'Grains & Staples': '🌾', 'Pulses & Lentils': '🫘', 'Oils & Ghee': '🧴',
  'Vegetables': '🥦', 'Fruits': '🍎', 'Dairy & Eggs': '🥛',
  'Spices': '🌶️', 'Beverages': '☕', 'Snacks': '🍪', 'Bakery': '🍞',
};

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, tp, o, cs] = await Promise.all([
          orderAPI.getDashboardStats(),
          orderAPI.getTopProducts(),
          orderAPI.getAll(),
          orderAPI.getSalesByCategory(),
        ]);
        setStats(s.data);
        setTopProducts(tp.data.slice(0, 5));
        setRecentOrders(o.data.slice(0, 5));
        setCategoryStats(cs.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="loading-dots"><span/><span/><span/></div>
    </div>
  );

  const fmt = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's your shop at a glance.</p>
      </div>

      <div className="stats-grid">
        {[
          { icon: '📦', label: 'Total Orders', value: stats?.totalOrders ?? 0, sub: `${stats?.todayOrders ?? 0} today` },
          { icon: '💰', label: 'Total Revenue', value: fmt(stats?.totalRevenue), sub: `${fmt(stats?.todayRevenue)} today` },
          { icon: '🏆', label: 'Top Product', value: topProducts[0]?.productName?.split(' ')[0] ?? '—', sub: topProducts[0] ? `${topProducts[0].totalQuantity} units sold` : '' },
          { icon: '📊', label: 'Categories', value: categoryStats.length, sub: 'Active categories' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-change">{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '0 32px', marginBottom: 24 }}>
        {/* Top Selling Products */}
        <div className="card">
          <h3 className="chart-title">🏆 Top Selling Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-muted text-sm">No sales data yet. Start selling!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topProducts.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? '#fef3c7' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: i === 0 ? '#92400e' : '#6b7280' }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.productName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.totalQuantity} units</div>
                    <div style={{ fontSize: 12, color: 'var(--primary)' }}>{fmt(p.totalRevenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="card">
          <h3 className="chart-title">💳 Payment Methods</h3>
          {stats?.paymentMethodStats && Object.keys(stats.paymentMethodStats).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {Object.entries(stats.paymentMethodStats).map(([method, count]) => {
                const icons = { CASH: '💵', CARD: '💳', UPI: '📱' };
                const total = Object.values(stats.paymentMethodStats).reduce((a, b) => a + b, 0);
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={method}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                      <span>{icons[method]} {method}</span>
                      <span style={{ fontWeight: 600 }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: 'var(--border)' }}>
                      <div style={{ height: '100%', borderRadius: 4, background: 'var(--primary)', width: `${pct}%`, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-muted text-sm">No payment data yet.</p>}
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ padding: '0 32px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="chart-title" style={{ marginBottom: 0 }}>🧾 Recent Orders</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('pos')}>+ New Sale</button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-muted text-sm">No orders yet. Create your first sale!</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 12 }}>{o.orderNumber}</td>
                      <td>{o.customerName || 'Walk-in'}</td>
                      <td>{o.items?.length || 0} items</td>
                      <td style={{ fontWeight: 600 }}>{fmt(o.totalAmount)}</td>
                      <td>
                        <span className="badge badge-info">
                          {o.paymentMethod === 'CASH' ? '💵' : o.paymentMethod === 'CARD' ? '💳' : '📱'} {o.paymentMethod}
                        </span>
                      </td>
                      <td><span className={`badge badge-${o.status === 'COMPLETED' ? 'success' : 'warning'}`}>{o.status}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
