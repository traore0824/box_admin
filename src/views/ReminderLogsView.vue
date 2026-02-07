<template>
  <div class="space-y-6 p-3 sm:p-4 md:p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Rappels non envoyés</h1>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Rechercher par email utilisateur ou nom de caisse..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <input
            v-model="dateFilter"
            @change="applyFilters"
            type="date"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <select
            v-model="successFilter"
            @change="applyFilters"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option :value="null">Tous les statuts</option>
            <option :value="false">Échecs uniquement</option>
            <option :value="true">Succès uniquement</option>
          </select>
        </div>
        <button
          @click="clearFilters"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <i class="fas fa-times mr-2"></i>
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Liste des Logs -->
    <div v-if="reminderLogsStore.isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="reminderLogsStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ reminderLogsStore.error }}</p>
    </div>

    <div v-else-if="reminderLogsStore.logs.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <i class="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
      <p class="text-gray-600">Aucun log de rappel trouvé</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caisse</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Canal</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programmé le</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Envoyé le</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="log in reminderLogsStore.logs" :key="log.id" class="hover:bg-gray-50">
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ log.user_email }}</div>
                <div class="text-sm text-gray-500">ID: {{ log.user }}</div>

              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ log.caisse_name }}</div>
                <div class="text-sm text-gray-500">ID: {{ log.caisse }}</div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getChannelClass(log.channel)">
                  {{ getChannelLabel(log.channel) }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDateTime(log.scheduled_at) }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ log.sent_at ? formatDateTime(log.sent_at) : 'Non envoyé' }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ log.success ? 'Succès' : 'Échec' }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="openEditModal(log)"
                  class="text-blue-600 hover:text-blue-900"
                  title="Modifier"
                >
                  <i class="fas fa-edit"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="reminderLogsStore.totalLogs > reminderLogsStore.itemsPerPage" class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="goToPage(reminderLogsStore.currentPage - 1)"
            :disabled="reminderLogsStore.currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button
            @click="goToPage(reminderLogsStore.currentPage + 1)"
            :disabled="reminderLogsStore.currentPage >= totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Affichage de
              <span class="font-medium">{{ (reminderLogsStore.currentPage - 1) * reminderLogsStore.itemsPerPage + 1 }}</span>
              à
              <span class="font-medium">{{ Math.min(reminderLogsStore.currentPage * reminderLogsStore.itemsPerPage, reminderLogsStore.totalLogs) }}</span>
              sur
              <span class="font-medium">{{ reminderLogsStore.totalLogs }}</span>
              résultats
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="goToPage(reminderLogsStore.currentPage - 1)"
                :disabled="reminderLogsStore.currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Page {{ reminderLogsStore.currentPage }} sur {{ totalPages }}
              </span>
              <button
                @click="goToPage(reminderLogsStore.currentPage + 1)"
                :disabled="reminderLogsStore.currentPage >= totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de modification -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeModal">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="closeModal"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">
                  Modifier le log de rappel
                </h3>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                  <label for="sent_at" class="block text-sm font-medium text-gray-700 mb-1">
                    Date et heure d'envoi
                  </label>
                  <input
                    id="sent_at"
                    v-model="formData.sent_at"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  />
                  <p class="mt-1 text-xs text-gray-500">Laissez vide si non envoyé</p>
                </div>

                <div>
                  <label class="flex items-center">
                    <input
                      v-model="formData.success"
                      type="checkbox"
                      class="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span class="ml-2 text-sm text-gray-700">Envoi réussi</span>
                  </label>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    :disabled="reminderLogsStore.isLoading"
                    class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  >
                    Modifier
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useReminderLogsStore, type ReminderLog } from '../stores/reminderLogs'

import { debounce } from 'lodash'

const reminderLogsStore = useReminderLogsStore()
const showModal = ref(false)
const editingLog = ref<ReminderLog | null>(null)

const searchQuery = ref('')
const dateFilter = ref<string | null>(null)
const successFilter = ref<boolean | null>(null)

const formData = ref({
  sent_at: '',
  success: true
})

const totalPages = computed(() => {
  return Math.ceil(reminderLogsStore.totalLogs / reminderLogsStore.itemsPerPage)
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    reminderLogsStore.updateSearchQuery(searchQuery.value)
    reminderLogsStore.applyFilters()
  }, 500)
}

onMounted(() => {
  loadLogs()
  dateFilter.value = reminderLogsStore.dateFilter
  searchQuery.value = reminderLogsStore.searchQuery
  successFilter.value = reminderLogsStore.successFilter
})

const loadLogs = async () => {
  try {
    await reminderLogsStore.fetchLogs(reminderLogsStore.currentPage)
    

  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}



const openEditModal = (log: ReminderLog) => {
  editingLog.value = log
  formData.value = {
    sent_at: log.sent_at ? formatDateTimeLocal(log.sent_at) : '',
    success: log.success
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingLog.value = null
  formData.value = {
    sent_at: '',
    success: true
  }
}

const handleSubmit = async () => {
  if (!editingLog.value) return

  try {
    const updateData: any = {
      success: formData.value.success
    }

    if (formData.value.sent_at) {
      // Convertir le datetime-local en format ISO
      updateData.sent_at = new Date(formData.value.sent_at).toISOString()
    } else {
      updateData.sent_at = null
    }

    await reminderLogsStore.updateLog(editingLog.value.id, updateData)
    closeModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

const goToPage = async (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    try {
      await reminderLogsStore.fetchLogs(page)
    } catch (error) {
      // L'erreur est déjà gérée dans le store
    }
  }
}

const applyFilters = () => {
  reminderLogsStore.updateDateFilter(dateFilter.value)
  reminderLogsStore.updateSuccessFilter(successFilter.value)
  reminderLogsStore.applyFilters()
}

const clearFilters = () => {
  searchQuery.value = ''
  dateFilter.value = null
  successFilter.value = null
  reminderLogsStore.updateSearchQuery('')
  reminderLogsStore.updateDateFilter(null)
  reminderLogsStore.updateSuccessFilter(null)
  reminderLogsStore.applyFilters()
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTimeLocal = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const getChannelLabel = (channel: string) => {
  const labels: Record<string, string> = {
    push: 'Push',
    email: 'Email',
    call: 'Appel'
  }
  return labels[channel] || channel
}

const getChannelClass = (channel: string) => {
  const classes: Record<string, string> = {
    push: 'bg-blue-100 text-blue-800',
    email: 'bg-green-100 text-green-800',
    call: 'bg-orange-100 text-orange-800'
  }
  return classes[channel] || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
.bg-primary {
  @apply bg-blue-600;
}

.bg-primary-700 {
  @apply bg-blue-700;
}

.text-primary {
  @apply text-blue-600;
}

.focus\:ring-primary:focus {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}

.focus\:border-primary:focus {
  @apply border-blue-500;
}
</style>

