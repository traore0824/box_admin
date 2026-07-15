import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'
import { useNotification } from '../services/notification'

interface Commission {
  id: number
  amount: string
  last_reconciliation_at: string | null
  calculated_total: string
  is_consistent: boolean
  available_amount: number | string
  withdrawn_amount: number | string
  total_amount: number | string
  ledger_total?: number | string
}

interface CommissionTransaction {
  id: number
  transaction: {
    id: number
    public_reference: string
    amount: string
  } | null
  commission: string
  commission_rate: string
  is_withdrawn: boolean
  notes: string | null
  created_at: string
}

interface CommissionWithdrawal {
  id: number
  total_amount: string
  calculated_total: string
  discrepancy: string
  status: 'pending' | 'completed' | 'cancelled'
  withdrawn_by: number
  withdrawn_by_email: string
  notes: string | null
  validation_errors: string | null
  created_at: string
  completed_at: string | null
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

      const data = await handleApiResponse<Commission | Commission[]>(
        response,
        'Erreur lors de la récupération de la commission'
      )
      // Si la réponse est un tableau, prendre le premier élément
      commission.value = Array.isArray(data) ? data[0] : data
      
      // Convertir les valeurs numériques en string si nécessaire
      if (commission.value) {
        if (typeof commission.value.available_amount === 'number') {
          commission.value.available_amount = commission.value.available_amount.toString()
        }
        if (typeof commission.value.withdrawn_amount === 'number') {
          commission.value.withdrawn_amount = commission.value.withdrawn_amount.toString()
        }
        if (typeof commission.value.total_amount === 'number') {
          commission.value.total_amount = commission.value.total_amount.toString()
        }
        if (typeof commission.value.ledger_total === 'number') {
          commission.value.ledger_total = commission.value.ledger_total.toString()
        }
      }
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

      const data = await handleApiResponse<{ results: CommissionTransaction[]; count: number }>(
        response,
        'Erreur lors de la récupération des transactions de commission'
      )
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

  // Retirer des commissions - Nouvelle API simplifiée
  async function withdrawCommissions(amount: number | string, notes?: string) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/commission/withdrawal', {
        method: 'POST',
        body: {
          amount: amount,
          notes: notes || ''
        }
      })

      const result = await handleApiResponse(
        response,
        'Erreur lors du retrait des commissions'
      )
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

      const data = await handleApiResponse<{ results: CommissionWithdrawal[]; count: number }>(
        response,
        'Erreur lors de la récupération des retraits'
      )
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

      const result = await handleApiResponse<ReconcileResponse>(
        response,
        'Erreur lors de la réconciliation'
      )
      const notification = useNotification()
      
      if (result.is_consistent) {
        notification.addNotification('Réconciliation réussie : tout est cohérent', 'success')
      } else {
        notification.addNotification(`Incohérence détectée : ${result.discrepancy} XOF`, 'warning')
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

