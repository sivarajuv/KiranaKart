import React, { useEffect, useState } from 'react';
import { productAPI, orderAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const CATEGORY_EMOJI = {
  'Grains & Staples': '🌾', 'Pulses & Lentils': '🫘', 'Oils & Ghee': '🧴',
  'Vegetables': '🥦', 'Fruits': '🍎', 'Dairy & Eggs': '🥛',
  'Spices': '🌶️', 'Beverages': '☕', 'Snacks': '🍪', 'Bakery': '🍞',
};

function getEmoji(category, name) {
  return CATEGORY_EMOJI[category] || '🛒';
}

function PaymentModal({ total, onClose, onSuccess }) {
  const [method, setMethod] = useState('CASH');
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [upiTxn, setUpiTxn] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [cardType, setCardType] = useState('VISA');
  const [loading, setLoading] = useState(false);
  const { items, dispatch } = useCart();

  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const handlePay = async () => {
    if (method === 'UPI' && !upiTxn.trim()) {
      alert('Please enter UPI Transaction ID');
      return;
    }
    if (method === 'CARD' && cardLast4.length !== 4) {
      alert('Please enter last 4 digits of card');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        customerName: customer.name || 'Walk-in Customer',
        customerPhone: customer.phone,
        paymentMethod: method,
        upiTransactionId: method === 'UPI' ? upiTxn : null,
        cardLast4: method === 'CARD' ? cardLast4 : null,
        cardType: method === 'CARD' ? cardType : null,
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      };
      const res = await orderAPI.create(payload);
      dispatch({ type: 'CLEAR' });
      onSuccess(res.data);
    } catch (e) {
      alert(e.response?.data?.error || 'Payment failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">💳 Complete Payment</h2>

        <div className="payment-summary">
          <div className="payment-summary-row"><span>Items</span><span>{items.reduce((s, i) => s + i.quantity, 0)}</span></div>
          <div className="payment-summary-row total"><span>Total Amount</span><span>{fmt(total)}</span></div>
        </div>

        <div className="form-group">
          <label className="form-label">Customer Name (optional)</label>
          <input className="form-input" placeholder="Walk-in Customer" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
        </div>

        <div className="form-group">
          <label className="form-label">Phone (optional)</label>
          <input className="form-input" placeholder="Phone number" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
        </div>

        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <div className="payment-methods">
            {[
              { id: 'CASH', icon: '💵', label: 'Cash' },
              { id: 'CARD', icon: '💳', label: 'Card' },
              { id: 'UPI', icon: '📱', label: 'UPI' },
            ].map(m => (
              <div
                key={m.id}
                className={`payment-method-btn ${method === m.id ? 'selected' : ''}`}
                onClick={() => setMethod(m.id)}
              >
                <div className="payment-method-icon">{m.icon}</div>
                <div className="payment-method-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {method === 'UPI' && (
          <div className="form-group">
            <label className="form-label">UPI Transaction ID</label>
            <input className="form-input" placeholder="Enter UPI transaction ID" value={upiTxn} onChange={e => setUpiTxn(e.target.value)} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Accepted: PhonePe, GPay, Paytm, BHIM UPI
            </div>
          </div>
        )}

        {method === 'CARD' && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Card Type</label>
              <select className="form-select" value={cardType} onChange={e => setCardType(e.target.value)}>
                <option>VISA</option>
                <option>MASTERCARD</option>
                <option>RUPAY</option>
                <option>AMEX</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Last 4 Digits</label>
              <input className="form-input" placeholder="XXXX" maxLength={4} value={cardLast4} onChange={e => setCardLast4(e.target.value.replace(/\D/,''))} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn btn-primary btn-lg" onClick={handlePay} disabled={loading} style={{ flex: 2 }}>
            {loading ? 'Processing...' : `Pay ${fmt(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ order, onClose }) {
  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="success-screen">
          <div className="success-icon">✅</div>
          <div className="success-title">Payment Successful!</div>
          <div className="success-order">Order #{order.orderNumber}</div>
          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Customer:</span><strong>{order.customerName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Payment:</span><strong>{order.paymentMethod}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: 'var(--primary)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <span>Total:</span><span>{fmt(order.totalAmount)}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-lg w-full" onClick={onClose}>New Transaction</button>
        </div>
      </div>
    </div>
  );
}

export default function POS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const { items, total, count, dispatch } = useCart();

  const fmt = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  useEffect(() => {
    productAPI.getAll().then(r => setProducts(r.data));
    productAPI.getCategories().then(r => setCategories(r.data));
  }, []);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    dispatch({ type: 'ADD_ITEM', product });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Point of Sale</h1>
        <p className="page-subtitle">Select products and process payments</p>
      </div>

      <div className="pos-layout">
        {/* Products Panel */}
        <div className="products-grid">
          <div className="products-search-bar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="category-tabs">
              <button className={`cat-tab ${activeCategory === 'All' ? 'active' : ''}`} onClick={() => setActiveCategory('All')}>All</button>
              {categories.map(c => (
                <button key={c} className={`cat-tab ${activeCategory === c ? 'active' : ''}`} onClick={() => setActiveCategory(c)}>
                  {CATEGORY_EMOJI[c] || '🛒'} {c}
                </button>
              ))}
            </div>
          </div>

          <div className="product-cards">
            {filtered.map(p => (
              <div
                key={p.id}
                className={`product-card ${p.stock <= 0 ? 'out-of-stock' : ''}`}
                onClick={() => addToCart(p)}
                title={p.stock <= 0 ? 'Out of stock' : `Add ${p.name} to cart`}
              >
                <div className="product-emoji">{getEmoji(p.category, p.name)}</div>
                <div className="product-card-name">{p.name}</div>
                <div className="product-card-price">{fmt(p.price)}</div>
                <div className="product-card-unit">per {p.unit}</div>
                <div className="product-card-stock">{p.stock > 0 ? `${p.stock} in stock` : '❌ Out of stock'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Panel */}
        <div className="cart-panel">
          <div className="cart-header">
            <span className="cart-title">🛒 Cart</span>
            <span className="cart-count">{count} items</span>
          </div>

          <div className="cart-items">
            {items.length === 0 ? (
              <div className="cart-empty">
                <span style={{ fontSize: 48 }}>🛒</span>
                <span>Cart is empty</span>
                <span style={{ fontSize: 12 }}>Click on a product to add</span>
              </div>
            ) : items.map(item => (
              <div key={item.product.id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="cart-item-price">{fmt(item.product.price)} / {item.product.unit}</div>
                </div>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => dispatch({ type: 'UPDATE_QTY', productId: item.product.id, quantity: item.quantity - 1 })}>−</button>
                  <span className="qty-num">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => dispatch({ type: 'UPDATE_QTY', productId: item.product.id, quantity: item.quantity + 1 })}>+</button>
                </div>
                <div className="cart-item-subtotal">{fmt(item.product.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-value">{fmt(total)}</span>
            </div>
            {items.length > 0 && (
              <button className="btn btn-secondary btn-sm" style={{ marginBottom: 10, width: '100%' }} onClick={() => dispatch({ type: 'CLEAR' })}>
                🗑️ Clear Cart
              </button>
            )}
            <button
              className="btn btn-primary btn-lg w-full"
              disabled={items.length === 0}
              onClick={() => setShowPayment(true)}
            >
              💳 Proceed to Payment
            </button>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          total={total}
          onClose={() => setShowPayment(false)}
          onSuccess={(order) => {
            setShowPayment(false);
            setSuccessOrder(order);
          }}
        />
      )}

      {successOrder && (
        <SuccessModal
          order={successOrder}
          onClose={() => setSuccessOrder(null)}
        />
      )}
    </div>
  );
}
