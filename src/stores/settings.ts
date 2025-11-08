import { defineStore } from 'pinia'
import { ref } from 'vue'
// import { useAuthStore } from './auth' // Non utilisé pour l'instant
import { fetchWithAuth } from './fetchwithtoken'

export interface Setting {
  id: number
  phone: string
  email: string
  minimum_amount: string
  minimum_amount_obj: string
  minimum_days: number
  only_agente_can_share: boolean
  referral_bonus_amount: string
  cancellation_commission: string
  done_commission: string
  reminreminder_day_morning: any[]
  reminreminder_day_afternoon: any[]
  reminreminder_week_morning: any[]
  reminreminder_week_afternoon: any[]
  reminreminder_day_evening: any[]
  reminreminder_month_morning: any[]
  reminreminder_month_afternoon: any[]
  reminreminder_month_evening: any[]
  test_mode: boolean
  min_version: number
  last_version: number
  update_message: string
  dowload_android_apk: string
  dowload_ios_apk: string
}

export const useSettingsStore = defineStore('settings', () => {
  // const authStore = useAuthStore() // Non utilisé pour l'instant

  const settings = ref<Setting | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 📡 GET settings
  const fetchSettings = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/setting')

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des paramètres')
      }

      const data = await response.json()
      settings.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des paramètres'
      console.error('Erreur fetchSettings:', err)
    } finally {
      loading.value = false
    }
  }

  // 📡 PATCH settings
  const updateSettings = async (data: Partial<Setting>) => {
    try {
      loading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/setting', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des paramètres')
      }

      await fetchSettings()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour des paramètres'
      console.error('Erreur updateSettings:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
  }
})
