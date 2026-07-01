<template>
  <div class="space-y-6 px-2 sm:px-0">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Retraits de bonus utilisateur</h1>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-3 sm:p-4">
      <div class="flex flex-wrap gap-3 sm:gap-4">
        <select
          v-model="statusFilter"
          @change="loadWithdrawals(1)"
          class="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="completed">Complété</option>
          <option value="rejected">Rejeté</option>
          <option value="cancelled">Annulé</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm overflow-hidden -mx-2 sm:mx-0">
      <div class="p-3 sm:p-4 border-b border-gray-200">
        <h2 class="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
          Demandes de retrait de bonus
        </h2>
      </div>

      <div v-if="store.isLoading" class="p-12 text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
        <p class="text-gray-500">Chargement...</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant argent
              </th>
              <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Types / Items
              </th>
              <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Date
              </th>
              <th class="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="withdrawal in store.withdrawals" :key="withdrawal.id">
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <div>
                  <p class="text-xs sm:text-sm font-medium text-gray-900">Utilisateur #{{ withdrawal.user }}</p>
                  <p class="text-xs sm:text-sm text-gray-500">{{ withdrawal.user_email }}</p>
                </div>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-green-600">
                {{ formatCurrency(parseFloat(withdrawal.total_money || '0')) }}
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                <p>{{ formatTypes(withdrawal.withdraw_types) }}</p>
                <p class="text-gray-400">
                  {{ withdrawal.items_count }} bonus
                  <span v-if="withdrawal.object_count"> · {{ withdrawal.object_count }} obj.</span>
                  <span v-if="withdrawal.voucher_count"> · {{ withdrawal.voucher_count }} bon(s)</span>
                </p>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <span
                  :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                    withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ getStatusLabel(withdrawal.status) }}
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
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium">
                <div v-if="withdrawal.status === 'pending'" class="flex space-x-2">
                  <button
                    @click="openAcceptModal(withdrawal)"
                    class="text-green-600 hover:text-green-900 p-1"
                    title="Accepter"
                  >
                    <i class="fas fa-check-circle text-sm sm:text-base"></i>
                  </button>
                  <button
                    @click="openRejectModal(withdrawal)"
                    class="text-red-600 hover:text-red-900 p-1"
                    title="Rejeter"
                  >
                    <i class="fas fa-times-circle text-sm sm:text-base"></i>
                  </button>
                </div>
                <div v-else class="text-xs sm:text-sm">
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

      <div
        v-if="store.totalWithdrawals > 0 && !store.isLoading"
        class="px-3 sm:px-4 py-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <div class="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
          Page {{ store.currentPage }} sur {{ Math.ceil(store.totalWithdrawals / 10) }}
        </div>
        <div class="flex space-x-2">
          <button
            @click="loadWithdrawals(store.currentPage - 1)"
            :disabled="store.currentPage === 1 || store.isLoading"
            class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs sm:text-sm"
          >
            <i v-if="store.isLoading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-chevron-left"></i>
          </button>
          <button
            @click="loadWithdrawals(store.currentPage + 1)"
            :disabled="store.currentPage * 10 >= store.totalWithdrawals || store.isLoading"
            class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs sm:text-sm"
          >
            <i v-if="store.isLoading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div v-if="store.withdrawals.length === 0 && !store.isLoading" class="p-12 text-center">
        <i class="fas fa-gift text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">Aucune demande de retrait trouvée</p>
      </div>
    </div>

    <div v-if="showAcceptModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-4 sm:p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmer l'approbation</h3>
          <p class="text-sm text-gray-600 mb-4">
            Approuver le retrait de
            <strong>{{ selectedWithdrawal ? formatCurrency(parseFloat(selectedWithdrawal.total_money || '0')) : '' }}</strong>
            pour <strong>{{ selectedWithdrawal?.user_email }}</strong> ?
          </p>
          <div class="flex justify-end space-x-3">
            <button
              @click="showAcceptModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
            >
              Annuler
            </button>
            <button
              @click="handleAccept"
              :disabled="store.isLoading"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              <i v-if="store.isLoading" class="fas fa-spinner fa-spin mr-2"></i>
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRejectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-4 sm:p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Rejeter la demande</h3>
          <p class="text-sm text-gray-600 mb-4">
            Rejeter le retrait de
            <strong>{{ selectedWithdrawal ? formatCurrency(parseFloat(selectedWithdrawal.total_money || '0')) : '' }}</strong>
            pour <strong>{{ selectedWithdrawal?.user_email }}</strong>.
          </p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Raison du rejet <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="rejectionReason"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              placeholder="Expliquez la raison du rejet..."
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="showRejectModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
            >
              Annuler
            </button>
            <button
              @click="handleReject"
              :disabled="store.isLoading || !rejectionReason.trim()"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
            >
              <i v-if="store.isLoading" class="fas fa-spinner fa-spin mr-2"></i>
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserBonusWithdrawalStore } from '../stores/userBonusWithdrawal'
import { formatCurrency } from '../utils/currency'

const store = useUserBonusWithdrawalStore()

const statusFilter = ref<string>('all')
const showAcceptModal = ref(false)
const showRejectModal = ref(false)
const selectedWithdrawal = ref<any>(null)
const rejectionReason = ref('')

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    completed: 'Complété',
    pending: 'En attente',
    rejected: 'Rejeté',
    cancelled: 'Annulé'
  }
  return labels[status] || status
}

const formatTypes = (types: string[] | undefined) => {
  if (!types?.length) return '-'
  const labels: Record<string, string> = {
    money: 'Argent',
    object: 'Objet',
    voucher: 'Bon',
    all: 'Tous'
  }
  return types.map((t) => labels[t] || t).join(', ')
}

const loadWithdrawals = async (page: number) => {
  try {
    await store.fetchWithdrawals(page, statusFilter.value === 'all' ? undefined : statusFilter.value)
  } catch {
    // géré dans le store
  }
}

const openAcceptModal = (withdrawal: any) => {
  selectedWithdrawal.value = withdrawal
  showAcceptModal.value = true
}

const openRejectModal = (withdrawal: any) => {
  selectedWithdrawal.value = withdrawal
  rejectionReason.value = ''
  showRejectModal.value = true
}

const handleAccept = async () => {
  if (!selectedWithdrawal.value) return

  try {
    await store.processWithdrawal(selectedWithdrawal.value.id, 'completed')
    showAcceptModal.value = false
    selectedWithdrawal.value = null
  } catch {
    // géré dans le store
  }
}

const handleReject = async () => {
  if (!selectedWithdrawal.value || !rejectionReason.value.trim()) return

  try {
    await store.processWithdrawal(
      selectedWithdrawal.value.id,
      'rejected',
      rejectionReason.value.trim()
    )
    showRejectModal.value = false
    selectedWithdrawal.value = null
    rejectionReason.value = ''
  } catch {
    // géré dans le store
  }
}

onMounted(() => {
  loadWithdrawals(1)
})
</script>
