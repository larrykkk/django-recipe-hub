import { defineStore } from 'pinia';
import recipeService from '../services/recipeService';

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

export const useRecipeStore = defineStore('recipe', {
  state: () => ({
    recipes: [],
    currentRecipe: null,
    tags: [],
    ingredients: [],
    loading: false,
    error: null,
    currentUser: null
  }),
  
  actions: {
    resetState() {
      this.recipes = [];
      this.currentRecipe = null;
      this.tags = [];
      this.ingredients = [];
      this.loading = false;
      this.error = null;
      this.currentUser = null;
    },

    async fetchAllRecipes(filters = {}) {
      return withAsync(this, async () => {
        const response = await recipeService.getAllRecipes(filters);
        this.recipes = response.data;
        return response.data;
      });
    },
    
    async fetchRecipeById(encodedId) {
      return withAsync(this, async () => {
        const response = await recipeService.getRecipeById(encodedId);
        this.currentRecipe = response.data;
        return response.data;
      });
    },
    
    async createRecipe(recipe) {
      return withAsync(this, async () => {
        const response = await recipeService.createRecipe(recipe);
        this.recipes.push(response.data);
        return response.data;
      });
    },
    
    async updateRecipe(encodedId, recipe) {
      return withAsync(this, async () => {
        const response = await recipeService.updateRecipe(encodedId, recipe);
        const index = this.recipes.findIndex(r => r.encoded_id === encodedId);
        if (index !== -1) this.recipes[index] = response.data;
        this.currentRecipe = response.data;
        return response.data;
      });
    },
    
    async deleteRecipe(encodedId) {
      return withAsync(this, async () => {
        await recipeService.deleteRecipe(encodedId);
        this.recipes = this.recipes.filter(recipe => recipe.encoded_id !== encodedId);
      });
    },
    
    async uploadRecipeImage(encodedId, imageFile) {
      return withAsync(this, async () => {
        const response = await recipeService.uploadImage(encodedId, imageFile);
        if (this.currentRecipe && this.currentRecipe.encoded_id === encodedId) {
          this.currentRecipe.image = response.data.image;
        }
        const index = this.recipes.findIndex(r => r.encoded_id === encodedId);
        if (index !== -1) this.recipes[index].image = response.data.image;
        return response.data;
      });
    },
    
    async fetchAllTags() {
      return withAsync(this, async () => {
        const response = await recipeService.getAllTags();
        this.tags = response.data;
        return response.data;
      });
    },
    
    async fetchAllIngredients() {
      return withAsync(this, async () => {
        const response = await recipeService.getAllIngredients();
        this.ingredients = response.data;
        return response.data;
      });
    },
    
    async createTag(name) {
      return withAsync(this, async () => {
        const response = await recipeService.createTag(name);
        this.tags.push(response.data);
        return response.data;
      });
    },
    
    async createIngredient(name) {
      return withAsync(this, async () => {
        const response = await recipeService.createIngredient(name);
        this.ingredients.push(response.data);
        return response.data;
      });
    },

    async fetchUserProfile(userId) {
      return withAsync(this, async () => {
        const response = await recipeService.getUserProfile(userId);
        this.currentUser = response.data;
        return response.data;
      });
    },

    async fetchUserRecipes(userId) {
      return withAsync(this, async () => {
        const response = await recipeService.getUserRecipes(userId);
        this.recipes = response.data;
        return response.data;
      });
    }
  }
});