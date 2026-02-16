<template>
  <div class="space-y-6 p-4 md:p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Publications</h1>
      <div class="flex space-x-2">
        <button 
          v-if="authStore.user?.is_staff"
          @click="showCreateModal = true"
          class="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <i class="fas fa-plus mr-2"></i>
          Ajouter
        </button>
        <button 
          @click="publicationsStore.fetchPublications(publicationsStore.currentPage)" 
          :disabled="publicationsStore.isLoading"
          class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': publicationsStore.isLoading }"></i>
          Actualiser
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="publicationsStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="fas fa-exclamation-circle text-red-400"></i>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Erreur</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ publicationsStore.error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="publicationsStore.isLoading && (!publicationsStore.publications || publicationsStore.publications.length === 0)" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!publicationsStore.publications || publicationsStore.publications.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
      <i class="fas fa-newspaper text-gray-300 text-5xl mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900">Aucune publication</h3>
      <p class="mt-1 text-gray-500">Il n'y a pas encore de publications à afficher.</p>
    </div>

    <!-- Publications List -->
    <div v-else class="space-y-4">
      <div 
        v-for="publication in publicationsStore.publications" 
        :key="publication.id"
        class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md"
        :class="{ 'opacity-75 bg-gray-50': publication.is_read }"
      >
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span 
                  v-if="!publication.is_read" 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  Non lu
                </span>
                <span class="text-xs text-gray-500" v-if="publication.created_at">
                  {{ formatDate(publication.created_at) }}
                </span>
                <span v-if="publication.created_by" class="text-xs text-gray-400">
                  par {{ publication.created_by.fullname || publication.created_by.email }}
                </span>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ publication.title }}
              </h3>
              
              <!-- Images Gallery -->
              <div v-if="publication.images && publication.images.length > 0" class="flex flex-wrap gap-2 mb-4">
                <img 
                  v-for="(image, index) in publication.images" 
                  :key="index" 
                  :src="image" 
                  class="h-24 w-24 object-cover rounded-lg border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                  @click="openImage(image)"
                />
              </div>

              <div class="prose prose-sm max-w-none text-gray-600" v-html="formatContent(publication.content)"></div>
            </div>
            
            <div class="ml-4 flex-shrink-0">
              <button
                v-if="!publication.is_read"
                @click="markAsRead(publication.id)"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                title="Marquer comme lu"
              >
                <i class="fas fa-check mr-1"></i>
                Marquer lu
              </button>
              <span v-else class="text-green-600 text-sm flex items-center">
                <i class="fas fa-check-double mr-1"></i>
                Lu
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Publication Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showCreateModal = false"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
              Nouvelle Publication
            </h3>
            
            <div class="space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700">Titre</label>
                <input 
                  type="text" 
                  id="title" 
                  v-model="newPub.title"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Titre de la publication"
                />
              </div>
              
              <div>
                <label for="content" class="block text-sm font-medium text-gray-700">Contenu</label>
                <textarea 
                  id="content" 
                  rows="4" 
                  v-model="newPub.content"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Contenu détaillé..."
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Images</label>
                <div class="mt-2 flex items-center space-x-2">
                  <div v-for="(img, index) in newPub.images" :key="index" class="relative">
                    <img :src="img" class="h-16 w-16 object-cover rounded-md border" />
                    <button 
                      @click="removeImage(index)"
                      class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px]"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <label 
                    v-if="!isUploading"
                    class="h-16 w-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-primary text-gray-400 hover:text-primary transition-colors"
                  >
                    <i class="fas fa-camera"></i>
                    <span class="text-[10px] mt-1">Ajouter</span>
                    <input type="file" class="hidden" accept="image/*" @change="handleFileUpload" />
                  </label>
                  
                  <div v-else class="h-16 w-16 flex items-center justify-center border border-gray-200 rounded-md">
                    <i class="fas fa-spinner animate-spin text-primary"></i>
                  </div>
                </div>
              </div>

              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="is_active" 
                  v-model="newPub.is_active"
                  class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label for="is_active" class="ml-2 block text-sm text-gray-900">
                  Activer immédiatement
                </label>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              @click="handleCreate"
              :disabled="publicationsStore.isLoading || isUploading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              <i v-if="publicationsStore.isLoading" class="fas fa-spinner animate-spin mr-2"></i>
              Publier
            </button>
            <button 
              type="button" 
              @click="showCreateModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { usePublicationsStore } from '../stores/publications'
import { useAuthStore } from '../stores/auth'
import { useUploadStore } from '../stores/upload'

const publicationsStore = usePublicationsStore()
const authStore = useAuthStore()
const uploadStore = useUploadStore()

const showCreateModal = ref(false)
const isUploading = ref(false)

const newPub = reactive({
  title: '',
  content: '',
  images: [] as string[],
  is_active: true
})

onMounted(() => {
  publicationsStore.fetchPublications()
})

const markAsRead = async (id: string) => {
  await publicationsStore.markAsRead(id)
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    try {
      isUploading.value = true
      const url = await uploadStore.uploadFile(target.files[0])
      newPub.images.push(url)
    } finally {
      isUploading.value = false
      target.value = '' // Reset input
    }
  }
}

const removeImage = (index: number) => {
  newPub.images.splice(index, 1)
}

const handleCreate = async () => {
  if (!newPub.title || !newPub.content) {
    alert('Veuillez remplir le titre et le contenu')
    return
  }
  
  try {
    await publicationsStore.createPublication({ ...newPub })
    showCreateModal.value = false
    // Reset form
    newPub.title = ''
    newPub.content = ''
    newPub.images = []
    newPub.is_active = true
  } catch (err) {
    // Error handled by store
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatContent = (content: string) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

const openImage = (url: string) => {
  window.open(url, '_blank')
}
</script>

<style scoped>
.bg-primary {
  @apply bg-blue-600;
}
.bg-primary-600 {
  @apply bg-blue-700;
}
.text-primary {
  @apply text-blue-600;
}
.bg-primary-50 {
  @apply bg-blue-50;
}
.bg-primary-100 {
  @apply bg-blue-100;
}
.focus\:ring-primary:focus {
  @apply ring-blue-500;
}
.focus\:border-primary:focus {
  @apply border-blue-500;
}
</style>
