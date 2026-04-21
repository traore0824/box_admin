<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="bg-white rounded-lg shadow-lg p-16 w-[48rem] h-auto min-h-[28rem]">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-shield-alt text-3xl text-primary-600"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Vérification 2FA</h1>
        <p class="text-gray-600">Entrez le code de votre application d'authentification</p>
      </div>

      <form @submit.prevent="handleVerify" class="space-y-6">
        <div>
          <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
            Code TOTP
          </label>
          <input
            id="code"
            v-model="code"
            type="text"
            inputmode="numeric"
            maxlength="6"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 text-center text-2xl tracking-widest font-mono"
            placeholder="000000"
            required
            autofocus
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading || code.length !== 6"
          class="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="isLoading" class="fas fa-spinner fa-spin mr-2"></i>
          <span>{{ isLoading ? 'Vérification...' : 'Vérifier' }}</span>
        </button>

        <button
          type="button"
          @click="handleLogout"
          class="w-full text-gray-500 hover:text-gray-700 text-sm text-center"
        >
          Se déconnecter
        </button>
      </form>

      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center text-sm">
        {{ error }}
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

const code = ref('')
const isLoading = ref(false)
const error = ref('')

async function handleVerify() {
  if (code.value.length !== 6) return

  try {
    isLoading.value = true
    error.value = ''
    await authStore.verify2FA(code.value)
    const isStaff = authStore.user?.is_staff === true
    await router.push({ name: isStaff ? 'dashboard' : 'users' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Code invalide'
    code.value = ''
  } finally {
    isLoading.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>
