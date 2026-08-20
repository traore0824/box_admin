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
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
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
            
            <div class="ml-4 flex-shrink-0 flex flex-col space-y-2">
              <button
                v-if="!publication.is_read"
                @click="markAsRead(publication.id)"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                title="Marquer comme lu"
              >
                <i class="fas fa-check mr-1"></i>
                Marquer lu
              </button>
              <span v-else class="text-green-600 text-sm flex items-center mb-2">
                <i class="fas fa-check-double mr-1"></i>
                Lu
              </span>
              
              <button
                v-if="authStore.user?.is_staff"
                @click="openEditModal(publication)"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                title="Modifier"
              >
                <i class="fas fa-edit mr-1"></i>
                Modifier
              </button>

              <button
                v-if="authStore.user?.is_staff"
                @click="openRepublishConfirm(publication)"
                :disabled="republishingId === publication.id"
                class="inline-flex items-center px-3 py-1.5 border border-primary-300 text-xs font-medium rounded-md text-primary-dark bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                title="Republier"
              >
                <i
                  class="fas mr-1"
                  :class="republishingId === publication.id ? 'fa-spinner animate-spin' : 'fa-redo-alt'"
                ></i>
                {{ republishingId === publication.id ? '...' : 'Republier' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Republish Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showRepublishModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="closeRepublishConfirm"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <div class="flex items-start gap-4 mb-4">
            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fas fa-redo-alt text-primary"></i>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900">Republier cette publication ?</h3>
              <p class="text-sm text-gray-500 mt-1">
                <span class="font-medium text-gray-700">« {{ republishTarget?.title }} »</span>
              </p>
            </div>
          </div>
          <ul class="text-sm text-gray-600 space-y-1.5 mb-5 bg-primary-50 rounded-lg p-3">
            <li class="flex items-center gap-2"><i class="fas fa-check text-primary w-4"></i> La publication repassera en tête du fil</li>
            <li class="flex items-center gap-2"><i class="fas fa-check text-primary w-4"></i> Elle sera marquée comme <strong>active</strong></li>
            <li class="flex items-center gap-2"><i class="fas fa-check text-primary w-4"></i> Toutes les lectures seront réinitialisées</li>
          </ul>
          <div class="flex justify-end gap-3">
            <button
              @click="closeRepublishConfirm"
              :disabled="republishingId !== null"
              class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              @click="confirmRepublish"
              :disabled="republishingId !== null"
              class="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i class="fas" :class="republishingId ? 'fa-spinner animate-spin' : 'fa-redo-alt'"></i>
              {{ republishingId ? 'Republication...' : 'Confirmer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create Publication Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeCreateModal"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
              {{ isEditing ? 'Modifier la Publication' : 'Nouvelle Publication' }}
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
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-sm font-medium text-gray-700">Contenu</label>
                  <div class="inline-flex rounded-md border border-gray-300 overflow-hidden text-xs font-medium">
                    <button
                      type="button"
                      @click="contentMode = 'rich'"
                      :class="contentMode === 'rich' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                      class="px-3 py-1.5"
                    >
                      Texte enrichi
                    </button>
                    <button
                      type="button"
                      @click="contentMode = 'plain'"
                      :class="contentMode === 'plain' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                      class="px-3 py-1.5 border-l border-gray-300"
                    >
                      Texte simple
                    </button>
                  </div>
                </div>
                <RichTextEditor
                  v-if="contentMode === 'rich'"
                  v-model="newPub.content"
                  placeholder="Contenu détaillé..."
                />
                <textarea
                  v-else
                  v-model="newPub.content"
                  rows="6"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2"
                  placeholder="Contenu détaillé (texte simple, sans mise en forme)"
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
              @click="handleSubmit"
              :disabled="publicationsStore.isLoading || isUploading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              <i v-if="publicationsStore.isLoading" class="fas fa-spinner animate-spin mr-2"></i>
              {{ isEditing ? 'Mettre à jour' : 'Publier' }}
            </button>
            <button 
              type="button" 
              @click="closeCreateModal"
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
import { useNotification } from '../services/notification'
import RichTextEditor from '../components/RichTextEditor.vue'

const publicationsStore = usePublicationsStore()
const authStore = useAuthStore()
const uploadStore = useUploadStore()

const showCreateModal = ref(false)
const isUploading = ref(false)

// Republish state
const showRepublishModal = ref(false)
const republishTarget = ref<{ id: string; title: string } | null>(null)
const republishingId = ref<string | null>(null)

const openRepublishConfirm = (publication: { id: string; title: string }) => {
  republishTarget.value = publication
  showRepublishModal.value = true
}

const closeRepublishConfirm = () => {
  if (republishingId.value) return
  showRepublishModal.value = false
  republishTarget.value = null
}

const confirmRepublish = async () => {
  if (!republishTarget.value) return
  const id = republishTarget.value.id
  republishingId.value = id
  try {
    const result = await publicationsStore.republishPublication(id)
    const notification = useNotification()
    notification.addNotification(
      `Publication republiée — ${result.reads_reset_count} lecture(s) réinitialisée(s)`,
      'success'
    )
    showRepublishModal.value = false
    republishTarget.value = null
  } catch {
    // Error handled in store
  } finally {
    republishingId.value = null
  }
}

const newPub = reactive({
  title: '',
  content: '',
  images: [] as string[],
  is_active: true
})

// Mode de saisie du contenu : éditeur riche ou texte simple
const contentMode = ref<'rich' | 'plain'>('rich')

const isEditing = ref(false)
const editingId = ref<string | null>(null)

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

const openEditModal = (publication: any) => {
  isEditing.value = true
  editingId.value = publication.id
  newPub.title = publication.title
  newPub.content = publication.content
  newPub.images = [...publication.images]
  newPub.is_active = publication.is_active
  showCreateModal.value = true
}

const handleSubmit = async () => {
  if (!newPub.title || !newPub.content) {
    alert('Veuillez remplir le titre et le contenu')
    return
  }
  
  try {
    if (isEditing.value && editingId.value) {
      await publicationsStore.updatePublication(editingId.value, { ...newPub })
    } else {
      await publicationsStore.createPublication({ ...newPub })
    }
    
    showCreateModal.value = false
    resetForm()
  } catch (err) {
    // Error handled by store
  }
}

const resetForm = () => {
  isEditing.value = false
  editingId.value = null
  newPub.title = ''
  newPub.content = ''
  newPub.images = []
  newPub.is_active = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  resetForm()
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

