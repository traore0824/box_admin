import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'
import { useNotification } from '../services/notification'

export interface KYCUser {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  phone: string
  status: 'pending' | 'accept' | 'reject' | null
  card_id: string | null
  user_cards: string[]
  created_at: string
  is_active: boolean
  is_block: boolean
}

export interface KYCStats {
  kyc_verified: number
  kyc_pending: number
  kyc_rejected: number
  kyc_not_submitted: number
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

  // Stats KYC issues de GET /box/statistic
  const stats = ref<KYCStats>({
    kyc_verified: 0,
    kyc_pending: 0,
    kyc_rejected: 0,
    kyc_not_submitted: 0
  })
  const statsLoading = ref(false)

  // Total pages calculé
  const totalPages = computed(() => Math.ceil(totalPending.value / 20))

  // Récupérer les stats KYC depuis le dashboard
  async function fetchStats() {
    try {
      statsLoading.value = true
      const response = await fetchWithAuth('/box/statistic', { method: 'GET' })
      if (!response.ok) return
      const data = await response.json()
      stats.value = {
        kyc_verified: data.kyc_verified ?? 0,
        kyc_pending: data.kyc_pending ?? 0,
        kyc_rejected: data.kyc_rejected ?? 0,
        kyc_not_submitted: data.kyc_not_submitted ?? 0
      }
    } catch (err) {
      console.error('Error fetching KYC stats:', err)
    } finally {
      statsLoading.value = false
    }
  }

  // Récupérer la liste des demandes KYC en attente
  async function fetchPendingKYCs(page = 1, search?: string) {
    try {
      isLoading.value = true
      error.value = null

      const params: Record<string, string> = {
        page: page.toString(),
        page_size: '20'
      }

      if (search !== undefined) {
        searchQuery.value = search
      }

      if (searchQuery.value.trim()) {
        params.q = searchQuery.value.trim()
      }

      const response = await fetchWithAuth('/auth/list-kyc-pending', {
        method: 'GET',
        queryParams: params
      })

      const data = await handleApiResponse<KYCResponse>(
        response,
        'Erreur lors de la récupération des demandes KYC'
      )
      pendingUsers.value = data.results
      totalPending.value = data.count
      currentPage.value = page
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

      const body: Record<string, unknown> = { user_id: userId, status }
      if (status === 'reject' && rejectionReason) {
        body.rejection_reason = rejectionReason
      }

      const response = await fetchWithAuth('/auth/update-kyc-status/', {
        method: 'POST',
        body
      })

      const result = await handleApiResponse(
        response,
        'Erreur lors de la mise à jour du statut KYC'
      )
      const notification = useNotification()

      const messages: Record<string, string> = {
        accept: 'Demande KYC approuvée avec succès',
        reject: 'Demande KYC rejetée',
        pending: 'Statut KYC mis à jour : En attente',
        null: 'Statut KYC réinitialisé'
      }
      const types: Record<string, 'success' | 'info'> = {
        accept: 'success',
        reject: 'info',
        pending: 'info',
        null: 'info'
      }
      notification.addNotification(messages[status], types[status])

      // Rafraîchir la liste et les stats
      await Promise.all([
        fetchPendingKYCs(currentPage.value),
        fetchStats()
      ])

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      const notification = useNotification()
      notification.addNotification(error.value!, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Vérification manuelle par l'admin (force status = accept)
  async function adminVerifyUser(payload: {
    user_id: number
    first_name?: string
    last_name?: string
    birthday?: string
    sexe?: string
    card_id?: string
    photos?: string[]
  }) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/auth/admin-verify-user/', {
        method: 'POST',
        body: payload
      })

      const result = await handleApiResponse(
        response,
        'Erreur lors de la vérification manuelle'
      )
      const notification = useNotification()
      notification.addNotification('Utilisateur vérifié manuellement avec succès', 'success')

      await Promise.all([
        fetchPendingKYCs(currentPage.value),
        fetchStats()
      ])

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      const notification = useNotification()
      notification.addNotification(error.value!, 'error')
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
    totalPages,
    searchQuery,
    stats,
    statsLoading,
    fetchStats,
    fetchPendingKYCs,
    updateKycStatus,
    adminVerifyUser
  }
})
