import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
