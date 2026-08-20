import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { ApiRequestError } from '../utils/apiError'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'
import { useNotification } from '../services/notification'

interface User {
  id: number
  first_name: string | null
  last_name: string | null
  email: string
  phone: string
  created_at: string
  last_login: string | null
  referral_code: string | null
  birthday: string | null
  user_referral_code: string | null
  card_id: string | null
  total_funds: number | string
  total_points?: number | string
  points_level?: { code?: string; label?: string; min_points?: number } | null
  push_notification: boolean
  email_notification: boolean
  updated_at: string | null
  commission_amount: string
  number_sponsor: number | string
  referral_revenue_for_box?: number | string
  referral_bonus_attributed?: number | string
  commission_earned_from_user?: number | string
  credit_score?: number | null
  credit_score_grade?: string | null
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
  is_active: boolean
  is_suspect?: boolean
  suspect_reason?: string | null
  suspect_marked_at?: string | null
}

export type UserSegmentKey =
  | 'never_created_caisse'
  | 'has_caisse'
  | 'more_than_2_caisses'
  | 'active_caisse'
  | 'active_caisse_blocked'
  | 'withdrawn_with_other_caisse'
  | 'withdrawn_stopped'
  | 'onboarding_48h'

export const USER_SEGMENT_LABELS: Record<UserSegmentKey, string> = {
  never_created_caisse: 'Jamais créé de caisse',
  has_caisse: 'Au moins 1 caisse',
  more_than_2_caisses: 'Plus de 2 caisses',
  active_caisse: 'Caisse en cours',
  active_caisse_blocked: 'Caisse en cours + bloqué',
  withdrawn_with_other_caisse: 'Retrait + autre caisse',
  withdrawn_stopped: 'Retrait + arrêté',
  onboarding_48h: 'Onboarding 48h (caisse + dépôt)',
}

interface UsersResponse {
  count: number
  next: string | null
  previous: string | null
  results: User[]
  user_segments?: Partial<Record<UserSegmentKey, number>>
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const blockFilter = ref<'all' | 'blocked' | 'unblocked'>('all')
  const agentFilter = ref<'all' | 'agent' | 'client'>('all')
  const noCaisseFilter = ref<'all' | 'no_caisse'>('all')
  const segmentFilter = ref<'all' | UserSegmentKey>('all')
  const startDate = ref('')
  const endDate = ref('')
  const userSegments = ref<Partial<Record<UserSegmentKey, number>>>({})
  const totalUsers = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = 10

  // Plus besoin de filteredUsers computed car le filtrage se fait côté backend
  // On garde juste users.value qui contient déjà les résultats filtrés du backend
  const filteredUsers = computed(() => users.value)

  function resetListFilters() {
    searchQuery.value = ''
    blockFilter.value = 'all'
    agentFilter.value = 'all'
    noCaisseFilter.value = 'all'
    segmentFilter.value = 'all'
    startDate.value = ''
    endDate.value = ''
    currentPage.value = 1
  }

  let isHydratingFromRoute = false

  function initFromRouteQuery(query: Record<string, unknown>) {
    isHydratingFromRoute = true
    resetListFilters()

    const str = (key: string) => {
      const v = query[key]
      return typeof v === 'string' ? v : ''
    }

    if (str('q')) searchQuery.value = str('q')
    if (str('block')) blockFilter.value = str('block') as typeof blockFilter.value
    if (str('agent')) agentFilter.value = str('agent') as typeof agentFilter.value
    if (str('no_caisse')) noCaisseFilter.value = str('no_caisse') as typeof noCaisseFilter.value
    const segment = str('user_segment')
    if (segment && segment in USER_SEGMENT_LABELS) {
      segmentFilter.value = segment as UserSegmentKey
    }
    if (str('start_date')) startDate.value = str('start_date')
    if (str('end_date')) endDate.value = str('end_date')

    const page = parseInt(str('page'), 10)
    currentPage.value = Number.isFinite(page) && page > 0 ? page : 1
    isHydratingFromRoute = false
  }

  function applyFilters() {
    // Réinitialiser à la page 1 et recharger les utilisateurs avec les nouveaux filtres
    currentPage.value = 1
    fetchUsers(1)
  }

  // Watcher pour appliquer automatiquement les filtres quand ils changent
  watch([blockFilter, agentFilter, noCaisseFilter, segmentFilter, startDate, endDate], () => {
    if (isHydratingFromRoute) return
    applyFilters()
  })

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
        queryParams.is_agent_client = 'true'
      } else if (agentFilter.value === 'client') {
        queryParams.is_agent_client = 'false'
      }

      // Ajouter le filtre utilisateurs sans caisse
      if (segmentFilter.value !== 'all') {
        queryParams.user_segment = segmentFilter.value
      } else if (noCaisseFilter.value === 'no_caisse') {
        queryParams.without_caisse = 'true'
      }
      if (startDate.value) {
        queryParams.start_date = startDate.value
      }
      if (endDate.value) {
        queryParams.end_date = endDate.value
      }

      const response = await fetchWithAuth('/auth/listUser/', {
        queryParams
      })

      const data = await handleApiResponse<UsersResponse>(
        response,
        'Erreur lors de la récupération des utilisateurs'
      )
      users.value = data.results
      totalUsers.value = data.count
      userSegments.value = data.user_segments ?? {}
      currentPage.value = page
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const body = err.body as { message?: string } | null
        if (body?.message?.includes('ERR_NGROK')) {
          const notification = useNotification()
          notification.addNotification(
            'Erreur de connexion au serveur. Veuillez vérifier votre connexion internet et réessayer.',
            'error'
          )
        }
      }
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

      await handleApiResponse(
        response,
        'Erreur lors du changement de statut de blocage.'
      )

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

      const data = await handleApiResponse<{ agent_client?: boolean }>(
        response,
        "Erreur lors du changement de statut d'agent."
      )
      const userIndex = users.value.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        users.value[userIndex].agent_client = data.agent_client
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

      const result = await handleApiResponse(
        response,
        'Erreur lors de la réinitialisation du PIN.'
      )

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

  // Envoyer un OTP de vérification PIN
  async function sendPinVerificationOtp(userId: number) {
    try {
      error.value = null

      const response = await fetchWithAuth('/auth/send-pin-verification-otp/', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
        headers: { 'Content-Type': 'application/json' }
      })

      return await handleApiResponse(
        response,
        "Erreur lors de l'envoi de l'OTP."
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error sending PIN verification OTP:', err)
      throw err
    }
  }

  // Mettre à jour le statut KYC d'un utilisateur
  async function updateKycStatus(
    userId: number, 
    status: 'pending' | 'accept' | 'reject' | 'null', 
    rejectionReason?: string
  ) {
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
        body
      })

      const result = await handleApiResponse(
        response,
        'Erreur lors de la mise à jour du statut KYC.'
      )

      // Rafraîchir la liste pour avoir les données à jour
      await fetchUsers(currentPage.value)

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors de la mise à jour du statut KYC.'
      console.error('Error updating KYC status:', err)
      throw err
    }
  }

  // Admin Update User
  async function adminUpdateUser(payload: {
    user_id: number
    first_name?: string
    last_name?: string
    phone?: string
    birthday?: string
    sexe?: string
    card_id?: string
  }) {
    try {
      error.value = null
      const response = await fetchWithAuth('/auth/admin-update-user/', {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      })

      return await handleApiResponse(
        response,
        "Erreur lors de la mise à jour de l'utilisateur."
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      console.error('Error in adminUpdateUser:', err)
      throw err
    }
  }

  // Admin KYC Verify
  async function adminKycVerify(payload: {
    user_id: number
    first_name: string
    last_name: string
    birthday: string
    sexe: string
    card_id: string
    photos: string[]
  }) {
    try {
      error.value = null
      const response = await fetchWithAuth('/auth/admin-verify-user/', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      })

      return await handleApiResponse(
        response,
        'Erreur lors de la vérification KYC.'
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la vérification KYC'
      console.error('Error in adminKycVerify:', err)
      throw err
    }
  }

  // Admin Activate User
  async function adminActivateUser(userId: number) {
    try {
      error.value = null
      const response = await fetchWithAuth('/auth/admin-activate-user/', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
        headers: { 'Content-Type': 'application/json' }
      })

      return await handleApiResponse(
        response,
        "Erreur lors de l'activation de l'utilisateur."
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de l\'activation'
      console.error('Error in adminActivateUser:', err)
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
    noCaisseFilter,
    segmentFilter,
    startDate,
    endDate,
    userSegments,
    USER_SEGMENT_LABELS,
    totalUsers,
    currentPage,
    itemsPerPage,
    filteredUsers,
    fetchUsers,
    updateSearchQuery,
    applyFilters,
    resetListFilters,
    initFromRouteQuery,
    toggleUserBlockStatus,
    toggleUserAgentStatus,
    resetUserPin,
    sendPinVerificationOtp,
    updateKycStatus,
    adminUpdateUser,
    adminKycVerify,
    adminActivateUser
  }
})