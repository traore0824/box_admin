import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'

interface WalletTransaction {
  id: number
  user: number
  user_email: string
  transaction_type: 'deposit' | 'withdrawal' | 'bonus' | 'commission' | 'refund' | 'transfer'
  transaction_type_display: string
  amount: string
  balance_before: string
  balance_after: string
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  status_display: string
  transaction: {
    id: number
    public_reference: string
  } | null
  transaction_reference: string
  reference: string
  description: string
  metadata: Record<string, any>
  is_processed: boolean
  processed_at: string | null
  created_at: string
}

interface Wallet {
  id: number
  user: {
    id: number
    email: string
    fullname: string
  }
  balance: string
  total_deposits: string
  total_withdrawals: string
  last_transaction_at: string | null
}

interface WalletSummary {
  current_balance: string
  total_deposits: string
  total_withdrawals: string
  available_amount: string
  withdraw_amount: string
}

interface WalletTransactionsResponse {
  success: boolean
  user?: {
    id: number
    email: string
    fullname: string
  }
  data: WalletTransaction[]
  summary: WalletSummary
}

interface WalletsListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Wallet[]
}

interface WalletStats {
  total_wallets: number
  total_balance: string
  total_deposits: string
  total_withdrawals: string
}

export const useWalletsStore = defineStore('wallets', () => {
  const transactions = ref<WalletTransaction[]>([])
  const summary = ref<WalletSummary | null>(null)
  const selectedUser = ref<{ id: number; email: string; fullname: string } | null>(null)
  const wallets = ref<Wallet[]>([])
  const stats = ref<WalletStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalTransactions = ref(0)
  const totalWallets = ref(0)
  const transactionTypeFilter = ref<string>('all')
  const statusFilter = ref<string>('all')
  const searchQuery = ref('')
  const dateFromFilter = ref('')
  const dateToFilter = ref('')

  // Récupérer les transactions wallet d'un utilisateur (ADMIN)
  async function fetchUserTransactions(userId: number, page = 1, transactionType?: string, status?: string) {
    try {
      isLoading.value = true
      error.value = null

      const params: Record<string, string> = {
        user_id: userId.toString(),
        page: page.toString(),
        page_size: '10'
      }

      if (transactionType && transactionType !== 'all') {
        params.transaction_type = transactionType
      }

      if (status && status !== 'all') {
        params.status = status
      }

      const response = await fetchWithAuth('/box/admin/wallet/transactions', {
        method: 'GET',
        queryParams: params
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des transactions wallet')
      }

      const data: WalletTransactionsResponse = await response.json()
      transactions.value = data.data
      summary.value = data.summary
      if (data.user) selectedUser.value = data.user
      totalTransactions.value = data.data.length // Note: L'API pourrait retourner un count séparé
      currentPage.value = page
      transactionTypeFilter.value = transactionType || 'all'
      statusFilter.value = status || 'all'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching wallet transactions:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Récupérer la liste de tous les wallets
  // Note: Si l'endpoint /box/wallet/admin/list n'existe pas, on utilise la liste des utilisateurs
  async function fetchWalletsList(page = 1, search?: string) {
    try {
      isLoading.value = true
      error.value = null

      // Essayer d'abord l'endpoint dédié
      try {
        const params: Record<string, string> = {
          page: page.toString(),
          page_size: '20'
        }

        if (search && search.trim()) {
          params.search = search.trim()
        }

        const response = await fetchWithAuth('/box/wallet/admin/list', {
          method: 'GET',
          queryParams: params
        })

        if (response.ok) {
          const data: WalletsListResponse = await response.json()
          wallets.value = data.results
          totalWallets.value = data.count
          currentPage.value = page
          if (search) searchQuery.value = search
          return
        }
      } catch (err) {
        // Si l'endpoint n'existe pas, on continue avec la méthode alternative
        if (import.meta.env.DEV) {
          console.log('Endpoint /box/wallet/admin/list non disponible, utilisation de la liste des utilisateurs')
        }
      }

      // Méthode alternative: utiliser la liste des utilisateurs
      // Note: Cette méthode nécessite que chaque utilisateur ait un wallet
      // Pour l'instant, on laisse vide et l'utilisateur devra rechercher par ID
      wallets.value = []
      totalWallets.value = 0
      if (import.meta.env.DEV) {
        console.log('Utilisez la recherche par ID utilisateur pour voir les wallets')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching wallets list:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Récupérer les statistiques des wallets
  // Note: Si l'endpoint n'existe pas, on retourne des stats vides
  async function fetchWalletStats() {
    try {
      isLoading.value = true
      error.value = null

      try {
        const response = await fetchWithAuth('/box/wallet/admin/stats', {
          method: 'GET'
        })

        if (response.ok) {
          stats.value = await response.json()
          return
        }
      } catch (err) {
        // Si l'endpoint n'existe pas, on continue sans erreur
        if (import.meta.env.DEV) {
          console.log('Endpoint /box/wallet/admin/stats non disponible')
        }
      }

      // Stats par défaut si l'endpoint n'existe pas
      stats.value = {
        total_wallets: 0,
        total_balance: '0',
        total_deposits: '0',
        total_withdrawals: '0'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching wallet stats:', err)
      // Ne pas throw pour ne pas bloquer l'interface
    } finally {
      isLoading.value = false
    }
  }

  // Réinitialiser les filtres
  function resetFilters() {
    transactionTypeFilter.value = 'all'
    statusFilter.value = 'all'
    selectedUser.value = null
    transactions.value = []
    summary.value = null
    searchQuery.value = ''
    dateFromFilter.value = ''
    dateToFilter.value = ''
  }

  return {
    transactions,
    summary,
    selectedUser,
    wallets,
    stats,
    isLoading,
    error,
    currentPage,
    totalTransactions,
    totalWallets,
    transactionTypeFilter,
    statusFilter,
    searchQuery,
    dateFromFilter,
    dateToFilter,
    fetchUserTransactions,
    fetchWalletsList,
    fetchWalletStats,
    resetFilters
  }
})

