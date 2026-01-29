<template>
  <div class="space-y-6 p-3 sm:p-4 md:p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Gestion des Messages de Rappel</h1>
      <button 
        @click="openCreateModal"
        class="mt-4 sm:mt-0 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <i class="fas fa-plus mr-2"></i>
        Créer un message
      </button>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Rechercher par titre ou contenu..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select 
          v-model="activeFilter"
          @change="applyFilters"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option :value="null">Tous les messages</option>
          <option :value="true">Actifs uniquement</option>
          <option :value="false">Inactifs uniquement</option>
        </select>
      </div>
    </div>

    <!-- Liste des Messages -->
    <div v-if="reminderMessagesStore.isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="reminderMessagesStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ reminderMessagesStore.error }}</p>
    </div>

    <div v-else-if="reminderMessagesStore.messages.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <i class="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
      <p class="text-gray-600">Aucun message de rappel trouvé</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de création</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="message in reminderMessagesStore.messages" :key="message.id" class="hover:bg-gray-50">
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ message.title }}</div>
                <div class="text-sm text-gray-500 truncate max-w-xs">{{ message.content }}</div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="message.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                  {{ message.active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(message.created_at) }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <button
                    @click="openEditModal(message)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Modifier"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="confirmDelete(message)"
                    class="text-red-600 hover:text-red-900"
                    title="Supprimer"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="reminderMessagesStore.totalMessages > reminderMessagesStore.itemsPerPage" class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="goToPage(reminderMessagesStore.currentPage - 1)"
            :disabled="reminderMessagesStore.currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button
            @click="goToPage(reminderMessagesStore.currentPage + 1)"
            :disabled="reminderMessagesStore.currentPage >= totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Affichage de
              <span class="font-medium">{{ (reminderMessagesStore.currentPage - 1) * reminderMessagesStore.itemsPerPage + 1 }}</span>
              à
              <span class="font-medium">{{ Math.min(reminderMessagesStore.currentPage * reminderMessagesStore.itemsPerPage, reminderMessagesStore.totalMessages) }}</span>
              sur
              <span class="font-medium">{{ reminderMessagesStore.totalMessages }}</span>
              résultats
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="goToPage(reminderMessagesStore.currentPage - 1)"
                :disabled="reminderMessagesStore.currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Page {{ reminderMessagesStore.currentPage }} sur {{ totalPages }}
              </span>
              <button
                @click="goToPage(reminderMessagesStore.currentPage + 1)"
                :disabled="reminderMessagesStore.currentPage >= totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de création/édition -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeModal">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="closeModal"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">
                  {{ editingMessage ? 'Modifier le message' : 'Créer un nouveau message' }}
                </h3>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                  <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                    Titre <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    v-model="formData.title"
                    type="text"
                    maxlength="200"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    placeholder="Ex: Rappel matinal"
                  />
                </div>

                <div>
                  <label for="content" class="block text-sm font-medium text-gray-700 mb-1">
                    Contenu <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    v-model="formData.content"
                    rows="4"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    placeholder="Ex: Bonjour {user_first_name}, pensez à épargner !"
                  ></textarea>
                  <p class="mt-1 text-xs text-gray-500">
                    Variables disponibles: {user_first_name}, {user_last_name}, {user_email}, {caisse_name}, {delay_periods}
                  </p>
                </div>

                <div>
                  <label class="flex items-center">
                    <input
                      v-model="formData.active"
                      type="checkbox"
                      class="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span class="ml-2 text-sm text-gray-700">Message actif</span>
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
                    :disabled="reminderMessagesStore.isLoading"
                    class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  >
                    {{ editingMessage ? 'Modifier' : 'Créer' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de confirmation de suppression -->
    <ConfirmationModal
      :is-open="showDeleteModal"
      title="Supprimer le message de rappel"
      :message="deleteModalMessage"
      @confirm="handleDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue'
import { useReminderMessagesStore, type ReminderMessage } from '../stores/reminderMessages'
import ConfirmationModal from '../components/ConfirmationModal.vue'

const reminderMessagesStore = useReminderMessagesStore()
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingMessage = ref<ReminderMessage | null>(null)
const messageToDelete = ref<ReminderMessage | null>(null)
const deleteModalMessage = ref('')
const searchQuery = ref('')
const activeFilter = ref<boolean | null>(null)

const formData = reactive({
  title: '',
  content: '',
  active: true
})

const totalPages = computed(() => {
  return Math.ceil(reminderMessagesStore.totalMessages / reminderMessagesStore.itemsPerPage)
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    reminderMessagesStore.updateSearchQuery(searchQuery.value)
    reminderMessagesStore.applyFilters()
  }, 500)
}

onMounted(() => {
  loadMessages()
  activeFilter.value = reminderMessagesStore.activeFilter
  searchQuery.value = reminderMessagesStore.searchQuery
})

const loadMessages = async () => {
  try {
    await reminderMessagesStore.fetchMessages(reminderMessagesStore.currentPage)
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

const openCreateModal = () => {
  editingMessage.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (message: ReminderMessage) => {
  editingMessage.value = message
  formData.title = message.title
  formData.content = message.content
  formData.active = message.active
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingMessage.value = null
  resetForm()
}

const resetForm = () => {
  formData.title = ''
  formData.content = ''
  formData.active = true
}

const handleSubmit = async () => {
  try {
    if (editingMessage.value) {
      await reminderMessagesStore.updateMessage(editingMessage.value.id, formData)
    } else {
      await reminderMessagesStore.createMessage(formData)
    }
    closeModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

const confirmDelete = (message: ReminderMessage) => {
  messageToDelete.value = message
  deleteModalMessage.value = `Êtes-vous sûr de vouloir supprimer le message "${message.title}" ? Cette action est irréversible.`
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  messageToDelete.value = null
}

const handleDelete = async () => {
  if (!messageToDelete.value) return
  
  try {
    await reminderMessagesStore.deleteMessage(messageToDelete.value.id)
    closeDeleteModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

const goToPage = async (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    try {
      await reminderMessagesStore.fetchMessages(page)
    } catch (error) {
      // L'erreur est déjà gérée dans le store
    }
  }
}

const applyFilters = () => {
  reminderMessagesStore.updateActiveFilter(activeFilter.value)
  reminderMessagesStore.applyFilters()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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

