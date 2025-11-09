<template>
  <header class="bg-white border-b border-gray-200 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6">
    <!-- Mobile menu button -->
    <button 
      @click="isMobileMenuOpen = !isMobileMenuOpen" 
      class="text-gray-500 hover:text-gray-600 sm:hidden"
    >
      <i class="fas fa-bars text-xl"></i>
    </button>

    <!-- Mobile menu -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-50"
      @click="isMobileMenuOpen = false"
    >
      <div class="fixed inset-y-0 right-0 w-full sm:w-64 bg-white shadow-lg z-50 p-4">
        <button 
          @click="isMobileMenuOpen = false" 
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-600"
        >
          <i class="fas fa-times text-xl"></i>
        </button>

        <!-- Menu items -->
        <nav class="mt-8">
          <router-link 
            v-for="route in routes" 
            :key="route.path" 
            :to="route.path" 
            class="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            @click="isMobileMenuOpen = false"
          >
            {{ route.meta?.title || route.name }}
          </router-link>
        </nav>
      </div>
    </div>
    
    <!-- Page title -->
    <h1 class="text-lg md:text-xl font-semibold text-gray-800 hidden md:block">
      {{ pageTitle }}
    </h1>
    
    <!-- Right side controls -->
    <div class="flex items-center space-x-4">
      <!-- Notifications -->
      <div class="relative">
        <button 
          @click="toggleNotifications" 
          class="relative p-2 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <i class="fas fa-bell"></i>
          <span 
            v-if="unreadCount > 0" 
            class="absolute top-0 right-0 w-5 h-5 bg-danger text-white rounded-full text-xs flex items-center justify-center"
          >
            {{ unreadCount }}
          </span>
        </button>
        
        <!-- Dropdown -->
        <div 
          v-if="isNotificationsOpen"
          class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-dropdown border border-gray-200 z-10"
        >
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="font-medium">Notifications</h3>
            <button 
              @click="markAllAsRead" 
              class="text-xs text-primary hover:text-primary-dark"
            >
              Marquer tout comme lu
            </button>
          </div>
          
          <div class="max-h-96 overflow-y-auto">
            <div 
              v-for="notification in recentNotifications" 
              :key="notification.id"
              class="p-4 border-b border-gray-100 flex hover:bg-gray-50"
              :class="{ 'bg-blue-50': (notification as any).status === 'pending' }"
            >
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                :class="{
                  'bg-success-light text-success-dark': notification.type === 'success',
                  'bg-warning-light text-warning-dark': notification.type === 'warning',
                  'bg-danger-light text-danger-dark': notification.type === 'danger',
                  'bg-info-light text-info-dark': notification.type === 'info'
                }"
              >
                <i 
                  :class="{
                    'fas fa-check': notification.type === 'success',
                    'fas fa-exclamation-triangle': notification.type === 'warning',
                    'fas fa-times': notification.type === 'danger',
                    'fas fa-info': notification.type === 'info'
                  }"
                ></i>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ notification.title }}</p>
                <p class="text-xs text-gray-500">{{ notification.content }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ new Date(notification.created_at).toLocaleDateString('fr-FR') }} · {{ new Date(notification.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</p>
              </div>
            </div>
          </div>
          
          <div class="p-3 text-center border-t border-gray-200">
            <router-link 
              to="/notifications"
              class="text-sm text-primary hover:text-primary-dark"
              @click="isNotificationsOpen = false"
            >
              Voir toutes les notifications
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Paramètres -->
      <div class="relative">
        <button 
          @click="toggleSettings" 
          class="p-2 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <i class="fas fa-cog"></i>
        </button>
        
        <!-- Dropdown -->
        <div 
          v-if="isSettingsOpen"
          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-dropdown border border-gray-200 z-10"
        >
          <div class="py-2">
            <router-link 
              to="/settings"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              @click="isSettingsOpen = false"
            >
              <i class="fas fa-cog mr-2"></i> Paramètres
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Profile -->
      <div class="relative">
        <button 
          @click="toggleProfile" 
          class="flex items-center space-x-2 sm:space-x-4"
        >
          <AvatarIcon class="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
          <span class="text-sm font-medium text-gray-700 hidden sm:block truncate max-w-[120px] md:max-w-none">{{ authStore.user?.name || `${authStore.user?.first_name || ''} ${authStore.user?.last_name || ''}`.trim() || authStore.user?.email }}</span>
          <i class="fas fa-chevron-down text-xs text-gray-500 hidden md:block flex-shrink-0"></i>
        </button>
        
        <!-- Dropdown -->
        <div 
          v-if="isProfileOpen"
          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-dropdown border border-gray-200 z-10"
        >
          <div class="py-2">
            <router-link 
              to="/settings"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              @click="isProfileOpen = false"
            >
              <i class="fas fa-cog mr-2"></i> Paramètres
            </router-link>
            <button 
              @click="logout" 
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <i class="fas fa-sign-out-alt mr-2"></i> Déconnexion
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '../../stores/notifications'
import { useRoute, useRouter } from 'vue-router'
import AvatarIcon from '../AvatarIcon.vue'

const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const router = useRouter()
const route = useRoute()

const isNotificationsOpen = ref(false)
const isProfileOpen = ref(false)
const isMobileMenuOpen = ref(false)
const isSettingsOpen = ref(false)

const unreadCount = computed(() => {
  // Calculer le nombre de notifications non lues
  return notificationsStore.notifications.filter(n => (n as any).status === 'pending').length
})
const recentNotifications = computed(() => {
  // Retourner les notifications récentes
  return notificationsStore.notifications.slice(0, 5)
})

// Get all routes from router
const routes = computed(() => {
  return router.getRoutes().filter(route => route.meta?.title)
})

const pageTitle = computed(() => {
  return route.meta?.title || 'Dashboard'
})

// Toggle notifications dropdown
const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value
  if (isNotificationsOpen.value) {
    isSettingsOpen.value = false
    isProfileOpen.value = false
  }
}

// Toggle settings dropdown
const toggleSettings = () => {
  isSettingsOpen.value = !isSettingsOpen.value
  if (isSettingsOpen.value) {
    isNotificationsOpen.value = false
    isProfileOpen.value = false
  }
}

// Toggle profile dropdown
const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value
  isNotificationsOpen.value = false
  isMobileMenuOpen.value = false
  isSettingsOpen.value = false
}

// Mark all notifications as read
const markAllAsRead = () => {
  // Mettre à jour le statut des notifications localement
  notificationsStore.notifications.forEach(n => {
    if ((n as any).status === 'pending') {
      (n as any).status = 'sent'
    }
  })
}

// Logout function
const logout = () => {
  authStore.logout()
  router.push('/login')
}

// Close dropdowns on route change
watch(
  () => route.path,
  () => {
    isNotificationsOpen.value = false
    isProfileOpen.value = false
    isSettingsOpen.value = false
    isMobileMenuOpen.value = false
  }
)
</script>