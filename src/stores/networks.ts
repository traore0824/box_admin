import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'
import { useNotification } from '../services/notification'

interface Network {
  id: number
  name: string
  name_display: string
  publique_name: string
  country_code: string
  indication_country: string
  enable_for_deposit: boolean
  enable_for_withdrawal: boolean
  image: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export const useNetworksStore = defineStore('networks', () => {
  const networks = ref<Network[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isActiveFilter = ref<boolean | null>(null)

  // Récupérer la liste des réseaux
  async function fetchNetworks(isActive?: boolean) {
    try {
      isLoading.value = true
      error.value = null

      const params: Record<string, string> = {}
      if (isActive !== undefined && isActive !== null) {
        params.is_active = isActive.toString()
      }

      const response = await fetchWithAuth('/box/network', {
        method: 'GET',
        queryParams: params
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des réseaux')
      }

      networks.value = await response.json()
      isActiveFilter.value = isActive ?? null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching networks:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Créer un réseau
  async function createNetwork(networkData: Omit<Network, 'id' | 'created_at' | 'updated_at' | 'name_display'>) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/box/network', {
        method: 'POST',
        body: networkData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || data.message || 'Erreur lors de la création du réseau')
      }

      const result = await response.json()
      const notification = useNotification()
      notification.addNotification('Réseau créé avec succès', 'success')

      // Rafraîchir la liste
      await fetchNetworks(isActiveFilter.value ?? undefined)

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      const notification = useNotification()
      notification.addNotification(error.value, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Mettre à jour un réseau
  async function updateNetwork(id: number, networkData: Partial<Omit<Network, 'id' | 'created_at' | 'updated_at' | 'name_display'>>) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth(`/box/network/${id}`, {
        method: 'PUT',
        body: networkData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || data.message || 'Erreur lors de la mise à jour du réseau')
      }

      const result = await response.json()
      const notification = useNotification()
      notification.addNotification('Réseau mis à jour avec succès', 'success')

      // Rafraîchir la liste
      await fetchNetworks(isActiveFilter.value ?? undefined)

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      const notification = useNotification()
      notification.addNotification(error.value, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Supprimer un réseau
  async function deleteNetwork(id: number) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth(`/box/network/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || data.message || 'Erreur lors de la suppression du réseau')
      }

      const notification = useNotification()
      notification.addNotification('Réseau supprimé avec succès', 'success')

      // Rafraîchir la liste
      await fetchNetworks(isActiveFilter.value ?? undefined)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      const notification = useNotification()
      notification.addNotification(error.value, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    networks,
    isLoading,
    error,
    isActiveFilter,
    fetchNetworks,
    createNetwork,
    updateNetwork,
    deleteNetwork
  }
})

