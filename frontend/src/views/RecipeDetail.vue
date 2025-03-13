<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipeStore } from '../store/recipe';
import CommentSection from '../components/CommentSection.vue';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();

const encodedId = computed(() => route.params.encodedId);
const recipe = computed(() => recipeStore.currentRecipe);
const loading = computed(() => recipeStore.loading);
const error = computed(() => recipeStore.error);

const confirmDelete = ref(false);

onMounted(async () => {
  await recipeStore.fetchRecipeById(encodedId.value);
});

const handleEdit = () => {
  router.push(`/recipes/${encodedId.value}/edit`);
};

const handleDelete = async () => {
  if (confirmDelete.value) {
    try {
      await recipeStore.deleteRecipe(encodedId.value);
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
</script>

<template>
  <div class="recipe-container">
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
                :key="tag.encoded_id" 
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
                :key="ingredient.encoded_id" 
                class="ingredient"
              >
                {{ ingredient.name }}
              </span>
              <span v-if="recipe.ingredients.length === 0" class="no-ingredients">No ingredients</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Comment Section -->
      <CommentSection :recipeId="recipe.encoded_id" />
      
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
.recipe-container {
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
  align-items: center;
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
  color: #999;
  font-style: italic;
}

.recipe-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.recipe-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.info-label {
  font-size: 0.9rem;
  color: #666;
}

.info-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.recipe-description {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.recipe-section {
  margin-bottom: 1.5rem;
}

.recipe-section h3 {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.ingredients-list, .steps-list {
  list-style-position: inside;
  padding-left: 1rem;
}

.ingredients-list li, .steps-list li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tag {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 0.3rem 0.8rem;
  border-radius: 16px;
  font-size: 0.9rem;
}

.back-link {
  margin-top: 3rem;
  text-align: center;
}
</style>