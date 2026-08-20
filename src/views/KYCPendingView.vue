<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Vérifications KYC</h1>
      <p class="text-sm text-gray-500 mt-1">Gestion des demandes de vérification d'identité</p>
    </div>

    <!-- Search bar -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Rechercher par email, téléphone, nom, prénom, numéro de pièce..."
            class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          @click="handleSearch"
          class="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <i class="fas fa-search"></i>
          Rechercher
        </button>
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <i class="fas fa-times"></i>
          Effacer
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="kycStore.isLoading && kycStore.pendingUsers.length === 0" class="bg-white rounded-lg shadow-sm p-16 text-center">
      <i class="fas fa-spinner fa-spin text-4xl text-primary-400 mb-4"></i>
      <p class="text-gray-500">Chargement des demandes KYC...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!kycStore.isLoading && kycStore.pendingUsers.length === 0" class="bg-white rounded-lg shadow-sm p-16 text-center">
      <i class="fas fa-check-circle text-6xl text-green-300 mb-4"></i>
      <p class="text-gray-500 text-lg font-medium">Aucune demande KYC en attente</p>
      <p class="text-sm text-gray-400 mt-2">
        {{ searchQuery ? 'Aucun résultat pour cette recherche' : 'Toutes les demandes ont été traitées' }}
      </p>
    </div>

    <!-- KYC List -->
    <div v-else class="space-y-4">
      <div
        v-for="user in kycStore.pendingUsers"
        :key="user.id"
        class="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <!-- Card Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-primary-dark font-bold text-sm">
                {{ userInitials(user) }}
              </span>
            </div>
            <div>
              <p class="font-semibold text-gray-900">
                {{ user.first_name || '' }} {{ user.last_name || '' }}
                <span v-if="!user.first_name && !user.last_name" class="text-gray-400 italic">Nom non renseigné</span>
              </p>
              <p class="text-xs text-gray-500">{{ user.email }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              <i class="fas fa-clock mr-1"></i>En attente
            </span>
            <span v-if="user.is_block" class="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
              <i class="fas fa-ban mr-1"></i>Bloqué
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="flex flex-col lg:flex-row gap-0 lg:gap-6 p-6">
          <!-- User info -->
          <div class="lg:w-64 flex-shrink-0 space-y-3">
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <span class="text-gray-500">Téléphone</span>
              <span class="text-gray-900 font-medium">{{ user.phone || '—' }}</span>

              <span class="text-gray-500">N° pièce</span>
              <span class="text-gray-900 font-medium font-mono">{{ user.card_id || '—' }}</span>

              <span class="text-gray-500">Inscrit le</span>
              <span class="text-gray-900">{{ formatDate(user.created_at) }}</span>

              <span class="text-gray-500">Compte actif</span>
              <span :class="user.is_active ? 'text-green-600' : 'text-red-500'">
                {{ user.is_active ? 'Oui' : 'Non' }}
              </span>
            </div>

            <!-- Action buttons -->
            <div class="flex flex-col gap-2 pt-3 border-t border-gray-100">
              <router-link
                :to="{ name: 'user-profile', params: { id: user.id.toString() } }"
                class="w-full px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark flex items-center justify-center gap-2 transition-colors"
              >
                <i class="fas fa-user-circle"></i>
                Voir le profil
              </router-link>
              <button
                @click="openAcceptModal(user)"
                :disabled="kycStore.isLoading && processingUserId === user.id"
                class="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                <i v-if="processingUserId === user.id && processingAction === 'accept'" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-check-circle"></i>
                {{ processingUserId === user.id && processingAction === 'accept' ? 'Traitement...' : 'Approuver' }}
              </button>
              <button
                @click="openRejectModal(user)"
                :disabled="kycStore.isLoading && processingUserId === user.id"
                class="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                <i v-if="processingUserId === user.id && processingAction === 'reject'" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-times-circle"></i>
                {{ processingUserId === user.id && processingAction === 'reject' ? 'Traitement...' : 'Rejeter' }}
              </button>
              <button
                @click="openManualVerifyModal(user)"
                class="w-full px-3 py-2 bg-primary-50 text-primary-dark text-sm rounded-lg hover:bg-primary-100 flex items-center justify-center gap-2 transition-colors border border-primary-200"
              >
                <i class="fas fa-user-check"></i>
                Vérif. manuelle
              </button>
            </div>
          </div>

          <!-- Documents gallery -->
          <div class="flex-1 mt-4 lg:mt-0">
            <p class="text-sm font-medium text-gray-700 mb-3">
              <i class="fas fa-images mr-1 text-gray-400"></i>
              Documents soumis
              <span class="ml-1 text-gray-400 font-normal">({{ user.user_cards?.length || 0 }})</span>
            </p>
            <div v-if="user.user_cards && user.user_cards.length > 0" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              <div
                v-for="(imageUrl, index) in user.user_cards"
                :key="index"
                class="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-400 transition-colors aspect-[4/3]"
                @click="openImageModal(imageUrl)"
              >
                <img
                  :src="imageUrl"
                  :alt="`Document KYC ${index + 1}`"
                  class="w-full h-full object-cover"
                  @error="handleImageError($event)"
                />
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <i class="fas fa-search-plus text-white opacity-0 group-hover:opacity-100 transition-opacity text-xl drop-shadow"></i>
                </div>
                <div class="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
                  {{ index + 1 }}/{{ user.user_cards.length }}
                </div>
              </div>
            </div>
            <div v-else class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <i class="fas fa-file-image text-2xl text-gray-300"></i>
              <p class="text-sm text-gray-400 italic">Aucun document soumis</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="kycStore.totalPending > 0" class="bg-white rounded-lg shadow-sm px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="text-sm text-gray-600">
        <span class="font-semibold">{{ kycStore.totalPending }}</span> demande(s) —
        Page <span class="font-semibold">{{ kycStore.currentPage }}</span> sur
        <span class="font-semibold">{{ kycStore.totalPages }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="kycStore.fetchPendingKYCs(kycStore.currentPage - 1)"
          :disabled="kycStore.currentPage === 1 || kycStore.isLoading"
          class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1 transition-colors"
        >
          <i class="fas fa-chevron-left text-xs"></i>
          Précédent
        </button>
        <span class="px-3 py-1.5 bg-primary text-white text-sm rounded-lg font-medium">
          {{ kycStore.currentPage }}
        </span>
        <button
          @click="kycStore.fetchPendingKYCs(kycStore.currentPage + 1)"
          :disabled="kycStore.currentPage >= kycStore.totalPages || kycStore.isLoading"
          class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1 transition-colors"
        >
          Suivant
          <i class="fas fa-chevron-right text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Modal : Approuver -->
    <ConfirmationModal
      :is-open="showAcceptModal"
      title="Approuver la demande KYC"
      :message="acceptModalMessage"
      confirm-text="Approuver"
      :loading="processingUserId !== null && processingAction === 'accept'"
      @confirm="confirmAccept"
      @cancel="closeAcceptModal"
    />

    <!-- Modal : Rejeter -->
    <Teleport to="body">
      <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click.self="closeRejectModal">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Rejeter la demande KYC</h3>
            <button @click="closeRejectModal" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
          </div>
          <p class="text-sm text-gray-600 mb-4">{{ rejectModalMessage }}</p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Raison du rejet <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="rejectionReason"
              rows="4"
              placeholder="Ex: Photo de la carte d'identité floue, merci de renvoyer une photo plus claire..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            ></textarea>
            <p class="mt-1 text-xs text-gray-400">Cette raison sera envoyée à l'utilisateur par notification et email.</p>
          </div>
          <div class="flex justify-end gap-3">
            <button @click="closeRejectModal" class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Annuler
            </button>
            <button
              @click="confirmReject"
              :disabled="!rejectionReason.trim() || (processingUserId === selectedUser?.id && processingAction === 'reject')"
              class="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <i v-if="processingUserId === selectedUser?.id && processingAction === 'reject'" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-times-circle"></i>
              {{ processingUserId === selectedUser?.id && processingAction === 'reject' ? 'Traitement...' : 'Confirmer le rejet' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal : Vérification manuelle -->
    <Teleport to="body">
      <div v-if="showManualModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto py-6" @click.self="closeManualModal">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Vérification manuelle</h3>
              <p class="text-xs text-gray-500 mt-0.5">Force le statut KYC à « Accepté » sans parcours mobile</p>
            </div>
            <button @click="closeManualModal" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
          </div>

          <!-- User ID field (only shown when no user pre-selected) -->
          <div v-if="!manualForm.user_id" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              ID utilisateur <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="manualUserId"
              type="number"
              placeholder="Ex: 4674"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div v-else class="mb-4 flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
            <i class="fas fa-user-circle text-primary"></i>
            <div>
              <p class="text-sm font-medium text-primary-800">{{ manualForm.first_name }} {{ manualForm.last_name }}</p>
              <p class="text-xs text-primary">ID: {{ manualForm.user_id }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
              <input v-model="manualForm.first_name" type="text" placeholder="Prénom" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
              <input v-model="manualForm.last_name" type="text" placeholder="Nom" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Date de naissance</label>
              <input v-model="manualForm.birthday" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Genre</label>
              <select v-model="manualForm.sexe" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Numéro de pièce d'identité</label>
            <input v-model="manualForm.card_id" type="text" placeholder="Ex: 12345678" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div class="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
            <i class="fas fa-info-circle text-amber-500 mt-0.5 flex-shrink-0"></i>
            <p class="text-xs text-amber-700">Cette action force le statut KYC à <strong>Accepté</strong>, envoie une notification push et un email de confirmation à l'utilisateur.</p>
          </div>
          <div class="flex justify-end gap-3 mt-5">
            <button @click="closeManualModal" class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Annuler
            </button>
            <button
              @click="confirmManualVerify"
              :disabled="kycStore.isLoading || (!manualForm.user_id && !manualUserId)"
              class="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <i v-if="kycStore.isLoading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-user-check"></i>
              {{ kycStore.isLoading ? 'Vérification...' : 'Vérifier et approuver' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal : Image plein écran -->
    <Teleport to="body">
      <div
        v-if="selectedImage"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-95"
        @click="closeImageModal"
      >
        <button
          @click="closeImageModal"
          class="absolute top-4 right-4 text-white bg-black bg-opacity-60 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-80 z-10 transition-all"
          title="Fermer (Échap)"
        >
          <i class="fas fa-times"></i>
        </button>
        <div class="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center" @click.stop>
          <img
            :src="selectedImage"
            alt="Document KYC agrandi"
            class="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
        <p class="absolute bottom-4 text-white text-xs bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          Cliquez en dehors de l'image pour fermer · <kbd class="font-mono">Échap</kbd>
        </p>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useKYCStore, type KYCUser } from '../stores/kyc'
import ConfirmationModal from '../components/ConfirmationModal.vue'
import { debounce } from 'lodash'

const kycStore = useKYCStore()

// Search
const searchQuery = ref('')

// Modals
const showAcceptModal = ref(false)
const showRejectModal = ref(false)
const showManualModal = ref(false)
const selectedUser = ref<KYCUser | null>(null)
const rejectionReason = ref('')
const acceptModalMessage = ref('')
const rejectModalMessage = ref('')

// Processing state
const processingUserId = ref<number | null>(null)
const processingAction = ref<'accept' | 'reject' | null>(null)

// Image viewer
const selectedImage = ref<string | null>(null)

// Manual verification form
const manualUserId = ref<number | null>(null)
const manualForm = ref({
  user_id: 0,
  first_name: '',
  last_name: '',
  birthday: '',
  sexe: '',
  card_id: ''
})

// Keyboard listener for Escape
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (selectedImage.value) closeImageModal()
    else if (showRejectModal.value) closeRejectModal()
    else if (showManualModal.value) closeManualModal()
    else if (showAcceptModal.value) closeAcceptModal()
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleEscape)
  await kycStore.fetchPendingKYCs(1)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
})

// Helpers
const userInitials = (user: KYCUser): string => {
  const f = user.first_name?.charAt(0)?.toUpperCase() || ''
  const l = user.last_name?.charAt(0)?.toUpperCase() || ''
  return f + l || user.email.charAt(0).toUpperCase()
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent) {
    parent.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center bg-gray-100"><i class="fas fa-broken-image text-2xl text-gray-300"></i><p class="text-xs text-gray-400 mt-1">Image indisponible</p></div>'
  }
}

// Search
const debouncedSearch = debounce(() => {
  kycStore.fetchPendingKYCs(1, searchQuery.value)
}, 400)

const handleSearch = () => {
  kycStore.fetchPendingKYCs(1, searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  kycStore.fetchPendingKYCs(1, '')
}

// Accept modal
const openAcceptModal = (user: KYCUser) => {
  selectedUser.value = user
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
  acceptModalMessage.value = `Êtes-vous sûr de vouloir approuver la demande KYC de ${name} ? Une notification et un email de confirmation lui seront envoyés.`
  showAcceptModal.value = true
}

const closeAcceptModal = () => {
  showAcceptModal.value = false
  selectedUser.value = null
  processingUserId.value = null
  processingAction.value = null
}

const confirmAccept = async () => {
  if (!selectedUser.value) return
  processingUserId.value = selectedUser.value.id
  processingAction.value = 'accept'
  try {
    await kycStore.updateKycStatus(selectedUser.value.id, 'accept')
    closeAcceptModal()
  } finally {
    processingUserId.value = null
    processingAction.value = null
  }
}

// Reject modal
const openRejectModal = (user: KYCUser) => {
  selectedUser.value = user
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
  rejectModalMessage.value = `Rejeter la demande KYC de ${name} (${user.email}) ?`
  rejectionReason.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  selectedUser.value = null
  rejectionReason.value = ''
  processingUserId.value = null
  processingAction.value = null
}

const confirmReject = async () => {
  if (!selectedUser.value || !rejectionReason.value.trim()) return
  processingUserId.value = selectedUser.value.id
  processingAction.value = 'reject'
  try {
    await kycStore.updateKycStatus(selectedUser.value.id, 'reject', rejectionReason.value.trim())
    closeRejectModal()
  } finally {
    processingUserId.value = null
    processingAction.value = null
  }
}

// Manual verify modal
const openManualVerifyModal = (user: KYCUser | null) => {
  if (user) {
    manualForm.value = {
      user_id: user.id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      birthday: '',
      sexe: '',
      card_id: user.card_id || ''
    }
    manualUserId.value = null
  } else {
    manualForm.value = { user_id: 0, first_name: '', last_name: '', birthday: '', sexe: '', card_id: '' }
    manualUserId.value = null
  }
  showManualModal.value = true
}

const closeManualModal = () => {
  showManualModal.value = false
  manualUserId.value = null
  manualForm.value = { user_id: 0, first_name: '', last_name: '', birthday: '', sexe: '', card_id: '' }
}

const confirmManualVerify = async () => {
  const userId = manualForm.value.user_id || manualUserId.value
  if (!userId) return

  const payload: Record<string, unknown> = { user_id: userId }
  if (manualForm.value.first_name) payload.first_name = manualForm.value.first_name
  if (manualForm.value.last_name) payload.last_name = manualForm.value.last_name
  if (manualForm.value.birthday) payload.birthday = manualForm.value.birthday
  if (manualForm.value.sexe) payload.sexe = manualForm.value.sexe
  if (manualForm.value.card_id) payload.card_id = manualForm.value.card_id

  try {
    await kycStore.adminVerifyUser(payload as Parameters<typeof kycStore.adminVerifyUser>[0])
    closeManualModal()
  } catch {
    // Error handled in store
  }
}

// Image viewer
const openImageModal = (url: string) => {
  selectedImage.value = url
}

const closeImageModal = () => {
  selectedImage.value = null
}
</script>
