import { defineStore } from 'pinia';
import recipeService from '../services/recipeService';

export const useRecipeStore = defineStore('recipe', {
  state: () => ({
    recipes: [],
    currentRecipe: null,
    tags: [],
    ingredients: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchAllRecipes(filters = {}) {
      this.loading = true;
      try {
        const response = await recipeService.getAllRecipes(filters);
        this.recipes = response.data;
        this.loading = false;
      } catch (error) {
        this.error = error.message || 'Failed to fetch recipes';
        this.loading = false;
      }
    },
    
    async fetchRecipeById(encodedId) {
      this.loading = true;
      try {
        const response = await recipeService.getRecipeById(encodedId);
        this.currentRecipe = response.data;
        this.loading = false;
      } catch (error) {
        this.error = error.message || 'Failed to fetch recipe details';
        this.loading = false;
      }
    },
    
    async createRecipe(recipe) {
      this.loading = true;
      try {
        const response = await recipeService.createRecipe(recipe);
        this.recipes.push(response.data);
        this.loading = false;
        return response.data;
      } catch (error) {
        this.error = error.message || 'Failed to create recipe';
        this.loading = false;
        throw error;
      }
    },
    
    async updateRecipe(encodedId, recipe) {
      this.loading = true;
      try {
        const response = await recipeService.updateRecipe(encodedId, recipe);
        const index = this.recipes.findIndex(r => r.encoded_id === encodedId);
        if (index !== -1) this.recipes[index] = response.data;
        this.currentRecipe = response.data;
        this.loading = false;
        return response.data;
      } catch (error) {
        this.error = error.message || 'Failed to update recipe';
        this.loading = false;
        throw error;
      }
    },
    
    async deleteRecipe(encodedId) {
      this.loading = true;
      try {
        await recipeService.deleteRecipe(encodedId);
        this.recipes = this.recipes.filter(recipe => recipe.encoded_id !== encodedId);
        this.loading = false;
      } catch (error) {
        this.error = error.message || 'Failed to delete recipe';
        this.loading = false;
        throw error;
      }
    },
    
    async uploadRecipeImage(encodedId, imageFile) {
      this.loading = true;
      try {
        const response = await recipeService.uploadImage(encodedId, imageFile);
        if (this.currentRecipe && this.currentRecipe.encoded_id === encodedId) {
          this.currentRecipe.image = response.data.image;
        }
        const index = this.recipes.findIndex(r => r.encoded_id === encodedId);
        if (index !== -1) this.recipes[index].image = response.data.image;
        this.loading = false;
        return response.data;
      } catch (error) {
        this.error = error.message || 'Failed to upload image';
        this.loading = false;
        throw error;
      }
    },
    
    async fetchAllTags() {
      try {
        const response = await recipeService.getAllTags();
        this.tags = response.data;
      } catch (error) {
        this.error = error.message || 'Failed to fetch tags';
      }
    },
    
    async fetchAllIngredients() {
      try {
        const response = await recipeService.getAllIngredients();
        this.ingredients = response.data;
      } catch (error) {
        this.error = error.message || 'Failed to fetch ingredients';
      }
    },
    
    async createTag(name) {
      try {
        const response = await recipeService.createTag(name);
        this.tags.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message || 'Failed to create tag';
        throw error;
      }
    },
    
    async createIngredient(name) {
      try {
        const response = await recipeService.createIngredient(name);
        this.ingredients.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message || 'Failed to create ingredient';
        throw error;
      }
    }
  }
});