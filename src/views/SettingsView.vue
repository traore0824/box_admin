<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ isCustomerService ? 'Gestion des Messages de Rappel' : 'Paramètres Globaux' }}
      </h1>
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
        <div v-if="isStaff" class="p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Informations de contact</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email support</label>
              <input 
                v-model="settings.email" 
                type="email" 
                maxlength="100"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone support</label>
              <input 
                v-model="settings.phone" 
                type="tel" 
                maxlength="120"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        <!-- Amount Settings -->
        <div v-if="isStaff" class="p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Paramètres des montants</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant minimum transaction</label>
              <input 
                v-model.number="settings.minimum_amount" 
                type="number" 
                step="0.01"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant minimum objectif caisse</label>
              <input 
                v-model.number="settings.minimum_amount_obj" 
                type="number" 
                step="0.01"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bonus de parrainage</label>
              <input 
                v-model.number="settings.referral_bonus_amount" 
                type="number" 
                step="0.01"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre minimum de jours</label>
              <input 
                v-model.number="settings.minimum_days" 
                type="number" 
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Frais de Transaction sur les retrait</label>
              <input 
                v-model.number="settings.operation_fee" 
                type="number" 
                step="0.01"
                min="0"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        <!-- Commissions -->
        <div v-if="isStaff" class="p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Commissions (%)</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Commission sur Caisse libre annuler (%)</label>
              <input 
                v-model.number="settings.cancellation_commission" 
                type="number" 
                step="0.01"
                min="0"
                max="100"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Commission sur caisse Terminer (%)</label>
              <input 
                v-model.number="settings.done_commission" 
                type="number" 
                step="0.01"
                min="0"
                max="100"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Commission sur caisse bloquer annuler (%)</label>
              <input 
                v-model.number="settings.cancel_block_commission" 
                type="number" 
                step="0.01"
                min="0"
                max="100"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        <!-- Other Settings -->
        <div v-if="isStaff" class="p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Autres paramètres</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Seuls les agents peuvent partager</label>
              <div class="mt-1">
                <label class="inline-flex items-center">
                  <input 
                    v-model="settings.only_agente_can_share" 
                    type="checkbox" 
                    class="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Activé</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mode test</label>
              <div class="mt-1">
                <label class="inline-flex items-center">
                  <input 
                    v-model="settings.test_mode" 
                    type="checkbox" 
                    class="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Activé</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Reminders - Daily -->
        <div class="p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Rappels Quotidiens (8h, 14h, 21h)</h2>
          <p class="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Messages envoyés aux utilisateurs avec des caisses quotidiennes en attente</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Matin (8h)</label>
              <MessageListEditor v-model="settings.reminreminder_day_morning" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_day_morning_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Après-midi (14h)</label>
              <MessageListEditor v-model="settings.reminreminder_day_afternoon" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_day_afternoon_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Soir (21h)</label>
              <MessageListEditor v-model="settings.reminreminder_day_evening" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_day_evening_image" />
              </div>
            </div>
          </div>
        </div>

        <!-- Reminders - Weekly -->
        <div class="p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Rappels Hebdomadaires (8h, 14h, 21h)</h2>
          <p class="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Messages envoyés aux utilisateurs avec des caisses hebdomadaires en attente</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Matin (8h)</label>
              <MessageListEditor v-model="settings.reminreminder_week_morning" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_week_morning_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Après-midi (14h)</label>
              <MessageListEditor v-model="settings.reminreminder_week_afternoon" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_week_afternoon_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Soir (21h)</label>
              <MessageListEditor v-model="settings.reminreminder_week_evening" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_week_evening_image" />
              </div>
            </div>
          </div>
        </div>

        <!-- Reminders - Monthly -->
        <div class="p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Rappels Mensuels (8h, 14h, 21h)</h2>
          <p class="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Messages envoyés aux utilisateurs avec des caisses mensuelles en attente</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Matin (8h)</label>
              <MessageListEditor v-model="settings.reminreminder_month_morning" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_month_morning_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Après-midi (14h)</label>
              <MessageListEditor v-model="settings.reminreminder_month_afternoon" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_month_afternoon_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Soir (21h)</label>
              <MessageListEditor v-model="settings.reminreminder_month_evening" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_month_evening_image" />
              </div>
            </div>
          </div>
        </div>

        <!-- Motivation Messages -->
        <div class="p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Messages de Motivation (8h, 14h, 21h)</h2>
          <p class="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Messages envoyés aux utilisateurs actifs qui n'ont aucune caisse en attente pour les motiver à en créer une</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Matin (8h)</label>
              <MessageListEditor v-model="settings.motivation_no_caisse_morning" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.motivation_no_caisse_morning_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Après-midi (14h)</label>
              <MessageListEditor v-model="settings.motivation_no_caisse_afternoon" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.motivation_no_caisse_afternoon_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Soir (21h)</label>
              <MessageListEditor v-model="settings.motivation_no_caisse_evening" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.motivation_no_caisse_evening_image" />
              </div>
            </div>
          </div>
        </div>

        <!-- Version Settings -->
        <div v-if="isStaff" class="p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Paramètres de version</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Version minimale requise</label>
              <input 
                v-model.number="settings.min_version" 
                type="number" 
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dernière version disponible</label>
              <input 
                v-model.number="settings.last_version" 
                type="number" 
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Message de mise à jour</label>
              <textarea 
                v-model="settings.update_message" 
                rows="3" 
                maxlength="250"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Message affiché lors de la mise à jour..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Download Links -->
        <div v-if="isStaff" class="p-4 sm:p-6">
          <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Liens de téléchargement</h2>
          <div class="grid grid-cols-1 gap-4 sm:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lien téléchargement Android</label>
              <input 
                v-model="settings.dowload_android_apk" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="https://..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lien téléchargement iOS</label>
              <input 
                v-model="settings.dowload_ios_apk" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="https://..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lien téléchargement générique</label>
              <input 
                v-model="settings.dowload_apk_link" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="p-4 sm:p-6 bg-gray-50">
          <button 
            type="submit" 
            class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" 
            :disabled="loading"
          >
            <span v-if="!loading" class="flex items-center">
              <i class="fas fa-save mr-2"></i>
              Sauvegarder les modifications
            </span>
            <span v-else class="flex items-center">
              <i class="fas fa-spinner animate-spin mr-2"></i>
              Enregistrement...
            </span>
          </button>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="p-6 bg-green-50">
          <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg" role="alert">
            <p class="font-bold">✓ Succès</p>
            <p>{{ successMessage }}</p>
          </div>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../stores/settings'
import { useAuthStore } from '../stores/auth'
import MessageListEditor from '../components/settings/MessageListEditor.vue'
import ImageUploader from '../components/settings/ImageUploader.vue'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const { settings, loading, error } = storeToRefs(settingsStore)
const { fetchSettings, updateSettings } = settingsStore
const successMessage = ref<string | null>(null)

// Vérifier si l'utilisateur est admin (staff) ou service client
const isStaff = computed(() => authStore.user?.is_staff === true)
const isCustomerService = computed(() => !isStaff.value)

onMounted(() => {
  fetchSettings()
})

const handleSubmit = async () => {
  if (settings.value) {
    try {
      successMessage.value = null
      const success = await updateSettings(settings.value)
      if (success) {
        successMessage.value = 'Les paramètres ont été mis à jour avec succès'
        setTimeout(() => {
          successMessage.value = null
        }, 5000)
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err)
    }
  }
}

</script>
