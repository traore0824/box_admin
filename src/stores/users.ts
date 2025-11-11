import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'
import { useNotification } from '../services/notification'

interface User {
  id: number
  first_name: string | null
  last_name: string | null
  email: string
  phone: string
  created_at: string
  referral_code: string | null
  birthday: string | null
  user_referral_code: string | null
  card_id: string | null
  total_funds: number | string
  push_notification: boolean
  email_notification: boolean
  updated_at: string | null
  commission_amount: string
  number_sponsor: number
  sexe: string | null
  total_box: number
  available_amout: string
  withdraw_amout: string
  agent_client?: boolean
  is_block: boolean
  reason_block: string | null
  pin_define: boolean
  pin_incorrect_count: number
  status?: 'pending' | 'accept' | 'reject' | null
  user_cards?: string[]
}

interface UsersResponse {
  count: number
  next: string | null
  previous: string | null
  results: User[]
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const blockFilter = ref<'all' | 'blocked' | 'unblocked'>('all')
  const agentFilter = ref<'all' | 'agent' | 'client'>('all')
  const totalUsers = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = 10

  // Plus besoin de filteredUsers computed car le filtrage se fait côté backend
  // On garde juste users.value qui contient déjà les résultats filtrés du backend
  const filteredUsers = computed(() => users.value)

  function applyFilters() {
    // Réinitialiser à la page 1 et recharger les utilisateurs avec les nouveaux filtres
    currentPage.value = 1
    fetchUsers(1)
  }

  async function fetchUsers(page = 1) {
    try {
      isLoading.value = true
      error.value = null

      const queryParams: Record<string, string> = {
        page: page.toString()
      }

      // Ajouter la recherche textuelle si présente
      if (searchQuery.value) {
        queryParams.q = searchQuery.value
      }

      // Ajouter le filtre de blocage
      if (blockFilter.value === 'blocked') {
        queryParams.is_block = 'true'
      } else if (blockFilter.value === 'unblocked') {
        queryParams.is_block = 'false'
      }

      // Ajouter le filtre agent/client
      if (agentFilter.value === 'agent') {
        queryParams.agent_client = 'true'
      } else if (agentFilter.value === 'client') {
        queryParams.agent_client = 'false'
      }

      const response = await fetchWithAuth('/auth/listUser/', {
        queryParams
      })

      if (!response.ok) {
        const data = await response.json()

        if (response.status === 401) {
          throw new Error('Non autorisé. Veuillez vous reconnecter.')
        }

        if (data.message?.includes('ERR_NGROK')) {
          const notification = useNotification()
          notification.addNotification(
            'Erreur de connexion au serveur. Veuillez vérifier votre connexion internet et réessayer.',
            'error'
          )
          throw new Error('Erreur de connexion au serveur.')
        }

        const notification = useNotification()
        notification.addNotification('Erreur lors de la récupération des utilisateurs', 'error')
        throw new Error('Erreur lors de la récupération des utilisateurs')
      }

      const data: UsersResponse = await response.json()
      users.value = data.results
      totalUsers.value = data.count
      currentPage.value = page
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la récupération des utilisateurs'
      console.error('Error fetching users:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function updateSearchQuery(query: string) {
    searchQuery.value = query
    currentPage.value = 1
    fetchUsers()
  }

  async function toggleUserBlockStatus(userId: number) {
    try {
      error.value = null

      const response = await fetchWithAuth('/auth/toggle-block/', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('Non autorisé. Veuillez vous reconnecter.')
        }
        throw new Error(data.detail || data.message || 'Erreur lors du changement de statut de blocage.')
      }

      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].is_block = !users.value[userIndex].is_block
      } else {
        await fetchUsers(currentPage.value)
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors du blocage/déblocage.'
      console.error('Error toggling block status:', err)
      throw err
    }
  }

  async function toggleUserAgentStatus(userId: number) {
    try {
      error.value = null

      const response = await fetchWithAuth('/auth/toggle-agent/', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('Non autorisé. Veuillez vous reconnecter.')
        }
        throw new Error(data.detail || data.message || "Erreur lors du changement de statut d'agent.")
      }

      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].agent_client = !users.value[userIndex].agent_client
      } else {
        await fetchUsers(currentPage.value)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Une erreur est survenue lors du changement de statut d'agent."
      console.error('Error toggling agent status:', err)
      throw err
    }
  }

  // Réinitialiser le PIN d'un utilisateur
  async function resetUserPin(userId: number) {
    try {
      error.value = null

      const response = await fetchWithAuth('/auth/reset-pin/', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('Non autorisé. Veuillez vous reconnecter.')
        }
        throw new Error(data.detail || data.message || 'Erreur lors de la réinitialisation du PIN.')
      }

      const result = await response.json()
      
      // Mettre à jour l'utilisateur dans la liste
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].pin_define = false
        users.value[userIndex].pin_incorrect_count = 0
      } else {
        await fetchUsers(currentPage.value)
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors de la réinitialisation du PIN.'
      console.error('Error resetting PIN:', err)
      throw err
    }
  }

  // Mettre à jour le statut KYC d'un utilisateur
  async function updateKycStatus(userId: number, status: 'pending' | 'accept' | 'reject' | 'null', rejectionReason?: string) {
    try {
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
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        if (response.status === 401) {
          throw new Error('Non autorisé. Veuillez vous reconnecter.')
        }
        throw new Error(data.detail || data.message || 'Erreur lors de la mise à jour du statut KYC.')
      }

      const result = await response.json()
      
      // Rafraîchir la liste pour avoir les données à jour
      await fetchUsers(currentPage.value)

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors de la mise à jour du statut KYC.'
      console.error('Error updating KYC status:', err)
      throw err
    }
  }

  return {
    users,
    isLoading,
    error,
    searchQuery,
    blockFilter,
    agentFilter,
    totalUsers,
    currentPage,
    itemsPerPage,
    filteredUsers,
    fetchUsers,
    updateSearchQuery,
    applyFilters,
    toggleUserBlockStatus,
    toggleUserAgentStatus,
    resetUserPin,
    updateKycStatus
  }
})