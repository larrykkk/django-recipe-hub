<script setup>
import { useAuthStore } from '../store/auth';
import { computed } from 'vue';

const authStore = useAuthStore();
const loggedIn = computed(() => authStore.loggedIn);
</script>

<template>
  <div class="home">
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
      <div class="feature-card">
        <h3>Store Your Recipes</h3>
        <p>Keep all your favorite recipes in one place and access them from anywhere.</p>
      </div>
      
      <div class="feature-card">
        <h3>Organize with Tags</h3>
        <p>Categorize recipes with tags to find them quickly when you need them.</p>
      </div>
      
      <div class="feature-card">
        <h3>Track Ingredients</h3>
        <p>Keep track of ingredients for all your recipes.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.hero h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
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
  padding: 0 1rem;
}

.feature-card {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  color: #4CAF50;
  margin-bottom: 1rem;
}
</style>