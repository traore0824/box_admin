import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'

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

            const dataContent = await handleApiResponse<Publication[] | { results?: Publication[]; count?: number }>(
                response,
                'Erreur lors du chargement des publications'
            )
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

            await handleApiResponse(response, 'Erreur lors du marquage comme lu')

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

            const newPub = await handleApiResponse<Publication>(
                response,
                'Erreur lors de la création de la publication'
            )
            publications.value.unshift(newPub)
            return newPub
        } catch (err: any) {
            error.value = err.message || 'Une erreur est survenue'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function updatePublication(id: string, data: Partial<{ title: string; content: string; images: string[]; is_active: boolean }>) {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetchWithAuth(`/box/admin/publications/${id}/`, {
                method: 'PATCH',
                body: data
            })

            const updatedPub = await handleApiResponse<Publication>(
                response,
                'Erreur lors de la modification de la publication'
            )
            const index = publications.value.findIndex(p => p.id === id)
            if (index !== -1) {
                publications.value[index] = updatedPub
            }
            return updatedPub
        } catch (err: any) {
            error.value = err.message || 'Une erreur est survenue'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function republishPublication(id: string): Promise<{ reads_reset_count: number; data: Publication }> {
        isLoading.value = true
        error.value = null
        try {
            const response = await fetchWithAuth(`/box/admin/publications/${id}/republish/`, {
                method: 'POST'
            })

            const result = await handleApiResponse<{ reads_reset_count: number; data: Publication }>(
                response,
                'Erreur lors de la republication'
            )
            // Mettre à jour localement : replacer la pub et la remonter en tête de liste
            const updatedPub: Publication = result.data
            const index = publications.value.findIndex(p => p.id === id)
            if (index !== -1) {
                publications.value.splice(index, 1)
            }
            publications.value.unshift(updatedPub)
            return result
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
        createPublication,
        updatePublication,
        republishPublication
    }
})
