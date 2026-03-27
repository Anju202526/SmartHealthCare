import api from './api';

const adminService = {
  // Users
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUser: async (userId, data) => {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  deactivateUser: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  // Appointments (admin view)
  getAllAppointments: async (filters = {}) => {
    const response = await api.get('/appointments', { params: filters });
    return response.data;
  },

  // System stats
  getSystemStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

export default adminService;
