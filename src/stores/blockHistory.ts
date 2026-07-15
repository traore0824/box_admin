import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'

interface PerformedBy {
  id: number
  email: string
  full_name: string
}

interface BlockHistoryEntry {
  id: number
  event: 'blocked' | 'unblocked'
  event_label: string
  reason: string
  reason_label: string
  reason_detail: string
  is_automatic: boolean
  performed_by: PerformedBy | null
  created_at: string
}

interface BlockHistoryResponse {
  count: number
  next: string | null
  previous: string | null
  results: BlockHistoryEntry[]
}

export const useBlockHistoryStore = defineStore('blockHistory', () => {
  const history = ref<BlockHistoryEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const count = ref(0)
  const currentPage = ref(1)
  const pageSize = 10

  async function fetchBlockHistory(userId: number, page = 1) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/auth/block-history/', {
        queryParams: { user_id: userId, page, page_size: pageSize }
      })

      const data = await handleApiResponse<BlockHistoryResponse>(
        response,
        'Erreur lors de la récupération de l\'historique'
      )
      history.value = data.results
      count.value = data.count
      currentPage.value = page
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      isLoading.value = false
    }
  }

  return {
    history,
    isLoading,
    error,
    count,
    currentPage,
    pageSize,
    fetchBlockHistory
  }
})
