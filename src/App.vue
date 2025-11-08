<template>
  <div class="h-screen flex flex-col">
    <div v-if="isAuthLoading" class="flex h-full items-center justify-center">
      <div>Chargement...</div>
    </div>
    <div v-else>
      <div v-if="authStore.isAuthenticated" class="flex h-full">
        <!-- Sidebar -->
        <Sidebar />
        
        <!-- Main Content -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <!-- Top Navbar -->
          <Navbar />
          
          <!-- Page Content -->
          <main class="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
            <router-view></router-view>
          </main>
          <ToastContainer />
        </div>
      </div>

      <!-- Login Screen -->
      <router-view v-else></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useAuthStore } from './stores/auth'
import Sidebar from './components/layout/Sidebar.vue'
import Navbar from './components/layout/Navbar.vue'
import ToastContainer from './components/ToastContainer.vue'

const authStore = useAuthStore()
const isAuthLoading = ref(true)

onBeforeMount(async () => {
  await authStore.autoLogin()
  isAuthLoading.value = false
})
</script>