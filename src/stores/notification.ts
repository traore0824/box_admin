import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from '../stores/fetchwithtoken'
import { NOTIFICATION_API } from '../config/notification'

interface Notification {
  id: number
  title: string
  content: string
  created_at: string
  status: 'pending' | 'sent' | 'failed'
  user_id?: number
}

interface NotificationResponse {
  count: number
  next: string | null
  previous: string | null
  results: Notification[]
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = 10

  async function sendNotification(data: {
    type: 'single' | 'all'
    channel: 'email' | 'push' | 'both'
    title: string
    content: string
    user_id?: number
    image_url?: string
    kyc_status?: string | null
    is_active?: boolean | null
    is_block?: boolean | null
    sexe?: string | null
    min_balance?: number | null
    max_balance?: number | null
    is_agent?: boolean | null
    has_deposit?: boolean | null
    has_withdrawal?: boolean | null
    has_cancellation?: boolean | null
    has_caisse?: boolean | null
  }) {
    try {
      isLoading.value = true
      error.value = null

      // Validation
      if (data.type === 'single' && !data.user_id) {
        throw new Error('user_id est obligatoire lorsque type="single"')
      }

      const payload: any = {
        type: data.type,
        channel: data.channel,
        title: data.title,
        content: data.content
      }

      if (data.type === 'single' && data.user_id) {
        payload.user_id = data.user_id
      }

      if (data.image_url) {
        payload.image_url = data.image_url
      }

      // Advanced filters (only for type="all")
      if (data.type === 'all') {
        if (data.kyc_status !== undefined) payload.kyc_status = data.kyc_status
        if (data.is_active !== undefined) payload.is_active = data.is_active
        if (data.is_block !== undefined) payload.is_block = data.is_block
        if (data.sexe !== undefined) payload.sexe = data.sexe
        if (data.min_balance !== undefined) payload.min_balance = data.min_balance
        if (data.max_balance !== undefined) payload.max_balance = data.max_balance
        if (data.is_agent !== undefined) payload.is_agent = data.is_agent
        if (data.has_deposit !== undefined) payload.has_deposit = data.has_deposit
        if (data.has_withdrawal !== undefined) payload.has_withdrawal = data.has_withdrawal
        if (data.has_cancellation !== undefined) payload.has_cancellation = data.has_cancellation
        if (data.has_caisse !== undefined) payload.has_caisse = data.has_caisse
      }

      const response = await fetchWithAuth('/box/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || 'Erreur lors de l\'envoi de la notification')
      }

      const result = await response.json()
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la notification'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Envoyer un email par admin (différent de sendNotification qui envoie des push notifications)
  async function sendEmail(data: {
    subject: string
    content: string
    user_id?: number
    user_ids?: number[]
    template_name?: string
  }) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.detail || data.message || 'Erreur lors de l\'envoi de l\'email')
      }

      const result = await response.json()
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchNotifications(page = 1) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth(NOTIFICATION_API.list, {
        queryParams: {
          page
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la récupération des notifications')
      }

      const data: NotificationResponse = await response.json()
      notifications.value = data.results
      currentPage.value = page
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la récupération des notifications'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function sendMarketingEmail(data: {
    user_id: number
    title: string
    subject?: string
    content?: string
    highlight_text?: string
    button_text?: string
    button_url?: string
    image_url?: string
    template_name?: string
  }) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/marketing/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || 'Erreur lors de l\'envoi de l\'email marketing')
      }

      const result = await response.json()
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email marketing'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    notifications,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    sendNotification,
    sendEmail,
    sendMarketingEmail,
    fetchNotifications
  }
})
