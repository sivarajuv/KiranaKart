import React, { useEffect, useState } from 'react';
import { productAPI } from '../services/api';

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || {
    name: '', category: '', price: '', stock: '', unit: 'kg', description: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.price || !form.stock) {
      alert('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await productAPI.update(form.id, form);
      } else {
        await productAPI.create(form);
      }
      onSave();
      onClose();
    } catch (e) {
      alert('Error saving product');
    }
    setSaving(false);
  };

  const CATEGORIES = ['Grains & Staples', 'Pulses & Lentils', 'Oils & Ghee', 'Vegetables', 'Fruits', 'Dairy & Eggs', 'Spices', 'Beverages', 'Snacks', 'Bakery'];
  const UNITS = ['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'packet', '100g', '250g', '200g', 'loaf'];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">{form.id ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
        <div className="form-group">
          <label className="form-label">Product Name *</label>
          <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Basmati Rice" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Unit *</label>
            <select className="form-select" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price (₹) *</label>
            <input className="form-input" type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Stock *</label>
            <input className="form-input" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="0" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-input" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description..." />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving} style={{ flex: 2 }}>
            {saving ? 'Saving...' : (form.id ? 'Save Changes' : 'Add Product')}
          </button>
        </div>
      </div>
    </div>
  );
}

function PriceModal({ product, onClose, onSave }) {
  const [price, setPrice] = useState(product.price);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [saving, setSaving] = useState(false);

  const getAISuggestion = async () => {
    setAiLoading(true);
    try {
      const res = await productAPI.getAIPriceSuggestion(product.id);
      setAiSuggestion(res.data.suggestion);
    } catch { setAiSuggestion('Unable to get AI suggestion. Please check your Claude API key.'); }
    setAiLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await productAPI.updatePrice(product.id, parseFloat(price));
      onSave();
      onClose();
    } catch { alert('Error updating price'); }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">💰 Update Price</h2>
        <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{product.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Current: ₹{product.price} / {product.unit} · Stock: {product.stock}</div>
        </div>
        <div className="form-group">
          <label className="form-label">New Price (₹)</label>
          <input className="form-input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <button className="btn btn-secondary w-full" onClick={getAISuggestion} disabled={aiLoading} style={{ marginBottom: 16 }}>
          {aiLoading ? '🤖 Asking Claude AI...' : '🤖 Get AI Price Suggestion'}
        </button>
        {aiSuggestion && (
          <div className="ai-insight-box">
            <strong>🤖 Claude AI Suggestion:</strong><br />{aiSuggestion}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
            {saving ? 'Saving...' : 'Update Price'}
          </button>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_EMOJI = {
  'Grains & Staples': '🌾', 'Pulses & Lentils': '🫘', 'Oils & Ghee': '🧴',
  'Vegetables': '🥦', 'Fruits': '🍎', 'Dairy & Eggs': '🥛',
  'Spices': '🌶️', 'Beverages': '☕', 'Snacks': '🍪', 'Bakery': '🍞',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categories, setCategories] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [priceProduct, setPriceProduct] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    const [p, c] = await Promise.all([productAPI.getAll(), productAPI.getCategories()]);
    setProducts(p.data);
    setCategories(c.data);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) {
      await productAPI.delete(id);
      load();
    }
  };

  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <p className="page-subtitle">Manage your inventory and pricing</p>
      </div>

      <div className="products-page-layout">
        <div className="products-toolbar">
          <input className="search-input form-input" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
          <select className="form-select" style={{ width: 'auto' }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option>All</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Product</button>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13 }}>{filtered.length} products</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{CATEGORY_EMOJI[p.category] || '🛒'} {p.name}</div>
                    {p.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.description}</div>}
                  </td>
                  <td><span className="badge badge-gray">{p.category}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{fmt(p.price)}</td>
                  <td>{p.unit}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: p.stock < 10 ? 'var(--warning)' : 'var(--text)' }}>{p.stock}</span>
                  </td>
                  <td>
                    {p.stock === 0 ? <span className="badge badge-danger">Out of Stock</span> :
                     p.stock < 10 ? <span className="badge badge-warning">Low Stock</span> :
                     <span className="badge badge-success">In Stock</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setPriceProduct(p)}>💰 Price</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditProduct(p)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(showAdd || editProduct) && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowAdd(false); setEditProduct(null); }}
          onSave={load}
        />
      )}

      {priceProduct && (
        <PriceModal
          product={priceProduct}
          onClose={() => setPriceProduct(null)}
          onSave={load}
        />
      )}
    </div>
  );
}
