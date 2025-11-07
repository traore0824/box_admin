import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'


export interface Caisse {
  id: number
  total_trans: number
  name: string
  start_date: string
  end_date: string | null
  amount: string
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
  amount_obj: string
  amount_already_paid: string
  percentage_progession: string
  remaining_amount: number
  frequence: string
  is_active: boolean
  date_before_delete: string
  custom_frequence: number[]
  cancel_date: string | null
  transaction_delay: number
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

  return {
    caisses,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    totalCaisse,
    fetchCaisse
  }
})

export type CaisseStore = ReturnType<typeof useCaisseStore>
