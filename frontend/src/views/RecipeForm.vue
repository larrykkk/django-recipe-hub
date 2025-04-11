<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipeStore } from '../store/recipe';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();

const isEditMode = computed(() => !!route.params.encodedId);
const encodedId = computed(() => route.params.encodedId);

const recipe = ref({
  title: '',
  description: '',
  time_minutes: 0,
  price: 0,
  link: '',
  tags: [], // Will now store objects with {id, encoded_id, name}
  ingredients: [] // Will now store objects with {id, encoded_id, name}
});

const loading = ref(false);
const error = ref('');
const tags = computed(() => recipeStore.tags);
const ingredients = computed(() => recipeStore.ingredients);

const newTagName = ref('');
const newIngredientName = ref('');

onMounted(async () => {
  loading.value = true;
  
  try {
    await recipeStore.fetchAllTags();
    await recipeStore.fetchAllIngredients();
    
    if (isEditMode.value) {
      await recipeStore.fetchRecipeById(encodedId.value);
      
      if (recipeStore.currentRecipe) {
        const r = recipeStore.currentRecipe;
        
        recipe.value = {
          title: r.title,
          description: r.description,
          time_minutes: r.time_minutes,
          price: r.price,
          link: r.link || '',
          tags: r.tags,
          ingredients: r.ingredients
        };
      }
    }
  } catch (err) {
    error.value = "Failed to load data. Please try again.";
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Transform the data before submission
    const submissionData = {
      ...recipe.value
    };

    console.log(submissionData)

    if (isEditMode.value) {
      await recipeStore.updateRecipe(encodedId.value, submissionData);
      router.push(`/recipes/${encodedId.value}`);
    } else {
      const newRecipe = await recipeStore.createRecipe(submissionData);
      router.push(`/recipes/${newRecipe.encoded_id}`);
    }
  } catch (err) {
    error.value = "Failed to save recipe. Please check your input and try again.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const addNewTag = async () => {
  if (newTagName.value.trim()) {
    try {
      const tag = await recipeStore.createTag({ name: newTagName.value.trim() });
      recipe.value.tags.push({ id: tag.id, encoded_id: tag.encoded_id, name: tag.name });
      newTagName.value = '';
    } catch (err) {
      console.error("Failed to add tag:", err);
    }
  }
};

const addNewIngredient = async () => {
  if (newIngredientName.value.trim()) {
    try {
      const ingredient = await recipeStore.createIngredient({ name: newIngredientName.value.trim() });
      recipe.value.ingredients.push({ id: ingredient.id, encoded_id: ingredient.encoded_id, name: ingredient.name });
      newIngredientName.value = '';
    } catch (err) {
      console.error("Failed to add ingredient:", err);
    }
  }
};

const formatPrice = (value) => {
  // Format to 2 decimal places
  return Number(value).toFixed(2);
};
</script>

<template>
  <div class="recipe-form-container">
    <div v-if="loading" class="loading">
      <p>Loading...</p>
    </div>
    
    <div v-else>
      <h1>{{ isEditMode ? 'Edit Recipe' : 'Create New Recipe' }}</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleSubmit" class="recipe-form">
        <div class="form-group">
          <label for="title">Recipe Title *</label>
          <input 
            type="text" 
            id="title" 
            v-model="recipe.title" 
            required 
            placeholder="Enter recipe title"
          />
        </div>
        
        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description" 
            v-model="recipe.description" 
            placeholder="Enter recipe description"
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="time">Preparation Time (minutes) *</label>
            <input 
              type="number" 
              id="time" 
              v-model.number="recipe.time_minutes" 
              required 
              min="1"
            />
          </div>
          
          <div class="form-group">
            <label for="price">Price *</label>
            <input 
              type="number" 
              id="price" 
              v-model.number="recipe.price" 
              required 
              min="0"
              step="0.01"
              @blur="recipe.price = formatPrice(recipe.price)"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="link">Source Link (Optional)</label>
          <input 
            type="url" 
            id="link" 
            v-model="recipe.link" 
            placeholder="https://example.com/recipe"
          />
        </div>
        
        <div class="form-group">
          <label>Tags</label>
          <div class="tags-container">
            <div class="selected-items">
              <div 
                v-for="tag in recipe.tags" 
                :key="tag.encoded_id"
                class="selected-item"
              >
                {{ tag.name }}
                <button 
                  type="button" 
                  @click="recipe.tags = recipe.tags.filter(t => t.encoded_id !== tag.encoded_id)"
                  class="remove-btn"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div class="add-new-container">
              <select 
                @change="(e) => { 
                  if (e.target.value) {
                    const selectedTag = tags.find(t => t.encoded_id === e.target.value);
                    if (selectedTag && !recipe.tags.some(t => t.encoded_id === selectedTag.encoded_id)) {
                      recipe.tags.push(selectedTag);
                    }
                    e.target.value = ''; 
                  }
                }"
                class="select-input"
              >
                <option value="">Select a tag</option>
                <option 
                  v-for="tag in tags" 
                  :key="tag.encoded_id" 
                  :value="tag.encoded_id"
                  :disabled="recipe.tags.some(t => t.encoded_id === tag.encoded_id)"
                >
                  {{ tag.name }}
                </option>
              </select>
              
              <div class="add-new-input">
                <input 
                  type="text" 
                  v-model="newTagName" 
                  placeholder="Add new tag"
                  @keyup.enter="addNewTag"
                />
                <button 
                  type="button" 
                  @click="addNewTag" 
                  class="btn btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label>Ingredients</label>
          <div class="ingredients-container">
            <div class="selected-items">
              <div 
                v-for="ingredient in recipe.ingredients" 
                :key="ingredient.encoded_id"
                class="selected-item"
              >
                {{ ingredient.name }}
                <button 
                  type="button" 
                  @click="recipe.ingredients = recipe.ingredients.filter(i => i.encoded_id !== ingredient.encoded_id)"
                  class="remove-btn"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div class="add-new-container">
              <select 
                @change="(e) => { 
                  if (e.target.value) {
                    const selectedIngredient = ingredients.find(i => i.encoded_id === e.target.value);
                    if (selectedIngredient && !recipe.ingredients.some(i => i.encoded_id === selectedIngredient.encoded_id)) {
                      recipe.ingredients.push(selectedIngredient);
                    }
                    e.target.value = ''; 
                  }
                }"
                class="select-input"
              >
                <option value="">Select an ingredient</option>
                <option 
                  v-for="ingredient in ingredients" 
                  :key="ingredient.encoded_id" 
                  :value="ingredient.encoded_id"
                  :disabled="recipe.ingredients.some(i => i.encoded_id === ingredient.encoded_id)"
                >
                  {{ ingredient.name }}
                </option>
              </select>
              
              <div class="add-new-input">
                <input 
                  type="text" 
                  v-model="newIngredientName" 
                  placeholder="Add new ingredient"
                  @keyup.enter="addNewIngredient"
                />
                <button 
                  type="button" 
                  @click="addNewIngredient" 
                  class="btn btn-secondary"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button 
            type="button" 
            @click="router.push('/recipes')" 
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading"
          >
            {{ isEditMode ? 'Update Recipe' : 'Create Recipe' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.recipe-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
}

.loading {
  text-align: center;
  margin: 3rem 0;
  color: #666;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  text-align: center;
}

.recipe-form {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 576px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, textarea, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

textarea {
  resize: vertical;
}

.tags-container, .ingredients-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  background-color: #fafafa;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.selected-item {
  display: inline-flex;
  align-items: center;
  background-color: #e64a19;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #f44336;
  font-size: 1.2rem;
  padding: 0 0 0 0.5rem;
  cursor: pointer;
}

.add-new-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.select-input {
  margin-bottom: 0.5rem;
}

.add-new-input {
  display: flex;
  gap: 0.5rem;
}

.add-new-input input {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
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
  background-color: #e64a19;
  color: white;
}

.btn-secondary {
  background-color: #f1f1f1;
  color: #333;
}

.btn-primary:hover {
  background-color: #d84315;
}

.btn-secondary:hover {
  background-color: #e1e1e1;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>