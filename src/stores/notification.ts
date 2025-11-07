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
    title: string
    content: string
    user_id?: number
  }) {
    try {
      isLoading.value = true
      error.value = null

      console.log('Sending notification with data:', data)

      const response = await fetchWithAuth('/box/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      // Vérifier si la réponse est vide
      const text = await response.text()
      console.log('Raw response:', text)

      // Si le status est 200 ou 201, considérer comme succès même si la réponse est vide
      if (response.ok) {
        if (!text) {
          console.log('Empty response but status is OK, considering as success')
          return { success: true }
        }

        try {
          const notification = JSON.parse(text)
          notifications.value.unshift(notification)
          return notification
        } catch (e) {
          console.log('Could not parse response as JSON, but status is OK, considering as success')
          return { success: true }
        }
      }

      // Gestion des erreurs
      let errorMessage = 'Erreur lors de l\'envoi de la notification'
      if (text) {
        try {
          const errorData = JSON.parse(text)
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          console.error('Error parsing error response:', e)
          errorMessage = `Erreur serveur (${response.status}): ${text}`
        }
      } else {
        errorMessage = `Erreur serveur (${response.status}): Réponse vide`
      }

      throw new Error(errorMessage)
    } catch (err) {
      console.error('Full error:', err)
      error.value = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la notification'
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

  return {
    notifications,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    sendNotification,
    fetchNotifications
  }
})
