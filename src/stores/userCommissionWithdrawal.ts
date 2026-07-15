import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'
import { useNotification } from '../services/notification'

interface UserCommissionWithdrawal {
  id: number
  user: number
  user_email: string
  payment_mode?: string
  phone?: string
  amount: string
  status: 'pending' | 'completed' | 'rejected' | 'cancelled'
  notes: string | null
  processed_by: number | null
  processed_by_email: string | null
  rejection_reason: string | null
  created_at: string
  processed_at: string | null
}

export const useUserCommissionWithdrawalStore = defineStore('userCommissionWithdrawal', () => {
  const withdrawals = ref<UserCommissionWithdrawal[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalWithdrawals = ref(0)
  const statusFilter = ref<string>('all')

  // Récupérer les demandes de retrait de commission utilisateur
  async function fetchWithdrawals(page = 1, status?: string) {
    try {
      isLoading.value = true
      error.value = null

      const params: Record<string, string> = {
        page: page.toString(),
        page_size: '10'
      }

      if (status && status !== 'all') {
        params.status = status
      }

      const response = await fetchWithAuth('/box/user-commission/withdrawals', {
        method: 'GET',
        queryParams: params
      })

      const data = await handleApiResponse<{ results: UserCommissionWithdrawal[]; count: number }>(
        response,
        'Erreur lors de la récupération des demandes de retrait'
      )
      withdrawals.value = data.results
      totalWithdrawals.value = data.count
      currentPage.value = page
      if (status) statusFilter.value = status
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching user commission withdrawals:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Récupérer les détails d'une demande
  async function fetchWithdrawalDetails(id: number) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth(`/box/user-commission/withdrawal/${id}`, {
        method: 'GET'
      })

      return await handleApiResponse(
        response,
        'Erreur lors de la récupération des détails'
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching withdrawal details:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Traiter une demande (accepter ou rejeter)
  async function processWithdrawal(id: number, status: 'completed' | 'rejected', rejectionReason?: string) {
    try {
      isLoading.value = true
      error.value = null

      const body: { status: string; rejection_reason?: string } = { status }
      
      if (status === 'rejected' && rejectionReason) {
        body.rejection_reason = rejectionReason
      }

      const response = await fetchWithAuth(`/box/user-commission/withdrawal/${id}/process`, {
        method: 'PATCH',
        body
      })

      const result = await handleApiResponse(
        response,
        'Erreur lors du traitement de la demande'
      )
      const notification = useNotification()
      
      if (status === 'completed') {
        notification.addNotification('Demande de retrait approuvée avec succès', 'success')
      } else {
        notification.addNotification('Demande de retrait rejetée', 'info')
      }

      // Rafraîchir la liste
      await fetchWithdrawals(currentPage.value, statusFilter.value === 'all' ? undefined : statusFilter.value)

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
    withdrawals,
    isLoading,
    error,
    currentPage,
    totalWithdrawals,
    statusFilter,
    fetchWithdrawals,
    fetchWithdrawalDetails,
    processWithdrawal
  }
})

