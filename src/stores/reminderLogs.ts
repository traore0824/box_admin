import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'
import { useNotification } from '../services/notification'

export interface ReminderLog {
  id: number
  user: number
  user_email: string
  caisse: number
  caisse_name: string
  channel: 'push' | 'email' | 'call'
  scheduled_at: string
  sent_at: string | null
  is_manual: boolean
  success: boolean
  created_at: string
}

interface ReminderLogResponse {
  count: number
  next: string | null
  previous: string | null
  results: ReminderLog[]
}

export const useReminderLogsStore = defineStore('reminderLogs', () => {
  const logs = ref<ReminderLog[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = 10
  const totalLogs = ref(0)
  const searchQuery = ref('')
  const dateFilter = ref<string | null>(null)

  const notification = useNotification()

  function buildQueryParams(page = 1): Record<string, string> {
    const params: Record<string, string> = {
      page: page.toString(),
      page_size: itemsPerPage.toString()
    }

    if (searchQuery.value.trim() !== '') {
      params.search = searchQuery.value.trim()
    }

    if (dateFilter.value) {
      params.date = dateFilter.value
    }

    return params
  }

  async function fetchLogs(page = 1) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/reminder-logs', {
        queryParams: buildQueryParams(page)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des logs de rappel')
      }

      const data: ReminderLogResponse = await response.json()
      logs.value = data.results
      totalLogs.value = data.count
      currentPage.value = page
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching reminder logs:', err)
      notification.addNotification(error.value, 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function updateLog(
    id: number,
    data: {
      sent_at?: string
      is_manual?: boolean
      success?: boolean
    },
    usePatch = true
  ) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth(`/box/reminder/logs/${id}`, {
        method: usePatch ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.detail || errorData.message || 'Erreur lors de la mise à jour du log'
        throw new Error(errorMessage)
      }

      const result: ReminderLog = await response.json()
      notification.addNotification('Log de rappel mis à jour avec succès', 'success')
      await fetchLogs(currentPage.value)
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error updating reminder log:', err)
      notification.addNotification(error.value, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function updateSearchQuery(query: string) {
    searchQuery.value = query
    currentPage.value = 1
  }

  function updateDateFilter(date: string | null) {
    dateFilter.value = date
    currentPage.value = 1
  }

  function applyFilters() {
    currentPage.value = 1
    fetchLogs(1)
  }

  return {
    logs,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    totalLogs,
    searchQuery,
    dateFilter,
    fetchLogs,
    updateLog,
    updateSearchQuery,
    updateDateFilter,
    applyFilters
  }
})

