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

      <!-- Image Upload -->
      <div class="mb-6">
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

      <!-- Type de message -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Type de message <span class="text-red-500">*</span>
        </label>
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <input 
              id="type-notification" 
              v-model="messageType" 
              type="radio" 
              value="notification"
              class="h-4 w-4 text-primary border-gray-300" 
            />
            <label for="type-notification" class="ml-2 text-sm text-gray-700">
              <i class="fas fa-bell mr-2"></i>
              Notification Push
            </label>
          </div>
          <div class="flex items-center">
            <input 
              id="type-email" 
              v-model="messageType" 
              type="radio" 
              value="email"
              class="h-4 w-4 text-primary border-gray-300"
            />
            <label 
              for="type-email" 
              class="ml-2 text-sm text-gray-700"
            >
              <i class="fas fa-envelope mr-2"></i>
              Email
            </label>
          </div>
        </div>
      </div>

      <!-- Champs Email (affichés si le type est email) -->
      <div v-if="messageType === 'email'" class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <div>
            <label for="highlight-text" class="block text-sm font-medium text-gray-700 mb-2">
              Texte mis en évidence (optionnel)
            </label>
            <input 
              id="highlight-text" 
              v-model="emailData.highlight_text" 
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
              placeholder="Ex: Réduction de 50%"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="button-text" class="block text-sm font-medium text-gray-700 mb-2">
                Texte du bouton (optionnel)
              </label>
              <input 
                id="button-text" 
                v-model="emailData.button_text" 
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
                placeholder="Ex: Voir l'offre"
              />
            </div>
            <div>
              <label for="button-url" class="block text-sm font-medium text-gray-700 mb-2">
                URL du bouton (optionnel)
              </label>
              <input 
                id="button-url" 
                v-model="emailData.button_url" 
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
                placeholder="https://app.example.com/promo"
              />
            </div>
          </div>

          <div>
            <label for="email-image-url" class="block text-sm font-medium text-gray-700 mb-2">
              URL de l'image pour l'email (optionnel)
            </label>
            <input 
              id="email-image-url" 
              v-model="emailData.image_url" 
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
              placeholder="https://example.com/image.jpg"
            />
            <p class="mt-1 text-xs text-gray-500">
              Si non renseigné, l'image de la notification sera utilisée
            </p>
          </div>

          <div>
            <label for="template-name" class="block text-sm font-medium text-gray-700 mb-2">
              Nom du template (optionnel)
            </label>
            <input 
              id="template-name" 
              v-model="emailData.template_name" 
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
              placeholder="Ex: marketing_notification.html"
            />
            <p class="mt-1 text-xs text-gray-500">
              Par défaut: marketing_notification.html
            </p>
          </div>
      </div>

      <!-- Recipients Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Destinataires
        </label>
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <input id="all-users" v-model="notification.recipientType" type="radio" value="all"
              class="h-4 w-4 text-primary border-gray-300" />
            <label for="all-users" class="ml-2 text-sm text-gray-700">
              Tous les utilisateurs
            </label>
          </div>
          <div class="flex items-center">
            <input id="specific-user" v-model="notification.recipientType" type="radio" value="specific"
              class="h-4 w-4 text-primary border-gray-300" />
            <label for="specific-user" class="ml-2 text-sm text-gray-700">
              Utilisateur spécifique
            </label>
          </div>
        </div>

        <!-- Specific User Selection -->
        <div v-if="notification.recipientType === 'specific'" class="mt-4">
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

          <!-- Selected Users Display -->
          <div v-if="notification.selectedUsers.length > 0" class="mb-4">
            <p class="text-sm font-medium text-gray-700 mb-2">Utilisateurs sélectionnés :</p>
            <div class="space-y-2">
              <div v-for="userId in notification.selectedUsers" :key="userId"
                class="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-md border border-blue-200">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ getUserById(userId)?.first_name }} {{ getUserById(userId)?.last_name }}</p>
                  <p class="text-xs text-gray-500">{{ getUserById(userId)?.email }}</p>
                </div>
                <button @click="removeUser(userId)" class="text-gray-400 hover:text-red-500 transition-colors">
                  <i class="fas fa-times"></i>
                </button>
              </div>
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
                <div v-if="notification.selectedUsers.includes(user.id)" class="text-primary">
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

      <!-- Actions -->
      <div class="flex justify-end space-x-4">
        <button @click="clearForm"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Annuler
        </button>
        <button @click="sendNotification" :disabled="!notification.title || !notification.content || notificationStore.isLoading"
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
  recipientType: 'all' as 'all' | 'specific',
  selectedUsers: [] as number[],
  image_url: '' as string | undefined
})

// Message type (notification or email)
const messageType = ref<'notification' | 'email'>('notification')

// Email state
const emailData = ref({
  highlight_text: '',
  button_text: '',
  button_url: '',
  image_url: '',
  template_name: ''
})

// Search and pagination state
const searchQuery = ref('')
const showUserList = ref(false)
const currentPage = ref(1)
const usersPerPage = 10

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
  if (notification.value.selectedUsers.includes(user.id)) {
    notification.value.selectedUsers = notification.value.selectedUsers.filter(id => id !== user.id)
  } else {
    notification.value.selectedUsers.push(user.id)
  }
}

const removeUser = (userId: number) => {
  notification.value.selectedUsers = notification.value.selectedUsers.filter(id => id !== userId)
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
    recipientType: 'all',
    selectedUsers: [],
    image_url: undefined
  }
  messageType.value = 'notification'
  emailData.value = {
    highlight_text: '',
    button_text: '',
    button_url: '',
    image_url: '',
    template_name: ''
  }
  searchQuery.value = ''
  showUserList.value = false
  currentPage.value = 1
}

const sendNotification = async () => {
  try {
    if (!notification.value.title || !notification.value.content) {
      notificationService.addNotification('Veuillez remplir le titre et le contenu', 'error')
      return
    }

    // Vérifier que si c'est un email avec utilisateur spécifique, au moins un utilisateur est sélectionné
    if (messageType.value === 'email' && notification.value.recipientType === 'specific' && notification.value.selectedUsers.length === 0) {
      notificationService.addNotification('Veuillez sélectionner au moins un utilisateur pour envoyer un email.', 'error')
      return
    }

    // Si c'est une notification push
    if (messageType.value === 'notification') {
      // Préparer les données pour l'API de notification
      const data: any = {
        title: notification.value.title,
        content: notification.value.content
      }

      // Ajouter l'ID utilisateur si c'est une notification spécifique
      if (notification.value.recipientType === 'specific' && notification.value.selectedUsers.length > 0) {
        data.user_id = notification.value.selectedUsers[0]
      }

      // Ajouter l'image si elle existe
      if (notification.value.image_url) {
        data.image_url = notification.value.image_url
      }

      // Envoyer la notification
      await notificationStore.sendNotification(data)
      notificationService.addNotification('Notification envoyée avec succès !', 'success')
    } 
    // Si c'est un email
    else if (messageType.value === 'email') {
      if (notification.value.recipientType === 'all') {
        // Envoyer un email à tous les utilisateurs (sans user_id)
        const emailDataToSend: any = {
          title: notification.value.title,
          subject: notification.value.title,
          content: notification.value.content
        }

        // Ajouter les champs optionnels
        if (emailData.value.highlight_text) {
          emailDataToSend.highlight_text = emailData.value.highlight_text
        }
        if (emailData.value.button_text) {
          emailDataToSend.button_text = emailData.value.button_text
        }
        if (emailData.value.button_url) {
          emailDataToSend.button_url = emailData.value.button_url
        }
        // Utiliser l'image de l'email si fournie, sinon celle de la notification
        if (emailData.value.image_url) {
          emailDataToSend.image_url = emailData.value.image_url
        } else if (notification.value.image_url) {
          emailDataToSend.image_url = notification.value.image_url
        }
        if (emailData.value.template_name) {
          emailDataToSend.template_name = emailData.value.template_name
        }

        await notificationStore.sendEmail(emailDataToSend)
        notificationService.addNotification('Email envoyé à tous les utilisateurs avec succès !', 'success')
      } else {
        // Envoyer un email à chaque utilisateur sélectionné
        const emailPromises = notification.value.selectedUsers.map(async (userId) => {
          const emailDataToSend: any = {
            user_id: userId,
            title: notification.value.title,
            subject: notification.value.title, // Utiliser title comme subject
            content: notification.value.content
          }

          // Ajouter les champs optionnels
          if (emailData.value.highlight_text) {
            emailDataToSend.highlight_text = emailData.value.highlight_text
          }
          if (emailData.value.button_text) {
            emailDataToSend.button_text = emailData.value.button_text
          }
          if (emailData.value.button_url) {
            emailDataToSend.button_url = emailData.value.button_url
          }
          // Utiliser l'image de l'email si fournie, sinon celle de la notification
          if (emailData.value.image_url) {
            emailDataToSend.image_url = emailData.value.image_url
          } else if (notification.value.image_url) {
            emailDataToSend.image_url = notification.value.image_url
          }
          if (emailData.value.template_name) {
            emailDataToSend.template_name = emailData.value.template_name
          }

          return notificationStore.sendEmail(emailDataToSend)
        })

        await Promise.all(emailPromises)
        notificationService.addNotification('Email(s) envoyé(s) avec succès !', 'success')
      }
    }
    
    clearForm()
  } catch (error) {
    console.error('Error sending message:', error)
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