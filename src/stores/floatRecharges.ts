import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'
import { useNotification } from '../services/notification'

export interface FloatRecharge {
  id: number
  date: string
  amount_from_feexpay: number | string
  recipient_phone: string
  amount_received_by_agent: number | string
  transfer_fees: number | string
  commission: number | string
  loss_amount: number
  network: number | null
  network_name: string | null
  device_id: string
  note: string
  created_by: number | null
  created_by_email: string | null
  created_at: string
  updated_at: string
}

export const useFloatRechargesStore = defineStore('floatRecharges', () => {
  const items = ref<FloatRecharge[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const currentPage = ref(1)

  async function fetchItems(page = 1) {
    try {
      isLoading.value = true
      error.value = null
      const response = await fetchWithAuth('/box/float-recharge/', {
        method: 'GET',
        queryParams: {
          page: String(page),
          page_size: '20',
        },
      })
      const data = await handleApiResponse<{ results?: FloatRecharge[]; count?: number } | FloatRecharge[]>(
        response,
        'Erreur récupération recharges float'
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

  async function createItem(payload: Partial<FloatRecharge>) {
    try {
      isLoading.value = true
      const response = await fetchWithAuth('/box/float-recharge/', {
        method: 'POST',
        body: payload,
      })
      await handleApiResponse(response, 'Erreur création recharge float')
      const notification = useNotification()
      notification.addNotification('Recharge float enregistrée', 'success')
      await fetchItems(currentPage.value)
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

  async function updateItem(id: number, payload: Partial<FloatRecharge>) {
    try {
      isLoading.value = true
      const response = await fetchWithAuth(`/box/float-recharge/${id}/`, {
        method: 'PUT',
        body: payload,
      })
      await handleApiResponse(response, 'Erreur mise à jour recharge float')
      const notification = useNotification()
      notification.addNotification('Recharge float mise à jour', 'success')
      await fetchItems(currentPage.value)
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
      const response = await fetchWithAuth(`/box/float-recharge/${id}/`, {
        method: 'DELETE',
      })
      await handleApiResponse(response, 'Erreur suppression')
      const notification = useNotification()
      notification.addNotification('Recharge float supprimée', 'success')
      await fetchItems(currentPage.value)
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
    isLoading,
    error,
    totalCount,
    currentPage,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  }
})
