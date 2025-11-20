import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
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
  cancel_block_commission: string
  operation_fee: string
  // Rappels quotidiens (tableaux de messages)
  reminreminder_day_morning: string[]
  reminreminder_day_afternoon: string[]
  reminreminder_day_evening: string[]
  reminreminder_day_morning_image: string | null
  reminreminder_day_afternoon_image: string | null
  reminreminder_day_evening_image: string | null
  // Rappels hebdomadaires
  reminreminder_week_morning: string[]
  reminreminder_week_afternoon: string[]
  reminreminder_week_evening: string[]
  reminreminder_week_morning_image: string | null
  reminreminder_week_afternoon_image: string | null
  reminreminder_week_evening_image: string | null
  // Rappels mensuels
  reminreminder_month_morning: string[]
  reminreminder_month_afternoon: string[]
  reminreminder_month_evening: string[]
  reminreminder_month_morning_image: string | null
  reminreminder_month_afternoon_image: string | null
  reminreminder_month_evening_image: string | null
  // Messages de motivation pour utilisateurs sans caisse
  motivation_no_caisse_morning: string[]
  motivation_no_caisse_afternoon: string[]
  motivation_no_caisse_evening: string[]
  motivation_no_caisse_morning_image: string | null
  motivation_no_caisse_afternoon_image: string | null
  motivation_no_caisse_evening_image: string | null
  test_mode: boolean
  min_version: number
  last_version: number
  update_message: string | null
  dowload_android_apk: string | null
  dowload_ios_apk: string | null
  dowload_apk_link: string | null
}

export const useSettingsStore = defineStore('settings', () => {
  // const authStore = useAuthStore() // Non utilisé pour l'instant

  const settings = ref<Setting | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Normaliser les données de l'API
  const normalizeSettings = (data: any): Setting => {
    return {
      id: data.id || 0,
      phone: data.phone || '',
      email: data.email || '',
      minimum_amount: data.minimum_amount || '0.00',
      minimum_amount_obj: data.minimum_amount_obj || '0.00',
      minimum_days: data.minimum_days || 0,
      only_agente_can_share: data.only_agente_can_share ?? false,
      referral_bonus_amount: data.referral_bonus_amount || '0.00',
      cancellation_commission: data.cancellation_commission || '0.00',
      done_commission: data.done_commission || '0.00',
      cancel_block_commission: data.cancel_block_commission || '0.00',
      operation_fee: data.operation_fee || '0.00',
      // Rappels quotidiens
      reminreminder_day_morning: Array.isArray(data.reminreminder_day_morning) ? data.reminreminder_day_morning : [],
      reminreminder_day_afternoon: Array.isArray(data.reminreminder_day_afternoon) ? data.reminreminder_day_afternoon : [],
      reminreminder_day_evening: Array.isArray(data.reminreminder_day_evening) ? data.reminreminder_day_evening : [],
      reminreminder_day_morning_image: data.reminreminder_day_morning_image || null,
      reminreminder_day_afternoon_image: data.reminreminder_day_afternoon_image || null,
      reminreminder_day_evening_image: data.reminreminder_day_evening_image || null,
      // Rappels hebdomadaires
      reminreminder_week_morning: Array.isArray(data.reminreminder_week_morning) ? data.reminreminder_week_morning : [],
      reminreminder_week_afternoon: Array.isArray(data.reminreminder_week_afternoon) ? data.reminreminder_week_afternoon : [],
      reminreminder_week_evening: Array.isArray(data.reminreminder_week_evening) ? data.reminreminder_week_evening : [],
      reminreminder_week_morning_image: data.reminreminder_week_morning_image || null,
      reminreminder_week_afternoon_image: data.reminreminder_week_afternoon_image || null,
      reminreminder_week_evening_image: data.reminreminder_week_evening_image || null,
      // Rappels mensuels
      reminreminder_month_morning: Array.isArray(data.reminreminder_month_morning) ? data.reminreminder_month_morning : [],
      reminreminder_month_afternoon: Array.isArray(data.reminreminder_month_afternoon) ? data.reminreminder_month_afternoon : [],
      reminreminder_month_evening: Array.isArray(data.reminreminder_month_evening) ? data.reminreminder_month_evening : [],
      reminreminder_month_morning_image: data.reminreminder_month_morning_image || null,
      reminreminder_month_afternoon_image: data.reminreminder_month_afternoon_image || null,
      reminreminder_month_evening_image: data.reminreminder_month_evening_image || null,
      // Messages de motivation
      motivation_no_caisse_morning: Array.isArray(data.motivation_no_caisse_morning) ? data.motivation_no_caisse_morning : [],
      motivation_no_caisse_afternoon: Array.isArray(data.motivation_no_caisse_afternoon) ? data.motivation_no_caisse_afternoon : [],
      motivation_no_caisse_evening: Array.isArray(data.motivation_no_caisse_evening) ? data.motivation_no_caisse_evening : [],
      motivation_no_caisse_morning_image: data.motivation_no_caisse_morning_image || null,
      motivation_no_caisse_afternoon_image: data.motivation_no_caisse_afternoon_image || null,
      motivation_no_caisse_evening_image: data.motivation_no_caisse_evening_image || null,
      test_mode: data.test_mode ?? false,
      min_version: data.min_version || 1,
      last_version: data.last_version || 1,
      update_message: data.update_message || null,
      dowload_android_apk: data.dowload_android_apk || null,
      dowload_ios_apk: data.dowload_ios_apk || null,
      dowload_apk_link: data.dowload_apk_link || null,
    }
  }

  // 📡 GET settings
  const fetchSettings = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/setting')

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des paramètres')
      }

      const result = await response.json()
      // L'API peut retourner directement les données ou dans un objet data
      const data = result.data || result
      settings.value = normalizeSettings(data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des paramètres'
      console.error('Erreur fetchSettings:', err)
    } finally {
      loading.value = false
    }
  }

  // 📡 PATCH settings (pour admin) ou POST setting-messages (pour service client)
  const updateSettings = async (data: Partial<Setting>) => {
    try {
      loading.value = true
      error.value = null

      // Vérifier si l'utilisateur est service client
      const authStore = useAuthStore()
      
      // Logs détaillés pour déboguer
      console.log('🔍 [updateSettings] Début de la fonction')
      console.log('🔍 [updateSettings] authStore.user:', authStore.user)
      console.log('🔍 [updateSettings] authStore.user?.is_staff:', authStore.user?.is_staff)
      console.log('🔍 [updateSettings] typeof authStore.user?.is_staff:', typeof authStore.user?.is_staff)
      console.log('🔍 [updateSettings] authStore.user?.is_staff === true:', authStore.user?.is_staff === true)
      console.log('🔍 [updateSettings] authStore.user?.is_staff !== true:', authStore.user?.is_staff !== true)
      
      // Service client = utilisateur authentifié qui n'est PAS staff
      const isCustomerService = authStore.user !== null && authStore.user !== undefined && authStore.user.is_staff !== true
      
      console.log('🔍 [updateSettings] isCustomerService calculé:', isCustomerService)
      console.log('🔍 [updateSettings] Condition 1 (user !== null):', authStore.user !== null)
      console.log('🔍 [updateSettings] Condition 2 (user !== undefined):', authStore.user !== undefined)
      console.log('🔍 [updateSettings] Condition 3 (is_staff !== true):', authStore.user?.is_staff !== true)

      // Liste des champs de messages (20 champs)
      const messageFields = [
        'reminreminder_day_morning',
        'reminreminder_day_morning_image',
        'reminreminder_day_afternoon',
        'reminreminder_day_afternoon_image',
        'reminreminder_day_evening',
        'reminreminder_day_evening_image',
        'reminreminder_week_morning',
        'reminreminder_week_morning_image',
        'reminreminder_week_afternoon',
        'reminreminder_week_afternoon_image',
        'reminreminder_week_evening',
        'reminreminder_week_evening_image',
        'reminreminder_month_morning',
        'reminreminder_month_morning_image',
        'reminreminder_month_afternoon',
        'reminreminder_month_afternoon_image',
        'reminreminder_month_evening',
        'reminreminder_month_evening_image',
        'motivation_no_caisse_morning',
        'motivation_no_caisse_morning_image',
        'motivation_no_caisse_afternoon',
        'motivation_no_caisse_afternoon_image',
        'motivation_no_caisse_evening',
        'motivation_no_caisse_evening_image',
      ]

      let payload: any = { ...data }
      let endpoint = '/box/setting'
      let method: 'POST' | 'PATCH' = 'PATCH'

      console.log('🔍 [updateSettings] Avant condition - endpoint:', endpoint, 'method:', method)

      // Si service client, utiliser l'endpoint dédié et filtrer uniquement les champs de messages
      if (isCustomerService) {
        console.log('✅ [updateSettings] BRANCHE SERVICE CLIENT ACTIVÉE')
        endpoint = '/box/setting-messages'
        method = 'POST'
        
        console.log('🔵 [updateSettings] Service Client détecté - Utilisation de /box/setting-messages (POST)')
        console.log('🔵 [updateSettings] User:', { 
          is_staff: authStore.user?.is_staff, 
          email: authStore.user?.email,
          id: authStore.user?.id 
        })
        
        // Filtrer pour ne garder que les champs de messages
        payload = {}
        messageFields.forEach(field => {
          if (data[field as keyof Setting] !== undefined) {
            payload[field] = data[field as keyof Setting]
          }
        })
        
        console.log('🔵 [updateSettings] Payload filtré (champs de messages uniquement):', Object.keys(payload))
      } else {
        console.log('✅ [updateSettings] BRANCHE ADMIN ACTIVÉE')
        console.log('🟢 [updateSettings] Admin détecté - Utilisation de /box/setting (PATCH)')
        console.log('🟢 [updateSettings] User:', { 
          is_staff: authStore.user?.is_staff, 
          email: authStore.user?.email,
          id: authStore.user?.id 
        })
        // Pour admin, convertir les décimales en strings
        const decimalFields = [
          'minimum_amount',
          'minimum_amount_obj',
          'referral_bonus_amount',
          'cancellation_commission',
          'done_commission',
          'cancel_block_commission',
          'operation_fee'
        ]

        decimalFields.forEach(field => {
          if (payload[field] !== undefined && payload[field] !== null) {
            payload[field] = String(payload[field])
          }
        })
      }

      // Filtrer les messages vides des tableaux de messages avant l'envoi
      const messageArrayFields = [
        'reminreminder_day_morning',
        'reminreminder_day_afternoon',
        'reminreminder_day_evening',
        'reminreminder_week_morning',
        'reminreminder_week_afternoon',
        'reminreminder_week_evening',
        'reminreminder_month_morning',
        'reminreminder_month_afternoon',
        'reminreminder_month_evening',
        'motivation_no_caisse_morning',
        'motivation_no_caisse_afternoon',
        'motivation_no_caisse_evening'
      ]

      messageArrayFields.forEach(field => {
        if (Array.isArray(payload[field])) {
          payload[field] = payload[field].filter((msg: string) => msg && msg.trim() !== '')
        }
      })

      console.log('📤 [updateSettings] Appel API final:')
      console.log('📤 [updateSettings] - endpoint:', endpoint)
      console.log('📤 [updateSettings] - method:', method)
      console.log('📤 [updateSettings] - payloadKeys:', Object.keys(payload))
      console.log('📤 [updateSettings] - payload (preview):', JSON.stringify(payload).substring(0, 200))

      const response = await fetchWithAuth(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      console.log('📥 [updateSettings] Réponse reçue:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || 'Erreur lors de la mise à jour des paramètres')
      }

      const result = await response.json()
      if (result.data) {
        // Si service client, fusionner les données mises à jour avec les settings existants
        if (isCustomerService) {
          settings.value = normalizeSettings({ ...settings.value, ...result.data })
        } else {
          settings.value = normalizeSettings(result.data)
        }
      } else {
        await fetchSettings()
      }
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
