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
  
  getRecipeById(id) {
    return axios.get(API_URL + `recipes/${id}/`, { headers: authHeader() });
  },
  
  createRecipe(recipe) {
    return axios.post(API_URL + 'recipes/', recipe, { headers: authHeader() });
  },
  
  updateRecipe(id, recipe) {
    return axios.put(API_URL + `recipes/${id}/`, recipe, { headers: authHeader() });
  },
  
  deleteRecipe(id) {
    return axios.delete(API_URL + `recipes/${id}/`, { headers: authHeader() });
  },
  
  uploadImage(id, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    return axios.post(
      API_URL + `recipes/${id}/upload-image/`, 
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
  
  createTag(name) {
    return axios.post(API_URL + 'tags/', { name }, { headers: authHeader() });
  },
  
  createIngredient(name) {
    return axios.post(API_URL + 'ingredients/', { name }, { headers: authHeader() });
  }
};