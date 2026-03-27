import api from './api';

const authService = {
  // Login User
  login: async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      if (response.data.token) {
        localStorage.setItem('smartcare_token', response.data.token);
        localStorage.setItem('smartcare_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  // Register new User
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('smartcare_token', response.data.token);
        localStorage.setItem('smartcare_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  // Get User Data
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get user' };
    }
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Password change failed' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('smartcare_token');
    localStorage.removeItem('smartcare_user');
  },

  // Validating User Logged In
  isAuthenticated: () => !!localStorage.getItem('smartcare_token'),

  // Getting Stored user
  getStoredUser: () => {
    const user = localStorage.getItem('smartcare_user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
