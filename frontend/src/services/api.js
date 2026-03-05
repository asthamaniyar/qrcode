import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const qrService = {
  // Create QR code
  createQR: async (data) => {
    const response = await api.post('/qr/create', data);
    return response.data;
  },

  // Get all QR codes
  getAllQRs: async (params = {}) => {
    const response = await api.get('/qr', { params });
    return response.data;
  },

  // Get single QR
  getQR: async (code) => {
    const response = await api.get(`/qr/${code}`);
    return response.data;
  },

  // Update QR
  updateQR: async (code, data) => {
    const response = await api.put(`/qr/${code}`, data);
    return response.data;
  },

  // Delete QR
  deleteQR: async (code) => {
    const response = await api.delete(`/qr/${code}`);
    return response.data;
  },

  // Get analytics
  getAnalytics: async (code) => {
    const response = await api.get(`/qr/${code}/analytics`);
    return response.data;
  },

  // Get overall analytics
  getOverallAnalytics: async () => {
    const response = await api.get('/qr/analytics/overview');
    return response.data;
  }
};

export default api;
