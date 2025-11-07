<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Paramètres</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-700">{{ error }}</p>
    </div>

    <!-- Settings Form -->
    <div v-if="settings" class="bg-white rounded-lg shadow overflow-hidden">
      <form @submit.prevent="handleSubmit" class="divide-y divide-gray-200">
        <!-- Contact Information -->
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Informations de contact</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model="settings.email" type="email" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input v-model="settings.phone" type="tel" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        <!-- Amount Settings -->
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Paramètres des montants</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant minimum</label>
              <input v-model="settings.minimum_amount" type="number" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant minimum objectif</label>
              <input v-model="settings.minimum_amount_obj" type="number" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bonus de parrainage</label>
              <input v-model="settings.referral_bonus_amount" type="number" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Commission annulation</label>
              <input v-model="settings.cancellation_commission" type="number" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Commission terminée</label>
              <input v-model="settings.done_commission" type="number" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        <!-- Days Settings -->
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Paramètres des jours</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre minimum de jours</label>
              <input v-model="settings.minimum_days" type="number" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mode test</label>
              <div class="mt-1">
                <input v-model="settings.test_mode" type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Seuls les agents peuvent partager</label>
              <div class="mt-1">
                <input v-model="settings.only_agente_can_share" type="checkbox" class="form-checkbox h-5 w-5 text-blue-600">
              </div>
            </div>
          </div>
        </div>

        <!-- Version Settings -->
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Paramètres de version</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Version minimale</label>
              <input v-model="settings.min_version" type="number" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dernière version</label>
              <input v-model="settings.last_version" type="number" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Message de mise à jour</label>
              <textarea v-model="settings.update_message" rows="3" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">URL APK Android</label>
              <input v-model="settings.dowload_android_apk" type="url" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">URL APK iOS</label>
              <input v-model="settings.dowload_ios_apk" type="url" class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="p-6">
          <button type="submit" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" :disabled="loading">
            <span v-if="!loading">Sauvegarder les modifications</span>
            <span v-else class="flex items-center">
              <i class="fas fa-spinner animate-spin mr-2"></i>
              Enregistrement...
            </span>
          </button>
        </div>

        <!-- Success/Error Message -->
        <div v-if="successMessage" class="p-6">
          <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4" role="alert">
            <p class="font-bold">Succès</p>
            <p>{{ successMessage }}</p>
          </div>
        </div>
        <div v-if="error" class="p-6">
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
            <p class="font-bold">Erreur</p>
            <p>{{ error }}</p>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()
const { settings, loading, error } = storeToRefs(settingsStore)
const { fetchSettings, updateSettings } = settingsStore
const successMessage = ref<string | null>(null)

onMounted(() => {
  fetchSettings()
})

const handleSubmit = async () => {
  if (settings.value) {
    try {
      loading.value = true
      const success = await updateSettings(settings.value)
      if (success) {
        successMessage.value = 'Les paramètres ont été mis à jour avec succès'
        setTimeout(() => {
          successMessage.value = null
        }, 3000)
      }
    } catch (err) {
      error.value = 'Erreur lors de la mise à jour des paramètres'
    } finally {
      loading.value = false
    }
  }
}
</script>
