<template>
  <div class="bg-white border-r border-gray-200 w-[260px] hidden md:block relative h-screen flex flex-col">
    <!-- Logo -->
    <div class="h-16 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
      <h1 class="text-2xl font-bold text-primary">BOX Admin</h1>
    </div>
    
    <!-- Navigation -->
    <nav class="mt-6 px-4 flex-1 overflow-y-auto pb-32">
      <ul class="space-y-1">
        <li v-for="item in filteredMenuItems" :key="item.path">
          <router-link 
            :to="item.path" 
            class="flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors"
            :class="{ 'bg-primary-50 text-primary font-medium': isActive(item.path) }"
          >
            <i :class="item.icon" class="mr-3 text-lg flex-shrink-0"></i>
            <span class="truncate">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <!-- User Section -->
    <div class="border-t border-gray-200 py-4 px-6 bg-white flex-shrink-0">
      <div class="flex items-center space-x-3 mb-4">
        <AvatarIcon class="w-10 h-10 flex-shrink-0" />
        <div class="min-w-0 flex-1">
          <p class="font-medium text-gray-800 truncate">{{ authStore.user?.name || `${authStore.user?.first_name || ''} ${authStore.user?.last_name || ''}`.trim() || authStore.user?.email }}</p>
          <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
        </div>
      </div>
      <button 
        @click="logout" 
        class="flex items-center text-gray-600 hover:text-primary transition-colors w-full"
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
    class="fixed inset-y-0 left-0 w-full bg-white z-40 md:hidden flex flex-col"
  >
    <!-- Logo -->
    <div class="h-16 border-b border-gray-200 flex items-center justify-center flex-shrink-0">
      <h1 class="text-2xl font-bold text-primary">BOX Admin</h1>
    </div>
    
    <!-- Navigation -->
    <nav class="mt-6 px-4 flex-1 overflow-y-auto pb-40">
      <ul class="space-y-1">
        <li v-for="item in filteredMenuItems" :key="item.path">
          <router-link 
            :to="item.path" 
            class="flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors relative"
            :class="{ 'bg-primary-50 text-primary font-medium': isActive(item.path) }"
            :style="isActive(item.path) ? {
              'box-shadow': 'inset 0 0 0 2px rgba(188, 138, 26, 0.3)'
            } : {}"
            @click="selectOption(item.path); isMobileMenuOpen = false"
          >
            <i :class="item.icon" class="mr-3 text-lg flex-shrink-0"></i>
            <span class="truncate">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <!-- Mobile User Section -->
    <div class="border-t border-gray-200 py-4 px-6 bg-white flex-shrink-0">
      <div class="flex items-center space-x-3 mb-4">
        <img 
          :src="authStore.user?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'" 
          alt="User Avatar" 
          class="w-10 h-10 rounded-full flex-shrink-0"
        >
        <div class="min-w-0 flex-1">
          <p class="font-medium text-gray-800 truncate">{{ authStore.user?.name || `${authStore.user?.first_name || ''} ${authStore.user?.last_name || ''}`.trim() || authStore.user?.email }}</p>
          <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
        </div>
      </div>
      <button 
        @click="logout" 
        class="flex items-center text-gray-600 hover:text-primary transition-colors w-full"
      >
        <i class="fas fa-sign-out-alt mr-2"></i> Logout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { menuItems } from '../../config/menu'
import AvatarIcon from '../AvatarIcon.vue'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)
const selectedOption = ref('/')
const route = useRoute()

// Filtrer le menu selon le rôle : CustomerService ne voit pas certaines sections
const filteredMenuItems = computed(() => {
  const isStaff = authStore.user?.is_staff === true
  if (isStaff) {
    return menuItems
  }
  // CustomerService : masquer le dashboard, le wallet et les commissions
  const hiddenPaths = ['/', '/wallets', '/commissions']
  return menuItems.filter(item => !hiddenPaths.includes(item.path))
})

// Définir le dashboard comme option par défaut (ou users pour CustomerService)
onMounted(() => {
  const isStaff = authStore.user?.is_staff === true
  selectedOption.value = isStaff ? '/' : '/users'
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