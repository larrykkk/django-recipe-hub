import axios from 'axios';
import authHeader from './authHeader';
import { API_PATHS } from '../config/api.config';

const API_URL = API_PATHS.RECIPE;

export default {
  getAllRecipes(filters = {}) {
    let url = API_URL + 'recipes/';
    if (filters.tags || filters.ingredients) {
      const params = new URLSearchParams();
      if (filters.tags) params.append('tags', filters.tags);
      if (filters.ingredients) params.append('ingredients', filters.ingredients);
      url += '?' + params.toString();
    }
    return axios.get(url, { headers: authHeader() });
  },
  
  getRecipeById(encodedId) {
    return axios.get(API_URL + `recipes/${encodedId}/`, { headers: authHeader() });
  },
  
  createRecipe(recipe) {
    return axios.post(API_URL + 'recipes/', recipe, { headers: authHeader() });
  },
  
  updateRecipe(encodedId, recipe) {
    return axios.put(API_URL + `recipes/${encodedId}/`, recipe, { headers: authHeader() });
  },
  
  deleteRecipe(encodedId) {
    return axios.delete(API_URL + `recipes/${encodedId}/`, { headers: authHeader() });
  },
  
  uploadImage(encodedId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    return axios.post(
      API_URL + `recipes/${encodedId}/upload-image/`, 
      formData, 
      { 
        headers: {
          ...authHeader(),
          'Content-Type': 'multipart/form-data'
        } 
      }
    );
  },
  
  getAllTags() {
    return axios.get(API_URL + 'tags/', { headers: authHeader() });
  },
  
  getAllIngredients() {
    return axios.get(API_URL + 'ingredients/', { headers: authHeader() });
  },
  
  createTag(tag) {
    return axios.post(API_URL + 'tags/', tag, { headers: authHeader() });
  },
  
  createIngredient(ingredient) {
    return axios.post(API_URL + 'ingredients/', ingredient, { headers: authHeader() });
  },

  getUserProfile(userId) {
    return axios.get(API_URL + `users/${userId}/profile/`, { headers: authHeader() });
  },

  getUserRecipes(userId) {
    return axios.get(API_URL + 'recipes/', { 
      headers: authHeader(),
      params: { userId }
    });
  }
};