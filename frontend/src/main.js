import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// Initialize Pinia and add it to the app
const pinia = createPinia()
app.use(pinia)

// Initialize Vue Router
app.use(router)

// Mount the app
app.mount('#app')
