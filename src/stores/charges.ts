import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'
import { useNotification } from '../services/notification'

export interface ChargeCategoryOption {
  value: string
  label: string
}

export interface ChargeByCategory {
  category: string
  label: string
  total: number
}

export interface ChargePeriodSummary {
  total: number
  count: number
  by_category: ChargeByCategory[]
}

export interface ChargeSummary {
  reference_date: string
  month: ChargePeriodSummary
  quarter: ChargePeriodSummary
  year: ChargePeriodSummary
  categories: ChargeCategoryOption[]
}

export interface Charge {
  id: number
  date: string
  amount: number | string
  category: string
  category_label: string
  label: string
  note: string
  created_by: number | null
  created_by_email: string | null
  created_at: string
  updated_at: string
}

export const CHARGE_CATEGORIES: ChargeCategoryOption[] = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'salaires', label: 'Salaires' },
  { value: 'fonctionnement', label: 'Fonctionnement' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'technique', label: 'Technique' },
  { value: 'legal', label: 'Juridique / Légal' },
  { value: 'autre', label: 'Autre' },
]

export const useChargesStore = defineStore('charges', () => {
  const items = ref<Charge[]>([])
  const summary = ref<ChargeSummary | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const currentPage = ref(1)
  const filters = ref({
    category: '',
    date_from: '',
    date_to: '',
    search: '',
  })

  async function fetchItems(page = 1) {
    try {
      isLoading.value = true
      error.value = null
      const queryParams: Record<string, string> = {
        page: String(page),
        page_size: '20',
      }
      if (filters.value.category) queryParams.category = filters.value.category
      if (filters.value.date_from) queryParams.date_from = filters.value.date_from
      if (filters.value.date_to) queryParams.date_to = filters.value.date_to
      if (filters.value.search) queryParams.search = filters.value.search

      const response = await fetchWithAuth('/box/charges/', {
        method: 'GET',
        queryParams,
      })
      const data = await handleApiResponse<{ results?: Charge[]; count?: number } | Charge[]>(
        response,
        'Erreur récupération des charges'
      )
      if (Array.isArray(data)) {
        items.value = data
        totalCount.value = data.length
      } else {
        items.value = data.results || []
        totalCount.value = data.count || 0
      }
      currentPage.value = page
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSummary() {
    try {
      const response = await fetchWithAuth('/box/charges/summary/', {
        method: 'GET',
      })
      summary.value = await handleApiResponse<ChargeSummary>(
        response,
        'Erreur récupération résumé charges'
      )
      return summary.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      throw err
    }
  }

  async function createItem(payload: Partial<Charge>) {
    try {
      isLoading.value = true
      const response = await fetchWithAuth('/box/charges/', {
        method: 'POST',
        body: payload,
      })
      await handleApiResponse(response, 'Erreur création charge')
      const notification = useNotification()
      notification.addNotification('Charge enregistrée', 'success')
      await Promise.all([fetchItems(currentPage.value), fetchSummary()])
    } catch (err) {
      const notification = useNotification()
      notification.addNotification(
        err instanceof Error ? err.message : 'Erreur',
        'error'
      )
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateItem(id: number, payload: Partial<Charge>) {
    try {
      isLoading.value = true
      const response = await fetchWithAuth(`/box/charges/${id}/`, {
        method: 'PUT',
        body: payload,
      })
      await handleApiResponse(response, 'Erreur mise à jour charge')
      const notification = useNotification()
      notification.addNotification('Charge mise à jour', 'success')
      await Promise.all([fetchItems(currentPage.value), fetchSummary()])
    } catch (err) {
      const notification = useNotification()
      notification.addNotification(
        err instanceof Error ? err.message : 'Erreur',
        'error'
      )
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteItem(id: number) {
    try {
      isLoading.value = true
      const response = await fetchWithAuth(`/box/charges/${id}/`, {
        method: 'DELETE',
      })
      await handleApiResponse(response, 'Erreur suppression')
      const notification = useNotification()
      notification.addNotification('Charge supprimée', 'success')
      await Promise.all([fetchItems(currentPage.value), fetchSummary()])
    } catch (err) {
      const notification = useNotification()
      notification.addNotification(
        err instanceof Error ? err.message : 'Erreur',
        'error'
      )
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    summary,
    isLoading,
    error,
    totalCount,
    currentPage,
    filters,
    fetchItems,
    fetchSummary,
    createItem,
    updateItem,
    deleteItem,
  }
})
