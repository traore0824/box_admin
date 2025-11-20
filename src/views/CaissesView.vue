<template>
  <div class="space-y-6">
    <!-- Page Header + Filtres -->
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Liste des Caisses</h1>

      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full md:w-auto">
        <!-- Champ de recherche -->
        <input v-model="searchQuery" @input="fetchCaisse" type="text" class="input flex-1 sm:flex-initial sm:min-w-[200px]"
          placeholder="Rechercher une caisse..." />

        <!-- Filtre par statut -->
        <select v-model="selectedStatus" @change="fetchCaisse" class="input flex-1 sm:flex-initial sm:min-w-[160px]">
          <option value="">Tous les statuts</option>
          <option value="disabled">Non actif</option>
          <option value="pending">En cours</option>
          <option value="done">Terminé</option>
          <option value="cancel">Annulé</option>
        </select>

        <!-- Filtre par fréquence -->
        <select v-model="selectedFrequence" @change="fetchCaisse" class="input flex-1 sm:flex-initial sm:min-w-[180px]">
          <option value="">Toutes les fréquences</option>
          <option value="all_week">Toutes les semaines</option>
          <option value="all_month">Tous les mois</option>
          <option value="all_days">Tous les jours</option>
          <option value="custom">Fréquence personnalisée</option>
        </select>

        <!-- Bouton rafraîchir -->
        <button class="btn btn-primary w-full sm:w-auto" @click="fetchCaisse">
          <i class="fas fa-sync mr-2"></i> <span class="hidden sm:inline">Rafraîchir</span><span class="sm:hidden">Raf.</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="caisseStore.isLoading" class="py-8 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      <p class="mt-2 text-gray-600">Chargement des caisses...</p>
    </div>

    <!-- Error State -->
    <div v-if="caisseStore.error" class="py-8 text-center">
      <p class="text-red-600">{{ caisseStore.error }}</p>
      <button class="mt-2 btn btn-primary" @click="fetchCaisse">
        <i class="fas fa-sync mr-2"></i> Réessayer
      </button>
    </div>

    <!-- Caisse List -->
    <div v-if="!caisseStore.isLoading && !caisseStore.error && caisseStore.caisses.length > 0"
      class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="table-container -mx-4 sm:mx-0">
        <table class="table">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-2 sm:px-4 md:px-6">Nom</th>
              <th scope="col" class="px-2 sm:px-4 md:px-6">Montant</th>
              <th scope="col" class="px-2 sm:px-4 md:px-6">Statut</th>
              <th scope="col" class="px-2 sm:px-4 md:px-6 hidden md:table-cell">Progression</th>
              <th scope="col" class="px-2 sm:px-4 md:px-6 hidden lg:table-cell">Date de début</th>
              <th scope="col" class="px-2 sm:px-4 md:px-6 hidden xl:table-cell">Utilisateur</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="caisse in caisseStore.caisses" :key="caisse.id">
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <div class="flex flex-col">
                  <span class="font-medium text-gray-900 text-xs sm:text-sm">{{ caisse.name }}</span>
                  <span class="text-xs text-gray-500 lg:hidden">{{ new Date(caisse.start_date).toLocaleDateString() }}</span>
                </div>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                <span class="font-medium">
                  {{ parseFloat(caisse.amount).toLocaleString() }} XOF
                </span>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <span class="badge text-xs" :class="{
                  'bg-green-100 text-green-800': caisse.status === 'done',
                  'bg-yellow-100 text-yellow-800': caisse.status === 'pending',
                  'bg-red-100 text-red-800': caisse.status === 'disabled',
                  'bg-blue-100 text-blue-800': !['done', 'pending', 'disabled'].includes(caisse.status)
                }">
                  {{ caisse.status === 'done' ? 'Terminé' :
                  caisse.status === 'pending' ? 'En cours' :
                  caisse.status === 'disabled' ? 'Désactivé' :
                  caisse.status.charAt(0).toUpperCase() + caisse.status.slice(1) }}
                </span>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden md:table-cell">
                <div class="flex items-center gap-2">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-500 h-2 rounded-full" :style="{ width: `${caisse.percentage_progession}%` }">
                    </div>
                  </div>
                  <span class="text-xs sm:text-sm whitespace-nowrap">{{ caisse.percentage_progession }}%</span>
                </div>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden lg:table-cell">{{ new Date(caisse.start_date).toLocaleDateString() }}</td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden xl:table-cell">
                <div class="text-xs sm:text-sm text-gray-900">{{ caisse.created_by.email }}</div>
                <div class="text-xs text-gray-500">{{ caisse.created_by.phone }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination - Version corrigée -->
    <div v-if="!caisseStore.isLoading && !caisseStore.error && caisseStore.caisses.length > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-4 py-3 bg-white border rounded-lg shadow-sm">

      <!-- Informations sur la pagination -->
      <div class="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
        <span>Page {{ caisseStore.currentPage || 1 }}</span>
        <span v-if="caisseStore.totalCaisse">
          sur {{ Math.ceil((caisseStore.totalCaisse || 0) / (caisseStore.itemsPerPage || 10)) }}
        </span>
        <span v-if="caisseStore.totalCaisse" class="ml-2 hidden sm:inline">
          ({{ caisseStore.totalCaisse }} élément{{ caisseStore.totalCaisse > 1 ? 's' : '' }} au total)
        </span>
      </div>

      <!-- Contrôles de navigation -->
      <div class="flex space-x-2">
        <button class="btn btn-sm text-xs sm:text-sm" :class="{ 'opacity-50 cursor-not-allowed': (caisseStore.currentPage || 1) === 1 }"
          :disabled="(caisseStore.currentPage || 1) === 1" @click="goToPreviousPage">
          <i class="fas fa-chevron-left mr-1"></i> <span class="hidden sm:inline">Précédente</span><span class="sm:hidden">Préc.</span>
        </button>

        <button class="btn btn-sm text-xs sm:text-sm" :class="{ 'opacity-50 cursor-not-allowed': !hasNextPage }" :disabled="!hasNextPage"
          @click="goToNextPage">
          <span class="hidden sm:inline">Suivante</span><span class="sm:hidden">Suiv.</span> <i class="fas fa-chevron-right ml-1"></i>
        </button>
      </div>
    </div>


    <!-- Empty State -->
    <div v-if="!caisseStore.isLoading && !caisseStore.error && caisseStore.caisses.length === 0"
      class="py-8 text-center">
      <p class="text-gray-500">Aucune caisse trouvée.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCaisseStore } from '../stores/caisse'

const caisseStore = useCaisseStore()

// Filtres
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedFrequence = ref('')

// Page suivante disponible ? - Version corrigée
const hasNextPage = computed(() => {
  const currentPage = caisseStore.currentPage || 1
  const totalCaisse = caisseStore.totalCaisse || 0
  const itemsPerPage = caisseStore.itemsPerPage || 10

  if (totalCaisse === 0) return false

  const totalPages = Math.ceil(totalCaisse / itemsPerPage)
  return currentPage < totalPages
})

const goToPreviousPage = () => {
  const currentPage = caisseStore.currentPage || 1
  if (currentPage > 1) {
    caisseStore.fetchCaisse(currentPage - 1, {
      q: searchQuery.value,
      status: selectedStatus.value,
      frequence: selectedFrequence.value
    })
  }
}

const goToNextPage = () => {
  if (hasNextPage.value) {
    const currentPage = caisseStore.currentPage || 1
    caisseStore.fetchCaisse(currentPage + 1, {
      q: searchQuery.value,
      status: selectedStatus.value,
      frequence: selectedFrequence.value
    })
  }
}

// Fonction qui appelle le store avec filtres
const fetchCaisse = () => {
  caisseStore.fetchCaisse(1, {
    q: searchQuery.value,
    status: selectedStatus.value,
    frequence: selectedFrequence.value
  })
}

onMounted(() => {
  fetchCaisse()
})
</script>

<style scoped>
.table-container {
  overflow-x: auto;
}

.table {
  @apply min-w-full;
}

.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.btn {
  @apply inline-flex items-center px-4 py-2 border border-transparent rounded-md font-medium text-sm transition-colors;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500;
}

.btn-sm {
  @apply px-3 py-1.5 text-xs;
}

.input {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm;
}

/* Styles pour les boutons désactivés */
.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>