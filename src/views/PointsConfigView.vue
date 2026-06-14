<template>
  <div class="space-y-6 p-4 md:p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Points BOX — Configuration</h1>
      <button @click="load" :disabled="loading"
        class="px-4 py-2 text-sm border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50">
        <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>Actualiser
      </button>
    </div>

    <!-- ── Actions points ─────────────────────────────────── -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Points par action</h2>
        <button @click="handleSeedActions" :disabled="saving"
          class="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50">
          <i class="fas fa-magic mr-1"></i>Ajouter les manquants
        </button>
      </div>

      <div v-if="loading" class="text-center py-6">
        <i class="fas fa-spinner fa-spin text-xl text-gray-400"></i>
      </div>

      <div v-else-if="store.pointsActions.length === 0" class="text-center py-8 text-gray-400">
        <i class="fas fa-star text-3xl mb-2"></i>
        <p class="text-sm">Aucune action. Cliquez sur "Initialiser par défaut".</p>
      </div>

      <div v-else>
        <div class="divide-y">
          <div v-for="a in store.pointsActions" :key="a.id"
            class="flex items-center justify-between py-3 gap-4">
            <div class="flex-1">
              <p class="font-medium text-gray-800">{{ a.label }}</p>
              <p class="text-xs text-gray-400 font-mono">{{ a.code }}</p>
            </div>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1.5 text-sm text-gray-600">
                <input type="checkbox" v-model="a.is_active" class="w-4 h-4" />
                Actif
              </label>
              <div class="flex items-center gap-1">
                <input v-model.number="a.points" type="number" min="0"
                  class="w-20 border rounded px-2 py-1.5 text-sm text-center font-semibold" />
                <span class="text-xs text-gray-400">pts</span>
              </div>
            </div>
          </div>
        </div>
        <button @click="saveActions" :disabled="saving"
          class="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm disabled:opacity-50">
          <i class="fas fa-save mr-1"></i>
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>

    <!-- ── Niveaux ────────────────────────────────────────── -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Niveaux utilisateur</h2>
        <button v-if="store.userLevels.length === 0 && !loading"
          @click="handleSeedLevels" :disabled="saving"
          class="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50">
          <i class="fas fa-magic mr-1"></i>Initialiser par défaut
        </button>
      </div>

      <div v-if="loading" class="text-center py-6">
        <i class="fas fa-spinner fa-spin text-xl text-gray-400"></i>
      </div>

      <div v-else-if="store.userLevels.length === 0" class="text-center py-8 text-gray-400">
        <i class="fas fa-layer-group text-3xl mb-2"></i>
        <p class="text-sm">Aucun niveau. Cliquez sur "Initialiser par défaut".</p>
      </div>

      <div v-else>
        <div class="divide-y">
          <div v-for="l in store.userLevels" :key="l.id"
            class="flex items-center justify-between py-3 gap-4">
            <div class="flex-1">
              <p class="font-medium text-gray-800">{{ l.label }}</p>
              <p class="text-xs text-gray-400 font-mono">{{ l.code }}</p>
            </div>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1.5 text-sm text-gray-600">
                <input type="checkbox" v-model="l.is_active" class="w-4 h-4" />
                Actif
              </label>
              <div class="flex items-center gap-1">
                <input v-model.number="l.min_points" type="number" min="0"
                  class="w-24 border rounded px-2 py-1.5 text-sm text-center font-semibold" />
                <span class="text-xs text-gray-400">pts min</span>
              </div>
            </div>
          </div>
        </div>
        <button @click="saveLevels" :disabled="saving"
          class="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm disabled:opacity-50">
          <i class="fas fa-save mr-1"></i>
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>

    <!-- ── Texte info points ──────────────────────────────── -->
    <div class="bg-white rounded-lg shadow p-4">
      <h2 class="text-lg font-semibold mb-2">Texte « Tout savoir sur les points »</h2>
      <p class="text-sm text-gray-500 mb-3">
        Affiché dans l'app mobile sur la page profil.
      </p>
      <textarea v-model="store.pointsInfo.info_point" rows="8"
        class="w-full border rounded-md px-3 py-2 text-sm"
        placeholder="Expliquez comment gagner et utiliser les points BOX..." />
      <button @click="saveInfo" :disabled="saving"
        class="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm disabled:opacity-50">
        <i class="fas fa-save mr-1"></i>
        {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChallengesStore } from '../stores/challenges'
import { useNotification } from '../services/notification'

const store = useChallengesStore()
const notification = useNotification()
const loading = ref(false)
const saving = ref(false)

async function load() {
  loading.value = true
  try { await store.fetchPointsConfig() } finally { loading.value = false }
}

async function saveActions() {
  saving.value = true
  try {
    await store.savePointsActions(store.pointsActions)
    notification.addNotification('Points enregistrés', 'success')
  } catch { notification.addNotification('Erreur enregistrement', 'error') }
  finally { saving.value = false }
}

async function saveLevels() {
  saving.value = true
  try {
    await store.saveUserLevels(store.userLevels)
    notification.addNotification('Niveaux enregistrés', 'success')
  } catch { notification.addNotification('Erreur enregistrement', 'error') }
  finally { saving.value = false }
}

async function saveInfo() {
  saving.value = true
  try {
    await store.savePointsInfo(store.pointsInfo)
    notification.addNotification('Texte enregistré', 'success')
  } catch { notification.addNotification('Erreur enregistrement', 'error') }
  finally { saving.value = false }
}

async function handleSeedActions() {
  saving.value = true
  try { await store.seedActions(); notification.addNotification('Actions initialisées', 'success') }
  catch { notification.addNotification('Erreur initialisation', 'error') }
  finally { saving.value = false }
}

async function handleSeedLevels() {
  saving.value = true
  try { await store.seedLevels(); notification.addNotification('Niveaux initialisés', 'success') }
  catch { notification.addNotification('Erreur initialisation', 'error') }
  finally { saving.value = false }
}

onMounted(load)
</script>
