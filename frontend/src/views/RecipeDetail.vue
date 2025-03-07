<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipeStore } from '../store/recipe';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();

const recipeId = computed(() => route.params.id);
const recipe = computed(() => recipeStore.currentRecipe);
const loading = computed(() => recipeStore.loading);
const error = computed(() => recipeStore.error);

const confirmDelete = ref(false);
const imageFile = ref(null);
const uploadLoading = ref(false);
const uploadError = ref('');

onMounted(async () => {
  await recipeStore.fetchRecipeById(recipeId.value);
});

const handleEdit = () => {
  router.push(`/recipes/${recipeId.value}/edit`);
};

const handleDelete = async () => {
  if (confirmDelete.value) {
    try {
      await recipeStore.deleteRecipe(recipeId.value);
      router.push('/recipes');
    } catch (err) {
      // Error is already handled in the store
    }
  } else {
    confirmDelete.value = true;
    setTimeout(() => {
      confirmDelete.value = false;
    }, 3000);
  }
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    imageFile.value = file;
  }
};

const uploadImage = async () => {
  if (!imageFile.value) return;

  uploadLoading.value = true;
  uploadError.value = '';
  
  try {
    await recipeStore.uploadRecipeImage(recipeId.value, imageFile.value);
    imageFile.value = null;
  } catch (err) {
    uploadError.value = 'Failed to upload image. Please try again.';
  } finally {
    uploadLoading.value = false;
  }
};
</script>

<template>
  <div class="recipe-detail-container">
    <div v-if="loading" class="loading">
      <p>Loading recipe...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>Failed to load recipe. Please try again.</p>
      <button @click="router.push('/recipes')" class="btn btn-secondary">
        Back to Recipes
      </button>
    </div>
    
    <div v-else-if="recipe" class="recipe-detail">
      <div class="recipe-header">
        <div class="recipe-title">
          <h1>{{ recipe.title }}</h1>
        </div>
        
        <div class="recipe-actions">
          <button @click="handleEdit" class="btn btn-primary">Edit</button>
          <button 
            @click="handleDelete" 
            class="btn btn-danger"
            :class="{ 'confirm-delete': confirmDelete }"
          >
            {{ confirmDelete ? 'Confirm Delete' : 'Delete' }}
          </button>
        </div>
      </div>
      
      <div class="recipe-content">
        <div class="recipe-image-container">
          <img 
            v-if="recipe.link" 
            :src="recipe.link" 
            alt="Recipe image" 
            class="recipe-image"
          />
          <div v-else class="no-image">No image available</div>
          
          <div class="image-upload">
            <input 
              type="file" 
              id="recipe-image" 
              accept="image/*" 
              @change="handleFileChange"
              class="file-input"
            />
            <label for="recipe-image" class="file-label">
              Choose Image
            </label>
            <button 
              @click="uploadImage" 
              class="btn btn-secondary upload-btn"
              :disabled="!imageFile || uploadLoading"
            >
              {{ uploadLoading ? 'Uploading...' : 'Upload' }}
            </button>
            <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
          </div>
        </div>
        
        <div class="recipe-info">
          <div class="info-item">
            <span class="label">Preparation time:</span>
            <span class="value">{{ recipe.time_minutes }} minutes</span>
          </div>
          
          <div class="info-item">
            <span class="label">Price:</span>
            <span class="value">${{ recipe.price }}</span>
          </div>
          
          <div class="info-item description">
            <span class="label">Description:</span>
            <p class="value description-text">{{ recipe.description }}</p>
          </div>
          
          <div v-if="recipe.link" class="info-item">
            <span class="label">Source:</span>
            <a :href="recipe.link" target="_blank" class="value link">{{ recipe.link }}</a>
          </div>
          
          <div class="info-item">
            <span class="label">Tags:</span>
            <div class="tag-list">
              <span 
                v-for="tag in recipe.tags" 
                :key="tag.id" 
                class="tag"
              >
                {{ tag.name }}
              </span>
              <span v-if="recipe.tags.length === 0" class="no-tags">No tags</span>
            </div>
          </div>
          
          <div class="info-item">
            <span class="label">Ingredients:</span>
            <div class="ingredient-list">
              <span 
                v-for="ingredient in recipe.ingredients" 
                :key="ingredient.id" 
                class="ingredient"
              >
                {{ ingredient.name }}
              </span>
              <span v-if="recipe.ingredients.length === 0" class="no-ingredients">No ingredients</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="back-link">
        <router-link to="/recipes" class="btn btn-secondary">
          Back to Recipes
        </router-link>
      </div>
    </div>
    
    <div v-else class="not-found">
      <p>Recipe not found</p>
      <router-link to="/recipes" class="btn btn-primary">
        Back to Recipes
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.recipe-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.loading, .error-message, .not-found {
  text-align: center;
  margin: 3rem 0;
  color: #666;
}

.error-message p, .not-found p {
  margin-bottom: 1.5rem;
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.recipe-title h1 {
  margin: 0;
  color: #333;
}

.recipe-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
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

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary:hover {
  background-color: #e1e1e1;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

.confirm-delete {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

.recipe-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .recipe-content {
    grid-template-columns: 1fr;
  }
}

.recipe-image-container {
  display: flex;
  flex-direction: column;
}

.recipe-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.no-image {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 1rem;
  color: #999;
  font-style: italic;
}

.image-upload {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 0;
}

.file-input {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.file-label {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #f1f1f1;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.file-label:hover {
  background-color: #e1e1e1;
}

.upload-btn {
  flex-grow: 1;
}

.upload-error {
  width: 100%;
  color: #f44336;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.recipe-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item.description {
  margin-bottom: 1rem;
}

.label {
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
}

.value {
  color: #333;
}

.description-text {
  line-height: 1.6;
  white-space: pre-line;
}

.link {
  color: #4CAF50;
  text-decoration: none;
  word-break: break-all;
}

.link:hover {
  text-decoration: underline;
}

.tag-list, .ingredient-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background-color: #f0f7f0;
  color: #4CAF50;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.ingredient {
  background-color: #f1f8fe;
  color: #2196F3;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.no-tags, .no-ingredients {
  color: #999;
  font-style: italic;
}

.back-link {
  margin-top: 3rem;
  text-align: center;
}
</style>