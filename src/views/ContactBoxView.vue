<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Messages de Contact</h1>
      <div class="mt-4 sm:mt-0 text-sm text-gray-600">
        <span class="font-semibold">{{ contactBoxStore.totalMessages }}</span> message(s)
      </div>
    </div>

    <!-- Recherche -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex gap-4">
        <div class="flex-1">
          <input 
            v-model="contactBoxStore.searchQuery"
            @input="debouncedSearch"
            type="text" 
            placeholder="Rechercher par email, nom, sujet..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="contactBoxStore.isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Error Message -->
    <div v-if="contactBoxStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-700">{{ contactBoxStore.error }}</p>
    </div>

    <!-- Liste des Messages -->
    <div v-if="!contactBoxStore.isLoading" class="space-y-4">
      <div 
        v-for="message in contactBoxStore.messages" 
        :key="message.id"
        class="bg-white rounded-lg shadow-sm p-6"
      >
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Informations Expéditeur -->
          <div class="flex-1">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ message.fullname }}</h3>
                <p class="text-sm text-gray-500">{{ message.email }}</p>
                <p v-if="message.created_at" class="text-xs text-gray-400 mt-1">
                  {{ formatDate(message.created_at) }}
                </p>
              </div>
            </div>

            <div class="space-y-2">
              <div>
                <span class="text-sm font-medium text-gray-700">Sujet :</span>
                <span class="text-sm text-gray-900 ml-2">{{ message.subjet }}</span>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-700">Message :</span>
                <p class="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{{ message.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message si aucun message -->
      <div v-if="contactBoxStore.messages.length === 0 && !contactBoxStore.isLoading" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-lg">Aucun message de contact</p>
        <p class="text-sm text-gray-400 mt-2">Les messages de contact apparaîtront ici</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="contactBoxStore.totalMessages > 0" class="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Page {{ contactBoxStore.currentPage }} sur {{ Math.ceil(contactBoxStore.totalMessages / contactBoxStore.itemsPerPage) }}
      </div>
      <div class="flex space-x-2">
        <button 
          @click="contactBoxStore.fetchMessages(contactBoxStore.currentPage - 1, contactBoxStore.itemsPerPage)"
          :disabled="contactBoxStore.currentPage === 1 || contactBoxStore.isLoading"
          class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <button 
          @click="contactBoxStore.fetchMessages(contactBoxStore.currentPage + 1, contactBoxStore.itemsPerPage)"
          :disabled="contactBoxStore.currentPage * contactBoxStore.itemsPerPage >= contactBoxStore.totalMessages || contactBoxStore.isLoading"
          class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useContactBoxStore } from '../stores/contactBox'
import { debounce } from 'lodash'

const contactBoxStore = useContactBoxStore()

onMounted(async () => {
  await contactBoxStore.fetchMessages(1)
})

const debouncedSearch = debounce(() => {
  contactBoxStore.fetchMessages(1, contactBoxStore.itemsPerPage)
}, 300)

const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

