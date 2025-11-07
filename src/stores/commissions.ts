import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'
import { useNotification } from '../services/notification'

interface Commission {
  id: number
  amount: string
  last_reconciliation_at: string | null
  calculated_total: string
  is_consistent: boolean
}

interface CommissionTransaction {
  id: number
  transaction: {
    id: number
    public_reference: string
    amount: string
  }
  commission: string
  commission_rate: string
  is_withdrawn: boolean
  created_at: string
}

interface CommissionWithdrawal {
  id: number
  total_amount: string
  status: 'pending' | 'completed' | 'cancelled'
  withdrawn_by: {
    id: number
    email: string
  }
  created_at: string
  completed_at: string | null
  notes: string | null
}

interface ReconcileResponse {
  calculated_total: string
  current_amount: string
  total_withdrawn: string
  total_all_commissions: string
  is_consistent: boolean
  discrepancy: string
}

export const useCommissionsStore = defineStore('commissions', () => {
  const commission = ref<Commission | null>(null)
  const commissionTransactions = ref<CommissionTransaction[]>([])
  const withdrawals = ref<CommissionWithdrawal[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalTransactions = ref(0)
  const totalWithdrawals = ref(0)
  const isWithdrawnFilter = ref<boolean | null>(null)

  // Récupérer la commission totale
  async function fetchCommission() {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/commission', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la commission')
      }

      commission.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching commission:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Récupérer les transactions de commission
  async function fetchCommissionTransactions(page = 1, isWithdrawn: boolean | null = null) {
    try {
      isLoading.value = true
      error.value = null

      const params: Record<string, string> = {
        page: page.toString(),
        page_size: '10'
      }

      if (isWithdrawn !== null) {
        params.is_withdrawn = isWithdrawn.toString()
      }

      const response = await fetchWithAuth('/box/commission/transactions', {
        method: 'GET',
        queryParams: params
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des transactions de commission')
      }

      const data = await response.json()
      commissionTransactions.value = data.results
      totalTransactions.value = data.count
      currentPage.value = page
      isWithdrawnFilter.value = isWithdrawn
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching commission transactions:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Retirer des commissions
  async function withdrawCommissions(commissionTransactionIds: number[], totalAmount: string, notes?: string) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/commission/withdrawal', {
        method: 'POST',
        body: {
          commission_transaction_ids: commissionTransactionIds,
          total_amount: totalAmount,
          notes: notes || ''
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || data.message || 'Erreur lors du retrait des commissions')
      }

      const result = await response.json()
      const notification = useNotification()
      notification.addNotification('Retrait de commissions effectué avec succès', 'success')
      
      // Rafraîchir les données
      await fetchCommission()
      await fetchCommissionTransactions(1, isWithdrawnFilter.value)
      await fetchWithdrawals()

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      const notification = useNotification()
      notification.addNotification(error.value, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Récupérer les retraits de commissions
  async function fetchWithdrawals(page = 1, status?: string) {
    try {
      isLoading.value = true
      error.value = null

      const params: Record<string, string> = {
        page: page.toString(),
        page_size: '10'
      }

      if (status) {
        params.status = status
      }

      const response = await fetchWithAuth('/box/commission/withdrawals', {
        method: 'GET',
        queryParams: params
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des retraits')
      }

      const data = await response.json()
      withdrawals.value = data.results
      totalWithdrawals.value = data.count
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching withdrawals:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Réconcilier les commissions
  async function reconcileCommissions() {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/commission/reconcile', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la réconciliation')
      }

      const result: ReconcileResponse = await response.json()
      const notification = useNotification()
      
      if (result.is_consistent) {
        notification.addNotification('Réconciliation réussie : tout est cohérent', 'success')
      } else {
        notification.addNotification(`Incohérence détectée : ${result.discrepancy} FCFA`, 'warning')
      }

      // Rafraîchir la commission
      await fetchCommission()

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      const notification = useNotification()
      notification.addNotification(error.value, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    commission,
    commissionTransactions,
    withdrawals,
    isLoading,
    error,
    currentPage,
    totalTransactions,
    totalWithdrawals,
    isWithdrawnFilter,
    fetchCommission,
    fetchCommissionTransactions,
    withdrawCommissions,
    fetchWithdrawals,
    reconcileCommissions
  }
})

