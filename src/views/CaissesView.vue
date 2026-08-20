<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Liste des Caisses</h1>
      <button class="btn btn-primary w-full sm:w-auto" @click="caisseStore.fetchCaisse(caisseStore.currentPage)">
        <i class="fas fa-sync mr-2"></i> Rafraîchir
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="space-y-3">
      <div class="relative w-full sm:max-w-[50%]">
        <input
          v-model="caisseStore.searchQuery"
          @input="caisseStore.updateSearchQuery(caisseStore.searchQuery)"
          type="text"
          placeholder="Rechercher par nom, email, téléphone..."
          class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        />
        <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
      </div>

      <div class="flex flex-wrap gap-3 items-end">
        <div class="flex-1 sm:flex-initial min-w-[130px]">
          <label class="block text-xs text-gray-500 mb-1">Du</label>
          <input
            v-model="caisseStore.startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div class="flex-1 sm:flex-initial min-w-[130px]">
          <label class="block text-xs text-gray-500 mb-1">Au</label>
          <input
            v-model="caisseStore.endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div class="flex-1 sm:flex-initial min-w-[150px]">
          <label class="block text-xs text-gray-500 mb-1">Statut</label>
          <select
            v-model="caisseStore.statusFilter"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous les statuts</option>
            <option value="disabled">Non actif</option>
            <option value="pending">En cours</option>
            <option value="done">Terminée</option>
            <option value="withdrawn">Retirée</option>
            <option value="cancel">Annulée</option>
            <option value="cancelled">Annulée (v2)</option>
          </select>
        </div>
        <div class="flex-1 sm:flex-initial min-w-[150px]">
          <label class="block text-xs text-gray-500 mb-1">Fréquence</label>
          <select
            v-model="caisseStore.frequenceFilter"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Toutes</option>
            <option value="all_week">Semaine</option>
            <option value="all_month">Mois</option>
            <option value="all_days">Jour</option>
            <option value="custom">Personnalisée</option>
            <option value="unlimited">Illimitée</option>
          </select>
        </div>
        <div class="flex-1 sm:flex-initial min-w-[130px]">
          <label class="block text-xs text-gray-500 mb-1">Type</label>
          <select
            v-model="caisseStore.typeBoxFilter"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous</option>
            <option value="free">Libre</option>
            <option value="locked">Bloquée</option>
          </select>
        </div>
        <div class="flex-1 sm:flex-initial min-w-[130px]">
          <label class="block text-xs text-gray-500 mb-1">Mode</label>
          <select
            v-model="caisseStore.personalFilter"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous</option>
            <option value="true">Personnelle</option>
            <option value="false">Groupe</option>
          </select>
        </div>
        <div class="flex-1 sm:flex-initial min-w-[140px]">
          <label class="block text-xs text-gray-500 mb-1">Retrait</label>
          <select
            v-model="caisseStore.withdrawnFilter"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous</option>
            <option value="false">Sans retrait</option>
            <option value="true">Retirée / annulée</option>
          </select>
        </div>
      </div>

      <!-- Stat cards -->
      <div v-if="caisseStore.caisseStats" class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <button
          v-for="card in statCards"
          :key="card.key"
          type="button"
          @click="applyStatCard(card)"
          :class="[
            'text-left p-2 rounded-lg border text-xs transition-colors',
            card.active
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-gray-200 bg-white hover:border-primary/40'
          ]"
        >
          <div class="font-semibold text-lg leading-tight">{{ card.count }}</div>
          <div class="text-gray-600 mt-0.5 leading-snug">{{ card.label }}</div>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="caisseStore.isLoading" class="py-8 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      <p class="mt-2 text-gray-600">Chargement des caisses...</p>
    </div>

    <!-- Error -->
    <div v-else-if="caisseStore.error" class="py-8 text-center">
      <p class="text-red-600">{{ caisseStore.error }}</p>
      <button class="mt-2 btn btn-primary" @click="caisseStore.fetchCaisse(caisseStore.currentPage)">
        <i class="fas fa-sync mr-2"></i> Réessayer
      </button>
    </div>

    <!-- List -->
    <div v-else-if="caisseStore.caisses.length > 0" class="bg-white rounded-lg shadow-sm">
      <div class="w-full overflow-x-auto">
        <table class="table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-2 sm:px-4 md:px-6">Nom</th>
              <th class="px-2 sm:px-4 md:px-6">Montant</th>
              <th class="px-2 sm:px-4 md:px-6">Statut</th>
              <th class="px-2 sm:px-4 md:px-6 hidden md:table-cell">Progression</th>
              <th class="px-2 sm:px-4 md:px-6 hidden lg:table-cell">Date de début</th>
              <th class="px-2 sm:px-4 md:px-6 hidden xl:table-cell">Utilisateur</th>
              <th class="px-2 sm:px-4 md:px-6">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="caisse in caisseStore.caisses" :key="caisse.id">
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <div class="flex flex-col">
                  <span class="font-medium text-gray-900 text-xs sm:text-sm">{{ caisse.name }}</span>
                  <span class="text-xs text-gray-500 lg:hidden">
                    {{ caisse.start_date ? new Date(caisse.start_date).toLocaleDateString('fr-FR') : '-' }}
                  </span>
                </div>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                <span class="font-medium">
                  {{ formatAmount(caisse.amount_already_paid || caisse.amount || 0) }}
                </span>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <span class="badge text-xs" :class="statusBadgeClass(caisse.status)">
                  {{ statusLabel(caisse.status) }}
                </span>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden md:table-cell">
                <div class="flex items-center gap-2">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-primary h-2 rounded-full"
                      :style="{ width: `${Math.min(100, parseFloat(caisse.percentage_progession) || 0)}%` }"
                    ></div>
                  </div>
                  <span class="text-xs sm:text-sm whitespace-nowrap">{{ caisse.percentage_progession }}%</span>
                </div>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden lg:table-cell">
                {{ caisse.start_date ? new Date(caisse.start_date).toLocaleDateString('fr-FR') : '-' }}
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden xl:table-cell">
                <div class="text-xs sm:text-sm text-gray-900">{{ caisse.created_by?.email }}</div>
                <div class="text-xs text-gray-500">{{ caisse.created_by?.phone }}</div>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <div class="flex flex-wrap gap-2">
                  <router-link
                    :to="{ name: 'caisse-details', params: { id: caisse.id.toString() } }"
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <i class="fas fa-eye mr-1"></i>
                    <span class="hidden sm:inline">Détails</span>
                  </router-link>
                  <button
                    type="button"
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary bg-white border border-primary/30 rounded-md hover:bg-primary/5"
                    @click="openBalanceHistory(caisse)"
                  >
                    <i class="fas fa-history mr-1"></i>
                    <span class="hidden sm:inline">Historique</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="py-8 text-center bg-white rounded-lg shadow-sm">
      <p class="text-gray-500">Aucune caisse trouvée.</p>
    </div>

    <!-- Pagination -->
    <div
      v-if="!caisseStore.isLoading && !caisseStore.error && caisseStore.caisses.length > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border rounded-lg shadow-sm"
    >
      <div class="text-xs sm:text-sm text-gray-700">
        Page {{ caisseStore.currentPage }}
        sur {{ totalPages }}
        <span class="ml-2 hidden sm:inline">({{ caisseStore.totalCaisse }} au total)</span>
      </div>
      <div class="flex space-x-2">
        <button
          class="btn btn-sm"
          :disabled="caisseStore.currentPage <= 1"
          @click="goToPage(caisseStore.currentPage - 1)"
        >
          <i class="fas fa-chevron-left mr-1"></i> Précédente
        </button>
        <button class="btn btn-sm" :disabled="!hasNextPage" @click="goToPage(caisseStore.currentPage + 1)">
          Suivante <i class="fas fa-chevron-right ml-1"></i>
        </button>
      </div>
    </div>

    <CaisseBalanceHistoryModal
      v-model="showBalanceHistoryModal"
      :caisse-id="selectedCaisseId"
      :caisse-name="selectedCaisseName"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useCaisseStore, CAISSE_STAT_LABELS, type Caisse } from '../stores/caisse'
import { formatAmount } from '../utils/currency'
import CaisseBalanceHistoryModal from '../components/CaisseBalanceHistoryModal.vue'

const route = useRoute()
const router = useRouter()
const caisseStore = useCaisseStore()

const showBalanceHistoryModal = ref(false)
const selectedCaisseId = ref<number | null>(null)
const selectedCaisseName = ref('')
const skipUrlSync = ref(false)

const totalPages = computed(() =>
  Math.max(1, Math.ceil((caisseStore.totalCaisse || 0) / caisseStore.itemsPerPage))
)

const hasNextPage = computed(() => caisseStore.currentPage < totalPages.value)

const statCards = computed(() => {
  const s = caisseStore.caisseStats
  if (!s) return []
  return [
    { key: 'all', label: 'Total', count: s.total, active: !caisseStore.statusFilter && !caisseStore.withdrawnFilter, filter: {} },
    { key: 'pending', label: 'En cours', count: s.pending, active: caisseStore.statusFilter === 'pending', filter: { status: 'pending' as const } },
    { key: 'done', label: 'Terminées', count: s.done, active: caisseStore.statusFilter === 'done', filter: { status: 'done' as const } },
    { key: 'not_withdrawn', label: 'Sans retrait', count: s.not_withdrawn, active: caisseStore.withdrawnFilter === 'false', filter: { withdrawn: 'false' as const } },
    { key: 'withdrawn', label: 'Retirées', count: s.withdrawn, active: caisseStore.withdrawnFilter === 'true', filter: { withdrawn: 'true' as const } },
    { key: 'disabled', label: 'Non actif', count: s.disabled, active: caisseStore.statusFilter === 'disabled', filter: { status: 'disabled' as const } },
    { key: 'group', label: 'Groupe', count: s.group, active: caisseStore.personalFilter === 'false', filter: { personal: 'false' as const } },
    { key: 'personal', label: 'Personnelle', count: s.personal, active: caisseStore.personalFilter === 'true', filter: { personal: 'true' as const } },
  ]
})

const statusLabel = (status: string) => CAISSE_STAT_LABELS[status] || status

const statusBadgeClass = (status: string) => ({
  'bg-green-100 text-green-800': status === 'done' || status === 'withdrawn',
  'bg-yellow-100 text-yellow-800': status === 'pending',
  'bg-red-100 text-red-800': status === 'disabled' || status === 'cancel' || status === 'cancelled',
  'bg-primary-100 text-primary-800': !['done', 'pending', 'disabled', 'withdrawn', 'cancel', 'cancelled'].includes(status),
})

const goToPage = (page: number) => {
  caisseStore.fetchCaisse(page)
}

const openBalanceHistory = (caisse: Caisse) => {
  selectedCaisseId.value = caisse.id
  selectedCaisseName.value = caisse.name
  showBalanceHistoryModal.value = true
}

const applyStatCard = (card: (typeof statCards.value)[number]) => {
  if (card.key === 'all') {
    caisseStore.statusFilter = ''
    caisseStore.withdrawnFilter = ''
    caisseStore.personalFilter = ''
  } else if ('status' in card.filter && card.filter.status) {
    caisseStore.statusFilter = caisseStore.statusFilter === card.filter.status ? '' : card.filter.status
    caisseStore.withdrawnFilter = ''
    caisseStore.personalFilter = ''
  } else if ('withdrawn' in card.filter && card.filter.withdrawn) {
    caisseStore.withdrawnFilter = caisseStore.withdrawnFilter === card.filter.withdrawn ? '' : card.filter.withdrawn
    caisseStore.statusFilter = ''
    caisseStore.personalFilter = ''
  } else if ('personal' in card.filter && card.filter.personal) {
    caisseStore.personalFilter = caisseStore.personalFilter === card.filter.personal ? '' : card.filter.personal
    caisseStore.statusFilter = ''
    caisseStore.withdrawnFilter = ''
  }
  caisseStore.applyFilters()
}

onMounted(() => {
  skipUrlSync.value = true
  caisseStore.initFromRouteQuery(route.query as Record<string, unknown>)
  caisseStore.fetchCaisse(caisseStore.currentPage)
  skipUrlSync.value = false
})

watch(
  () => [
    caisseStore.currentPage,
    caisseStore.searchQuery,
    caisseStore.statusFilter,
    caisseStore.frequenceFilter,
    caisseStore.typeBoxFilter,
    caisseStore.personalFilter,
    caisseStore.withdrawnFilter,
    caisseStore.startDate,
    caisseStore.endDate,
  ],
  ([page, q, status, frequence, typeBox, personal, withdrawn, startDate, endDate]) => {
    if (skipUrlSync.value) return
    const query: Record<string, string> = {}
    if (page && page !== 1) query.page = String(page)
    if (q) query.q = q as string
    if (status) query.status = status as string
    if (frequence) query.frequence = frequence as string
    if (typeBox) query.type_box = typeBox as string
    if (personal) query.personal = personal as string
    if (withdrawn) query.withdrawn = withdrawn as string
    if (startDate) query.start_date = startDate as string
    if (endDate) query.end_date = endDate as string
    router.replace({ query })
  }
)

onBeforeRouteLeave(() => {
  skipUrlSync.value = true
  caisseStore.resetListFilters()
})
</script>

<style scoped>
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
  @apply bg-primary text-white hover:bg-primary-dark;
}
.btn-sm {
  @apply px-3 py-1.5 text-xs border border-gray-300 bg-white hover:bg-gray-50;
}
.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>
