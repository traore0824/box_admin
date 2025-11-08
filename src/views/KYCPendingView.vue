<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Vérifications KYC en Attente</h1>
      <div class="mt-4 sm:mt-0 text-sm text-gray-600">
        <span class="font-semibold">{{ kycStore.totalPending }}</span> demande(s) en attente
      </div>
    </div>

    <!-- Recherche -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex gap-4">
        <div class="flex-1">
          <input 
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text" 
            placeholder="Rechercher par email, téléphone, nom, prénom, card_id..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Liste des Demandes KYC -->
    <div class="space-y-4">
      <div 
        v-for="user in kycStore.pendingUsers" 
        :key="user.id"
        class="bg-white rounded-lg shadow-sm p-6"
      >
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Informations Utilisateur -->
          <div class="flex-1">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ user.first_name }} {{ user.last_name }}
                </h3>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
                <p class="text-sm text-gray-500">{{ user.phone }}</p>
              </div>
              <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                En attente
              </span>
            </div>

            <div class="space-y-2 mb-4">
              <div>
                <span class="text-sm font-medium text-gray-700">Numéro de carte d'identité :</span>
                <span class="text-sm text-gray-900 ml-2">{{ user.card_id || 'Non renseigné' }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-700">Date de soumission :</span>
                <span class="text-sm text-gray-900 ml-2">{{ formatDate(user.created_at) }}</span>
              </div>
            </div>

            <!-- Galerie d'Images -->
            <div v-if="user.user_cards && user.user_cards.length > 0" class="mb-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Documents soumis :</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div 
                  v-for="(imageUrl, index) in user.user_cards" 
                  :key="index"
                  class="relative group cursor-pointer"
                  @click="openImageModal(imageUrl)"
                >
                  <img 
                    :src="imageUrl" 
                    :alt="`Document KYC ${index + 1}`"
                    class="w-full h-48 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors pointer-events-none"
                  />
                  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity flex items-center justify-center pointer-events-none">
                    <i class="fas fa-search-plus text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="mb-4">
              <p class="text-sm text-gray-500 italic">Aucun document soumis</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="lg:w-48 flex flex-col gap-3">
            <button 
              @click="openAcceptModal(user)"
              :disabled="kycStore.isLoading"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <i class="fas fa-check-circle mr-2"></i>
              Approuver
            </button>
            <button 
              @click="openRejectModal(user)"
              :disabled="kycStore.isLoading"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <i class="fas fa-times-circle mr-2"></i>
              Rejeter
            </button>
          </div>
        </div>
      </div>

      <!-- Message si aucune demande -->
      <div v-if="kycStore.pendingUsers.length === 0 && !kycStore.isLoading" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <i class="fas fa-check-circle text-6xl text-green-300 mb-4"></i>
        <p class="text-gray-500 text-lg">Aucune demande KYC en attente</p>
        <p class="text-sm text-gray-400 mt-2">Toutes les demandes ont été traitées</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="kycStore.totalPending > 0" class="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Page {{ kycStore.currentPage }} sur {{ Math.ceil(kycStore.totalPending / 20) }}
      </div>
      <div class="flex space-x-2">
        <button 
          @click="kycStore.fetchPendingKYCs(kycStore.currentPage - 1, searchQuery)"
          :disabled="kycStore.currentPage === 1 || kycStore.isLoading"
          class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <button 
          @click="kycStore.fetchPendingKYCs(kycStore.currentPage + 1, searchQuery)"
          :disabled="kycStore.currentPage * 20 >= kycStore.totalPending || kycStore.isLoading"
          class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Modal Approuver -->
    <ConfirmationModal
      :is-open="showAcceptModal"
      title="Approuver la demande KYC"
      :message="acceptModalMessage"
      @confirm="confirmAccept"
      @cancel="closeAcceptModal"
    />

    <!-- Modal Rejeter -->
    <Teleport to="body">
      <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Rejeter la demande KYC</h3>
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">{{ rejectModalMessage }}</p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Raison du rejet <span class="text-red-500">*</span>
            </label>
            <textarea 
              v-model="rejectionReason"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Expliquez la raison du rejet (ex: Photo de la carte d'identité floue, veuillez renvoyer une photo plus claire)..."
              required
            ></textarea>
            <p class="mt-1 text-xs text-gray-500">
              Cette raison sera envoyée à l'utilisateur dans une notification
            </p>
          </div>
          <div class="flex justify-end space-x-3">
            <button 
              @click="closeRejectModal"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Annuler
            </button>
            <button 
              @click="confirmReject"
              :disabled="!rejectionReason.trim() || kycStore.isLoading"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Image -->
    <Teleport to="body">
      <div v-if="selectedImage" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-95" @click="closeImageModal">
        <div class="relative w-full h-full flex items-center justify-center p-4">
          <button 
            @click="closeImageModal"
            class="absolute top-4 right-4 text-white bg-black bg-opacity-70 rounded-full p-3 hover:bg-opacity-90 z-10 transition-all"
            title="Fermer (Échap)"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
          <div class="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
            <img 
              :src="selectedImage" 
              alt="Document KYC"
              class="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
              @click.stop
            />
          </div>
          <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg">
            Cliquez en dehors de l'image pour fermer
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useKYCStore } from '../stores/kyc'
import ConfirmationModal from '../components/ConfirmationModal.vue'
import { debounce } from 'lodash'

const kycStore = useKYCStore()
const searchQuery = ref('')
const showAcceptModal = ref(false)
const showRejectModal = ref(false)
const selectedUser = ref<any>(null)
const rejectionReason = ref('')
const acceptModalMessage = ref('')
const rejectModalMessage = ref('')
const selectedImage = ref<string | null>(null)

// Gestion de la touche Échap pour fermer le modal d'image
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && selectedImage.value) {
    closeImageModal()
  }
}

onMounted(async () => {
  await kycStore.fetchPendingKYCs(1)
  window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
})

const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const debouncedSearch = debounce(() => {
  kycStore.fetchPendingKYCs(1, searchQuery.value)
}, 300)

const openAcceptModal = (user: any) => {
  selectedUser.value = user
  acceptModalMessage.value = `Êtes-vous sûr de vouloir approuver la demande KYC de ${user.first_name} ${user.last_name} (${user.email}) ?`
  showAcceptModal.value = true
}

const closeAcceptModal = () => {
  showAcceptModal.value = false
  selectedUser.value = null
}

const confirmAccept = async () => {
  if (!selectedUser.value) return
  
  try {
    await kycStore.updateKycStatus(selectedUser.value.id, 'accept')
    closeAcceptModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

const openRejectModal = (user: any) => {
  selectedUser.value = user
  rejectModalMessage.value = `Rejeter la demande KYC de ${user.first_name} ${user.last_name} (${user.email}) ?`
  rejectionReason.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  selectedUser.value = null
  rejectionReason.value = ''
}

const confirmReject = async () => {
  if (!selectedUser.value || !rejectionReason.value.trim()) return
  
  try {
    await kycStore.updateKycStatus(
      selectedUser.value.id, 
      'reject', 
      rejectionReason.value.trim()
    )
    closeRejectModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

const openImageModal = (imageUrl: string) => {
  selectedImage.value = imageUrl
}

const closeImageModal = () => {
  selectedImage.value = null
}
</script>

