import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'
import { useNotification } from '../services/notification'

export interface ReminderMessage {
  id: number
  title: string
  content: string
  active: boolean
  created_at: string
  updated_at: string
}

interface ReminderMessageResponse {
  count: number
  next: string | null
  previous: string | null
  results: ReminderMessage[]
}

export const useReminderMessagesStore = defineStore('reminderMessages', () => {
  const messages = ref<ReminderMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = 10
  const totalMessages = ref(0)
  const searchQuery = ref('')
  const activeFilter = ref<boolean | null>(null)

  const notification = useNotification()

  function buildQueryParams(page = 1): Record<string, string> {
    const params: Record<string, string> = {
      page: page.toString(),
      page_size: itemsPerPage.toString()
    }

    if (searchQuery.value.trim() !== '') {
      params.search = searchQuery.value.trim()
    }

    if (activeFilter.value !== null) {
      params.active = activeFilter.value.toString()
    }

    return params
  }

  async function fetchMessages(page = 1) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/marketing/reminder-messages', {
        queryParams: buildQueryParams(page)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des messages de rappel')
      }

      const data: ReminderMessageResponse = await response.json()
      messages.value = data.results
      totalMessages.value = data.count
      currentPage.value = page
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching reminder messages:', err)
      notification.addNotification(error.value, 'error')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMessageById(id: number): Promise<ReminderMessage> {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth(`/box/marketing/reminder-messages/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Message de rappel non trouvé')
        }
        throw new Error('Erreur lors de la récupération du message de rappel')
      }

      const data: ReminderMessage = await response.json()
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching reminder message:', err)
      notification.addNotification(error.value, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createMessage(data: {
    title: string
    content: string
    active?: boolean
  }) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/marketing/reminder-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          active: data.active !== undefined ? data.active : true
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.detail || errorData.message || 'Erreur lors de la création du message de rappel'
        throw new Error(errorMessage)
      }

      const result: ReminderMessage = await response.json()
      notification.addNotification('Message de rappel créé avec succès', 'success')
      await fetchMessages(currentPage.value)
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error creating reminder message:', err)
      notification.addNotification(error.value, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateMessage(
    id: number,
    data: {
      title?: string
      content?: string
      active?: boolean
    },
    usePatch = true
  ) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth(`/box/marketing/reminder-messages/${id}`, {
        method: usePatch ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.detail || errorData.message || 'Erreur lors de la mise à jour du message de rappel'
        throw new Error(errorMessage)
      }

      const result: ReminderMessage = await response.json()
      notification.addNotification('Message de rappel mis à jour avec succès', 'success')
      await fetchMessages(currentPage.value)
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error updating reminder message:', err)
      notification.addNotification(error.value, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteMessage(id: number) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth(`/box/marketing/reminder-messages/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Message de rappel non trouvé')
        }
        throw new Error('Erreur lors de la suppression du message de rappel')
      }

      notification.addNotification('Message de rappel supprimé avec succès', 'success')
      await fetchMessages(currentPage.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error deleting reminder message:', err)
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

  function updateActiveFilter(active: boolean | null) {
    activeFilter.value = active
    currentPage.value = 1
  }

  function applyFilters() {
    currentPage.value = 1
    fetchMessages(1)
  }

  return {
    messages,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    totalMessages,
    searchQuery,
    activeFilter,
    fetchMessages,
    fetchMessageById,
    createMessage,
    updateMessage,
    deleteMessage,
    updateSearchQuery,
    updateActiveFilter,
    applyFilters
  }
})

