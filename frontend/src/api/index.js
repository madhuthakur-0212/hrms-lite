import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

export const employeeApi = {
  getAll: () => api.get('/employees'),
  create: (data) => api.post('/employees', data),
  delete: (id) => api.delete(`/employees/${id}`),
  getStats: () => api.get('/employees/stats'),
};

export const attendanceApi = {
  mark: (data) => api.post('/attendance', data),
  getByEmployee: (id, date) =>
    api.get(`/attendance/employee/${id}`, { params: date ? { date } : {} }),
  getAll: (date) =>
    api.get('/attendance', { params: date ? { date } : {} }),
  getSummary: () => api.get('/attendance/summary'),
};

export default api;
