import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Transaction } from '../types/transaction'
// import { useAuthStore } from './auth' // Non utilisé pour l'instant
import { fetchWithAuth } from './fetchwithtoken'

export const useTransactionsStore = defineStore('transactions', () => {
  // const authStore = useAuthStore() // Non utilisé pour l'instant

  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const searchQuery = ref('')
  const statusFilter = ref<string>('all')
  const typeTransFilter = ref<string>('all')
  const currentPage = ref(1)
  const itemsPerPage = 10
  const totalTransactions = ref(0)

  // ⚙️ Nouvelle version : retourne un objet utilisable par `queryParams`
  function buildQueryParams(page = 1): Record<string, string> {
    const params: Record<string, string> = {
      page: page.toString(),
      page_size: itemsPerPage.toString()
    }

    if (searchQuery.value.trim() !== '') {
      params.q = searchQuery.value.trim()
    }

    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value
    }

    if (typeTransFilter.value !== 'all') {
      params.type_trans = typeTransFilter.value
    }

    return params
  }

  // 📡 Requête API avec fetchWithAuth
  async function fetchTransactions(page = 1) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/transaction', {
        queryParams: buildQueryParams(page)
      })

      if (!response.ok) throw new Error('Erreur récupération transactions')

      const data = await response.json()
      transactions.value = data.results
      totalTransactions.value = data.count
      currentPage.value = page
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Erreur lors du fetch des transactions:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 🔄 Filtres
  function updateSearchQuery(query: string) {
    searchQuery.value = query
    currentPage.value = 1
    fetchTransactions(1)
  }

  function updateStatusFilter(status: string) {
    statusFilter.value = status
    currentPage.value = 1
    fetchTransactions(1)
  }

  function updateTypeTransFilter(type: string) {
    typeTransFilter.value = type
    currentPage.value = 1
    fetchTransactions(1)
  }

  // 🔎 Local filtering (optionnel selon cas)
  function getFilteredTransactions() {
    return transactions.value
  }

  return {
    transactions,
    isLoading,
    error,
    searchQuery,
    statusFilter,
    typeTransFilter,
    currentPage,
    itemsPerPage,
    totalTransactions,
    fetchTransactions,
    updateSearchQuery,
    updateStatusFilter,
    updateTypeTransFilter,
    getFilteredTransactions
  }
})
