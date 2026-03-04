import React, { useState, useRef, useEffect } from 'react';
import { aiAPI, productAPI } from '../services/api';

const QUICK_PROMPTS = [
  { icon: '💰', text: 'Pricing Strategy', sub: 'Get pricing tips for my products', message: 'What pricing strategies should I use for a grocery shop to maximize profit while staying competitive?' },
  { icon: '📦', text: 'Inventory Tips', sub: 'Best practices for stock management', message: 'Give me 5 best practices for inventory management in a small grocery shop.' },
  { icon: '📈', text: 'Boost Sales', sub: 'Ideas to increase revenue', message: 'What are effective ways to increase sales in a grocery shop?' },
  { icon: '🛒', text: 'Customer Retention', sub: 'Keep customers coming back', message: 'How can I improve customer loyalty and retention for my grocery store?' },
  { icon: '🌿', text: 'Fresh Produce', sub: 'Reduce wastage tips', message: 'How can I reduce wastage of fresh vegetables and fruits in my grocery shop?' },
  { icon: '📱', text: 'Digital Payments', sub: 'UPI & card payment tips', message: 'What are the benefits of accepting UPI and digital payments in a grocery shop?' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI business assistant powered by Claude. I can help you with pricing strategies, inventory management, sales analysis, and growing your grocery shop. What would you like to discuss?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await aiAPI.chat(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Unable to connect to Claude AI. Please check your API key in application.properties.' }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🤖 AI Assistant</h1>
        <p className="page-subtitle">Powered by Claude — Ask anything about your grocery business</p>
      </div>

      <div className="ai-layout">
        {/* Chat */}
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.role}`}>
                <div className="chat-avatar">{m.role === 'user' ? '👤' : '🤖'}</div>
                <div className="chat-bubble">
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div className="chat-avatar">🤖</div>
                <div className="chat-bubble">
                  <div className="loading-dots"><span/><span/><span/></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              className="chat-input"
              placeholder="Ask about pricing, inventory, sales strategies..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              rows={2}
            />
            <button className="btn btn-primary" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
              Send
            </button>
          </div>
        </div>

        {/* Quick Prompts */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>💡 Quick Questions</h3>
            <div className="quick-prompts">
              {QUICK_PROMPTS.map((p, i) => (
                <button key={i} className="quick-prompt-btn" onClick={() => sendMessage(p.message)}>
                  <span className="quick-prompt-icon">{p.icon}</span>
                  <div className="quick-prompt-text">{p.text}</div>
                  <div className="quick-prompt-sub">{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #0f2419 0%, #1a4a2a 100%)', border: 'none' }}>
            <div style={{ color: '#a8c5b5', fontSize: 12, lineHeight: 1.7 }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: 8, fontSize: 14 }}>🔑 Setup Required</strong>
              To use AI features, add your Claude API key in:<br />
              <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>
                backend/src/main/resources/application.properties
              </code><br /><br />
              Set <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>claude.api.key=YOUR_KEY</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
