<template>
  <div class="max-w-xl mx-auto space-y-6">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Changer le mot de passe</h1>
      <p class="text-sm text-gray-600 mt-1">
        Après le changement, vous serez déconnecté et devrez vous reconnecter.
      </p>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="old-password" class="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe actuel
          </label>
          <div class="relative">
            <input
              id="old-password"
              v-model="oldPassword"
              :type="showOldPassword ? 'text' : 'password'"
              class="input pr-10"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              @click="showOldPassword = !showOldPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i :class="showOldPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div>
          <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">
            Nouveau mot de passe
          </label>
          <div class="relative">
            <input
              id="new-password"
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              class="input pr-10"
              placeholder="••••••••"
              required
              minlength="8"
              autocomplete="new-password"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Au moins 8 caractères, une majuscule, une minuscule et un chiffre.
          </p>
        </div>

        <div>
          <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le nouveau mot de passe
          </label>
          <div class="relative">
            <input
              id="confirm-password"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="input pr-10"
              placeholder="••••••••"
              required
              minlength="8"
              autocomplete="new-password"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div v-if="localError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {{ localError }}
        </div>

        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="btn btn-primary w-full sm:w-auto"
            :class="{ 'opacity-50 cursor-not-allowed': authStore.isLoading }"
          >
            <i v-if="authStore.isLoading" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-key mr-2"></i>
            Changer le mot de passe
          </button>
          <router-link to="/" class="btn btn-outline w-full sm:w-auto text-center">
            Annuler
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotification } from '../services/notification'

const authStore = useAuthStore()
const router = useRouter()
const notification = useNotification()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const localError = ref<string | null>(null)
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

async function handleSubmit() {
  localError.value = null

  if (newPassword.value !== confirmPassword.value) {
    localError.value = 'Les mots de passe ne correspondent pas'
    return
  }

  try {
    await authStore.changePassword(
      oldPassword.value,
      newPassword.value,
      confirmPassword.value
    )
    notification.addNotification(
      'Mot de passe modifié avec succès. Veuillez vous reconnecter.',
      'success',
      5000
    )
    router.push({ name: 'login', query: { message: 'Mot de passe modifié. Reconnectez-vous.' } })
  } catch (err) {
    localError.value = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe'
  }
}
</script>
