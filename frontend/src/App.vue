<script setup>
import { useAuthStore } from './store/auth';
import { computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isMenuOpen = ref(false);

const logout = () => {
  authStore.logout();
  router.push('/login');
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleMenuClick = (to) => {
  if (route.path === to) {
    isMenuOpen.value = false;
  }
};

const loggedIn = computed(() => authStore.loggedIn);
const userName = computed(() => authStore.user?.name || authStore.user?.email || 'User');

// Watch for route changes and close the menu
watch(() => route.path, () => {
  isMenuOpen.value = false;
});

</script>

<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-logo" @click="handleMenuClick('/')">Recipe Hub</router-link>
      </div>
      <button class="menu-toggle" @click="toggleMenu">
        <span class="menu-icon"></span>
      </button>
      <div class="navbar-menu" :class="{ 'is-open': isMenuOpen }">
        <a href="/api/docs" target="_blank" class="navbar-item">API Docs</a>
        <router-link to="/" class="navbar-item" @click="handleMenuClick('/')">Home</router-link>
        <template v-if="loggedIn">
          <router-link to="/recipes" class="navbar-item" @click="handleMenuClick('/recipes')">Recipes</router-link>
          <router-link to="/recipes/create" class="navbar-item" @click="handleMenuClick('/recipes/create')">Create Recipe</router-link>
          <router-link to="/profile" class="navbar-item" @click="handleMenuClick('/profile')" style="display: flex; align-items: center;">
            <!-- 使用者頭貼 -->
            <img :src="'/default-avatar.png'" alt="User Avatar" class="user-avatar" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px;">
            {{ userName }}
          </router-link>
          <a @click="logout" class="navbar-item logout-button">
            <span class="logout-text">Logout</span>
          </a>
        </template>
        <template v-else>
          <router-link to="/login" class="navbar-item" @click="handleMenuClick('/login')">Login</router-link>
          <router-link to="/register" class="navbar-item" @click="handleMenuClick('/register')">Register</router-link>
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
  color: #2c3e50;
  background-color: #f8f9fa;
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
  padding: 1rem 1.5rem;
  background-color: #fff;
  color: #3a3a3a;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-bottom: 2px solid #e1e4e8;
  border-radius: 0 0 6px 6px;
  margin-bottom: 8px;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-logo {
  color: #3a3a3a;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.navbar-item {
  color: #3a3a3a;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.navbar-item:hover {
  background-color: rgba(192, 3, 3, 0.03);
  color: #000;
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
  /* border-left: 1px solid rgba(255, 255, 255, 0.3); */
  /* padding-left: 0.5rem; */
}

.main-content {
  flex: 1;
  padding: 1rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.25rem;
  background-color: #e64a19;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-height: 44px;
  min-width: 44px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  background-color: #d84315;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #fecaca;
}

.success-message {
  background-color: #dcfce7;
  color: #16a34a;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #bbf7d0;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  width: 32px;
  height: 32px;
  position: relative;
}

.menu-icon {
  display: block;
  width: 20px;
  height: 2px;
  background-color: #3a3a3a;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
  left: 0;
  width: 20px;
  height: 2px;
  background-color: #3a3a3a;
  transition: all 0.3s ease;
}

.menu-icon::before {
  top: -6px;
}

.menu-icon::after {
  bottom: -6px;
}

.menu-toggle:hover .menu-icon,
.menu-toggle:hover .menu-icon::before,
.menu-toggle:hover .menu-icon::after {
  background-color: #000;
}

/* 當選單開啟時的動畫效果 */
.menu-toggle.is-open .menu-icon {
  background-color: transparent;
}

.menu-toggle.is-open .menu-icon::before {
  transform: translateY(6px) rotate(45deg);
}

.menu-toggle.is-open .menu-icon::after {
  transform: translateY(-6px) rotate(-45deg);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .navbar {
    flex-direction: row;
    padding: 0.75rem 1rem;
    position: relative;
  }

  .navbar-brand {
    width: auto;
    text-align: left;
  }

  .menu-toggle {
    display: block;
  }

  .navbar-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #f9f7f5;
    padding: 0.5rem;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
    border-top: 1px solid #eaeaea;
  }

  .navbar-menu.is-open {
    display: flex;
  }

  .navbar-item {
    width: 100%;
    text-align: left;
    padding: 0.75rem;
    font-size: 1rem;
  }

  .main-content {
    padding: 1rem;
    margin: 0.5rem;
    border-radius: 4px;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.75rem 1rem;
  }

  .navbar-brand {
    font-size: 1.2rem;
  }

  .navbar-item {
    padding: 0.6rem;
    font-size: 0.95rem;
  }

  .main-content {
    padding: 1rem;
    margin: 0.5rem 0;
    max-width: 100%;
  }

  .error-message,
  .success-message {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
}
</style>
