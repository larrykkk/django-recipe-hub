<script setup>
import { useAuthStore } from '../store/auth';
import { computed } from 'vue';

const authStore = useAuthStore();
const loggedIn = computed(() => authStore.loggedIn);
</script>

<template>
  <div class="home-container">
    <div class="hero">
      <h1>Welcome to Recipe App</h1>
      <p>Store, organize, and discover amazing recipes</p>
      
      <div class="cta-buttons">
        <router-link v-if="!loggedIn" to="/register" class="btn btn-primary">Get Started</router-link>
        <router-link v-if="loggedIn" to="/recipes" class="btn btn-primary">View Recipes</router-link>
        <router-link v-if="loggedIn" to="/recipes/create" class="btn btn-secondary">Add New Recipe</router-link>
      </div>
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
  background-color: #4CAF50;
  color: white;
}

.btn-secondary {
  background-color: #FFF;
  color: #4CAF50;
  border: 1px solid #4CAF50;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary:hover {
  background-color: #f5f5f5;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.feature {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.feature h3 {
  margin-bottom: 1rem;
  color: #333;
}

.feature p {
  color: #666;
  line-height: 1.6;
}
</style>