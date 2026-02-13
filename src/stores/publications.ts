import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'

export interface Publication {
    id: string
    title: string
    content: string
    is_read: boolean
    created_at?: string
    // Add other fields if necessary based on API response
}

interface PublicationsResponse {
    count: number
    next: string | null
    previous: string | null
    results: Publication[]
}

export const usePublicationsStore = defineStore('publications', () => {
    const publications = ref<Publication[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const totalCount = ref(0)
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    async function fetchPublications(page = 1) {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetchWithAuth(`/box/publications?page=${page}`, {
                method: 'GET'
            })

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des publications')
            }

            const data: PublicationsResponse = await response.json()
            publications.value = data.results
            totalCount.value = data.count
            currentPage.value = page
        } catch (err: any) {
            error.value = err.message || 'Une erreur est survenue'
        } finally {
            isLoading.value = false
        }
    }

    async function markAsRead(id: string) {
        try {
            const response = await fetchWithAuth('/box/publications/mark-read', {
                method: 'POST',
                body: JSON.stringify({ publication_id: id })
            })

            if (!response.ok) {
                throw new Error('Erreur lors du marquage comme lu')
            }

            // Update local state
            const pub = publications.value.find(p => p.id === id)
            if (pub) {
                pub.is_read = true
            }

            return true
        } catch (err: any) {
            error.value = err.message || 'Une erreur est survenue'
            return false
        }
    }

    return {
        publications,
        isLoading,
        error,
        totalCount,
        currentPage,
        itemsPerPage,
        fetchPublications,
        markAsRead
    }
})
