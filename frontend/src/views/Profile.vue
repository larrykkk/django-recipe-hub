<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import authService from '../services/authService';

const router = useRouter();
const authStore = useAuthStore();
const currentUser = ref(null);
const loading = ref(true);
const error = ref('');
const success = ref('');
const nameInput = ref('');
const passwordInput = ref('');
const confirmPasswordInput = ref('');

onMounted(async () => {
  try {
    // Get user profile from API
    const response = await authService.getCurrentUserDetails();
    currentUser.value = response.data;
    nameInput.value = currentUser.value.name || '';
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
    // Only attempt to update password if one is provided
    const updateData = { name: nameInput.value };
    if (passwordInput.value) {
      if (passwordInput.value !== confirmPasswordInput.value) {
        error.value = 'Passwords do not match';
        loading.value = false;
        return;
      }
      updateData.password = passwordInput.value;
    }
    
    await authService.updateUser(updateData);
    
    // Update local user info
    const user = authStore.user;
    if (user) {
      user.name = nameInput.value;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    success.value = 'Profile updated successfully';
    passwordInput.value = '';
    confirmPasswordInput.value = '';
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update profile';
  } finally {
    loading.value = false;
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="profile-container">
    <div v-if="loading" class="loading">
      <p>Loading profile...</p>
    </div>
    
    <div v-else class="profile-content">
      <h1>My Profile</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-if="success" class="success-message">
        {{ success }}
      </div>
      
      <div class="profile-info">
        <div class="account-details">
          <h2>Account Details</h2>
          <p><strong>Email:</strong> {{ currentUser?.email }}</p>
        </div>
        
        <div class="profile-form">
          <h2>Update Profile</h2>
          
          <form @submit.prevent="updateProfile">
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
      
      <div class="logout-section">
        <button @click="logout" class="btn btn-danger">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.loading {
  text-align: center;
  margin: 3rem 0;
  color: #666;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

h2 {
  margin-bottom: 1.5rem;
  color: #444;
  font-size: 1.3rem;
}

.error-message {
  color: #f44336;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  text-align: center;
}

.profile-info {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .profile-info {
    grid-template-columns: 1fr;
  }
}

.account-details {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.account-details p {
  margin-bottom: 0.5rem;
}

.profile-form {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
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
  background-color: #4CAF50;
  color: white;
  width: 100%;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.logout-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.logout-section h2 {
  margin-bottom: 1rem;
  color: #333;
}

.logout-section p {
  margin-bottom: 1.5rem;
  color: #666;
  line-height: 1.6;
}
</style>