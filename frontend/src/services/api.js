import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_BASE });

// Products
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (cat) => api.get(`/products/category/${cat}`),
  search: (q) => api.get(`/products/search?q=${q}`),
  getCategories: () => api.get('/products/categories'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  updatePrice: (id, price) => api.patch(`/products/${id}/price`, { price }),
  updateStock: (id, stock) => api.patch(`/products/${id}/stock`, { stock }),
  delete: (id) => api.delete(`/products/${id}`),
  getAIPriceSuggestion: (id) => api.get(`/products/${id}/ai-price-suggestion`),
};

// Orders
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getToday: () => api.get('/orders/today'),
  getById: (id) => api.get(`/orders/${id}`),
  getDashboardStats: () => api.get('/orders/dashboard/stats'),
  getTopProducts: () => api.get('/orders/reports/top-products'),
  getSalesByCategory: () => api.get('/orders/reports/by-category'),
  getDailyRevenue: () => api.get('/orders/reports/daily-revenue'),
  getAIInsights: () => api.get('/orders/reports/ai-insights'),
};

// AI Chat
export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
};

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Users (Admin only)
export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;
