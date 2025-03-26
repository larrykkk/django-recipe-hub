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
const isFilterExpanded = ref(false);

onMounted(async () => {
  await recipeStore.fetchAllRecipes();
  await recipeStore.fetchAllTags();
  await recipeStore.fetchAllIngredients();
});

const toggleFilter = () => {
  isFilterExpanded.value = !isFilterExpanded.value;
};

const toggleTag = (tagEncodedId) => {
  const index = selectedTags.value.indexOf(tagEncodedId);
  if (index === -1) {
    selectedTags.value.push(tagEncodedId);
  } else {
    selectedTags.value.splice(index, 1);
  }
};

const toggleIngredient = (ingredientEncodedId) => {
  const index = selectedIngredients.value.indexOf(ingredientEncodedId);
  if (index === -1) {
    selectedIngredients.value.push(ingredientEncodedId);
  } else {
    selectedIngredients.value.splice(index, 1);
  }
};

const getSelectedTagNames = computed(() => {
  return tags.value.filter(tag => selectedTags.value.includes(tag.encoded_id));
});

const getSelectedIngredientNames = computed(() => {
  return ingredients.value.filter(ingredient => selectedIngredients.value.includes(ingredient.encoded_id));
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
      selectedTags.value.every(tagEncodedId => recipe.tags.some(tag => tag.encoded_id === tagEncodedId));
    
    // Filter by ingredients
    const matchesIngredients = selectedIngredients.value.length === 0 ? 
      true : 
      selectedIngredients.value.every(ingredientEncodedId => 
        recipe.ingredients.some(ingredient => ingredient.encoded_id === ingredientEncodedId)
      );
    
    return matchesSearch && matchesTags && matchesIngredients;
  });
});

const viewRecipe = (encodedId) => {
  router.push(`/recipes/${encodedId}`);
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
    
    <div class="filter-container">
      <div class="filter-header" @click="toggleFilter">
        <div class="filter-summary">
          <div class="search-wrapper">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search recipes..." 
              class="search-input"
              @click.stop
            />
          </div>
          
          <div v-if="!isFilterExpanded && (selectedTags.length > 0 || selectedIngredients.length > 0)" class="selected-filters">
            <div v-if="selectedTags.length > 0" class="selected-section">
              <span class="selected-label">Tags:</span>
              <div class="selected-badges">
                <div 
                  v-for="tag in getSelectedTagNames" 
                  :key="tag.encoded_id" 
                  class="filter-badge active"
                  @click.stop="toggleTag(tag.encoded_id)"
                >
                  {{ tag.name }}
                </div>
              </div>
            </div>
            
            <div v-if="selectedIngredients.length > 0" class="selected-section">
              <span class="selected-label">Ingredients:</span>
              <div class="selected-badges">
                <div 
                  v-for="ingredient in getSelectedIngredientNames" 
                  :key="ingredient.encoded_id" 
                  class="filter-badge active"
                  @click.stop="toggleIngredient(ingredient.encoded_id)"
                >
                  {{ ingredient.name }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="toggle-filter">
            <span>{{ isFilterExpanded ? 'Hide Filters' : 'Show Filters' }}</span>
            <i class="filter-arrow" :class="{ 'expanded': isFilterExpanded }">▼</i>
          </div>
        </div>
      </div>
      
      <div class="filters-wrapper" v-if="isFilterExpanded">
        <div class="filter-section">
          <h3 class="filter-title">Tags</h3>
          <div class="badge-container">
            <div 
              v-for="tag in tags" 
              :key="tag.encoded_id" 
              @click="toggleTag(tag.encoded_id)"
              class="filter-badge"
              :class="{ active: selectedTags.includes(tag.encoded_id) }"
            >
              {{ tag.name }}
            </div>
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-title">Ingredients</h3>
          <div class="badge-container">
            <div 
              v-for="ingredient in ingredients" 
              :key="ingredient.encoded_id" 
              @click="toggleIngredient(ingredient.encoded_id)"
              class="filter-badge"
              :class="{ active: selectedIngredients.includes(ingredient.encoded_id) }"
            >
              {{ ingredient.name }}
            </div>
          </div>
        </div>
        
        <div class="filter-actions">
          <button @click="applyFilters" class="filter-btn apply">Apply</button>
          <button @click="clearFilters" class="filter-btn clear">Clear</button>
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
        :key="recipe.encoded_id" 
        class="recipe-card"
      >
        <div class="recipe-image" 
             :style="recipe.link ? `background-image: url(${recipe.link})` : ''"
             @click="viewRecipe(recipe.encoded_id)">
          <div v-if="!recipe.link" class="no-image">No Image</div>
        </div>
        <div class="recipe-info">
          <h3 @click="viewRecipe(recipe.encoded_id)">{{ recipe.title }}</h3>
          <a class="recipe-author" @click="$router.push(`/user/${recipe.user.id}/profile`)">
            By {{ recipe.user.name }}
          </a>
          <p class="recipe-time">{{ recipe.time_minutes }} min</p>
          <p class="recipe-price">${{ recipe.price }}</p>
          <div class="recipe-tags">
            <span v-for="tag in recipe.tags" :key="tag.encoded_id" class="tag">{{ tag.name }}</span>
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
  margin-bottom: 2.5rem;
  text-align: center;
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
  position: relative;
}

h1::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: #4CAF50;
  border-radius: 2px;
}

.filter-container {
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filter-header {
  cursor: pointer;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.filter-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-wrapper {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #f9fafb;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.selected-filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.selected-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-label {
  font-weight: 600;
  color: #4b5563;
  font-size: 1rem;
}

.selected-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.toggle-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: #4b5563;
  font-weight: 500;
}

.filter-arrow {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.filter-arrow.expanded {
  transform: rotate(180deg);
}

.filters-wrapper {
  padding: 1rem;
  border-top: 1px solid #f0f0f0;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #2c3e50;
}

.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-badge {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border-radius: 20px;
  font-size: 1rem;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.filter-badge:hover {
  background-color: #e5e7eb;
}

.filter-badge.active {
  background-color: #ecfdf5;
  color: #059669;
  border-color: #059669;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.loading, .no-recipes {
  text-align: center;
  margin: 4rem 0;
  color: #64748b;
  font-size: 1.2rem;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2.5rem;
  margin-top: 2rem;
}

.recipe-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.4s ease;
  border: 1px solid #eef2f7;
}

.recipe-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.recipe-image {
  height: 220px;
  background-size: cover;
  background-position: center;
  position: relative;
  background-color: #f8fafc;
  transition: all 0.3s ease;
}

.recipe-card:hover .recipe-image {
  height: 240px;
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
  color: #94a3b8;
  font-style: italic;
  font-size: 1.1rem;
}

.recipe-info {
  padding: 1.8rem;
}

.recipe-info h3 {
  margin-bottom: 1rem;
  color: #1e293b;
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.4;
}

.recipe-author {
  color: #4CAF50;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.recipe-author:hover {
  color: #45a049;
  text-decoration: underline;
}

.recipe-time, .recipe-price {
  color: #64748b;
  margin-bottom: 0.8rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recipe-time::before {
  content: '⏱';
}

.recipe-price::before {
  content: '💰';
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
  font-weight: 500;
  transition: all 0.3s ease;
}

.tag:hover {
  background-color: #059669;
  color: white;
}

.add-recipe-btn {
  margin-top: 4rem;
  text-align: center;
}

.add-recipe-btn .btn {
  font-size: 1.1rem;
  padding: 0.9rem 2rem;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .recipe-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .filter-container {
    padding: 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }
}
</style>