import { defineStore } from 'pinia';
import authService from '../services/authService';

// Action wrapper for handling loading and error states
const withAsync = async (store, action) => {
  store.error = null;
  store.loading = true;
  try {
    const result = await action();
    return result;
  } catch (error) {
    store.error = error.message || 'An error occurred';
    throw error;
  } finally {
    store.loading = false;
  }
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')),
    loggedIn: !!localStorage.getItem('user'),
    loading: false,
    error: null
  }),
  
  actions: {
    resetState() {
      this.user = null;
      this.loggedIn = false;
      this.loading = false;
      this.error = null;
    },

    async login(email, password) {
      return withAsync(this, async () => {
        const user = await authService.login(email, password);
        this.loggedIn = true;
        this.user = user;
        return user;
      });
    },
    
    logout() {
      authService.logout();
      this.resetState();
    },
    
    async register(user) {
      return withAsync(this, async () => {
        const response = await authService.register(user);
        return response.data;
      });
    },
    
    async updateUserProfile(userData) {
      return withAsync(this, async () => {
        const response = await authService.updateUser(userData);
        if (this.user) {
          this.user = { ...this.user, ...userData };
          localStorage.setItem('user', JSON.stringify(this.user));
        }
        return response.data;
      });
    }
  }
});