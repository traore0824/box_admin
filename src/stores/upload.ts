import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'
import { useNotification } from '../services/notification'

interface UploadResponse {
  id: number
  image?: string
  file?: string
}

export const useUploadStore = defineStore('upload', () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Uploader un fichier/image
  async function uploadFile(file: File, type: 'image' | 'file' = 'image'): Promise<string> {
    try {
      isLoading.value = true
      error.value = null

      // Validation de sécurité pour les images
      if (type === 'image') {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        const maxSize = 5 * 1024 * 1024 // 5MB
        
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, GIF, WebP')
        }
        
        if (file.size > maxSize) {
          throw new Error('Fichier trop volumineux. Taille maximum: 5MB')
        }
      }

      const formData = new FormData()
      if (type === 'image') {
        formData.append('image', file)
      } else {
        formData.append('file', file)
      }

      const response = await fetchWithAuth('/box/upload', {
        method: 'POST',
        body: formData
        // Note: Ne pas mettre Content-Type, le navigateur le fait automatiquement pour FormData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || data.message || 'Erreur lors de l\'upload du fichier')
      }

      const result: UploadResponse = await response.json()
      const url = type === 'image' ? result.image : result.file

      if (!url) {
        throw new Error('URL du fichier non retournée par le serveur')
      }

      return url
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
    isLoading,
    error,
    uploadFile
  }
})

