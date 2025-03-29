<script setup>
import { useAuthStore } from './store/auth';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  router.push('/login');
};

const loggedIn = computed(() => authStore.loggedIn);
const userName = computed(() => authStore.user?.name || authStore.user?.email || 'User');
</script>

<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-logo">Recipe App</router-link>
      </div>
      <div class="navbar-menu">
        <a href="/api/docs" target="_blank" class="navbar-item">API Docs</a>
        <router-link to="/" class="navbar-item">Home</router-link>
        <template v-if="loggedIn">
          <router-link to="/recipes" class="navbar-item">Recipes</router-link>
          <router-link to="/recipes/create" class="navbar-item">Create Recipe</router-link>
          <router-link to="/profile" class="navbar-item">{{ userName }}</router-link>
          <a @click="logout" class="navbar-item logout-button">
            <span class="logout-text">Logout</span>
          </a>
        </template>
        <template v-else>
          <router-link to="/login" class="navbar-item">Login</router-link>
          <router-link to="/register" class="navbar-item">Register</router-link>
        </template>
      </div>
    </nav>
    
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #4CAF50;
  color: white;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-logo {
  color: white;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  gap: 1rem;
}

.navbar-item {
  color: white;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.navbar-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name {
  font-weight: bold;
  margin-right: 0.5rem;
}

.logout-text {
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  padding-left: 0.5rem;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #45a049;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
</style>
