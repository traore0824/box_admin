import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'

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
}

export const useCaisseStore = defineStore('caisse', () => {
  const caisses = ref<Caisse[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = 10
  const totalCaisse = ref(0)

  async function fetchCaisse(
    page = 1,
    filters: { q?: string; status?: string; frequence?: string } = {}
  ) {
    try {
      isLoading.value = true
      error.value = null

      const queryParams: Record<string, string> = { page: page.toString() }

      if (filters.q?.trim()) queryParams.q = filters.q.trim()
      if (filters.status?.trim()) queryParams.status = filters.status.trim()
      if (filters.frequence?.trim()) queryParams.frequence = filters.frequence.trim()

      const response = await fetchWithAuth('/box/caisse', {
        method: 'GET',
        queryParams
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur lors de la récupération des caisses')
      }

      const data: CaisseResponse = await response.json()
      caisses.value = data.results
      totalCaisse.value = data.count
      currentPage.value = page
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la récupération des caisses'
      console.error('Error fetching caisse:', err)
    } finally {
      isLoading.value = false
    }
  }

  // ── Balance history ──────────────────────────────────────────────
  const balanceHistory = ref<BalanceHistoryEntry[]>([])
  const balanceHistoryLoading = ref(false)
  const balanceHistoryError = ref<string | null>(null)
  const balanceHistoryPage = ref(1)
  const balanceHistoryTotal = ref(0)
  const balanceHistoryCurrentAmount = ref<number>(0)
  const PAGE_SIZE = 20

  const balanceHistoryTotalPages = (): number => Math.ceil(balanceHistoryTotal.value / PAGE_SIZE)

  async function fetchBalanceHistory(caisseId: number, page = 1) {
    try {
      balanceHistoryLoading.value = true
      balanceHistoryError.value = null

      const response = await fetchWithAuth(`/box/caisse/balance-history/${caisseId}/`, {
        method: 'GET',
        queryParams: { page: page.toString(), page_size: PAGE_SIZE.toString() }
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.detail || data.message || "Erreur lors de la récupération de l'historique")
      }

      const data: BalanceHistoryResponse = await response.json()
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
    fetchCaisse,
    balanceHistory,
    balanceHistoryLoading,
    balanceHistoryError,
    balanceHistoryPage,
    balanceHistoryTotal,
    balanceHistoryCurrentAmount,
    balanceHistoryTotalPages,
    fetchBalanceHistory
  }
})

export type CaisseStore = ReturnType<typeof useCaisseStore>
