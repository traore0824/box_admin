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

export const useWalletsStore = defineStore('wallets', () => {
  const transactions = ref<WalletTransaction[]>([])
  const summary = ref<WalletSummary | null>(null)
  const selectedUser = ref<{ id: number; email: string; fullname: string } | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalTransactions = ref(0)
  const transactionTypeFilter = ref<string>('all')
  const statusFilter = ref<string>('all')

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

  // Réinitialiser les filtres
  function resetFilters() {
    transactionTypeFilter.value = 'all'
    statusFilter.value = 'all'
    selectedUser.value = null
    transactions.value = []
    summary.value = null
  }

  return {
    transactions,
    summary,
    selectedUser,
    isLoading,
    error,
    currentPage,
    totalTransactions,
    transactionTypeFilter,
    statusFilter,
    fetchUserTransactions,
    resetFilters
  }
})

