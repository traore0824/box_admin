<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Gestion des Bonus de Parrainage</h1>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex flex-wrap gap-4">
        <select 
          v-model="statusFilter"
          @change="bonusStore.fetchWithdrawals(1, statusFilter)"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="completed">Complété</option>
          <option value="rejected">Rejeté</option>
        </select>
      </div>
    </div>

    <!-- Liste des Demandes -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">Demandes de Retrait de Bonus</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de demande
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="withdrawal in bonusStore.withdrawals" :key="withdrawal.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ withdrawal.user.fullname }}</p>
                  <p class="text-sm text-gray-500">{{ withdrawal.user.email }}</p>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                {{ formatCurrency(parseFloat(withdrawal.amount)) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
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
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(withdrawal.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div v-if="withdrawal.status === 'pending'" class="flex space-x-2">
                  <button 
                    @click="openAcceptModal(withdrawal)"
                    class="text-green-600 hover:text-green-900"
                  >
                    <i class="fas fa-check-circle"></i>
                  </button>
                  <button 
                    @click="openRejectModal(withdrawal)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <i class="fas fa-times-circle"></i>
                  </button>
                </div>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Page {{ bonusStore.currentPage }} sur {{ Math.ceil(bonusStore.totalWithdrawals / 10) }}
        </div>
        <div class="flex space-x-2">
          <button 
            @click="bonusStore.fetchWithdrawals(bonusStore.currentPage - 1, statusFilter === 'all' ? undefined : statusFilter)"
            :disabled="bonusStore.currentPage === 1 || bonusStore.isLoading"
            class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button 
            @click="bonusStore.fetchWithdrawals(bonusStore.currentPage + 1, statusFilter === 'all' ? undefined : statusFilter)"
            :disabled="bonusStore.currentPage * 10 >= bonusStore.totalWithdrawals || bonusStore.isLoading"
            class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Accepter -->
    <ConfirmationModal
      :is-open="showAcceptModal"
      title="Accepter la demande de retrait"
      :message="acceptModalMessage"
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
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useBonusStore } from '../stores/bonus'
import ConfirmationModal from '../components/ConfirmationModal.vue'

const bonusStore = useBonusStore()
const statusFilter = ref('all')
const showAcceptModal = ref(false)
const showRejectModal = ref(false)
const selectedWithdrawal = ref<any>(null)
const rejectionReason = ref('')
const acceptModalMessage = ref('')
const rejectModalMessage = ref('')

onMounted(async () => {
  await bonusStore.fetchWithdrawals(1)
})

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount)
}

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
  acceptModalMessage.value = `Êtes-vous sûr de vouloir accepter la demande de retrait de ${formatCurrency(parseFloat(withdrawal.amount))} de ${withdrawal.user.fullname} ?`
  showAcceptModal.value = true
}

const closeAcceptModal = () => {
  showAcceptModal.value = false
  selectedWithdrawal.value = null
}

const confirmAccept = async () => {
  if (!selectedWithdrawal.value) return
  
  try {
    await bonusStore.processWithdrawal(selectedWithdrawal.value.id, 'accept')
    closeAcceptModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

const openRejectModal = (withdrawal: any) => {
  selectedWithdrawal.value = withdrawal
  rejectModalMessage.value = `Rejeter la demande de retrait de ${formatCurrency(parseFloat(withdrawal.amount))} de ${withdrawal.user.fullname} ?`
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
      'reject', 
      rejectionReason.value.trim()
    )
    closeRejectModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}
</script>

