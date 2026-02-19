import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'

export interface Publication {
    id: string
    title: string
    content: string
    images: string[]
    created_by: {
        id: number
        email: string
        fullname: string
    }
    created_at: string
    updated_at: string
    is_active: boolean
    is_read: boolean
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

            const dataContent = await response.json()
            // The documentation says Response (200 OK): [ {...} ] (an array directly)
            // But previous code assumed { results: [...] }. 
            // I'll handle both or stick to the documentation.
            if (Array.isArray(dataContent)) {
                publications.value = dataContent
                totalCount.value = dataContent.length
            } else if (dataContent && typeof dataContent === 'object') {
                publications.value = dataContent.results || []
                totalCount.value = dataContent.count || 0
            } else {
                publications.value = []
                totalCount.value = 0
            }
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
                body: { publication_id: id }
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

    async function createPublication(data: { title: string; content: string; images: string[]; is_active: boolean }) {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetchWithAuth('/box/admin/publications', {
                method: 'POST',
                body: data
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Erreur lors de la création de la publication')
            }

            const newPub: Publication = await response.json()
            publications.value.unshift(newPub)
            return newPub
        } catch (err: any) {
            error.value = err.message || 'Une erreur est survenue'
            throw err
        } finally {
            isLoading.value = false
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
        markAsRead,
        createPublication
    }
})
