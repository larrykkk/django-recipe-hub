import { defineStore } from 'pinia';
import commentService from '../services/commentService';
import { useAuthStore } from './auth';

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

export const useCommentStore = defineStore('comment', {
  state: () => ({
    comments: [],
    loading: false,
    error: null
  }),
  
  actions: {
    resetState() {
      this.comments = [];
      this.loading = false;
      this.error = null;
    },

    async fetchRecipeComments(recipeEncodedId) {
      return withAsync(this, async () => {
        const response = await commentService.getRecipeComments(recipeEncodedId);
        const authStore = useAuthStore();
        const currentUser = authStore.user;
        this.comments = response.data;
        return response.data;
      });
    },
    
    async createComment(comment) {
      return withAsync(this, async () => {
        const response = await commentService.createComment(comment);
        this.comments.push(response.data);
        return response.data;
      });
    },
    
    async updateComment(encodedId, comment) {
      return withAsync(this, async () => {
        const response = await commentService.updateComment(encodedId, comment);
        const index = this.comments.findIndex(c => c.encoded_id === encodedId);
        
        if (index !== -1) {
          this.comments[index] = {
            ...this.comments[index],
            ...response.data
          };
        }
        
        return response.data;
      });
    },
    
    async deleteComment(encodedId) {
      return withAsync(this, async () => {
        await commentService.deleteComment(encodedId);
        this.comments = this.comments.filter(comment => comment.encoded_id !== encodedId);
      });
    }
  }
}); 