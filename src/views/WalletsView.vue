<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Gestion des Wallets</h1>
    </div>

    <!-- Sélection Utilisateur -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Sélectionner un utilisateur</h2>
      <div class="flex gap-4">
        <input 
          type="number"
          v-model="userIdInput"
          placeholder="ID de l'utilisateur"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          @click="loadUserTransactions"
          :disabled="!userIdInput || walletsStore.isLoading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <i class="fas fa-search mr-2"></i>
          Charger
        </button>
        <button 
          v-if="walletsStore.selectedUser"
          @click="resetView"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Résumé du Wallet -->
    <div v-if="walletsStore.selectedUser && walletsStore.summary" class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">
        Wallet de {{ walletsStore.selectedUser.fullname }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Solde Actuel</p>
          <p class="text-2xl font-bold text-blue-600">
            {{ formatCurrency(parseFloat(walletsStore.summary.current_balance)) }}
          </p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Total Dépôts</p>
          <p class="text-2xl font-bold text-green-600">
            {{ formatCurrency(parseFloat(walletsStore.summary.total_deposits)) }}
          </p>
        </div>
        <div class="bg-red-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Total Retraits</p>
          <p class="text-2xl font-bold text-red-600">
            {{ formatCurrency(parseFloat(walletsStore.summary.total_withdrawals)) }}
          </p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Montant Disponible</p>
          <p class="text-2xl font-bold text-gray-600">
            {{ formatCurrency(parseFloat(walletsStore.summary.available_amount)) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div v-if="walletsStore.selectedUser" class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex flex-wrap gap-4">
        <select 
          v-model="transactionTypeFilter"
          @change="applyFilters"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les types</option>
          <option value="deposit">Dépôt</option>
          <option value="withdrawal">Retrait</option>
          <option value="bonus">Bonus</option>
          <option value="commission">Commission</option>
          <option value="refund">Remboursement</option>
          <option value="transfer">Transfert</option>
        </select>
        <select 
          v-model="statusFilter"
          @change="applyFilters"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="completed">Complété</option>
          <option value="pending">En attente</option>
          <option value="failed">Échoué</option>
          <option value="cancelled">Annulé</option>
        </select>
      </div>
    </div>

    <!-- Liste des Transactions -->
    <div v-if="walletsStore.selectedUser" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">Historique des Transactions</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Solde Avant
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Solde Après
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référence
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transaction in walletsStore.transactions" :key="transaction.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getTransactionTypeClass(transaction.transaction_type)
                  ]"
                >
                  {{ transaction.transaction_type_display }}
                </span>
              </td>
              <td 
                class="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                :class="getAmountClass(transaction.transaction_type)"
              >
                {{ transaction.transaction_type === 'deposit' || transaction.transaction_type === 'bonus' ? '+' : '-' }}
                {{ formatCurrency(parseFloat(transaction.amount)) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatCurrency(parseFloat(transaction.balance_before)) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatCurrency(parseFloat(transaction.balance_after)) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getStatusClass(transaction.status)
                  ]"
                >
                  {{ transaction.status_display }}
                  <i 
                    v-if="!transaction.is_processed" 
                    class="fas fa-exclamation-triangle ml-1 text-yellow-500"
                    title="Transaction non traitée"
                  ></i>
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ transaction.transaction_reference || transaction.reference }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(transaction.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Alerte pour transactions non traitées -->
      <div v-if="hasUnprocessedTransactions" class="p-4 bg-yellow-50 border-t border-yellow-200">
        <div class="flex items-center">
          <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
          <p class="text-sm text-yellow-800">
            Attention: {{ unprocessedCount }} transaction(s) non traitée(s) détectée(s)
          </p>
        </div>
      </div>
    </div>

    <!-- Message si aucun utilisateur sélectionné -->
    <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
      <i class="fas fa-wallet text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-500">Sélectionnez un utilisateur pour voir son historique wallet</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useWalletsStore } from '../stores/wallets'
import { useNotification } from '../services/notification'

const walletsStore = useWalletsStore()
const userIdInput = ref<number | null>(null)
const transactionTypeFilter = ref('all')
const statusFilter = ref('all')

const hasUnprocessedTransactions = computed(() => {
  return walletsStore.transactions.some(t => !t.is_processed)
})

const unprocessedCount = computed(() => {
  return walletsStore.transactions.filter(t => !t.is_processed).length
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

const getTransactionTypeClass = (type: string): string => {
  const classes: Record<string, string> = {
    deposit: 'bg-green-100 text-green-800',
    withdrawal: 'bg-red-100 text-red-800',
    bonus: 'bg-blue-100 text-blue-800',
    commission: 'bg-purple-100 text-purple-800',
    refund: 'bg-yellow-100 text-yellow-800',
    transfer: 'bg-gray-100 text-gray-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getAmountClass = (type: string): string => {
  if (type === 'deposit' || type === 'bonus') {
    return 'text-green-600'
  }
  return 'text-red-600'
}

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const loadUserTransactions = async () => {
  if (!userIdInput.value) return
  
  // Validation de sécurité : l'ID doit être un nombre positif
  const userId = typeof userIdInput.value === 'string' ? parseInt(userIdInput.value, 10) : userIdInput.value
  if (isNaN(userId) || userId <= 0 || !Number.isInteger(userId)) {
    const notification = useNotification()
    notification.addNotification('ID utilisateur invalide', 'error')
    return
  }
  
  try {
    await walletsStore.fetchUserTransactions(
      userId,
      1,
      transactionTypeFilter.value === 'all' ? undefined : transactionTypeFilter.value,
      statusFilter.value === 'all' ? undefined : statusFilter.value
    )
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

const applyFilters = () => {
  if (!userIdInput.value) return
  loadUserTransactions()
}

const resetView = () => {
  walletsStore.resetFilters()
  userIdInput.value = null
  transactionTypeFilter.value = 'all'
  statusFilter.value = 'all'
}
</script>

