<template>
  <div class="space-y-6">
    <!-- Header avec bouton retour -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="text-gray-600 hover:text-primary transition-colors">
          <i class="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Profil Utilisateur</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <i class="fas fa-spinner fa-spin text-3xl text-primary"></i>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- User Profile Content -->
    <div v-else-if="user" class="space-y-6">
      <!-- En-tête du profil -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <!-- Avatar -->
          <div class="flex-shrink-0 w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl">
            {{ getUserInitials(user) }}
          </div>
          
          <!-- Informations principales -->
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold text-gray-900 mb-1">
              {{ user.first_name }} {{ user.last_name }}
            </h2>
            <p class="text-gray-600 mb-2">{{ user.email }}</p>
            <div class="flex flex-wrap gap-2">
              <span :class="[
                'px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full',
                user.is_block ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              ]">
                <i :class="[
                  'fas mr-1',
                  user.is_block ? 'fa-lock' : 'fa-unlock'
                ]"></i>
                {{ user.is_block ? 'Bloqué' : 'Actif' }}
              </span>
              <span :class="[
                'px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full',
                user.agent_client ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              ]">
                {{ user.agent_client ? 'Agent' : 'Client' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations personnelles -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-user-circle mr-2 text-primary"></i>
          Informations personnelles
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <p class="text-gray-900">{{ user.phone || '-' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
            <p class="text-gray-900">{{ new Date(user.created_at).toLocaleDateString('fr-FR') }}</p>
          </div>
          <div v-if="user.birthday">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
            <p class="text-gray-900">{{ new Date(user.birthday).toLocaleDateString('fr-FR') }}</p>
          </div>
          <div v-if="user.sexe">
            <label class="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
            <p class="text-gray-900">{{ user.sexe }}</p>
          </div>
          <div v-if="user.referral_code">
            <label class="block text-sm font-medium text-gray-700 mb-1">Code parrainage</label>
            <p class="text-gray-900 font-mono">{{ user.referral_code }}</p>
          </div>
          <div v-if="user.user_referral_code">
            <label class="block text-sm font-medium text-gray-700 mb-1">Code parrain</label>
            <p class="text-gray-900 font-mono">{{ user.user_referral_code }}</p>
          </div>
          <div v-if="user.card_id">
            <label class="block text-sm font-medium text-gray-700 mb-1">Carte ID</label>
            <p class="text-gray-900 font-mono">{{ user.card_id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut KYC</label>
            <span :class="[
              'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
              getKycStatusClass(user.status)
            ]">
              {{ getKycStatusLabel(user.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Statistiques financières -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-chart-line mr-2 text-primary"></i>
          Statistiques financières
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Solde actuel (Wallet)</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ walletBalance ? formatCurrency(parseFloat(walletBalance.current_balance)) : '-' }}
            </p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Total dépôts</p>
            <p class="text-2xl font-bold text-green-600">
              {{ walletBalance ? formatCurrency(parseFloat(walletBalance.total_deposits)) : '-' }}
            </p>
          </div>
          <div class="bg-red-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Total retraits</p>
            <p class="text-2xl font-bold text-red-600">
              {{ walletBalance ? formatCurrency(parseFloat(walletBalance.total_withdrawals)) : '-' }}
            </p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Montant disponible</p>
            <p class="text-2xl font-bold text-gray-600">
              {{ walletBalance ? formatCurrency(parseFloat(walletBalance.available_amount)) : '-' }}
            </p>
          </div>
          <div class="bg-primary-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Solde total</p>
            <p class="text-2xl font-bold text-primary">
              {{ formatAmount(user.total_funds) }}
            </p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Caisse total</p>
            <p class="text-2xl font-bold text-purple-600">
              {{ user.total_box || 0 }}
            </p>
          </div>
        </div>
      </div>

      <!-- Historique des transactions -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-history mr-2 text-primary"></i>
          Historique des transactions
        </h3>
        <div v-if="transactionsLoading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-2xl text-primary"></i>
        </div>
        <div v-else-if="transactions.length === 0" class="text-center py-8 text-gray-500">
          Aucune transaction trouvée
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in transactions" :key="transaction.id">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(transaction.created_at) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {{ transaction.type_trans }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                  {{ formatAmount(transaction.amount) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getTransactionStatusClass(transaction.status)
                  ]">
                    {{ transaction.status }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                  {{ transaction.public_reference || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Portefeuille de l'utilisateur -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-wallet mr-2 text-primary"></i>
          Portefeuille de l'utilisateur
        </h3>
        <div v-if="walletTransactionsLoading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-2xl text-primary"></i>
        </div>
        <div v-else-if="walletTransactions.length === 0" class="text-center py-8 text-gray-500">
          Aucune transaction wallet trouvée
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde Avant</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde Après</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in walletTransactions" :key="transaction.id">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(transaction.created_at) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getWalletTransactionTypeClass(transaction.transaction_type)
                  ]">
                    {{ transaction.transaction_type_display }}
                  </span>
                </td>
                <td :class="[
                  'px-4 py-3 whitespace-nowrap text-sm font-semibold',
                  getWalletAmountClass(transaction.transaction_type)
                ]">
                  {{ transaction.transaction_type === 'deposit' || transaction.transaction_type === 'bonus' ? '+' : '-' }}
                  {{ formatCurrency(parseFloat(transaction.amount)) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ formatCurrency(parseFloat(transaction.balance_before)) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ formatCurrency(parseFloat(transaction.balance_after)) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getWalletStatusClass(transaction.status)
                  ]">
                    {{ transaction.status_display }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Caisses de l'utilisateur -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-piggy-bank mr-2 text-primary"></i>
          Caisses de l'utilisateur
        </h3>
        <div v-if="caissesLoading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-2xl text-primary"></i>
        </div>
        <div v-else-if="caisses.length === 0" class="text-center py-8 text-gray-500">
          Aucune caisse trouvée
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="caisse in caisses" :key="caisse.id" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h4 class="font-semibold text-gray-900 mb-2">{{ caisse.name }}</h4>
            <div class="space-y-1 text-sm">
              <p class="text-gray-600">
                <span class="font-medium">Montant épargné:</span> {{ formatAmount(caisse.savedAmount) }}
              </p>
              <p class="text-gray-600">
                <span class="font-medium">Objectif:</span> {{ formatAmount(caisse.targetAmount) }}
              </p>
              <p class="text-gray-600">
                <span class="font-medium">Fréquence:</span> {{ getFrequencyLabel(caisse.frequency) }}
              </p>
              <p class="text-gray-600">
                <span class="font-medium">Statut:</span>
                <span :class="[
                  'ml-1 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getCaisseStatusClass(caisse.status)
                ]">
                  {{ getCaisseStatusLabel(caisse.status) }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchWithAuth } from '../stores/fetchwithtoken'
import { formatCurrency, formatAmount } from '../utils/currency'
import { useNotification } from '../services/notification'

const route = useRoute()
const router = useRouter()
const notification = useNotification()

// State
const user = ref<any>(null)
const walletBalance = ref<any>(null)
const transactions = ref<any[]>([])
const walletTransactions = ref<any[]>([])
const caisses = ref<any[]>([])
const isLoading = ref(false)
const transactionsLoading = ref(false)
const walletTransactionsLoading = ref(false)
const caissesLoading = ref(false)
const error = ref<string | null>(null)

const userId = ref<number | null>(null)

// Fonction pour générer les initiales
const getUserInitials = (user: any): string => {
  const firstName = user.first_name || ''
  const lastName = user.last_name || ''
  const firstInitial = firstName.charAt(0).toUpperCase()
  const lastInitial = lastName.charAt(0).toUpperCase()
  return `${firstInitial}${lastInitial}` || 'U'
}

// Fonction pour obtenir le label KYC
const getKycStatusLabel = (status: string | null | undefined): string => {
  const labels: Record<string, string> = {
    null: 'Aucun document',
    pending: 'En attente',
    accept: 'Approuvé',
    reject: 'Rejeté'
  }
  return labels[status || 'null'] || 'Inconnu'
}

// Fonction pour obtenir la classe KYC
const getKycStatusClass = (status: string | null | undefined): string => {
  const classes: Record<string, string> = {
    null: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    accept: 'bg-green-100 text-green-800',
    reject: 'bg-red-100 text-red-800'
  }
  return classes[status || 'null'] || 'bg-gray-100 text-gray-800'
}

// Fonction pour obtenir la classe de statut de transaction
const getTransactionStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    accept: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
    timeout: 'bg-orange-100 text-orange-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Fonction pour obtenir la classe de type de transaction wallet
const getWalletTransactionTypeClass = (type: string): string => {
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

// Fonction pour obtenir la classe de montant wallet
const getWalletAmountClass = (type: string): string => {
  if (type === 'deposit' || type === 'bonus') {
    return 'text-green-600'
  }
  return 'text-red-600'
}

// Fonction pour obtenir la classe de statut wallet
const getWalletStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Fonction pour obtenir le label de fréquence
const getFrequencyLabel = (frequency: string): string => {
  const labels: Record<string, string> = {
    daily: 'Quotidienne',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuelle'
  }
  return labels[frequency] || frequency
}

// Fonction pour obtenir le label de statut de caisse
const getCaisseStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: 'Active',
    completed: 'Terminée',
    blocked: 'Bloquée'
  }
  return labels[status] || status
}

// Fonction pour obtenir la classe de statut de caisse
const getCaisseStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    blocked: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Fonction pour formater la date et l'heure
const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fonction pour revenir en arrière
const goBack = () => {
  router.push({ name: 'users' })
}

// Charger les informations de l'utilisateur
const loadUserInfo = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Récupérer l'ID depuis la route
    const id = route.params.id as string
    userId.value = parseInt(id)

    if (!userId.value) {
      throw new Error('ID utilisateur invalide')
    }

    // Charger les informations de base de l'utilisateur depuis la liste
    // On va utiliser l'API /auth/listUser/ avec un filtre par ID
    const response = await fetchWithAuth('/auth/listUser/', {
      queryParams: { page: '1', page_size: '100' }
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des informations utilisateur')
    }

    const data = await response.json()
    const foundUser = data.results?.find((u: any) => u.id === userId.value) || data.results?.[0]

    if (!foundUser) {
      throw new Error('Utilisateur non trouvé')
    }

    user.value = foundUser

    // Charger toutes les données en parallèle
    await Promise.all([
      loadWalletBalance(),
      loadTransactions(),
      loadWalletTransactions(),
      loadCaisses()
    ])
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    console.error('Error loading user info:', err)
    notification.addNotification(error.value, 'error')
  } finally {
    isLoading.value = false
  }
}

// Charger le solde wallet
const loadWalletBalance = async () => {
  if (!userId.value) return

  try {
    const response = await fetchWithAuth('/box/wallet/balance', {
      queryParams: { user_id: userId.value.toString() }
    })

    if (!response.ok) {
      if (response.status === 404) {
        walletBalance.value = null
        return
      }
      throw new Error('Erreur lors de la récupération du solde wallet')
    }

    const data = await response.json()
    if (data.success && data.data) {
      walletBalance.value = data.data
    }
  } catch (err) {
    console.error('Error loading wallet balance:', err)
  }
}

// Charger les transactions
const loadTransactions = async () => {
  if (!userId.value) return

  try {
    transactionsLoading.value = true
    const response = await fetchWithAuth('/box/transaction/list', {
      queryParams: { user_id: userId.value.toString(), page_size: '20' }
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des transactions')
    }

    const data = await response.json()
    transactions.value = data.results || []
  } catch (err) {
    console.error('Error loading transactions:', err)
  } finally {
    transactionsLoading.value = false
  }
}

// Charger les transactions wallet
const loadWalletTransactions = async () => {
  if (!userId.value) return

  try {
    walletTransactionsLoading.value = true
    const response = await fetchWithAuth('/box/wallet/transactions', {
      queryParams: { user_id: userId.value.toString(), page_size: '20' }
    })

    if (!response.ok) {
      if (response.status === 404) {
        walletTransactions.value = []
        return
      }
      throw new Error('Erreur lors de la récupération des transactions wallet')
    }

    const data = await response.json()
    if (data.success && data.data) {
      walletTransactions.value = data.data
    } else {
      walletTransactions.value = []
    }
  } catch (err) {
    console.error('Error loading wallet transactions:', err)
  } finally {
    walletTransactionsLoading.value = false
  }
}

// Charger les caisses
const loadCaisses = async () => {
  if (!userId.value) return

  try {
    caissesLoading.value = true
    const response = await fetchWithAuth('/box/caisse', {
      queryParams: { user_id: userId.value.toString() }
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des caisses')
    }

    const data = await response.json()
    caisses.value = data.results || data || []
  } catch (err) {
    console.error('Error loading caisses:', err)
  } finally {
    caissesLoading.value = false
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

