import { defineStore } from 'pinia';
import commentService from '../services/commentService';

export const useCommentStore = defineStore('comment', {
  state: () => ({
    comments: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchRecipeComments(recipeId) {
      this.loading = true;
      try {
        const response = await commentService.getRecipeComments(recipeId);
        this.comments = response.data;
        this.loading = false;
      } catch (error) {
        this.error = error.message || 'Failed to fetch comments';
        this.loading = false;
      }
    },
    
    async createComment(comment) {
      this.loading = true;
      try {
        const response = await commentService.createComment(comment);
        this.comments.push(response.data);
        this.loading = false;
        return response.data;
      } catch (error) {
        this.error = error.message || 'Failed to create comment';
        this.loading = false;
        throw error;
      }
    },
    
    async updateComment(id, comment) {
      this.loading = true;
      try {
        const response = await commentService.updateComment(id, comment);
        const index = this.comments.findIndex(c => c.id === id);
        if (index !== -1) this.comments[index] = response.data;
        this.loading = false;
        return response.data;
      } catch (error) {
        this.error = error.message || 'Failed to update comment';
        this.loading = false;
        throw error;
      }
    },
    
    async deleteComment(id) {
      this.loading = true;
      try {
        await commentService.deleteComment(id);
        this.comments = this.comments.filter(comment => comment.id !== id);
        this.loading = false;
      } catch (error) {
        this.error = error.message || 'Failed to delete comment';
        this.loading = false;
        throw error;
      }
    }
  }
}); 