<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Gestion des Bonus de Parrainage</h1>
    </div>

    <!-- Onglets -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button
            @click="activeTab = 'attributions'"
            :class="[
              'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'attributions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <i class="fas fa-gift mr-2"></i>
            Attributions
          </button>
          <button
            @click="activeTab = 'withdrawals'"
            :class="[
              'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'withdrawals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <i class="fas fa-money-bill-wave mr-2"></i>
            Retraits
          </button>
        </nav>
      </div>
    </div>

    <!-- Onglet Attributions -->
    <div v-if="activeTab === 'attributions'" class="space-y-6">
      <!-- Recherche -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex flex-wrap gap-4">
          <input
            v-model="attributionSearch"
            @input="handleAttributionSearch"
            type="text"
            placeholder="Rechercher par email ou nom du parrain/filleul..."
            class="flex-1 min-w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Liste des Attributions -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="p-3 sm:p-4 border-b border-gray-200">
          <h2 class="text-base sm:text-lg font-semibold text-gray-800">Historique des Attributions de Bonus</h2>
        </div>
        <div class="overflow-x-auto -mx-4 sm:mx-0">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Parrain
                </th>
                <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Filleul
                </th>
                <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Transaction
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="attribution in bonusStore.attributions" :key="attribution.id">
                <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                  <div class="flex flex-col">
                    <span>{{ formatDate(attribution.created_at) }}</span>
                    <span class="text-xs text-gray-400 md:hidden">{{ attribution.parrain?.fullname || 'N/A' }}</span>
                  </div>
                </td>
                <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden md:table-cell">
                  <div v-if="attribution.parrain">
                    <p class="text-xs sm:text-sm font-medium text-gray-900">{{ attribution.parrain.fullname || 'N/A' }}</p>
                    <p class="text-xs sm:text-sm text-gray-500">{{ attribution.parrain.email || 'N/A' }}</p>
                  </div>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden lg:table-cell">
                  <div v-if="attribution.filleul">
                    <p class="text-xs sm:text-sm font-medium text-gray-900">{{ attribution.filleul.fullname || 'N/A' }}</p>
                    <p class="text-xs sm:text-sm text-gray-500">{{ attribution.filleul.email || 'N/A' }}</p>
                  </div>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-green-600">
                  {{ formatCurrency(parseFloat(attribution.amount)) }}
                </td>
                <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden xl:table-cell">
                  <span class="font-mono text-xs">{{ attribution.transaction_reference || 'N/A' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="bonusStore.totalAttributions > 0" class="px-3 sm:px-4 py-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Page {{ bonusStore.currentAttributionPage }} sur {{ Math.ceil(bonusStore.totalAttributions / 20) }}
          </div>
          <div class="flex space-x-2">
            <button
              @click="loadAttributionsPage(bonusStore.currentAttributionPage - 1)"
              :disabled="bonusStore.currentAttributionPage === 1 || bonusStore.isLoading"
              class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <i v-if="bonusStore.isLoading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-chevron-left"></i>
            </button>
            <button
              @click="loadAttributionsPage(bonusStore.currentAttributionPage + 1)"
              :disabled="bonusStore.currentAttributionPage * 20 >= bonusStore.totalAttributions || bonusStore.isLoading"
              class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <i v-if="bonusStore.isLoading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Message si aucune attribution -->
        <div v-if="bonusStore.attributions.length === 0 && !bonusStore.isLoading" class="p-12 text-center">
          <i class="fas fa-gift text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">Aucune attribution trouvée</p>
        </div>
      </div>
    </div>

    <!-- Onglet Retraits -->
    <div v-if="activeTab === 'withdrawals'" class="space-y-6">
      <!-- Filtres -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex flex-wrap gap-4">
          <select
            v-model="statusFilter"
            @change="bonusStore.fetchWithdrawals(1, statusFilter === 'all' ? undefined : statusFilter)"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="completed">Complété</option>
            <option value="rejected">Rejeté</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
      </div>

      <!-- Liste des Demandes -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="p-3 sm:p-4 border-b border-gray-200">
          <h2 class="text-base sm:text-lg font-semibold text-gray-800">Demandes de Retrait de Bonus</h2>
        </div>
        <div class="overflow-x-auto -mx-4 sm:mx-0">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Date de demande
                </th>
                <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Notes
                </th>
                <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="withdrawal in bonusStore.withdrawals" :key="withdrawal.id">
                <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                  <div>
                    <p class="text-xs sm:text-sm font-medium text-gray-900">Utilisateur #{{ withdrawal.user }}</p>
                    <p class="text-xs sm:text-sm text-gray-500">{{ withdrawal.user_email }}</p>
                  </div>
                </td>
                <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-green-600">
                  {{ formatCurrency(parseFloat(withdrawal.amount)) }}
                </td>
                <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                  <span
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ withdrawal.status === 'completed' ? 'Complété' :
                       withdrawal.status === 'pending' ? 'En attente' :
                       withdrawal.status === 'rejected' ? 'Rejeté' : 'Annulé' }}
                  </span>
                </td>
                <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                  <div>
                    <p>{{ formatDate(withdrawal.created_at) }}</p>
                    <p v-if="withdrawal.processed_at" class="text-xs text-gray-400">
                      Traité: {{ formatDate(withdrawal.processed_at) }}
                    </p>
                  </div>
                </td>
                <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                  <p v-if="withdrawal.notes" class="max-w-xs truncate" :title="withdrawal.notes">
                    {{ withdrawal.notes }}
                  </p>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium">
                  <div v-if="withdrawal.status === 'pending'" class="flex space-x-2">
                    <button
                      @click="openAcceptModal(withdrawal)"
                      class="text-green-600 hover:text-green-900"
                      title="Accepter"
                    >
                      <i class="fas fa-check-circle"></i>
                    </button>
                    <button
                      @click="openRejectModal(withdrawal)"
                      class="text-red-600 hover:text-red-900"
                      title="Rejeter"
                    >
                      <i class="fas fa-times-circle"></i>
                    </button>
                  </div>
                  <div v-else class="text-sm">
                    <p v-if="withdrawal.processed_by_email" class="text-gray-600">
                      Par: {{ withdrawal.processed_by_email }}
                    </p>
                    <p v-if="withdrawal.rejection_reason" class="text-xs text-red-600 mt-1">
                      {{ withdrawal.rejection_reason }}
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="bonusStore.totalWithdrawals > 0" class="px-3 sm:px-4 py-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Page {{ bonusStore.currentPage }} sur {{ Math.ceil(bonusStore.totalWithdrawals / 10) }}
          </div>
          <div class="flex space-x-2">
            <button
              @click="bonusStore.fetchWithdrawals(bonusStore.currentPage - 1, statusFilter === 'all' ? undefined : statusFilter)"
              :disabled="bonusStore.currentPage === 1 || bonusStore.isLoading"
              class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <i v-if="bonusStore.isLoading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-chevron-left"></i>
            </button>
            <button
              @click="bonusStore.fetchWithdrawals(bonusStore.currentPage + 1, statusFilter === 'all' ? undefined : statusFilter)"
              :disabled="bonusStore.currentPage * 10 >= bonusStore.totalWithdrawals || bonusStore.isLoading"
              class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <i v-if="bonusStore.isLoading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Message si aucune demande -->
        <div v-if="bonusStore.withdrawals.length === 0 && !bonusStore.isLoading" class="p-12 text-center">
          <i class="fas fa-money-bill-wave text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">Aucune demande de retrait trouvée</p>
        </div>
      </div>
    </div>

    <!-- Modal Accepter -->
    <ConfirmationModal
      :is-open="showAcceptModal"
      title="Accepter la demande de retrait"
      :message="acceptModalMessage"
      :loading="bonusStore.isLoading"
      @confirm="confirmAccept"
      @cancel="closeAcceptModal"
    />

    <!-- Modal Rejeter -->
    <Teleport to="body">
      <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Rejeter la demande de retrait</h3>
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">{{ rejectModalMessage }}</p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Raison du rejet *</label>
            <textarea
              v-model="rejectionReason"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Expliquez la raison du rejet..."
              required
            ></textarea>
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
              :disabled="!rejectionReason.trim() || bonusStore.isLoading"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <i v-if="bonusStore.isLoading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-times-circle mr-2"></i>
              {{ bonusStore.isLoading ? 'Traitement...' : 'Rejeter' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useBonusStore } from '../stores/bonus'
import ConfirmationModal from '../components/ConfirmationModal.vue'
import { formatCurrency } from '../utils/currency'

const bonusStore = useBonusStore()
const activeTab = ref<'attributions' | 'withdrawals'>('attributions')
const statusFilter = ref('all')
const attributionSearch = ref('')
const showAcceptModal = ref(false)
const showRejectModal = ref(false)
const selectedWithdrawal = ref<any>(null)
const rejectionReason = ref('')
const acceptModalMessage = ref('')
const rejectModalMessage = ref('')

// Recherche avec debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const handleAttributionSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    bonusStore.fetchAttributions(1, attributionSearch.value || undefined)
  }, 500)
}

// Charger une page d'attributions
const loadAttributionsPage = (page: number) => {
  bonusStore.fetchAttributions(page, attributionSearch.value || undefined)
}

// Charger les données selon l'onglet actif
const loadTabData = async () => {
  if (activeTab.value === 'attributions') {
    await bonusStore.fetchAttributions(1)
  } else {
    await bonusStore.fetchWithdrawals(1)
  }
}

// Watcher pour charger les données quand on change d'onglet
watch(activeTab, () => {
  loadTabData()
})

onMounted(async () => {
  await loadTabData()
})

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openAcceptModal = (withdrawal: any) => {
  selectedWithdrawal.value = withdrawal
  acceptModalMessage.value = `Êtes-vous sûr de vouloir accepter la demande de retrait de ${formatCurrency(parseFloat(withdrawal.amount))} de ${withdrawal.user_email} ?`
  showAcceptModal.value = true
}

const closeAcceptModal = () => {
  showAcceptModal.value = false
  selectedWithdrawal.value = null
}

const confirmAccept = async () => {
  if (!selectedWithdrawal.value) return

  try {
    await bonusStore.processWithdrawal(selectedWithdrawal.value.id, 'completed')
    closeAcceptModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

const openRejectModal = (withdrawal: any) => {
  selectedWithdrawal.value = withdrawal
  rejectModalMessage.value = `Rejeter la demande de retrait de ${formatCurrency(parseFloat(withdrawal.amount))} de ${withdrawal.user_email} ?`
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  selectedWithdrawal.value = null
  rejectionReason.value = ''
}

const confirmReject = async () => {
  if (!selectedWithdrawal.value || !rejectionReason.value.trim()) return

  try {
    await bonusStore.processWithdrawal(
      selectedWithdrawal.value.id,
      'rejected',
      rejectionReason.value.trim()
    )
    closeRejectModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}
</script>
