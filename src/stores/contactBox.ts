import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'

interface ContactMessage {
  id: number
  email: string
  fullname: string
  subjet: string
  content: string
  created_at?: string
}

interface ContactResponse {
  count: number
  next: string | null
  previous: string | null
  results: ContactMessage[]
}

export const useContactBoxStore = defineStore('contactBox', () => {
  const messages = ref<ContactMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const totalMessages = ref(0)
  const searchQuery = ref('')

  // Récupérer les messages de contact
  async function fetchMessages(page = 1, pageSize = 10) {
    try {
      isLoading.value = true
      error.value = null

      const params: Record<string, string> = {
        page: page.toString(),
        page_size: Math.min(pageSize, 25).toString() // Max 25 selon la doc
      }

      if (searchQuery.value.trim()) {
        params.q = searchQuery.value.trim()
      }

      const response = await fetchWithAuth('/box/box-site-contact', {
        method: 'GET',
        queryParams: params
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des messages')
      }

      const data: ContactResponse = await response.json()
      messages.value = data.results
      totalMessages.value = data.count
      currentPage.value = page
      itemsPerPage.value = pageSize
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching contact messages:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function updateSearchQuery(query: string) {
    searchQuery.value = query
    currentPage.value = 1
    fetchMessages(1, itemsPerPage.value)
  }

  return {
    messages,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    totalMessages,
    searchQuery,
    fetchMessages,
    updateSearchQuery
  }
})

