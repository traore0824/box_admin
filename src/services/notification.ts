import { ref } from 'vue'

interface Notification {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const notifications = ref<Notification[]>([])
let nextId = 1

export const useNotification = () => {
  const addNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
    const notification = {
      id: nextId++,
      message,
      type,
      duration
    }
    notifications.value.push(notification)
    
    // Auto-dismiss after duration
    setTimeout(() => {
      removeNotification(notification.id)
    }, duration)
  }

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications,
    addNotification,
    removeNotification
  }
}
