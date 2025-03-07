<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipeStore } from '../store/recipe';

const router = useRouter();
const recipeStore = useRecipeStore();
const recipes = computed(() => recipeStore.recipes);
const loading = computed(() => recipeStore.loading);
const tags = computed(() => recipeStore.tags);
const ingredients = computed(() => recipeStore.ingredients);

const selectedTags = ref([]);
const selectedIngredients = ref([]);
const searchQuery = ref('');

onMounted(async () => {
  await recipeStore.fetchAllRecipes();
  await recipeStore.fetchAllTags();
  await recipeStore.fetchAllIngredients();
});

const filteredRecipes = computed(() => {
  if (!searchQuery.value && selectedTags.value.length === 0 && selectedIngredients.value.length === 0) {
    return recipes.value;
  }
  
  return recipes.value.filter(recipe => {
    // Filter by search query
    const matchesSearch = searchQuery.value ? 
      recipe.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      recipe.description.toLowerCase().includes(searchQuery.value.toLowerCase()) : 
      true;
    
    // Filter by tags
    const matchesTags = selectedTags.value.length === 0 ? 
      true : 
      selectedTags.value.every(tagId => recipe.tags.some(tag => tag.id === parseInt(tagId)));
    
    // Filter by ingredients
    const matchesIngredients = selectedIngredients.value.length === 0 ? 
      true : 
      selectedIngredients.value.every(ingredientId => 
        recipe.ingredients.some(ingredient => ingredient.id === parseInt(ingredientId))
      );
    
    return matchesSearch && matchesTags && matchesIngredients;
  });
});

const viewRecipe = (id) => {
  router.push(`/recipes/${id}`);
};

const applyFilters = async () => {
  const filters = {};
  
  if (selectedTags.value.length > 0) {
    filters.tags = selectedTags.value.join(',');
  }
  
  if (selectedIngredients.value.length > 0) {
    filters.ingredients = selectedIngredients.value.join(',');
  }
  
  await recipeStore.fetchAllRecipes(filters);
};

const clearFilters = async () => {
  selectedTags.value = [];
  selectedIngredients.value = [];
  searchQuery.value = '';
  await recipeStore.fetchAllRecipes();
};
</script>

<template>
  <div class="recipe-list-container">
    <h1>My Recipes</h1>
    
    <div class="filter-section">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search recipes..." 
          class="search-input"
        />
      </div>
      
      <div class="filter-options">
        <div class="filter-group">
          <label>Filter by Tags</label>
          <select multiple v-model="selectedTags" class="filter-select">
            <option v-for="tag in tags" :key="tag.id" :value="tag.id">
              {{ tag.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Filter by Ingredients</label>
          <select multiple v-model="selectedIngredients" class="filter-select">
            <option v-for="ingredient in ingredients" :key="ingredient.id" :value="ingredient.id">
              {{ ingredient.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-buttons">
          <button @click="applyFilters" class="btn btn-primary">Apply Filters</button>
          <button @click="clearFilters" class="btn btn-secondary">Clear</button>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <p>Loading recipes...</p>
    </div>
    
    <div v-else-if="filteredRecipes.length === 0" class="no-recipes">
      <p>No recipes found. Try adjusting your filters or add a new recipe.</p>
      <router-link to="/recipes/create" class="btn btn-primary">Add Recipe</router-link>
    </div>
    
    <div v-else class="recipe-grid">
      <div 
        v-for="recipe in filteredRecipes" 
        :key="recipe.id" 
        class="recipe-card"
        @click="viewRecipe(recipe.id)"
      >
        <div class="recipe-image" :style="recipe.link ? `background-image: url(${recipe.link})` : ''">
          <div v-if="!recipe.link" class="no-image">No Image</div>
        </div>
        <div class="recipe-info">
          <h3>{{ recipe.title }}</h3>
          <p class="recipe-time">{{ recipe.time_minutes }} min</p>
          <p class="recipe-price">${{ recipe.price }}</p>
          <div class="recipe-tags">
            <span v-for="tag in recipe.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="add-recipe-btn">
      <router-link to="/recipes/create" class="btn btn-primary">
        Add New Recipe
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.recipe-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
}

.filter-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-box {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.filter-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 100px;
  background-color: white;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-secondary {
  background-color: #f1f1f1;
  color: #333;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary:hover {
  background-color: #e1e1e1;
}

.loading, .no-recipes {
  text-align: center;
  margin: 3rem 0;
  color: #666;
}

.no-recipes p {
  margin-bottom: 1.5rem;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.recipe-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.recipe-image {
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
  background-color: #f9f9f9;
}

.no-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-style: italic;
}

.recipe-info {
  padding: 1.5rem;
}

.recipe-info h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.recipe-time, .recipe-price {
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tag {
  background-color: #f0f7f0;
  color: #4CAF50;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.add-recipe-btn {
  margin-top: 3rem;
  text-align: center;
}
</style>