<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Gestion des Commissions</h1>
      <!-- Bouton de réconciliation commenté -->
      <!--
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button 
          @click="handleReconcile"
          :disabled="commissionsStore.isLoading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-sync-alt mr-2"></i>
          Réconcilier
        </button>
      </div>
      -->
    </div>

    <!-- Commission Totale -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Commission Totale</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Montant Total</p>
          <p class="text-2xl font-bold text-blue-600">
            {{ formatCurrency(parseFloat(commissionsStore.commission?.amount || '0')) }}
          </p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Disponible</p>
          <p class="text-2xl font-bold text-green-600">
            {{ formatCurrency(parseFloat(commissionsStore.commission?.amount || '0')) }}
          </p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Cohérence</p>
          <p class="text-lg font-semibold" :class="commissionsStore.commission?.is_consistent ? 'text-green-600' : 'text-red-600'">
            <i :class="commissionsStore.commission?.is_consistent ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
            {{ commissionsStore.commission?.is_consistent ? 'Cohérent' : 'Incohérent' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex flex-wrap gap-4">
        <select 
          v-model="isWithdrawnFilter"
          @change="commissionsStore.fetchCommissionTransactions(1, isWithdrawnFilter)"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option :value="null">Toutes les commissions</option>
          <option :value="false">Non retirées</option>
          <option :value="true">Retirées</option>
        </select>
      </div>
    </div>

    <!-- Liste des Transactions de Commission -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">Transactions de Commission</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  v-model="selectAll"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référence
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant Transaction
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commission
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taux
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in commissionsStore.commissionTransactions" :key="transaction.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <input 
                  type="checkbox" 
                  :value="transaction.id"
                  v-model="selectedTransactions"
                  :disabled="transaction.is_withdrawn"
                  class="rounded border-gray-300"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ transaction.transaction.public_reference }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatCurrency(parseFloat(transaction.transaction.amount)) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                {{ formatCurrency(parseFloat(transaction.commission)) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ transaction.commission_rate }}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    transaction.is_withdrawn ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                  ]"
                >
                  {{ transaction.is_withdrawn ? 'Retirée' : 'Disponible' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(transaction.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Actions -->
      <div v-if="selectedTransactions.length > 0" class="p-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-700">
            {{ selectedTransactions.length }} commission(s) sélectionnée(s) - 
            Total: <span class="font-semibold">{{ formatCurrency(calculateSelectedTotal()) }}</span>
          </p>
          <button 
            @click="openWithdrawModal"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <i class="fas fa-money-bill-wave mr-2"></i>
            Retirer
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div class="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Page {{ commissionsStore.currentPage }} sur {{ Math.ceil(commissionsStore.totalTransactions / 10) }}
        </div>
        <div class="flex space-x-2">
          <button 
            @click="commissionsStore.fetchCommissionTransactions(commissionsStore.currentPage - 1, isWithdrawnFilter)"
            :disabled="commissionsStore.currentPage === 1 || commissionsStore.isLoading"
            class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <i v-if="commissionsStore.isLoading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-chevron-left"></i>
          </button>
          <button 
            @click="commissionsStore.fetchCommissionTransactions(commissionsStore.currentPage + 1, isWithdrawnFilter)"
            :disabled="commissionsStore.currentPage * 10 >= commissionsStore.totalTransactions || commissionsStore.isLoading"
            class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <i v-if="commissionsStore.isLoading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Historique des Retraits -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">Historique des Retraits</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Retiré par
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="withdrawal in commissionsStore.withdrawals" :key="withdrawal.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{{ withdrawal.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                {{ formatCurrency(parseFloat(withdrawal.total_amount)) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                    withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ withdrawal.status === 'completed' ? 'Complété' : 
                     withdrawal.status === 'pending' ? 'En attente' : 'Annulé' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ withdrawal.withdrawn_by.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(withdrawal.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Retrait -->
    <Teleport to="body">
      <div v-if="showWithdrawModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Retirer des Commissions</h3>
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">Montant total sélectionné:</p>
            <p class="text-2xl font-bold text-green-600">{{ formatCurrency(calculateSelectedTotal()) }}</p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Notes (optionnel)</label>
            <textarea 
              v-model="withdrawNotes"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3">
            <button 
              @click="showWithdrawModal = false"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Annuler
            </button>
            <button 
              @click="handleWithdraw"
              :disabled="commissionsStore.isLoading"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de Réconciliation -->
    <ConfirmationModal
      :is-open="showReconcileModal"
      title="Réconcilier les commissions"
      message="Êtes-vous sûr de vouloir réconcilier les commissions ? Cette action vérifiera la cohérence entre le montant total et la somme des transactions."
      :loading="commissionsStore.isLoading"
      @confirm="confirmReconcile"
      @cancel="showReconcileModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCommissionsStore } from '../stores/commissions'
import { useNotification } from '../services/notification'
import ConfirmationModal from '../components/ConfirmationModal.vue'
import { formatCurrency } from '../utils/currency'

const commissionsStore = useCommissionsStore()
const selectedTransactions = ref<number[]>([])
const selectAll = ref(false)
const isWithdrawnFilter = ref<boolean | null>(null)
const showWithdrawModal = ref(false)
const withdrawNotes = ref('')
const showReconcileModal = ref(false)

onMounted(async () => {
  await commissionsStore.fetchCommission()
  await commissionsStore.fetchCommissionTransactions(1, null)
  await commissionsStore.fetchWithdrawals()
})

// formatCurrency est importé depuis utils/currency

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const calculateSelectedTotal = (): number => {
  return selectedTransactions.value.reduce((total, id) => {
    const transaction = commissionsStore.commissionTransactions.find(t => t.id === id)
    return total + (transaction ? parseFloat(transaction.commission) : 0)
  }, 0)
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedTransactions.value = commissionsStore.commissionTransactions
      .filter(t => !t.is_withdrawn)
      .map(t => t.id)
  } else {
    selectedTransactions.value = []
  }
}

const openWithdrawModal = () => {
  if (selectedTransactions.value.length === 0) return
  showWithdrawModal.value = true
}

const handleWithdraw = async () => {
  try {
    // Validation de sécurité
    if (selectedTransactions.value.length === 0) {
      return
    }
    
    const totalAmount = calculateSelectedTotal()
    
    // Validation : montant doit être positif
    if (totalAmount <= 0) {
      const notification = useNotification()
      notification.addNotification('Le montant doit être supérieur à 0', 'error')
      return
    }
    
    // Validation : montant ne doit pas dépasser un seuil raisonnable (sécurité)
    if (totalAmount > 100000000) { // 100 millions FCFA
      const notification = useNotification()
      notification.addNotification('Montant trop élevé. Veuillez contacter le support.', 'error')
      return
    }
    
    await commissionsStore.withdrawCommissions(
      selectedTransactions.value,
      totalAmount.toFixed(2),
      withdrawNotes.value.substring(0, 500) // Limiter la longueur des notes
    )
    selectedTransactions.value = []
    selectAll.value = false
    showWithdrawModal.value = false
    withdrawNotes.value = ''
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleReconcile = async () => {
  showReconcileModal.value = true
}

const confirmReconcile = async () => {
  try {
    await commissionsStore.reconcileCommissions()
    showReconcileModal.value = false
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}
</script>

