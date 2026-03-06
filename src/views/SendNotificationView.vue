<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-2">
        <i class="fas fa-bell-plus text-primary text-xl"></i>
        <h1 class="text-2xl font-bold text-gray-900">Envoyer une Notification</h1>
      </div>
    </div>

    <!-- Notification Form -->
    <div class="bg-white rounded-lg shadow p-6">
      <!-- Title -->
      <div class="mb-6">
        <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
          Titre de la notification
        </label>
        <input id="title" v-model="notification.title" type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
          placeholder="Entrez le titre de la notification" required />
      </div>

      <!-- Content -->
      <div class="mb-6">
        <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
          Contenu de la notification
        </label>
        <textarea id="content" v-model="notification.content" rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
          placeholder="Entrez le contenu de la notification" required></textarea>
      </div>

      <!-- Canal de communication -->
      <div class="mb-6">
        <label for="channel" class="block text-sm font-medium text-gray-700 mb-2">
          Canal de communication <span class="text-red-500">*</span>
        </label>
        <select
          id="channel"
          v-model="channel"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
        >
          <option value="push">🔔 Notification Push uniquement</option>
          <option value="email">✉️ Email uniquement</option>
          <option value="both">📧 Email + Push</option>
        </select>
      </div>

      <!-- Image Upload (affiché pour push ou both) -->
      <div v-if="channel === 'push' || channel === 'both'" class="mb-6">
        <label for="image" class="block text-sm font-medium text-gray-700 mb-2">
          Image (optionnel)
        </label>
        <div class="flex items-center space-x-4">
          <input 
            id="image" 
            type="file" 
            @change="handleImageUpload"
            accept="image/*"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
          />
          <img 
            v-if="notification.image_url"
            :src="notification.image_url"
            alt="Preview"
            class="w-24 h-24 object-contain rounded border border-gray-300"
          />
        </div>
        <p v-if="uploadStore.isLoading" class="mt-2 text-sm text-gray-500">
          <i class="fas fa-spinner fa-spin mr-2"></i>
          Upload en cours...
        </p>
      </div>

      <!-- Type de destinataire -->
      <div class="mb-6">
        <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
          Destinataires <span class="text-red-500">*</span>
        </label>
        <select
          id="type"
          v-model="type"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
        >
          <option value="all">Tous les utilisateurs</option>
          <option value="single">Utilisateur spécifique</option>
        </select>

        <!-- Specific User Selection -->
        <div v-if="type === 'single'" class="mt-4">
          <!-- Search Bar -->
          <div class="flex gap-2 mb-4">
            <div class="flex-1 relative">
              <input v-model="searchQuery" type="text"
                class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
                placeholder="Rechercher par nom, prénom ou email..."
                @input="debouncedSearch && debouncedSearch()" />
              <i class="fas fa-search absolute left-3 top-2.5 h-4 w-4 text-gray-400"></i>
            </div>
          </div>

          <!-- Selected User Display -->
          <div v-if="selectedUserId" class="mb-4">
            <p class="text-sm font-medium text-gray-700 mb-2">Utilisateur sélectionné :</p>
            <div class="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-md border border-blue-200">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ getUserById(selectedUserId)?.first_name }} {{ getUserById(selectedUserId)?.last_name }}</p>
                <p class="text-xs text-gray-500">{{ getUserById(selectedUserId)?.email }}</p>
              </div>
              <button @click="selectedUserId = null" class="text-gray-400 hover:text-red-500 transition-colors">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- User List -->
          <div v-if="showUserList" class="border border-gray-200 rounded-md">
            <div class="p-3 bg-gray-50 border-b border-gray-200">
              <p class="text-sm font-medium text-gray-700">
                Sélectionner un utilisateur *
              </p>
            </div>

            <div class="max-h-64 overflow-y-auto">
              <div v-if="!usersStore.isLoading && currentUsers.length === 0" class="p-4 text-center text-gray-500">
                <p class="text-sm">Aucun utilisateur trouvé</p>
                <p class="text-xs text-gray-400">Vérifiez votre recherche ou essayez avec d'autres termes</p>
              </div>
              <div v-else-if="usersStore.isLoading" class="p-4 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p class="mt-2 text-sm text-gray-500">Chargement...</p>
              </div>
              <div v-for="user in currentUsers" :key="user.id" @click="selectUser(user)"
                class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <p class="font-semibold text-gray-900 text-sm">{{ user.first_name }}</p>
                    <span class="text-gray-600 text-sm">-</span>
                    <p class="font-semibold text-gray-900 text-sm">{{ user.last_name }}</p>
                  </div>
                  <p class="text-sm text-gray-500">{{ user.email }}</p>
                </div>
                <div v-if="selectedUserId === user.id" class="text-primary">
                  <i class="fas fa-check"></i>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1"
              class="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p class="text-sm text-gray-700">
                Page {{ currentPage }} - Total: {{ filteredUsers.length }} utilisateurs
              </p>
              <div class="flex items-center space-x-2">
                <button @click="previousPage" :disabled="currentPage === 1"
                  class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  &lt;
                </button>
                <button @click="nextPage" :disabled="currentPage === totalPages"
                  class="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Filters (Only for type='all') -->
      <div v-if="type === 'all'" class="mb-6 border border-gray-200 rounded-lg overflow-hidden">
        <button 
          @click="showAdvancedFilters = !showAdvancedFilters"
          class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center gap-2 font-medium text-gray-700">
            <i class="fas fa-filter text-primary"></i>
            Filtres avancés (Action ciblée)
          </div>
          <i class="fas" :class="showAdvancedFilters ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </button>

        <div v-if="showAdvancedFilters" class="p-6 bg-white space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- KYC Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut KYC</label>
              <select v-model="filters.kyc_status" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm">
                <option :value="null">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="accept">Accepté</option>
                <option value="reject">Rejeté</option>
              </select>
            </div>

            <!-- Account Active -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">État du compte</label>
              <select v-model="filters.is_active" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm">
                <option :value="null">Tous l'état</option>
                <option :value="true">Activé</option>
                <option :value="false">Inactif</option>
              </select>
            </div>

            <!-- Account Blocked -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Blocage</label>
              <select v-model="filters.is_block" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm">
                <option :value="null">Peu importe</option>
                <option :value="true">Utilisateurs bloqués</option>
                <option :value="false">Utilisateurs non bloqués</option>
              </select>
            </div>

            <!-- Sexe -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
              <select v-model="filters.sexe" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm">
                <option :value="null">Tous</option>
                <option value="H">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>

            <!-- Role Agent -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select v-model="filters.is_agent" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm">
                <option :value="null">Tous</option>
                <option :value="true">Agents uniquement</option>
                <option :value="false">Clients uniquement</option>
              </select>
            </div>

            <!-- Balance Range -->
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Solde (Portage)</label>
              <div class="flex items-center gap-2">
                <input v-model.number="filters.min_balance" type="number" placeholder="Min" class="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" />
                <input v-model.number="filters.max_balance" type="number" placeholder="Max" class="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" />
              </div>
            </div>
          </div>

          <!-- Boolean Filters -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="filters.has_deposit" class="w-4 h-4 text-primary rounded border-gray-300" />
              <span class="text-sm text-gray-700">A fait un dépôt</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="filters.has_withdrawal" class="w-4 h-4 text-primary rounded border-gray-300" />
              <span class="text-sm text-gray-700">A fait un retrait</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="filters.has_cancellation" class="w-4 h-4 text-primary rounded border-gray-300" />
              <span class="text-sm text-gray-700">A eu une annulation</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="filters.has_caisse" class="w-4 h-4 text-primary rounded border-gray-300" />
              <span class="text-sm text-gray-700">Possède une caisse</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="filters.has_disabled_caisse" class="w-4 h-4 text-primary rounded border-gray-300" />
              <span class="text-sm text-gray-700">A une caisse désactivée</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-4">
        <button @click="clearForm"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Annuler
        </button>
        <button @click="sendNotification" :disabled="!notification.title || !notification.content || notificationStore.isLoading || (type === 'single' && !selectedUserId)"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          :class="{ 'opacity-50 cursor-not-allowed': !notification.title || !notification.content || notificationStore.isLoading }">
          <i v-if="notificationStore.isLoading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-paper-plane"></i>
          {{ notificationStore.isLoading ? 'Envoi...' : 'Envoyer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { debounce } from 'lodash'
import { useRoute } from 'vue-router'
import { useUsersStore } from '../stores/users'
import { useNotification } from '../services/notification'
import { useNotificationStore } from '../stores/notification'
import { useUploadStore } from '../stores/upload'

const usersStore = useUsersStore()
const notificationService = useNotification()
const notificationStore = useNotificationStore()
const uploadStore = useUploadStore()

// Notification state
const notification = ref({
  title: '',
  content: '',
  image_url: '' as string | undefined
})

// Type: 'all' ou 'single'
const type = ref<'all' | 'single'>('all')

// Channel: 'email', 'push', ou 'both'
const channel = ref<'email' | 'push' | 'both'>('push')

// Selected user (pour type='single')
const selectedUserId = ref<number | null>(null)

// Search and pagination state
const searchQuery = ref('')
const showUserList = ref(false)
const currentPage = ref(1)
const usersPerPage = 10

// Advanced filters state
const showAdvancedFilters = ref(false)
const filters = ref({
  kyc_status: null as string | null,
  is_active: null as boolean | null,
  is_block: null as boolean | null,
  sexe: null as string | null,
  min_balance: null as number | null,
  max_balance: null as number | null,
  is_agent: null as boolean | null,
  has_deposit: false,
  has_withdrawal: false,
  has_cancellation: false,
  has_caisse: false,
  has_disabled_caisse: false
})

// Computed properties
const filteredUsers = computed(() => {
  return usersStore.filteredUsers
})

const totalPages = computed(() => {
  return Math.ceil(usersStore.totalUsers / usersPerPage)
})

const currentUsers = computed(() => {
  const startIndex = (currentPage.value - 1) * usersPerPage
  return filteredUsers.value.slice(startIndex, startIndex + usersPerPage)
})

// Methods
const getUserById = (id: number) => {
  return usersStore.users.find(user => user.id === id)
}

const selectUser = (user: any) => {
  selectedUserId.value = user.id
  showUserList.value = false
}

// Débogage de la recherche
const debouncedSearch = ref<ReturnType<typeof debounce> | null>(null)

onMounted(() => {
  debouncedSearch.value = debounce(async () => {
    if (!searchQuery.value.trim()) {
      showUserList.value = false
      usersStore.searchQuery = '' // Réinitialiser la recherche dans le store
      return
    }

    showUserList.value = true
    usersStore.searchQuery = searchQuery.value // Mettre à jour la recherche dans le store
    try {
      await usersStore.fetchUsers(1)
    } catch (error) {
      notificationService.addNotification('Erreur lors de la recherche des utilisateurs', 'error')
    }
  }, 300)

  // Pré-remplir les champs depuis les query params
  const route = useRoute()
  if (route.query.title) {
    notification.value.title = route.query.title as string
  }
  if (route.query.content) {
    notification.value.content = route.query.content as string
  }
  if (route.query.type) {
    type.value = route.query.type as 'all' | 'single'
  }
  if (route.query.channel) {
    channel.value = route.query.channel as 'email' | 'push' | 'both'
  }
  if (route.query.email && type.value === 'single') {
    // Rechercher l'utilisateur par email
    const userEmail = route.query.email as string
    searchQuery.value = userEmail
    showUserList.value = true
    usersStore.searchQuery = userEmail
    usersStore.fetchUsers(1).then(() => {
      // Sélectionner automatiquement l'utilisateur si trouvé
      const foundUser = usersStore.users.find(u => u.email === userEmail)
      if (foundUser) {
        selectedUserId.value = foundUser.id
        showUserList.value = false
      }
    })
  }
})

onUnmounted(() => {
  if (debouncedSearch.value) {
    debouncedSearch.value.cancel?.()
  }
})

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    usersStore.fetchUsers(currentPage.value)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    usersStore.fetchUsers(currentPage.value)
  }
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const url = await uploadStore.uploadFile(file, 'image')
    notification.value.image_url = url
    notificationService.addNotification('Image uploadée avec succès', 'success')
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

const clearForm = () => {
  notification.value = {
    title: '',
    content: '',
    image_url: undefined
  }
  type.value = 'all'
  channel.value = 'push'
  selectedUserId.value = null
  searchQuery.value = ''
  showUserList.value = false
  currentPage.value = 1
  showAdvancedFilters.value = false
  filters.value = {
    kyc_status: null,
    is_active: null,
    is_block: null,
    sexe: null,
    min_balance: null,
    max_balance: null,
    is_agent: null,
    has_deposit: false,
    has_withdrawal: false,
    has_cancellation: false,
    has_caisse: false,
    has_disabled_caisse: false
  }
}

const sendNotification = async () => {
  try {
    if (!notification.value.title || !notification.value.content) {
      notificationService.addNotification('Veuillez remplir le titre et le contenu', 'error')
      return
    }

    // Vérifier que si type='single', un utilisateur est sélectionné
    if (type.value === 'single' && !selectedUserId.value) {
      notificationService.addNotification('Veuillez sélectionner un utilisateur', 'error')
      return
    }

    // Préparer les données pour l'API
    const data: any = {
      type: type.value,
      channel: channel.value,
      title: notification.value.title,
      content: notification.value.content
    }

    // Ajouter user_id si type='single'
    if (type.value === 'single' && selectedUserId.value) {
      data.user_id = selectedUserId.value
    }

    // Ajouter l'image si elle existe
    if (notification.value.image_url) {
      data.image_url = notification.value.image_url
    }

    // Ajouter les filtres si type='all'
    if (type.value === 'all') {
      if (filters.value.kyc_status !== null) data.kyc_status = filters.value.kyc_status
      if (filters.value.is_active !== null) data.is_active = filters.value.is_active
      if (filters.value.is_block !== null) data.is_block = filters.value.is_block
      if (filters.value.sexe !== null) data.sexe = filters.value.sexe
      if (filters.value.min_balance !== null) data.min_balance = filters.value.min_balance
      if (filters.value.max_balance !== null) data.max_balance = filters.value.max_balance
      if (filters.value.is_agent !== null) data.is_agent = filters.value.is_agent
      if (filters.value.has_deposit) data.has_deposit = true
      if (filters.value.has_withdrawal) data.has_withdrawal = true
      if (filters.value.has_cancellation) data.has_cancellation = true
      if (filters.value.has_caisse) data.has_caisse = true
      if (filters.value.has_disabled_caisse) data.has_disabled_caisse = true
    }

    // Envoyer la notification
    const result = await notificationStore.sendNotification(data)
    
    // Message de succès personnalisé
    let successMessage = 'Notification envoyée avec succès !'
    if (channel.value === 'email') {
      successMessage = 'Email envoyé avec succès !'
    } else if (channel.value === 'push') {
      successMessage = 'Notification push envoyée avec succès !'
    } else if (channel.value === 'both') {
      successMessage = 'Email et notification push envoyés avec succès !'
    }
    
    notificationService.addNotification(successMessage, 'success')
    clearForm()
  } catch (error) {
    console.error('Error sending notification:', error)
    notificationService.addNotification(
      error instanceof Error ? error.message : 'Erreur lors de l\'envoi',
      'error'
    )
  }
}
</script>

<style scoped>
.bg-primary {
  @apply bg-blue-600;
}

.text-primary {
  @apply text-blue-600;
}

.hover\:bg-primary-700:hover {
  @apply bg-blue-700;
}

.focus\:ring-primary:focus {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}

.focus\:border-primary:focus {
  @apply border-blue-500;
}
</style>