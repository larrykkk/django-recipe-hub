<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCommentStore } from '../store/comment';
import { useAuthStore } from '../store/auth';
import { formatDistanceToNow } from 'date-fns';

const props = defineProps({
  recipeId: {
    type: String,
    required: true
  }
});

const commentStore = useCommentStore();
const authStore = useAuthStore();

const comments = computed(() => commentStore.comments);
const loading = computed(() => commentStore.loading);
const error = computed(() => commentStore.error);
const currentUser = computed(() => authStore.user);
const isLoggedIn = computed(() => authStore.loggedIn);

const newComment = ref('');
const editingCommentId = ref(null);
const editContent = ref('');
const confirmDeleteId = ref(null);

onMounted(async () => {
  await commentStore.fetchRecipeComments(props.recipeId);
});

const handleSubmitComment = async () => {
  if (!newComment.value.trim()) return;
  
  try {
    await commentStore.createComment({
      content: newComment.value,
      recipe: props.recipeId
    });
    newComment.value = '';
  } catch (err) {
    // Error is already handled in the store
  }
};

const startEditing = (comment) => {
  editingCommentId.value = comment.encoded_id;
  editContent.value = comment.content;
};

const cancelEditing = () => {
  editingCommentId.value = null;
  editContent.value = '';
};

const saveEdit = async (commentId) => {
  if (!editContent.value.trim()) return;
  
  try {
    await commentStore.updateComment(commentId, {
      content: editContent.value,
      recipe: props.recipeId
    });
    editingCommentId.value = null;
    editContent.value = '';
  } catch (err) {
    // Error is already handled in the store
  }
};

const confirmDelete = (commentId) => {
  confirmDeleteId.value = commentId;
  
  // Auto-reset after 3 seconds
  setTimeout(() => {
    if (confirmDeleteId.value === commentId) {
      confirmDeleteId.value = null;
    }
  }, 3000);
};

const handleDelete = async (commentId) => {
  if (confirmDeleteId.value === commentId) {
    try {
      await commentStore.deleteComment(commentId);
      confirmDeleteId.value = null;
    } catch (err) {
      // Error is already handled in the store
    }
  } else {
    confirmDelete(commentId);
  }
};

const formatTime = (dateString) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return 'unknown time';
  }
};

const canManageComment = (comment) => {
  if (!currentUser.value || !comment.user) return false;
  
  // Get the current user ID
  const currentUserId = currentUser.value.id;
  
  // Get the comment user ID
  const commentUserId = typeof comment.user === 'object' ? comment.user.id : comment.user;
  
  // Compare the IDs
  return currentUserId === commentUserId;
};
</script>

<template>
  <div class="comments-section">
    <h3 class="comments-title">Comments</h3>
    
    <div v-if="loading && comments.length === 0" class="loading-comments">
      <p>Loading comments...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>Failed to load comments. Please try again.</p>
    </div>
    
    <div v-else>
      <!-- Comment Form -->
      <div v-if="isLoggedIn" class="comment-form">
        <textarea 
          v-model="newComment" 
          placeholder="Share your thoughts about this recipe..." 
          maxlength="500"
          class="comment-input"
        ></textarea>
        <div class="comment-form-footer">
          <span class="char-count">{{ newComment.length }}/500</span>
          <button 
            @click="handleSubmitComment" 
            class="btn btn-primary"
            :disabled="!newComment.trim()"
          >
            Post Comment
          </button>
        </div>
      </div>
      
      <div v-else class="login-prompt">
        <p>Please <router-link to="/login">login</router-link> to leave a comment.</p>
      </div>
      
      <!-- Comments List -->
      <div class="comments-list">
        <div v-if="comments.length === 0" class="no-comments">
          <p>Be the first to comment on this recipe!</p>
        </div>
        
        <div 
          v-for="comment in comments" 
          :key="comment.encoded_id" 
          class="comment-item"
          :class="{ 'own-comment': canManageComment(comment) }"
        >
          <div class="comment-header">
            <div class="comment-user">
              <span class="username">
                {{ comment.user.email || 'User' }}
                <span v-if="canManageComment(comment)" class="user-badge">(You)</span>
              </span>
              <span class="comment-time">{{ formatTime(comment.updated_on) }}</span>
            </div>
            
            <div v-if="canManageComment(comment)" class="comment-actions">
              <button 
                v-if="editingCommentId !== comment.encoded_id"
                @click="startEditing(comment)" 
                class="action-btn edit-btn"
              >
                Edit
              </button>
              
              <button 
                v-if="editingCommentId !== comment.encoded_id"
                @click="handleDelete(comment.encoded_id)" 
                class="action-btn delete-btn"
                :class="{ 'confirm-delete': confirmDeleteId === comment.encoded_id }"
              >
                {{ confirmDeleteId === comment.encoded_id ? 'Confirm Delete' : 'Delete' }}
              </button>
            </div>
          </div>
          
          <div v-if="editingCommentId === comment.encoded_id" class="edit-comment-form">
            <textarea 
              v-model="editContent" 
              class="comment-input"
              maxlength="500"
            ></textarea>
            <div class="edit-actions">
              <button @click="cancelEditing" class="btn btn-secondary">Cancel</button>
              <button 
                @click="saveEdit(comment.encoded_id)" 
                class="btn btn-primary"
                :disabled="!editContent.trim()"
              >
                Save
              </button>
            </div>
          </div>
          
          <div v-else class="comment-content">
            {{ comment.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comments-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.comments-title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #333;
}

.loading-comments, .error-message, .no-comments {
  text-align: center;
  margin: 2rem 0;
  color: #666;
}

.comment-form {
  margin-bottom: 2rem;
}

.comment-input {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.comment-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  color: #666;
  font-size: 0.9rem;
}

.login-prompt {
  text-align: center;
  margin: 2rem 0;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.comments-list {
  margin-top: 2rem;
}

.comment-item {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 1rem;
  background-color: #fff;
}

.own-comment {
  border-left: 3px solid #4CAF50;
  background-color: #f9fff9;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-user {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: bold;
  color: #333;
}

.user-badge {
  font-size: 0.8rem;
  color: #4CAF50;
  margin-left: 0.5rem;
  font-weight: normal;
}

.comment-time {
  font-size: 0.8rem;
  color: #888;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.edit-btn {
  color: #2196F3;
}

.edit-btn:hover {
  background-color: rgba(33, 150, 243, 0.1);
}

.delete-btn {
  color: #f44336;
}

.delete-btn:hover {
  background-color: rgba(244, 67, 54, 0.1);
}

.confirm-delete {
  background-color: #f44336;
  color: white;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

.comment-content {
  white-space: pre-wrap;
  line-height: 1.5;
}

.edit-comment-form {
  margin-top: 0.5rem;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-secondary {
  background-color: #f1f1f1;
  color: #333;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary:hover {
  background-color: #e1e1e1;
}

.btn:disabled {
  background-color: #cccccc;
  color: #666;
  cursor: not-allowed;
}
</style> 