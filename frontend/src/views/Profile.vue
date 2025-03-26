<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useRecipeStore } from '../store/recipe';

const router = useRouter();
const authStore = useAuthStore();
const recipeStore = useRecipeStore();
const currentUser = ref(null);
const loading = ref(true);
const error = ref('');
const success = ref('');
const nameInput = ref('');
const passwordInput = ref('');
const confirmPasswordInput = ref('');
const activeSection = ref('account'); // Default section
const userRecipes = computed(() => recipeStore.recipes);
const recipesLoaded = ref(false);

// Watch for section changes
watch(activeSection, async (newSection) => {
  if (newSection === 'recipes' && !recipesLoaded.value && currentUser.value) {
    try {
      loading.value = true;
      await recipeStore.fetchUserRecipes(currentUser.value.id);
      recipesLoaded.value = true;
    } catch (err) {
      error.value = 'Failed to load recipes';
    } finally {
      loading.value = false;
    }
  }
});

onMounted(async () => {
  try {
    // Get user data from store
    currentUser.value = authStore.user;
    
    if (currentUser.value) {
      nameInput.value = currentUser.value.name || '';
    } else {
      error.value = 'User data not found';
    }
  } catch (err) {
    error.value = 'Failed to load user profile';
  } finally {
    loading.value = false;
  }
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
          @click="activeSection = 'account'"
        >
          Account Details
        </div>
        <div 
          class="sidebar-item" 
          :class="{ active: activeSection === 'recipes' }"
          @click="activeSection = 'recipes'"
        >
          My Recipes
        </div>
        <div 
          class="sidebar-item" 
          :class="{ active: activeSection === 'update' }"
          @click="activeSection = 'update'"
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
          <div v-else class="recipe-grid">
            <div 
              v-for="recipe in userRecipes" 
              :key="recipe.encoded_id" 
              class="recipe-card"
              @click="viewRecipe(recipe.encoded_id)"
            >
              <div class="recipe-image" :style="recipe.link ? `background-image: url(${recipe.link})` : ''">
                <div v-if="!recipe.link" class="no-image">No Image</div>
              </div>
              <div class="recipe-info">
                <h3>{{ recipe.title }}</h3>
                <p class="recipe-time">{{ recipe.time_minutes }} min</p>
                <p class="recipe-price">${{ recipe.price }}</p>
                <div class="recipe-tags">
                  <span v-for="tag in recipe.tags" :key="tag.encoded_id" class="tag">
                    {{ tag.name }}
                  </span>
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

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.recipe-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.recipe-card:hover {
  transform: translateY(-4px);
}

.recipe-image {
  height: 180px;
  background-size: cover;
  background-position: center;
}

.no-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
}

.recipe-info {
  padding: 1rem;
}

.recipe-info h3 {
  margin: 0 0 0.5rem;
  color: #1f2937;
}

.recipe-time, .recipe-price {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.tag {
  background: #ecfdf5;
  color: #059669;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
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
}
</style>