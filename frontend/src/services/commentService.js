import axios from 'axios';
import authHeader from './authHeader';
import { API_PATHS } from '../config/api.config';

const API_URL = API_PATHS.RECIPE;

export default {
  // Get all comments for a recipe
  getRecipeComments(recipeEncodedId) {
    return axios.get(API_URL + 'comments/?recipe=' + recipeEncodedId, { headers: authHeader() });
  },
  
  // Create a new comment
  createComment(comment) {
    return axios.post(API_URL + 'comments/', comment, { headers: authHeader() });
  },
  
  // Update a comment
  updateComment(encodedId, comment) {
    return axios.put(API_URL + `comments/${encodedId}/`, comment, { headers: authHeader() });
  },
  
  // Delete a comment
  deleteComment(encodedId) {
    return axios.delete(API_URL + `comments/${encodedId}/`, { headers: authHeader() });
  }
}; 