import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'

export type BalanceHistoryReason = 'deposit' | 'withdrawal' | 'cancellation' | 'adjustment' | 'unknown'

export interface BalanceHistoryEntry {
  id: number
  caisse: number
  amount_before: number
  amount_after: number
  delta: number
  reason: BalanceHistoryReason
  reason_label: string
  transaction_id: number | null
  transaction_type: string | null
  transaction_reference: string | null
  triggered_by: {
    id: number
    email: string
    first_name: string
    last_name: string
  } | null
  note: string | null
  created_at: string
}

export interface BalanceHistoryResponse {
  count: number
  next: string | null
  previous: string | null
  caisse_id: number
  current_amount_already_paid: number
  results: BalanceHistoryEntry[]
}

export interface CaisseStats {
  total: number
  pending: number
  done: number
  disabled: number
  cancelled: number
  withdrawn: number
  not_withdrawn: number
  group: number
  personal: number
}

export interface Caisse {
  id: number
  total_trans: number
  name: string
  start_date: string
  end_date: string | null
  amount: string | null
  status: string
  created_by: {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string
    referral_code: string
    agent_client: boolean
  }
  created_at: string
  updated_at: string
  next_payment: string | null
  amount_obj: number | string
  amount_already_paid: number | string
  percentage_progession: string
  remaining_amount?: number
  frequence: string
  is_active: boolean
  date_before_delete: string
  custom_frequence: number[]
  cancel_date: string | null
  transaction_delay: number
  type_box?: 'locked' | 'free'
  define_block?: boolean
  personal?: boolean
  members?: Array<{
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string
    referral_code: string
    agent_client: boolean
  }>
  date_active?: string | null
  user_total_trans?: number
  has_pending_withdrawal?: boolean
}

export interface CaisseResponse {
  count: number
  next: string | null
  previous: string | null
  results: Caisse[]
  caisse_stats?: CaisseStats
}

export type CaisseStatusFilter = '' | 'disabled' | 'pending' | 'done' | 'withdrawn' | 'cancel' | 'cancelled'
export type CaisseFrequenceFilter = '' | 'all_week' | 'all_month' | 'all_days' | 'custom' | 'unlimited'
export type CaisseTypeBoxFilter = '' | 'free' | 'locked'
export type CaissePersonalFilter = '' | 'true' | 'false'
export type CaisseWithdrawnFilter = '' | 'true' | 'false'

export const CAISSE_STAT_LABELS: Record<string, string> = {
  pending: 'En cours',
  done: 'Terminée',
  disabled: 'Non actif',
  withdrawn: 'Retirée',
  cancel: 'Annulée',
  cancelled: 'Annulée',
}

export const useCaisseStore = defineStore('caisse', () => {
  const caisses = ref<Caisse[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = 10
  const totalCaisse = ref(0)
  const caisseStats = ref<CaisseStats | null>(null)

  const searchQuery = ref('')
  const statusFilter = ref<CaisseStatusFilter>('')
  const frequenceFilter = ref<CaisseFrequenceFilter>('')
  const typeBoxFilter = ref<CaisseTypeBoxFilter>('')
  const personalFilter = ref<CaissePersonalFilter>('')
  const withdrawnFilter = ref<CaisseWithdrawnFilter>('')
  const startDate = ref('')
  const endDate = ref('')

  let isHydratingFromRoute = false

  function resetListFilters() {
    searchQuery.value = ''
    statusFilter.value = ''
    frequenceFilter.value = ''
    typeBoxFilter.value = ''
    personalFilter.value = ''
    withdrawnFilter.value = ''
    startDate.value = ''
    endDate.value = ''
    currentPage.value = 1
  }

  function initFromRouteQuery(query: Record<string, unknown>) {
    isHydratingFromRoute = true
    resetListFilters()

    const str = (key: string) => {
      const v = query[key]
      return typeof v === 'string' ? v : ''
    }

    if (str('q')) searchQuery.value = str('q')
    if (str('status')) statusFilter.value = str('status') as CaisseStatusFilter
    if (str('frequence')) frequenceFilter.value = str('frequence') as CaisseFrequenceFilter
    if (str('type_box')) typeBoxFilter.value = str('type_box') as CaisseTypeBoxFilter
    if (str('personal')) personalFilter.value = str('personal') as CaissePersonalFilter
    if (str('withdrawn')) withdrawnFilter.value = str('withdrawn') as CaisseWithdrawnFilter
    if (str('start_date')) startDate.value = str('start_date')
    if (str('end_date')) endDate.value = str('end_date')

    const page = parseInt(str('page'), 10)
    currentPage.value = Number.isFinite(page) && page > 0 ? page : 1
    isHydratingFromRoute = false
  }

  function buildQueryParams(page: number): Record<string, string> {
    const queryParams: Record<string, string> = { page: page.toString() }
    if (searchQuery.value.trim()) queryParams.q = searchQuery.value.trim()
    if (statusFilter.value) queryParams.status = statusFilter.value
    if (frequenceFilter.value) queryParams.frequence = frequenceFilter.value
    if (typeBoxFilter.value) queryParams.type_box = typeBoxFilter.value
    if (personalFilter.value) queryParams.personal = personalFilter.value
    if (withdrawnFilter.value) queryParams.withdrawn = withdrawnFilter.value
    if (startDate.value) queryParams.start_date = startDate.value
    if (endDate.value) queryParams.end_date = endDate.value
    return queryParams
  }

  function applyFilters() {
    currentPage.value = 1
    fetchCaisse(1)
  }

  function updateSearchQuery(query: string) {
    searchQuery.value = query
    currentPage.value = 1
    fetchCaisse(1)
  }

  watch([statusFilter, frequenceFilter, typeBoxFilter, personalFilter, withdrawnFilter, startDate, endDate], () => {
    if (isHydratingFromRoute) return
    applyFilters()
  })

  async function fetchCaisse(page = 1, legacyFilters?: {
    q?: string
    status?: string
    frequence?: string
  }) {
    try {
      isLoading.value = true
      error.value = null

      if (legacyFilters) {
        if (legacyFilters.q !== undefined) searchQuery.value = legacyFilters.q
        if (legacyFilters.status !== undefined) statusFilter.value = legacyFilters.status as CaisseStatusFilter
        if (legacyFilters.frequence !== undefined) frequenceFilter.value = legacyFilters.frequence as CaisseFrequenceFilter
      }

      const response = await fetchWithAuth('/box/caisse', {
        method: 'GET',
        queryParams: buildQueryParams(page)
      })

      const data = await handleApiResponse<CaisseResponse>(
        response,
        'Erreur lors de la récupération des caisses'
      )
      caisses.value = data.results
      totalCaisse.value = data.count
      caisseStats.value = data.caisse_stats ?? null
      currentPage.value = page
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la récupération des caisses'
      console.error('Error fetching caisse:', err)
    } finally {
      isLoading.value = false
    }
  }

  const balanceHistory = ref<BalanceHistoryEntry[]>([])
  const balanceHistoryLoading = ref(false)
  const balanceHistoryError = ref<string | null>(null)
  const balanceHistoryPage = ref(1)
  const balanceHistoryTotal = ref(0)
  const balanceHistoryCurrentAmount = ref<number>(0)
  const balanceHistoryCaisseId = ref<number | null>(null)
  const PAGE_SIZE = 20

  const balanceHistoryTotalPages = (): number => Math.ceil(balanceHistoryTotal.value / PAGE_SIZE)

  function resetBalanceHistory() {
    balanceHistory.value = []
    balanceHistoryError.value = null
    balanceHistoryPage.value = 1
    balanceHistoryTotal.value = 0
    balanceHistoryCurrentAmount.value = 0
    balanceHistoryCaisseId.value = null
  }

  async function updateCaisseDefineBlock(caisseId: number, defineBlock: boolean) {
    const response = await fetchWithAuth(`/box/caisse/${caisseId}`, {
      method: 'PATCH',
      body: { define_block: defineBlock },
      headers: { 'Content-Type': 'application/json' },
    })
    return handleApiResponse(response, 'Erreur mise à jour du blocage')
  }

  async function createAdminWithdrawal(payload: {
    caisse_id: number
    payment_mode: string
    phone: string
  }) {
    const response = await fetchWithAuth('/box/admin/transaction-withdrawal', {
      method: 'POST',
      body: payload,
    })
    return handleApiResponse(response, 'Erreur lors de la création du retrait')
  }

  async function createAdminCancellation(payload: {
    caisse_id: number
    payment_mode: string
    phone: string
  }) {
    const response = await fetchWithAuth('/box/admin/transaction-cancellation', {
      method: 'POST',
      body: payload,
    })
    return handleApiResponse(response, "Erreur lors de la création de l'annulation")
  }

  async function createAdminPartialWithdrawal(payload: {
    caisse_id: number
    payment_mode: string
    phone: string
    amount: number
  }) {
    const response = await fetchWithAuth('/box/admin/partial-withdrawal', {
      method: 'POST',
      body: payload,
    })
    return handleApiResponse(response, 'Erreur lors de la création du retrait partiel')
  }

  async function fetchBalanceHistory(caisseId: number, page = 1) {
    try {
      balanceHistoryLoading.value = true
      balanceHistoryError.value = null
      balanceHistoryCaisseId.value = caisseId

      const response = await fetchWithAuth(`/box/caisse/balance-history/${caisseId}/`, {
        method: 'GET',
        queryParams: { page: page.toString(), page_size: PAGE_SIZE.toString() }
      })

      const data = await handleApiResponse<BalanceHistoryResponse>(
        response,
        "Erreur lors de la récupération de l'historique"
      )
      balanceHistory.value = data.results
      balanceHistoryTotal.value = data.count
      balanceHistoryPage.value = page
      balanceHistoryCurrentAmount.value = data.current_amount_already_paid
    } catch (err) {
      balanceHistoryError.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching balance history:', err)
      throw err
    } finally {
      balanceHistoryLoading.value = false
    }
  }

  return {
    caisses,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    totalCaisse,
    caisseStats,
    searchQuery,
    statusFilter,
    frequenceFilter,
    typeBoxFilter,
    personalFilter,
    withdrawnFilter,
    startDate,
    endDate,
    resetListFilters,
    initFromRouteQuery,
    applyFilters,
    updateSearchQuery,
    fetchCaisse,
    balanceHistory,
    balanceHistoryLoading,
    balanceHistoryError,
    balanceHistoryPage,
    balanceHistoryTotal,
    balanceHistoryCurrentAmount,
    balanceHistoryCaisseId,
    balanceHistoryTotalPages,
    resetBalanceHistory,
    fetchBalanceHistory,
    updateCaisseDefineBlock,
    createAdminWithdrawal,
    createAdminCancellation,
    createAdminPartialWithdrawal,
  }
})

export type CaisseStore = ReturnType<typeof useCaisseStore>
