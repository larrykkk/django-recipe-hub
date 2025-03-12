import axios from 'axios';
import { API_PATHS } from '../config/api.config';

const API_URL = API_PATHS.USER;

export default {
  register(user) {
    return axios.post(API_URL + 'create/', user);
  },
  login(email, password) {
    return axios.post(API_URL + 'token/', { email, password })
      .then(response => {
        if (response.data.token) {
          // Store token temporarily
          const userData = { token: response.data.token };
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Fetch user details
          return this.fetchUserDetails(userData.token)
            .then(userDetails => {
              // Combine token with user details
              const completeUserData = {
                ...userDetails,
                token: userData.token
              };
              
              // Update localStorage with complete user data
              localStorage.setItem('user', JSON.stringify(completeUserData));
              return completeUserData;
            });
        }
        return response.data;
      });
  },
  fetchUserDetails(token) {
    return axios.get(API_URL + 'me/', {
      headers: { 'Authorization': 'Token ' + token }
    })
    .then(response => response.data);
  },
  logout() {
    localStorage.removeItem('user');
  },
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  },
  updateUser(userData) {
    const user = this.getCurrentUser();
    if (!user || !user.token) {
      return Promise.reject('User not authenticated');
    }
    
    return axios.patch(API_URL + 'me/', userData, {
      headers: { 'Authorization': 'Token ' + user.token }
    });
  }
};