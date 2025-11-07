<template>
  <div class="bg-white border-r border-gray-200 w-[260px] hidden md:block">
    <!-- Logo -->
    <div class="h-16 border-b border-gray-200 flex items-center justify-center">
      <h1 class="text-2xl font-bold text-primary">BOX Admin</h1>
    </div>
    
    <!-- Navigation -->
    <nav class="mt-6 px-4">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.path">
          <router-link 
            :to="item.path" 
            class="flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors"
            :class="{ 'bg-primary-50 text-primary font-medium': isActive(item.path) }"
          >
            <i :class="item.icon" class="mr-3 text-lg"></i>
            <span>{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <!-- User Section -->
    <div class="absolute bottom-0 w-[260px] border-t border-gray-200 py-4 px-6">
      <div class="flex items-center space-x-3">
        <AvatarIcon class="w-10 h-10" />
        <div>
          <p class="font-medium text-gray-800">{{ authStore.user?.name }}</p>
          <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
        </div>
      </div>
      <button 
        @click="logout" 
        class="mt-4 flex items-center text-gray-600 hover:text-primary transition-colors"
      >
        <i class="fas fa-sign-out-alt mr-2"></i> Logout
      </button>
    </div>
  </div>
  
  <!-- Mobile Menu Overlay -->
  <div 
    v-if="isMobileMenuOpen" 
    class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    @click="isMobileMenuOpen = false"
  ></div>
  
  <!-- Mobile Menu -->
  <div 
    v-if="isMobileMenuOpen" 
    class="fixed inset-y-0 left-0 w-full bg-white z-40 md:hidden"
  >
    <!-- Logo -->
    <div class="h-16 border-b border-gray-200 flex items-center justify-center">
      <h1 class="text-2xl font-bold text-primary">BOX Admin</h1>
    </div>
    
    <!-- Navigation -->
    <nav class="mt-6 px-4">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.path">
          <router-link 
            :to="item.path" 
            class="flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors relative"
            :class="{ 'bg-primary-50 text-primary font-medium': isActive(item.path) }"
            :style="isActive(item.path) ? {
              'box-shadow': 'inset 0 0 0 2px rgba(188, 138, 26, 0.3)'
            } : {}"
            @click="selectOption(item.path); isMobileMenuOpen = false"
          >
            <i :class="item.icon" class="mr-3 text-lg"></i>
            <span>{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <!-- Mobile User Section -->
    <div class="absolute bottom-0 w-full border-t border-gray-200 py-4 px-6">
      <div class="flex items-center space-x-3">
        <img :src="authStore.user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'" alt="User Avatar" class="w-10 h-10 rounded-full">
        <div>
          <p class="font-medium text-gray-800">{{ authStore.user?.name }}</p>
          <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
        </div>
      </div>
      <button 
        @click="logout" 
        class="mt-4 flex items-center text-gray-600 hover:text-primary transition-colors"
      >
        <i class="fas fa-sign-out-alt mr-2"></i> Logout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { menuItems } from '../../config/menu'
import AvatarIcon from '../AvatarIcon.vue'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)
const selectedOption = ref('/')
const route = useRoute()

// Définir le dashboard comme option par défaut
onMounted(() => {
  selectedOption.value = '/'
})

// Mise à jour de la sélection quand l'utilisateur change de page
watch(route, (newRoute) => {
  selectedOption.value = newRoute.path
})

// Fonction pour vérifier si une option est sélectionnée
const isActive = (path: string) => {
  return path === selectedOption.value
}

// Fonction pour gérer la sélection d'une option
const selectOption = (path: string) => {
  selectedOption.value = path
}

// Fonction pour la déconnexion
const logout = () => {
  authStore.logout()
}
</script>