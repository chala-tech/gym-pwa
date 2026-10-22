import axios from 'axios';

// import.meta.env.PROD is a Vite built-in: true during `vite build`, false during `vite dev`.
const BASE_URL = import.meta.env.PROD
  ? 'https://gym-pwa-ua65.onrender.com/api'
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Members
export const getMembers = (query = '') =>
  api.get(`/members${query ? `?q=${encodeURIComponent(query)}` : ''}`);

export const getMember = (id) => api.get(`/members/${id}`);

export const createMember = (data) => api.post('/members', data);

// durationMonths: number of months to renew (1, 2, 3, 6, 12 …)
export const renewMember = (id, durationMonths = 1) =>
  api.patch(`/members/${id}/renew`, { durationMonths });

export const deleteMember = (id) => api.delete(`/members/${id}`);

export default api;
