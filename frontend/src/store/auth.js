import { defineStore } from 'pinia';
import authService from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')),
    loggedIn: !!localStorage.getItem('user')
  }),
  
  actions: {
    login(email, password) {
      return authService.login(email, password)
        .then(user => {
          this.loggedIn = true;
          this.user = user;
          return Promise.resolve(user);
        })
        .catch(error => {
          this.loggedIn = false;
          this.user = null;
          return Promise.reject(error);
        });
    },
    
    logout() {
      authService.logout();
      this.loggedIn = false;
      this.user = null;
    },
    
    register(user) {
      return authService.register(user)
        .then(response => {
          return Promise.resolve(response.data);
        });
    }
  }
});