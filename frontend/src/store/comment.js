import { defineStore } from 'pinia';
import commentService from '../services/commentService';
import { useAuthStore } from './auth';

export const useCommentStore = defineStore('comment', {
  state: () => ({
    comments: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchRecipeComments(recipeEncodedId) {
      this.loading = true;
      try {
        const response = await commentService.getRecipeComments(recipeEncodedId);
        
        // Get current user to identify own comments
        const authStore = useAuthStore();
        const currentUser = authStore.user;
        
        // Process comments to add user info for display
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
        
        // Add the comment to the list
        this.comments.push(response.data);
        this.loading = false;
        return response.data;
      } catch (error) {
        this.error = error.message || 'Failed to create comment';
        this.loading = false;
        throw error;
      }
    },
    
    async updateComment(encodedId, comment) {
      this.loading = true;
      try {
        const response = await commentService.updateComment(encodedId, comment);
        const index = this.comments.findIndex(c => c.encoded_id === encodedId);
        
        if (index !== -1) {
          // Update the comment while preserving the user information
          this.comments[index] = {
            ...this.comments[index],
            ...response.data
          };
        }
        
        this.loading = false;
        return response.data;
      } catch (error) {
        this.error = error.message || 'Failed to update comment';
        this.loading = false;
        throw error;
      }
    },
    
    async deleteComment(encodedId) {
      this.loading = true;
      try {
        await commentService.deleteComment(encodedId);
        this.comments = this.comments.filter(comment => comment.encoded_id !== encodedId);
        this.loading = false;
      } catch (error) {
        this.error = error.message || 'Failed to delete comment';
        this.loading = false;
        throw error;
      }
    }
  }
}); 