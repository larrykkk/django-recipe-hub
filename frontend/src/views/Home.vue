<script setup>
import { useRecipeStore } from '../store/recipe';
import { computed, ref, onMounted } from 'vue';

const recipeStore = useRecipeStore();
const recipes = computed(() => recipeStore.recipes.slice(0, 10));
const loading = computed(() => recipeStore.loading);
const error = computed(() => recipeStore.error);
const imageLoaded = ref({});

onMounted(async () => {
  await recipeStore.fetchAllRecipes();
});

const handleImageLoad = (recipeId) => {
  imageLoaded.value[recipeId] = true;
};
</script>

<template>
  <div class="home-container">
    <div class="hero">
      <h1>Welcome to Recipe App</h1>
      <p>Store, organize, and discover amazing recipes</p>
      
      <!-- <div class="cta-buttons"> -->
        <!-- <router-link v-if="!loggedIn" to="/register" class="btn btn-primary">Get Started</router-link> -->
        <!-- <router-link v-if="loggedIn" to="/recipes" class="btn btn-primary">View Recipes</router-link> -->
        <!-- <router-link v-if="loggedIn" to="/recipes/create" class="btn btn-secondary">Add New Recipe</router-link> -->
      <!-- </div> -->
    </div>
    
    <div class="features">
      <div class="feature">
        <h3>Store Your Recipes</h3>
        <p>Keep all your favorite recipes in one place and access them from anywhere.</p>
      </div>
      
      <div class="feature">
        <h3>Organize with Tags</h3>
        <p>Categorize recipes with tags to find them quickly when you need them.</p>
      </div>
      
      <div class="feature">
        <h3>Track Ingredients</h3>
        <p>Keep track of ingredients for all your recipes.</p>
      </div>
    </div>
  
    <!-- 展示出前 10 個 recipe -->
    <div class="recipe-list">
      <h2>Recipes</h2>
      <div v-if="loading" class="loading">Loading recipes...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else class="recipe-grid">
        <div v-for="recipe in recipes" :key="recipe.id" class="recipe-item">
          <div class="recipe-image">
            <div v-if="!imageLoaded[recipe.id]" class="skeleton-loader"></div>
            <img 
              :src="recipe.link" 
              :alt="recipe.title" 
              @load="handleImageLoad(recipe.id)" 
              @error="handleImageLoad(recipe.id)" 
              :class="{ 'image-loaded': imageLoaded[recipe.id] }"
              onerror="this.src='/default-recipe.jpg'"
            >
          </div>
          <router-link :to="'/recipes/' + recipe.id" class="view-recipe"><h3>{{ recipe.title }}</h3></router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.hero {
  text-align: center;
  margin-bottom: 4rem;
}

.hero h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  color: #666;
  max-width: 800px;
  margin: 0 auto 2rem;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #e64a19;
  color: white;
}

.btn-secondary {
  background-color: #FFF;
  color: #e64a19;
  border: 1px solid #e64a19;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary:hover {
  background-color: #f5f5f5;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.feature {
  background-color: #fff;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature:hover {
  transform: translateY(-2px);
}

.feature h3 {
  color: #e64a19;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.feature p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .features {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin: 1.5rem 0;
  }

  .feature {
    padding: 1rem;
  }

  .feature h3 {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  .feature p {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .features {
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .feature {
    padding: 0.75rem;
  }
}

.recipe-list {
  margin-top: 3rem;
  text-align: center;
}

.recipe-list h2 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.recipe-item {
  background: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.recipe-item:hover {
  transform: translateY(-2px);
}

.recipe-item h3 {
  color: #e64a19;
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
}

.recipe-item p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.view-recipe {
  display: inline-block;
  color: #e64a19;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
}

.view-recipe:hover {
  text-decoration: underline;
}

.loading {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.error-message {
  color: #dc3545;
  text-align: center;
  padding: 1rem;
  background: #fff;
  border-radius: 4px;
  margin: 1rem 0;
}

.recipe-image {
  width: 100%;
  height: 180px;
  margin-bottom: 1rem;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  background-color: #f0f0f0;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  opacity: 0;
}

.recipe-image img.image-loaded {
  opacity: 1;
}

.skeleton-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.recipe-item:hover .recipe-image img.image-loaded {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .recipe-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .recipe-item {
    padding: 1rem;
  }

  .recipe-list h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .recipe-image {
    height: 160px;
  }
}

@media (max-width: 480px) {
  .recipe-item {
    padding: 0.75rem;
  }

  .recipe-item h3 {
    font-size: 1.1rem;
  }

  .recipe-item p {
    font-size: 0.9rem;
  }

  .recipe-image {
    height: 140px;
  }
}
</style>