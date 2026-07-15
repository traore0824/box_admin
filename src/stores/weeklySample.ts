import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'
import { useNotification } from '../services/notification'

interface GeneratedBy {
  id: number
  email: string
}

interface UserInfo {
  id: number
  email: string
  first_name: string
  last_name: string
  phone?: string
  created_at?: string
}

interface Caisse {
  name: string
  status: string
  amount_obj: number
  amount_already_paid?: number
}

interface Withdrawal {
  amount: number
  created_at: string
  payment_method?: string
}

export interface SampleEntry {
  id: number
  called: boolean
  called_at: string | null
  called_by?: { id: number; email: string } | null
  notes: string | null
  user: UserInfo
  caisses: Caisse[]
  withdrawals: Withdrawal[]
}

export interface WeeklySample {
  id: number
  week: number
  year: number
  label: string
  created_at: string
  generated_by: GeneratedBy
  entries_with_caisse: SampleEntry[]
  entries_without_caisse: SampleEntry[]
}

export const useWeeklySampleStore = defineStore('weeklySample', () => {
  const current = ref<WeeklySample | null>(null)
  const history = ref<WeeklySample[]>([])
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  async function fetchCurrent() {
    try {
      isLoading.value = true
      error.value = null
      const response = await fetchWithAuth('/box/marketing/weekly-sample/current')
      current.value = await handleApiResponse<WeeklySample>(
        response,
        'Erreur lors du chargement de la sélection'
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      isLoading.value = false
    }
  }

  async function generate() {
    try {
      isGenerating.value = true
      error.value = null
      const notification = useNotification()
      const response = await fetchWithAuth('/box/marketing/weekly-sample/generate', { method: 'POST' })
      const data = await handleApiResponse<WeeklySample & { skipped?: boolean; week?: number }>(
        response,
        'Erreur lors de la génération'
      )
      if (data.skipped) {
        notification.addNotification(`Sélection déjà générée pour la semaine ${data.week}`, 'info')
      } else {
        current.value = data
        notification.addNotification('Sélection générée avec succès', 'success')
      }
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      const notification = useNotification()
      notification.addNotification(error.value!, 'error')
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  async function fetchHistory() {
    try {
      isLoading.value = true
      error.value = null
      const response = await fetchWithAuth('/box/marketing/weekly-sample/history')
      history.value = await handleApiResponse<WeeklySample[]>(
        response,
        'Erreur lors du chargement de l\'historique'
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    } finally {
      isLoading.value = false
    }
  }

  async function markCalled(entryId: number, notes: string) {
    try {
      const notification = useNotification()
      const response = await fetchWithAuth(`/box/marketing/weekly-sample/entry/${entryId}/mark-called`, {
        method: 'PATCH',
        body: { notes }
      })
      const updated = await handleApiResponse<SampleEntry>(
        response,
        'Erreur lors de la mise à jour'
      )
      notification.addNotification('Utilisateur marqué comme appelé', 'success')

      // Mettre à jour dans current
      if (current.value) {
        const updateEntry = (entries: SampleEntry[]) => {
          const idx = entries.findIndex(e => e.id === entryId)
          if (idx !== -1) entries[idx] = { ...entries[idx], ...updated }
        }
        updateEntry(current.value.entries_with_caisse)
        updateEntry(current.value.entries_without_caisse)
      }
      return updated
    } catch (err) {
      const notification = useNotification()
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue'
      notification.addNotification(msg, 'error')
      throw err
    }
  }

  return {
    current,
    history,
    isLoading,
    isGenerating,
    error,
    fetchCurrent,
    generate,
    fetchHistory,
    markCalled
  }
})
