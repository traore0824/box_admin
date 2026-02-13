<template>
  <div class="space-y-6 p-4 md:p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Publications</h1>
      <button 
        @click="publicationsStore.fetchPublications(publicationsStore.currentPage)" 
        :disabled="publicationsStore.isLoading"
        class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': publicationsStore.isLoading }"></i>
        Actualiser
      </button>
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
    <div v-if="publicationsStore.isLoading && publicationsStore.publications.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="publicationsStore.publications.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
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
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ publication.title }}
              </h3>
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
    
    <!-- Pagination could be added here if needed, consistent with other views -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePublicationsStore } from '../stores/publications'

const publicationsStore = usePublicationsStore()

onMounted(() => {
  publicationsStore.fetchPublications()
})

const markAsRead = async (id: string) => {
  await publicationsStore.markAsRead(id)
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
  // Simple replacement of newlines with <br> if content is plain text
  // If content is already HTML, this might need adjustment or usage of v-html directly
  return content.replace(/\n/g, '<br>')
}
</script>

<style scoped>
.bg-primary {
  @apply bg-blue-600;
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
</style>
