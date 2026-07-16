import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { Transaction } from '../types/transaction'
// import { useAuthStore } from './auth' // Non utilisé pour l'instant
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'
import { useNotification } from '../services/notification'

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

      const response = await fetchWithAuth('/box/all-transaction', {
        queryParams: buildQueryParams(page)
      })

      const data = await handleApiResponse<{ results: Transaction[]; count: number }>(
        response,
        'Erreur récupération transactions'
      )
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
    // Le watcher va déclencher fetchTransactions automatiquement
  }

  function updateStatusFilter(status: string) {
    statusFilter.value = status
    currentPage.value = 1
    // Le watcher va déclencher fetchTransactions automatiquement
  }

  function updateTypeTransFilter(type: string) {
    typeTransFilter.value = type
    currentPage.value = 1
    // Le watcher va déclencher fetchTransactions automatiquement
  }

  function applyFilters() {
    // Réinitialiser à la page 1 et recharger les transactions avec les nouveaux filtres
    currentPage.value = 1
    fetchTransactions(1)
  }

  // Watcher pour appliquer automatiquement les filtres quand ils changent
  let isInitialLoad = true
  watch([statusFilter, typeTransFilter, searchQuery], () => {
    // Ignorer le premier déclenchement (montage initial)
    if (isInitialLoad) {
      isInitialLoad = false
      return
    }
    // Appliquer les filtres automatiquement
    currentPage.value = 1
    fetchTransactions(1)
  })

  // 🔎 Local filtering (optionnel selon cas)
  function getFilteredTransactions() {
    return transactions.value
  }

  // 📡 Mettre à jour le statut d'une transaction (vérifie Feexpay)
  async function updateTransactionStatus(transactionId: number) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/transaction/update-status/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transaction_id: transactionId })
      })

      const result = await handleApiResponse<{ message?: string }>(
        response,
        'Erreur lors de la mise à jour du statut'
      )

      // Rafraîchir la liste des transactions
      await fetchTransactions(currentPage.value)
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error updating transaction status:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 📡 Valider une transaction de retrait/annulation (sans changer le statut)
  async function validateWithdrawal(transactionId: number, typeTrans?: string) {
    try {
      isLoading.value = true
      error.value = null

      const endpoint =
        typeTrans === 'partial_withdrawal'
          ? '/box/partial_withdrawal/validate-admin'
          : '/box/transaction-validate-withdrawal/v2'

      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transaction_id: transactionId })
      })

      return await handleApiResponse<{ message?: string; success?: boolean }>(
        response,
        'Erreur lors de la validation'
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error validating withdrawal:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ✅ Approuver une transaction de retrait ou d'annulation
  async function approveWithdrawal(transactionId: number, typeTrans?: string) {
    try {
      isLoading.value = true
      error.value = null

      const endpoint =
        typeTrans === 'partial_withdrawal'
          ? '/box/partial_withdrawal/approve-admin'
          : '/box/transaction-approve-withdrawal/v2'

      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transaction_id: transactionId })
      })

      const result = await handleApiResponse<{ success?: boolean; message?: string }>(
        response,
        'Erreur lors de l\'approbation de la transaction'
      )
      const notification = useNotification()
      
      if (result.success) {
        notification.addNotification(result.message || 'Transaction approuvée avec succès', 'success')
        // Rafraîchir la liste des transactions
        await fetchTransactions(currentPage.value)
      } else {
        throw new Error(result.message || 'Erreur lors de l\'approbation')
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'approbation'
      const notification = useNotification()
      notification.addNotification(error.value, 'error')
      console.error('Erreur lors de l\'approbation de la transaction:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ✏️ Mettre à jour la référence Feexpay (pending / timeout)
  async function updateTransactionReference(transactionId: number, reference: string) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/transaction/update-reference/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          reference: reference.trim()
        })
      })

      const data = await handleApiResponse<{ updated_by?: { email?: string } }>(
        response,
        'Erreur lors de la mise à jour de la référence'
      )

      await fetchTransactions(currentPage.value)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error updating transaction reference:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 🔍 Vérifier le statut d'une transaction sur Feexpay
  async function checkFeexpayStatus(transactionId: number) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/transaction-check-feexpay-status/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transaction_id: transactionId })
      })

      return await handleApiResponse<Record<string, unknown>>(
        response,
        'Erreur lors de la vérification du statut Feexpay'
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors de la vérification'
      console.error('Erreur lors de la vérification du statut Feexpay:', err)
      throw err
    } finally {
      isLoading.value = false
    }
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
    applyFilters,
    getFilteredTransactions,
    updateTransactionStatus,
    validateWithdrawal,
    approveWithdrawal,
    checkFeexpayStatus,
    updateTransactionReference
  }
})
