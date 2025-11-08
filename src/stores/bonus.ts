import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'
import { useNotification } from '../services/notification'

interface BonusWithdrawal {
  id: number
  user: number
  user_email: string
  reward: number | null
  amount: string
  status: 'pending' | 'completed' | 'rejected' | 'cancelled'
  notes: string | null
  rejection_reason: string | null
  processed_by: number | null
  processed_by_email: string | null
  created_at: string
  processed_at: string | null
}

interface BonusAttribution {
  id: number
  parrain: {
    id: number
    email: string
    fullname: string
  }
  filleul: {
    id: number
    email: string
    fullname: string
  }
  amount: string
  transaction_reference: string
  created_at: string
}

export const useBonusStore = defineStore('bonus', () => {
  const withdrawals = ref<BonusWithdrawal[]>([])
  const attributions = ref<BonusAttribution[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const currentAttributionPage = ref(1)
  const totalWithdrawals = ref(0)
  const totalAttributions = ref(0)
  const statusFilter = ref<string>('all')
  const attributionSearchQuery = ref('')

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
  async function processWithdrawal(id: number, status: 'completed' | 'rejected', rejectionReason?: string) {
    try {
      isLoading.value = true
      error.value = null

      const body: { status: string; rejection_reason?: string } = { status }
      
      if (status === 'rejected' && rejectionReason) {
        body.rejection_reason = rejectionReason
      }

      const response = await fetchWithAuth(`/box/reward/withdrawal/${id}/process`, {
        method: 'PATCH',
        body
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || data.message || 'Erreur lors du traitement de la demande')
      }

      const result = await response.json()
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

  // Récupérer les attributions de bonus
  async function fetchAttributions(page = 1, search?: string) {
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

      const response = await fetchWithAuth('/box/reward/attributions', {
        method: 'GET',
        queryParams: params
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des attributions de bonus')
      }

      const data = await response.json()
      
      // Gérer différents formats de réponse
      if (Array.isArray(data)) {
        attributions.value = data
        totalAttributions.value = data.length
      } else if (data.results && Array.isArray(data.results)) {
        attributions.value = data.results
        totalAttributions.value = data.count || data.results.length
      } else {
        attributions.value = []
        totalAttributions.value = 0
      }
      
      currentAttributionPage.value = page
      if (search) attributionSearchQuery.value = search
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching bonus attributions:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    withdrawals,
    attributions,
    isLoading,
    error,
    currentPage,
    currentAttributionPage,
    totalWithdrawals,
    totalAttributions,
    statusFilter,
    attributionSearchQuery,
    fetchWithdrawals,
    fetchAttributions,
    fetchWithdrawalDetails,
    processWithdrawal
  }
})

