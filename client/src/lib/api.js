import axios from 'axios';

// import.meta.env.PROD is a Vite built-in: true during `vite build`, false during `vite dev`.
// This means NO environment variables need to be set anywhere — Vite bakes the correct
// URL into the bundle at build time automatically.
const BASE_URL = import.meta.env.PROD
  ? 'https://gym-pwa-ua65.onrender.com/api'  // production → Render backend
  : '/api';                                    // local dev  → Vite proxy → localhost:5000

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Members
export const getMembers = (query = '') =>
  api.get(`/members${query ? `?q=${encodeURIComponent(query)}` : ''}`);

export const getMember = (id) => api.get(`/members/${id}`);

export const createMember = (data) => api.post('/members', data);

export const renewMember = (id) => api.patch(`/members/${id}/renew`);

export const deleteMember = (id) => api.delete(`/members/${id}`);

// Check-ins
export const checkIn = (memberId) => api.post('/checkins', { memberId });

export const getCheckIns = (memberId, limit = 10) =>
  api.get(`/checkins?memberId=${memberId}&limit=${limit}`);

export default api;
