<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="bg-white rounded-lg shadow-lg p-16 w-[48rem] h-auto min-h-[28rem]">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-600 mb-2">BOX</h1>
        <p class="text-gray-600">Connectez-vous à votre compte</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
            placeholder="email"
            required
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 pr-12"
              placeholder="••••"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          :class="{ 'opacity-50 cursor-not-allowed': authStore.isLoading }"
        >
          <span v-if="!authStore.isLoading">Connexion</span>
          <span v-else>Loading...</span>
        </button>
      </form>

      <div v-if="authStore.error" class="mt-4 text-red-600 text-center">
        {{ authStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

async function handleLogin() {
  try {
    await authStore.login(email.value, password.value)
    await router.push({ name: 'dashboard' })
  } catch (err) {
    // L'erreur est déjà gérée dans le store
  }
}

// Auto-login si des tokens existent
authStore.autoLogin()
</script>