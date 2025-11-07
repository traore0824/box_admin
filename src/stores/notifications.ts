import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'

interface Notification {
  id: number
  created_at: string
  title: string
  content: string
  user: number
  file: string
  image: string
  type: 'success' | 'warning' | 'danger' | 'info'
}

interface NotificationsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Notification[]
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const hasNext = ref(false)
  const hasPrevious = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // 📡 Récupération des notifications
  async function fetchNotifications(
    query = 'all',
    page = 1,
    page_size = 10,
    type = 'all',
    created_at = '',
    q = '',
    notificationType = 'owner'
  ) {
    try {
      isLoading.value = true
      error.value = null

      const queryParams: Record<string, string> = {
        q: query,
        page: page.toString(),
        page_size: page_size.toString(),
        notification: notificationType
      }

      if (type !== 'all') queryParams.type = type
      if (created_at) queryParams.created_at = created_at
      if (q) queryParams.search = q

      const response = await fetchWithAuth('/box/notification', {
        method: 'GET',
        queryParams
      })

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des notifications')
      }

      const data: NotificationsResponse = await response.json()

      notifications.value = data.results
      totalCount.value = data.count
      hasNext.value = !!data.next
      hasPrevious.value = !!data.previous
      currentPage.value = page
      pageSize.value = page_size

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des notifications'
      console.error('Erreur fetchNotifications:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 🔄 Rafraîchissement
  async function refreshNotifications() {
    await fetchNotifications(
      'all',
      currentPage.value,
      pageSize.value
    )
  }

  // 🧹 Nettoyage
  function clearNotifications() {
    notifications.value = []
    totalCount.value = 0
    hasNext.value = false
    hasPrevious.value = false
    error.value = null
    currentPage.value = 1
  }

  const getUnreadCount = computed(() => {
    return 0 // à adapter si tu as un champ "is_read"
  })

  return {
    notifications,
    isLoading,
    error,
    getUnreadCount,
    totalCount,
    hasNext,
    hasPrevious,
    currentPage,
    pageSize,
    fetchNotifications,
    refreshNotifications,
    clearNotifications
  }
})
