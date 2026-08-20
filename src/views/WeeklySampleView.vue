<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Sélection hebdomadaire</h1>
        <p v-if="store.current" class="text-sm text-gray-500 mt-1">
          Générée le {{ formatDate(store.current.created_at) }}
          <span v-if="store.current.generated_by">· par {{ store.current.generated_by.email }}</span>
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="showHistory = !showHistory"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <i class="fas fa-history"></i>
          {{ showHistory ? 'Voir semaine courante' : 'Historique' }}
        </button>
        <button
          @click="handleGenerate"
          :disabled="store.isGenerating"
          class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
        >
          <i v-if="store.isGenerating" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-sync-alt"></i>
          Générer
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex justify-center py-16">
      <i class="fas fa-spinner fa-spin text-3xl text-primary"></i>
    </div>

    <!-- Historique -->
    <div v-else-if="showHistory">
      <div v-if="store.history.length === 0" class="bg-white rounded-lg shadow p-12 text-center text-gray-500">
        Aucun historique disponible
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="sample in store.history"
          :key="sample.id"
          @click="selectedHistory = sample"
          class="bg-white rounded-lg shadow p-4 cursor-pointer hover:border-primary hover:border transition-colors"
          :class="selectedHistory?.id === sample.id ? 'border-2 border-primary' : 'border border-transparent'"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-gray-900">{{ sample.label }}</p>
              <p class="text-sm text-gray-500">Générée le {{ formatDate(sample.created_at) }}</p>
            </div>
            <div class="flex gap-4 text-sm text-gray-600">
              <span><i class="fas fa-briefcase mr-1 text-primary"></i>{{ sample.entries_with_caisse.length }} avec caisse</span>
              <span><i class="fas fa-user mr-1 text-gray-400"></i>{{ sample.entries_without_caisse.length }} sans caisse</span>
              <span class="text-green-600">
                <i class="fas fa-phone-check mr-1"></i>
                {{ countCalled(sample) }} appelés
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Détail sélection historique -->
      <div v-if="selectedHistory" class="mt-6">
        <SampleDetail :sample="selectedHistory" :readonly="true" />
      </div>
    </div>

    <!-- Semaine courante -->
    <div v-else-if="store.current">
      <SampleDetail :sample="store.current" :readonly="false" @mark-called="handleMarkCalled" />
    </div>

    <div v-else class="bg-white rounded-lg shadow p-12 text-center">
      <i class="fas fa-calendar-week text-5xl text-gray-300 mb-4"></i>
      <p class="text-gray-500 mb-4">Aucune sélection pour cette semaine</p>
      <button @click="handleGenerate" :disabled="store.isGenerating"
        class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">
        <i v-if="store.isGenerating" class="fas fa-spinner fa-spin mr-2"></i>
        Générer la sélection
      </button>
    </div>

    <!-- Modal notes -->
    <Teleport to="body">
      <div v-if="showNotesModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Marquer comme appelé — {{ pendingEntry?.user.first_name }} {{ pendingEntry?.user.last_name }}
          </h3>
          <textarea
            v-model="callNotes"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="Notes sur l'appel (optionnel)..."
          ></textarea>
          <div class="flex justify-end gap-3 mt-4">
            <button @click="showNotesModal = false" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Annuler
            </button>
            <button @click="confirmMarkCalled" :disabled="isSaving"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
              <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-check"></i>
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWeeklySampleStore, type WeeklySample, type SampleEntry } from '../stores/weeklySample'
import SampleDetail from '../components/dashboard/SampleDetail.vue'

const store = useWeeklySampleStore()
const showHistory = ref(false)
const selectedHistory = ref<WeeklySample | null>(null)
const showNotesModal = ref(false)
const pendingEntry = ref<SampleEntry | null>(null)
const callNotes = ref('')
const isSaving = ref(false)

onMounted(async () => {
  await store.fetchCurrent()
  await store.fetchHistory()
})

const formatDate = (date: string) =>
  new Date(date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const countCalled = (sample: WeeklySample) =>
  [...sample.entries_with_caisse, ...sample.entries_without_caisse].filter(e => e.called).length

async function handleGenerate() {
  await store.generate()
}

function handleMarkCalled(entry: SampleEntry) {
  pendingEntry.value = entry
  callNotes.value = entry.notes || ''
  showNotesModal.value = true
}

async function confirmMarkCalled() {
  if (!pendingEntry.value) return
  try {
    isSaving.value = true
    await store.markCalled(pendingEntry.value.id, callNotes.value)
    showNotesModal.value = false
  } finally {
    isSaving.value = false
  }
}
</script>
