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

interface WalletSummary {
  current_balance: string
  total_deposits: string
  total_withdrawals: string
  available_amount: string
  withdraw_amount: string
}

interface Wallet {
  id: number
  user?: {
    id: number
    email: string
    fullname: string
  } | null
  balance: string
  total_deposits: string
  total_withdrawals: string
  last_transaction_at: string | null
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

export const useWalletsStore = defineStore('wallets', () => {
  const transactions = ref<WalletTransaction[]>([])
  const summary = ref<WalletSummary | null>(null)
  const selectedUser = ref<{ id: number; email: string; fullname: string } | null>(null)
  const wallets = ref<Wallet[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalTransactions = ref(0)
  const totalWallets = ref(0)
  const transactionTypeFilter = ref<string>('all')
  const statusFilter = ref<string>('all')
  const dateFromFilter = ref('')
  const dateToFilter = ref('')
  const searchQuery = ref('')

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

      const response = await fetchWithAuth('/box/wallet/admin/transactions', {
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
  async function fetchWalletsList(page = 1, search?: string) {
    try {
      isLoading.value = true
      error.value = null

      const params: Record<string, string> = {
        page: page.toString(),
        page_size: '20'
      }

      if (search && search.trim()) {
        params.q = search.trim()
      }

      const response = await fetchWithAuth('/box/wallet/admin/list', {
        method: 'GET',
        queryParams: params
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la liste des wallets')
      }

      const data = await response.json()
      
      // Log pour debug (uniquement en dev)
      if (import.meta.env.DEV) {
        console.log('API Response:', data)
      }
      
      // Gérer différents formats de réponse
      if (Array.isArray(data)) {
        // Si l'API retourne directement un tableau
        wallets.value = data
        totalWallets.value = data.length
      } else if (data.results && Array.isArray(data.results)) {
        // Si l'API retourne un objet avec results
        wallets.value = data.results
        totalWallets.value = data.count || data.results.length
      } else {
        // Format inattendu
        wallets.value = []
        totalWallets.value = 0
        if (import.meta.env.DEV) {
          console.warn('Format de réponse inattendu:', data)
        }
      }
      
      currentPage.value = page
      if (search) searchQuery.value = search
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching wallets list:', err)
      throw err
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
    dateFromFilter.value = ''
    dateToFilter.value = ''
  }

  return {
    transactions,
    summary,
    selectedUser,
    wallets,
    isLoading,
    error,
    currentPage,
    totalTransactions,
    totalWallets,
    transactionTypeFilter,
    statusFilter,
    dateFromFilter,
    dateToFilter,
    searchQuery,
    fetchUserTransactions,
    fetchWalletsList,
    resetFilters
  }
})

