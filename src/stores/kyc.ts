import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'
import { useNotification } from '../services/notification'

interface KYCUser {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  phone: string
  status: 'pending' | 'accept' | 'reject' | null
  card_id: string | null
  user_cards: string[] // URLs des images de documents KYC
  created_at: string
}

interface KYCResponse {
  count: number
  next: string | null
  previous: string | null
  results: KYCUser[]
}

export const useKYCStore = defineStore('kyc', () => {
  const pendingUsers = ref<KYCUser[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPending = ref(0)
  const searchQuery = ref('')

  // Récupérer la liste des demandes KYC en attente
  async function fetchPendingKYCs(page = 1, search?: string) {
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

      const response = await fetchWithAuth('/auth/list-kyc-pending', {
        method: 'GET',
        queryParams: params
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes KYC')
      }

      const data: KYCResponse = await response.json()
      pendingUsers.value = data.results
      totalPending.value = data.count
      currentPage.value = page
      if (search) searchQuery.value = search
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching pending KYCs:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Mettre à jour le statut KYC (approuver, rejeter, mettre en attente ou réinitialiser)
  async function updateKycStatus(
    userId: number, 
    status: 'accept' | 'reject' | 'pending' | 'null', 
    rejectionReason?: string
  ) {
    try {
      isLoading.value = true
      error.value = null

      const body: any = {
        user_id: userId,
        status
      }

      if (status === 'reject' && rejectionReason) {
        body.rejection_reason = rejectionReason
      }

      const response = await fetchWithAuth('/auth/update-kyc-status/', {
        method: 'POST',
        body
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || data.message || 'Erreur lors de la mise à jour du statut KYC')
      }

      const result = await response.json()
      const notification = useNotification()
      
      switch (status) {
        case 'accept':
          notification.addNotification('Demande KYC approuvée avec succès', 'success')
          break
        case 'reject':
          notification.addNotification('Demande KYC rejetée', 'info')
          break
        case 'pending':
          notification.addNotification('Statut KYC mis à jour: En attente', 'info')
          break
        case 'null':
          notification.addNotification('Statut KYC réinitialisé', 'info')
          break
      }

      // Rafraîchir la liste
      await fetchPendingKYCs(currentPage.value, searchQuery.value)

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
    pendingUsers,
    isLoading,
    error,
    currentPage,
    totalPending,
    searchQuery,
    fetchPendingKYCs,
    updateKycStatus
  }
})

