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
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
      });
  },
  logout() {
    localStorage.removeItem('user');
  },
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
};