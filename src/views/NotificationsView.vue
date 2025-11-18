<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
      </div>
      <div class="mt-4 md:mt-0">
        <button @click="refreshNotifications" :disabled="notificationsStore.isLoading" class="btn btn-outline">
          <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': notificationsStore.isLoading }"></i>
          Actualiser
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        <!-- <div>
          <label for="type-filter" class="block text-sm font-medium text-gray-700">Type</label>
          <select id="type-filter" v-model="typeFilter" class="input mt-1">
            <option value="all">Tous les types</option>
            <option value="success">Succès</option>
            <option value="warning">Avertissement</option>
            <option value="danger">Erreur</option>
            <option value="info">Information</option>
          </select>
        </div> -->
        <div>
          <label for="type-filter" class="block text-sm font-medium text-gray-700">Notifications</label>
          <select id="type-filter" v-model="notificationFilter" class="input mt-1">
              <option value="owner">Mes notifications</option>
              <option value="all">Toutes les notifications</option>
            </select>
        </div>
        <div>
          <label for="created-at-filter" class="block text-sm font-medium text-gray-700">Date</label>
          <input type="date" id="created-at-filter" v-model="createdAtFilter" class="input mt-1" />
        </div>
        <div>
          <label for="search-filter" class="block text-sm font-medium text-gray-700">Recherche</label>
          <input type="search" id="search-filter" v-model="qFilter" placeholder="Rechercher..." class="input mt-1" />
        </div>
      </div>



      <!-- Résumé des notifications filtrées -->
      <div class="mt-4 text-sm text-gray-600">
        {{ notificationsStore.totalCount }} notification{{ notificationsStore.totalCount > 1 ? 's' : '' }}
        {{ typeFilter !== 'all' ? `de type ${typeFilter}` : '' }}
        {{ createdAtFilter ? `à partir du ${createdAtFilter}` : '' }}
        {{ qFilter ? `avec "${qFilter}"` : '' }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="notificationsStore.isLoading && notificationsStore.notifications.length === 0"
      class="bg-white rounded-lg shadow-sm p-8">
      <div class="flex items-center justify-center">
        <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mr-3"></i>
        <span class="text-gray-600">Chargement des notifications...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="notificationsStore.error" class="bg-white rounded-lg shadow-sm p-8">
      <div class="text-center">
        <i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-3"></i>
        <p class="text-red-600 mb-4">{{ notificationsStore.error }}</p>
        <button @click="loadNotifications()" class="btn btn-primary">
          Réessayer
        </button>
      </div>
    </div>

    <!-- Notifications List -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="divide-y divide-gray-200">
        <div v-for="notification in notificationsStore.notifications" :key="notification.id"
          class="p-4 md:p-6 hover:bg-gray-50 transition-colors">
          <div class="flex">
            <div class="w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0" :class="{
              'bg-green-100 text-green-600': notification.type === 'success',
              'bg-yellow-100 text-yellow-600': notification.type === 'warning',
              'bg-red-100 text-red-600': notification.type === 'danger',
              'bg-blue-100 text-blue-600': notification.type === 'info'
            }">
              <i :class="{
                'fas fa-check': notification.type === 'success',
                'fas fa-exclamation-triangle': notification.type === 'warning',
                'fas fa-times': notification.type === 'danger',
                'fas fa-info': notification.type === 'info'
              }"></i>
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-start">
                <h3 class="font-medium text-gray-900">{{ notification.title }}</h3>
                <div class="flex flex-col items-end text-sm text-gray-500">
                  <span>{{ formatDate(notification.created_at) }}</span>
                  <span>{{ formatTime(notification.created_at) }}</span>
                </div>
              </div>
              <p class="mt-1 text-gray-600">{{ notification.content }}</p>

              <!-- Image si présente -->
              <div v-if="notification.image" class="mt-3">
                <img :src="notification.image" :alt="notification.title" class="max-w-xs rounded-lg shadow-sm" />
              </div>

              <!-- Fichier si présent -->
              <div v-if="notification.file" class="mt-3">
                <a :href="notification.file" target="_blank"
                  class="inline-flex items-center text-blue-600 hover:text-blue-800">
                  <i class="fas fa-paperclip mr-2"></i>
                  Fichier joint
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="notificationsStore.notifications.length === 0 && !notificationsStore.isLoading"
        class="py-12 text-center">
        <i class="fas fa-bell-slash text-4xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-lg mb-2">Aucune notification trouvée</p>
        <p class="text-gray-400 text-sm">
          {{ (typeFilter !== 'all' || createdAtFilter || qFilter)
          ? 'Aucune notification correspondant aux filtres.'
          : 'Vous n\'avez aucune notification pour le moment.' }}
        </p>
      </div>
    </div>

    <!-- Pagination Info -->
    <div v-if="notificationsStore.totalCount > 0"
      class="flex items-center justify-between mt-4 px-4 py-3 bg-white border rounded-lg shadow-sm">
      <!-- Infos -->
      <div class="text-sm text-gray-700">
        <span>Page {{ notificationsStore.currentPage }}</span>
        <span>
          sur {{ totalPages }}
        </span>
        <span class="ml-2">
          ({{ notificationsStore.totalCount }} notification{{ notificationsStore.totalCount > 1 ? 's' : '' }} au total)
        </span>
      </div>

      <!-- Contrôles -->
      <div class="flex space-x-2">
        <button class="btn btn-sm" :class="{ 'opacity-50 cursor-not-allowed': notificationsStore.currentPage === 1 || notificationsStore.isLoading }"
          :disabled="notificationsStore.currentPage === 1 || notificationsStore.isLoading" @click="changePage(notificationsStore.currentPage - 1)">
          <i v-if="notificationsStore.isLoading" class="fas fa-spinner fa-spin mr-1"></i>
          <i v-else class="fas fa-chevron-left mr-1"></i> Précédente
        </button>

        <button class="btn btn-sm" :class="{ 'opacity-50 cursor-not-allowed': !hasNextPage || notificationsStore.isLoading }" :disabled="!hasNextPage || notificationsStore.isLoading"
          @click="changePage(notificationsStore.currentPage + 1)">
          <i v-if="notificationsStore.isLoading" class="fas fa-spinner fa-spin ml-1"></i>
          <i v-else class="fas fa-chevron-right ml-1"></i> Suivante
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useNotificationsStore } from '../stores/notifications'

const notificationsStore = useNotificationsStore()

// Format date as 'DD/MM/YYYY'
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR')
}

// Format time as 'HH:mm'
function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Filtres
const typeFilter = ref('all')
const createdAtFilter = ref('')
const qFilter = ref('')
const notificationFilter = ref('owner') // par défaut sur "owner"

// Pagination calculée
const totalPages = computed(() => Math.ceil(notificationsStore.totalCount / notificationsStore.pageSize))
const hasNextPage = computed(() => notificationsStore.hasNext)

// Charger notifications avec tous les filtres et page
async function loadNotifications(page = 1) {
  await notificationsStore.fetchNotifications(
    notificationFilter.value,
    page,
    notificationsStore.pageSize,
    typeFilter.value,
    createdAtFilter.value,
    qFilter.value,
    notificationFilter.value
  )
}

// Changer la page
async function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return
  await loadNotifications(page)
}

// Rafraîchir (recharge la page courante)
async function refreshNotifications() {
  await loadNotifications(notificationsStore.currentPage)
}

// Charger au montage
onMounted(() => {
  loadNotifications()
})

// Recharger les notifications à chaque changement de filtre
watch(
  [typeFilter, createdAtFilter, qFilter, notificationFilter],
  () => {
    loadNotifications(1)
  }
)
</script>
