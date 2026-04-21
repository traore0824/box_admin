<template>
  <div class="h-screen flex flex-col">
    <div v-if="isAuthLoading" class="flex h-full items-center justify-center">
      <div>Chargement...</div>
    </div>
    <div v-else>
      <div v-if="authStore.isAuthenticated && !isFullscreenRoute" class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <Sidebar />
        
        <!-- Main Content -->
        <div class="flex-1 flex flex-col h-screen overflow-hidden">
          <!-- Top Navbar -->
          <Navbar />
          
          <!-- Page Content -->
          <main class="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 p-4 md:p-6" style="height: 0;">
            <router-view></router-view>
          </main>
          <ToastContainer />
        </div>
      </div>

      <!-- Login / 2FA / pages sans layout -->
      <router-view v-else></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRoute } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'
import Navbar from './components/layout/Navbar.vue'
import ToastContainer from './components/ToastContainer.vue'

const authStore = useAuthStore()
const route = useRoute()
const isAuthLoading = ref(true)

// Routes qui s'affichent sans le layout (sidebar/navbar)
const fullscreenRoutes = ['login', 'verify-2fa']
const isFullscreenRoute = computed(() => fullscreenRoutes.includes(route.name as string))

onBeforeMount(async () => {
  await authStore.autoLogin()
  isAuthLoading.value = false
})
</script>