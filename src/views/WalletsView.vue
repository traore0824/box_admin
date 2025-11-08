<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Gestion des Wallets</h1>
      <button 
        v-if="viewMode === 'history'"
        @click="viewMode = 'list'"
        class="mt-4 sm:mt-0 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
      >
        <i class="fas fa-arrow-left mr-2"></i>
        Retour à la liste
      </button>
    </div>

    <!-- Note: Les statistiques wallet sont disponibles dans le Dashboard via /box/statistic -->

    <!-- Vue Liste des Wallets -->
    <div v-if="viewMode === 'list'">
      <!-- Recherche -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Liste des Wallets</h2>
        <div class="flex gap-4">
          <input 
            type="text"
            v-model="searchQuery"
            @input="handleSearch"
            placeholder="Rechercher par email ou ID utilisateur..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Liste des Wallets -->
      <div v-if="walletsStore.wallets.length > 0" class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solde Actuel
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Dépôts
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Retraits
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière Transaction
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="wallet in walletsStore.wallets" :key="wallet.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="wallet.user">
                    <p class="text-sm font-medium text-gray-900">{{ wallet.user.fullname || 'N/A' }}</p>
                    <p class="text-sm text-gray-500">{{ wallet.user.email || 'N/A' }}</p>
                  </div>
                  <div v-else>
                    <p class="text-sm text-gray-500">Utilisateur #{{ wallet.id }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm font-semibold text-blue-600">
                    {{ formatCurrency(parseFloat(wallet.balance)) }}
                  </p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm font-semibold text-green-600">
                    {{ formatCurrency(parseFloat(wallet.total_deposits)) }}
                  </p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm font-semibold text-red-600">
                    {{ formatCurrency(parseFloat(wallet.total_withdrawals)) }}
                  </p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ wallet.last_transaction_at ? formatDate(wallet.last_transaction_at) : 'Aucune' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    v-if="wallet.user"
                    @click="viewWalletHistory(wallet.user.id)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    <i class="fas fa-history mr-1"></i>
                    Voir historique
                  </button>
                  <span v-else class="text-gray-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="walletsStore.totalWallets > 0" class="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Page {{ walletsStore.currentPage }} sur {{ Math.ceil(walletsStore.totalWallets / 20) }}
          </div>
          <div class="flex space-x-2">
            <button 
              @click="loadWalletsPage(walletsStore.currentPage - 1)"
              :disabled="walletsStore.currentPage === 1 || walletsStore.isLoading"
              class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button 
              @click="loadWalletsPage(walletsStore.currentPage + 1)"
              :disabled="walletsStore.currentPage * 20 >= walletsStore.totalWallets || walletsStore.isLoading"
              class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Message si aucun wallet -->
      <div v-else-if="!walletsStore.isLoading" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <i class="fas fa-wallet text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 mb-2">Aucun wallet trouvé</p>
        <p class="text-sm text-gray-400">Essayez de modifier votre recherche</p>
      </div>
    </div>

    <!-- Vue Historique d'un Wallet -->
    <div v-if="viewMode === 'history'">
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
          <input 
            type="date"
            v-model="dateFromFilter"
            @change="applyFilters"
            placeholder="Date de début"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            type="date"
            v-model="dateToFilter"
            @change="applyFilters"
            placeholder="Date de fin"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
                  Date/Heure
                </th>
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
                  Description
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in walletsStore.transactions" :key="transaction.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(transaction.created_at) }}
                </td>
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
                  <span class="font-mono text-xs">{{ transaction.transaction_reference || transaction.reference }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {{ transaction.description }}
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

        <!-- Pagination -->
        <div v-if="walletsStore.totalTransactions > 0" class="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Page {{ walletsStore.currentPage }} sur {{ Math.ceil(walletsStore.totalTransactions / 10) }}
          </div>
          <div class="flex space-x-2">
            <button 
              @click="loadPage(walletsStore.currentPage - 1)"
              :disabled="walletsStore.currentPage === 1 || walletsStore.isLoading"
              class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button 
              @click="loadPage(walletsStore.currentPage + 1)"
              :disabled="walletsStore.currentPage * 10 >= walletsStore.totalTransactions || walletsStore.isLoading"
              class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWalletsStore } from '../stores/wallets'
import { useUsersStore } from '../stores/users'
import { useNotification } from '../services/notification'
import { formatCurrency } from '../utils/currency'

const walletsStore = useWalletsStore()
const usersStore = useUsersStore()
const route = useRoute()
const viewMode = ref<'list' | 'history'>('list')
const userIdInput = ref<number | null>(null)
const searchQuery = ref('')
const transactionTypeFilter = ref('all')
const statusFilter = ref('all')
const dateFromFilter = ref('')
const dateToFilter = ref('')
const currentUserId = ref<number | null>(null)

const hasUnprocessedTransactions = computed(() => {
  return walletsStore.transactions.some(t => !t.is_processed)
})

const unprocessedCount = computed(() => {
  return walletsStore.transactions.filter(t => !t.is_processed).length
})

// formatCurrency est importé depuis utils/currency

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatDateTime = (date: string): string => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
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
  
  await viewWalletHistory(userId)
}

const viewWalletHistory = async (userId: number) => {
  currentUserId.value = userId
  userIdInput.value = userId
  viewMode.value = 'history'
  
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
  if (!currentUserId.value) return
  
  walletsStore.fetchUserTransactions(
    currentUserId.value,
    1,
    transactionTypeFilter.value === 'all' ? undefined : transactionTypeFilter.value,
    statusFilter.value === 'all' ? undefined : statusFilter.value
  )
}

const loadPage = (page: number) => {
  if (!currentUserId.value) return
  
  walletsStore.fetchUserTransactions(
    currentUserId.value,
    page,
    transactionTypeFilter.value === 'all' ? undefined : transactionTypeFilter.value,
    statusFilter.value === 'all' ? undefined : statusFilter.value
  )
}

onMounted(async () => {
  // Vérifier si un user_id est passé en paramètre d'URL
  const userIdParam = route.query.user_id as string | undefined
  
  if (userIdParam) {
    const userId = parseInt(userIdParam, 10)
    if (!isNaN(userId) && userId > 0) {
      await viewWalletHistory(userId)
      return
    }
  }
  
  // Charger la liste des wallets au montage
  await walletsStore.fetchWalletsList(1)
})

// Recherche avec debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    walletsStore.fetchWalletsList(1, searchQuery.value || undefined)
  }, 500)
}

// Charger une page de la liste
const loadWalletsPage = (page: number) => {
  walletsStore.fetchWalletsList(page, searchQuery.value || undefined)
}
</script>
