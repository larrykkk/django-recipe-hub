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
    },
    
    updateUserProfile(userData) {
      return authService.updateUser(userData)
        .then(response => {
          // Update the user in the store with new data
          if (this.user) {
            // Update user data in store
            this.user = { ...this.user, ...userData };
            
            // Update localStorage
            localStorage.setItem('user', JSON.stringify(this.user));
          }
          return Promise.resolve(response.data);
        });
    }
  }
});