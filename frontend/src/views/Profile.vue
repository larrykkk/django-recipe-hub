<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useRecipeStore } from '../store/recipe';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const recipeStore = useRecipeStore();
const currentUser = ref(null);
const loading = ref(true);
const error = ref('');
const success = ref('');
const nameInput = ref('');
const passwordInput = ref('');
const confirmPasswordInput = ref('');
const recipesLoaded = ref(false);

// Add userRecipes computed property
const userRecipes = computed(() => recipeStore.recipes || []);

// Map tab parameter to section names
const TAB_MAP = {
  '1': 'account',
  '2': 'recipes',
  '3': 'update'
};

const SECTION_TO_TAB = {
  'account': '1',
  'recipes': '2',
  'update': '3'
};

// Compute active section from route parameter
const activeSection = computed(() => {
  const tab = route.query.tab || '1';
  return TAB_MAP[tab] || 'account';
});

// Watch for section changes through URL
watch([() => route.query.tab, currentUser], async ([newTab, user]) => {
  if (newTab === '2' && user) {
    try {
      loading.value = true;
      await recipeStore.fetchUserRecipes(user.id);
      recipesLoaded.value = true;
    } catch (err) {
      error.value = 'Failed to load recipes';
    } finally {
      loading.value = false;
    }
  }
}, { immediate: true });

// Change tab through UI
const changeSection = (section) => {
  const tab = SECTION_TO_TAB[section];
  router.push({ query: { tab }});
};

const closeAllDropdowns = () => {
  userRecipes.value.forEach(recipe => {
    recipe.showDropdown = false;
  });
};

const handleClickOutside = (event) => {
  const dropdowns = document.querySelectorAll('.dropdown');
  let clickedOutside = true;
  
  dropdowns.forEach(dropdown => {
    if (dropdown.contains(event.target)) {
      clickedOutside = false;
    }
  });

  if (clickedOutside) {
    closeAllDropdowns();
  }
};

onMounted(async () => {
  try {
    currentUser.value = authStore.user;
    document.addEventListener('click', handleClickOutside);
  } catch (err) {
    error.value = 'Failed to load user profile';
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const updateProfile = async () => {
  loading.value = true;
  error.value = '';
  success.value = '';
  
  try {
    const updateData = { name: nameInput.value };
    if (passwordInput.value) {
      if (passwordInput.value !== confirmPasswordInput.value) {
        error.value = 'Passwords do not match';
        loading.value = false;
        return;
      }
      updateData.password = passwordInput.value;
    }
    
    await authStore.updateUserProfile(updateData);
    currentUser.value = authStore.user;
    success.value = 'Profile updated successfully';
    passwordInput.value = '';
    confirmPasswordInput.value = '';
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update profile';
  } finally {
    loading.value = false;
  }
};

const viewRecipe = (encodedId) => {
  router.push(`/recipes/${encodedId}`);
};

const deleteRecipe = async (encodedId) => {
  if (confirm('Are you sure you want to delete this recipe?')) {
    try {
      await recipeStore.deleteRecipe(encodedId);
      // Refresh the recipes list
      await recipeStore.fetchUserRecipes(currentUser.value.id);
    } catch (err) {
      error.value = 'Failed to delete recipe';
    }
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="profile-page">
    <div v-if="loading" class="loading">
      <p>Loading profile...</p>
    </div>
    
    <div v-else class="profile-layout">
      <!-- Sidebar Navigation -->
      <div class="sidebar">
        <div 
          class="sidebar-item" 
          :class="{ active: activeSection === 'account' }"
          @click="changeSection('account')"
        >
          Account Details
        </div>
        <div 
          class="sidebar-item" 
          :class="{ active: activeSection === 'recipes' }"
          @click="changeSection('recipes')"
        >
          My Recipes
        </div>
        <div 
          class="sidebar-item" 
          :class="{ active: activeSection === 'update' }"
          @click="changeSection('update')"
        >
          Update Profile
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div v-if="success" class="success-message">
          {{ success }}
        </div>

        <!-- My Recipes Section -->
        <div v-if="activeSection === 'recipes'" class="content-section">
          <h2>My Recipes</h2>
          <div v-if="userRecipes.length === 0" class="no-recipes">
            <p>You haven't created any recipes yet.</p>
            <router-link to="/recipes/create" class="btn btn-primary">Create Recipe</router-link>
          </div>
          <div v-else class="recipe-list">
            <div 
              v-for="recipe in userRecipes" 
              :key="recipe.encoded_id" 
              class="recipe-list-item"
            >
              <div class="recipe-title" @click="viewRecipe(recipe.encoded_id)">
                {{ recipe.title }}
              </div>
              <div class="recipe-date">
                {{ new Date(recipe.created_at).toLocaleString() }}
              </div>
              <div class="recipe-actions">
                <div class="dropdown">
                  <button class="dropdown-toggle" @click="recipe.showDropdown = !recipe.showDropdown">
                    <span class="dots">•••</span>
                  </button>
                  <div class="dropdown-menu" v-if="recipe.showDropdown">
                    <router-link :to="`/recipes/${recipe.encoded_id}/edit`" class="dropdown-item">
                      Edit
                    </router-link>
                    <button class="dropdown-item delete" @click="deleteRecipe(recipe.encoded_id)">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Details Section -->
        <div v-if="activeSection === 'account'" class="content-section">
          <h2>Account Details</h2>
          <div class="account-details">
            <p><strong>User ID:</strong> {{ currentUser?.id }}</p>
            <p><strong>Email:</strong> {{ currentUser?.email }}</p>
            <p><strong>Name:</strong> {{ currentUser?.name }}</p>
          </div>
        </div>

        <!-- Update Profile Section -->
        <div v-if="activeSection === 'update'" class="content-section">
          <h2>Update Profile</h2>
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-group">
              <label for="name">Name</label>
              <input 
                type="text" 
                id="name" 
                v-model="nameInput" 
                placeholder="Your name"
              />
            </div>
            
            <div class="form-group">
              <label for="password">New Password (leave blank to keep current)</label>
              <input 
                type="password" 
                id="password" 
                v-model="passwordInput" 
                placeholder="New password"
              />
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                v-model="confirmPasswordInput" 
                placeholder="Confirm new password"
                :disabled="!passwordInput"
              />
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Updating...' : 'Update Profile' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.loading {
  text-align: center;
  margin: 3rem 0;
  color: #666;
}

.profile-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  min-height: 600px;
}

.sidebar {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
}

.sidebar-item {
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
}

.sidebar-item:hover {
  background-color: #f5f5f5;
  color: #4CAF50;
}

.sidebar-item.active {
  background-color: #4CAF50;
  color: white;
}

.main-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.content-section {
  animation: fadeIn 0.3s ease;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

h2 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
}

.account-details {
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
}

.account-details p {
  margin-bottom: 1rem;
  color: #4b5563;
}

.profile-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4b5563;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
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

.btn-primary:hover {
  background-color: #45a049;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.recipe-list {
  width: 100%;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 2px solid #4CAF50;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.recipe-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
  flex-shrink: 0;
}

.recipe-list-item:first-child {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.recipe-list-item:last-child {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: none;
}

.recipe-title {
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  color: #374151;
  flex: 1;
}

.recipe-title:hover {
  color: #4CAF50;
}

.recipe-date {
  color: #6b7280;
  font-size: 0.875rem;
  margin-right: 1.5rem;
  min-width: 150px;
  text-align: right;
}

.recipe-actions {
  display: flex;
  align-items: center;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #6b7280;
  font-size: 1.2rem;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.dropdown-toggle:hover {
  background-color: #f3f4f6;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  z-index: 10;
  min-width: 140px;
  border: 1px solid #e5e7eb;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
  font-size: 0.875rem;
  text-decoration: none;
  border: none;
  font-weight: 500;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.dropdown-item.delete {
  color: #dc2626;
  width: 100%;
  font-weight: 500;
  border-radius: 0;
}

.dropdown-item.delete:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.dropdown-item + .dropdown-item {
  border-top: 1px solid #e5e7eb;
}

.dots {
  font-size: 1.25rem;
  line-height: 0.5;
  letter-spacing: 1px;
}

.no-recipes {
  text-align: center;
  padding: 3rem 0;
  color: #6b7280;
}

@media (max-width: 768px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: flex;
    justify-content: space-around;
    padding: 0;
  }

  .sidebar-item {
    flex: 1;
    text-align: center;
    padding: 1rem 0.5rem;
  }

  .recipe-title {
    font-size: 1rem;
  }

  .recipe-actions {
    display: none;
  }
}
</style>