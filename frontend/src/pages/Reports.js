import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { orderAPI } from '../services/api';

const COLORS = ['#1a7a4a', '#22a05e', '#f4a823', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [aiInsights, setAiInsights] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, tp, cs, dr, o] = await Promise.all([
          orderAPI.getDashboardStats(),
          orderAPI.getTopProducts(),
          orderAPI.getSalesByCategory(),
          orderAPI.getDailyRevenue(),
          orderAPI.getAll(),
        ]);
        setStats(s.data);
        setTopProducts(tp.data);
        setCategoryStats(cs.data);
        setDailyRevenue(dr.data);
        setOrders(o.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const getAIInsights = async () => {
    setAiLoading(true);
    try {
      const res = await orderAPI.getAIInsights();
      setAiInsights(res.data.insights);
    } catch { setAiInsights('Unable to fetch AI insights. Please check your Claude API key.'); }
    setAiLoading(false);
  };

  const paymentData = stats?.paymentMethodStats ? Object.entries(stats.paymentMethodStats).map(([name, value]) => ({ name, value })) : [];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="loading-dots"><span/><span/><span/></div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">Insights on your shop performance</p>
          </div>
          <button className="btn btn-primary" onClick={getAIInsights} disabled={aiLoading}>
            {aiLoading ? '🤖 Analyzing...' : '🤖 Get AI Insights'}
          </button>
        </div>
      </div>

      {aiInsights && (
        <div style={{ padding: '0 32px 20px' }}>
          <div className="ai-insight-box" style={{ fontSize: 14, lineHeight: 1.8 }}>
            <strong style={{ display: 'block', marginBottom: 8, fontSize: 15 }}>🤖 Claude AI Business Insights</strong>
            {aiInsights}
          </div>
        </div>
      )}

      <div className="reports-layout">
        {/* Stats Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: '📦' },
            { label: 'Total Revenue', value: fmt(stats?.totalRevenue ?? 0), icon: '💰' },
            { label: 'Today Orders', value: stats?.todayOrders ?? 0, icon: '📅' },
            { label: 'Today Revenue', value: fmt(stats?.todayRevenue ?? 0), icon: '💵' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="reports-grid">
          {/* Daily Revenue */}
          <div className="chart-card" style={{ gridColumn: 'span 2' }}>
            <h3 className="chart-title">📈 Daily Revenue Trend</h3>
            {dailyRevenue.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No revenue data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={v => fmt(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Products */}
          <div className="chart-card">
            <h3 className="chart-title">🏆 Top Selling Products</h3>
            {topProducts.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No sales data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topProducts.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="productName" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="totalQuantity" fill="var(--primary)" radius={[0, 4, 4, 0]} name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Sales by Category */}
          <div className="chart-card">
            <h3 className="chart-title">🍎 Revenue by Category</h3>
            {categoryStats.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryStats} dataKey="totalRevenue" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) => `${category?.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {categoryStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Payment Methods */}
          <div className="chart-card">
            <h3 className="chart-title">💳 Payment Methods</h3>
            {paymentData.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Products Table */}
        <div className="chart-card">
          <h3 className="chart-title">📊 Detailed Sales Report</h3>
          {topProducts.length === 0 ? (
            <p className="text-muted text-sm">No sales yet. Start selling from the POS!</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => {
                    const totalRev = topProducts.reduce((s, x) => s + Number(x.totalRevenue), 0);
                    const pct = totalRev ? ((Number(p.totalRevenue) / totalRev) * 100).toFixed(1) : 0;
                    return (
                      <tr key={i}>
                        <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{p.productName}</td>
                        <td><span className="badge badge-gray">{p.category}</span></td>
                        <td style={{ fontWeight: 600 }}>{p.totalQuantity}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{fmt(p.totalRevenue)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--border)' }}>
                              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: 'var(--primary)' }} />
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
