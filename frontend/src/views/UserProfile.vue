<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useRecipeStore } from '../store/recipe';

const route = useRoute();
const recipeStore = useRecipeStore();
const userId = computed(() => route.params.userId);
const userRecipes = computed(() => recipeStore.recipes);
const loading = ref(true);
const error = ref(null);
const user = ref(null);

onMounted(async () => {
  try {
    // 獲取用戶資訊和該用戶的食譜
    await recipeStore.fetchUserProfile(userId.value);
    await recipeStore.fetchUserRecipes(userId.value);
    loading.value = false;
  } catch (err) {
    error.value = "Failed to load user profile";
    loading.value = false;
  }
});
</script>

<template>
  <div class="user-profile-container">
    <div v-if="loading" class="loading">
      <p>Loading profile...</p>
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else class="profile-content">
      <div class="profile-header">
        <h1>{{ user?.name || 'User Profile' }}</h1>
        <p class="user-email">{{ user?.email }}</p>
      </div>

      <div class="user-recipes">
        <h2>Recipes by {{ user?.name || 'User' }}</h2>
        
        <div v-if="userRecipes.length === 0" class="no-recipes">
          <p>No recipes found.</p>
        </div>

        <div v-else class="recipe-grid">
          <div 
            v-for="recipe in userRecipes" 
            :key="recipe.encoded_id" 
            class="recipe-card"
            @click="$router.push(`/recipes/${recipe.encoded_id}`)"
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
    </div>
  </div>
</template>

<style scoped>
.user-profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.loading, .error-message {
  text-align: center;
  margin: 3rem 0;
  color: #666;
}

.profile-header {
  text-align: center;
  margin-bottom: 3rem;
}

.profile-header h1 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.user-email {
  color: #666;
  font-size: 1.1rem;
}

.user-recipes {
  margin-top: 2rem;
}

.user-recipes h2 {
  margin-bottom: 2rem;
  text-align: center;
  color: #2c3e50;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2.5rem;
}

.recipe-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.4s ease;
}

.recipe-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.recipe-image {
  height: 220px;
  background-size: cover;
  background-position: center;
  background-color: #f8fafc;
}

.no-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-style: italic;
}

.recipe-info {
  padding: 1.8rem;
}

.recipe-info h3 {
  margin-bottom: 1rem;
  color: #1e293b;
  font-size: 1.4rem;
  font-weight: 600;
}

.recipe-time, .recipe-price {
  color: #64748b;
  margin-bottom: 0.8rem;
  font-size: 1rem;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.2rem;
}

.tag {
  background-color: #ecfdf5;
  color: #059669;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.no-recipes {
  text-align: center;
  color: #666;
  margin: 3rem 0;
}

@media (max-width: 768px) {
  .recipe-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}
</style> 