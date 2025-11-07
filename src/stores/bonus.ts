import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'
import { useNotification } from '../services/notification'

interface BonusWithdrawal {
  id: number
  user: {
    id: number
    email: string
    fullname: string
  }
  amount: string
  status: 'pending' | 'completed' | 'rejected' | 'cancelled'
  created_at: string
  notes: string | null
  rejection_reason: string | null
}

export const useBonusStore = defineStore('bonus', () => {
  const withdrawals = ref<BonusWithdrawal[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalWithdrawals = ref(0)
  const statusFilter = ref<string>('all')

  // Récupérer les demandes de retrait de bonus
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

      const response = await fetchWithAuth('/box/reward/withdrawals', {
        method: 'GET',
        queryParams: params
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes de retrait')
      }

      const data = await response.json()
      withdrawals.value = data.results
      totalWithdrawals.value = data.count
      currentPage.value = page
      if (status) statusFilter.value = status
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching bonus withdrawals:', err)
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

      const response = await fetchWithAuth(`/box/reward/withdrawal/${id}`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails')
      }

      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching withdrawal details:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Traiter une demande (accepter ou rejeter)
  async function processWithdrawal(id: number, action: 'accept' | 'reject', rejectionReason?: string, notes?: string) {
    try {
      isLoading.value = true
      error.value = null

      const body: any = { action }
      if (notes) body.notes = notes
      if (action === 'reject' && rejectionReason) {
        body.rejection_reason = rejectionReason
      }

      const response = await fetchWithAuth(`/box/reward/withdrawal/${id}/process`, {
        method: 'POST',
        body
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || data.message || 'Erreur lors du traitement de la demande')
      }

      const result = await response.json()
      const notification = useNotification()
      
      if (action === 'accept') {
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

