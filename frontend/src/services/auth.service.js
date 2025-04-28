import api from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        const userData = {
          ...response.data.user,
          channelId: response.data.user.channelId || null // Ensure channelId is explicitly set
        };
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        return { token: response.data.token, user: userData };
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  async signup(userData) {
    try {
      const response = await api.post('/auth/signup', userData);
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        const userData = {
          ...response.data.user,
          channelId: response.data.user.channelId || null // Ensure channelId is explicitly set
        };
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        return { token: response.data.token, user: userData };
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Signup error:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  }
};
