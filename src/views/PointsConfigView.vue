<template>
  <div class="space-y-6 p-4 md:p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Pièces BOX — Configuration</h1>
      <button @click="load" :disabled="loading"
        class="px-4 py-2 text-sm border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50">
        <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>Actualiser
      </button>
    </div>

    <!-- ── Distribution globale ───────────────────────────────── -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold">Distribution automatique</h2>
          <p class="text-sm text-gray-500 mt-1">
            Quand désactivée, aucune pièce BOX n'est attribuée ni retirée automatiquement
            (gains, pénalités, notifications).
          </p>
        </div>
        <label class="inline-flex items-center gap-2 shrink-0">
          <span class="text-sm text-gray-700">
            {{ distributionEnabled ? 'Activée' : 'Désactivée' }}
          </span>
          <input
            type="checkbox"
            v-model="distributionEnabled"
            :disabled="savingDistribution"
            class="w-5 h-5"
            @change="toggleDistribution"
          />
        </label>
      </div>
    </div>

    <!-- ── Actions pièces BOX ─────────────────────────────────── -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Pièces BOX par action</h2>
        <button @click="handleSeedActions" :disabled="saving"
          class="px-3 py-1.5 text-sm bg-primary-50 text-primary-dark border border-primary-200 rounded-md hover:bg-primary-100 disabled:opacity-50">
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
                <span class="text-xs text-gray-400">pièces</span>
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
        <button @click="handleSeedLevels" :disabled="saving || loading"
          class="px-3 py-1.5 text-sm bg-primary-50 text-primary-dark border border-primary-200 rounded-md hover:bg-primary-100 disabled:opacity-50">
          <i class="fas fa-magic mr-1"></i>Ajouter les niveaux manquants
        </button>
      </div>

      <div v-if="loading" class="text-center py-6">
        <i class="fas fa-spinner fa-spin text-xl text-gray-400"></i>
      </div>

      <div v-else-if="store.userLevels.length === 0" class="text-center py-8 text-gray-400">
        <i class="fas fa-layer-group text-3xl mb-2"></i>
        <p class="text-sm">Aucun niveau. Cliquez sur « Ajouter les niveaux manquants ».</p>
      </div>

      <div v-else>
        <p class="text-sm text-gray-500 mb-3">
          Définissez le seuil de pièces BOX, le bonus argent (XOF) crédité sur le wallet,
          et optionnellement un bonus objet (via UserBonus) à l'atteinte du niveau.
          Le dialogue de félicitations s'affiche à partir du 2e niveau (pas Bronze).
          Clés disponibles : <code class="text-xs bg-gray-100 px-1 rounded">{level_label}</code>,
          <code class="text-xs bg-gray-100 px-1 rounded">{money_bonus}</code>,
          <code class="text-xs bg-gray-100 px-1 rounded">{object_bonus}</code>,
          <code class="text-xs bg-gray-100 px-1 rounded">{total_points}</code>,
          <code class="text-xs bg-gray-100 px-1 rounded">{next_level_label}</code>.
          <span v-if="missingOfficialLevels.length" class="text-amber-600">
            Niveaux officiels manquants : {{ missingOfficialLevels.join(', ') }}.
          </span>
        </p>
        <div class="divide-y">
          <div v-for="l in activeUserLevels" :key="l.id" class="py-4 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex-1 min-w-[140px]">
                <p class="font-medium text-gray-800">{{ l.label }}</p>
                <p class="text-xs text-gray-400 font-mono">{{ l.code }}</p>
                <p v-if="l.sort_order <= 1" class="text-xs text-amber-600 mt-1">
                  Pas de dialogue (premier palier)
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <label class="flex items-center gap-1.5 text-sm text-gray-600">
                  <input type="checkbox" v-model="l.is_active" class="w-4 h-4" />
                  Actif
                </label>
                <div class="flex items-center gap-1">
                  <input v-model.number="l.min_points" type="number" min="0"
                    class="w-24 border rounded px-2 py-1.5 text-sm text-center font-semibold" />
                  <span class="text-xs text-gray-400">pièces min</span>
                </div>
                <div class="flex items-center gap-1">
                  <input v-model.number="l.bonus_amount" type="number" min="0" step="1"
                    class="w-28 border rounded px-2 py-1.5 text-sm text-center font-semibold" />
                  <span class="text-xs text-gray-400">XOF wallet</span>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 md:pl-2">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">
                  Bonus objet (libellé)
                </label>
                <input v-model="l.object_bonus_label" type="text"
                  placeholder="Ex. T-shirt BOX"
                  class="w-full border rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">
                  Détails bonus objet
                </label>
                <input v-model="l.object_bonus_details" type="text"
                  placeholder="Instructions ou description"
                  class="w-full border rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">
                  Titre dialogue félicitations
                </label>
                <input v-model="l.congrats_title" type="text"
                  placeholder="Niveau {level_label} atteint ! 🎉"
                  class="w-full border rounded px-2 py-1.5 text-sm" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-gray-600 mb-1">
                  Message dialogue félicitations
                </label>
                <textarea v-model="l.congrats_message" rows="3"
                  placeholder="Message personnalisé (vide = texte par défaut avec bonus et prochain niveau)"
                  class="w-full border rounded px-2 py-1.5 text-sm" />
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

    <!-- ── Texte info pièces BOX ──────────────────────────────── -->
    <div class="bg-white rounded-lg shadow p-4">
      <h2 class="text-lg font-semibold mb-2">Texte « Tout savoir sur les pièces BOX »</h2>
      <p class="text-sm text-gray-500 mb-3">
        Affiché dans l'app mobile (accueil et profil). Mise en forme HTML : titres, listes, liens, etc.
      </p>
      <RichTextEditor
        v-model="store.pointsInfo.info_point"
        placeholder="Expliquez comment gagner et utiliser les pièces BOX..."
      />
      <button @click="saveInfo" :disabled="saving"
        class="mt-4 px-4 py-2 bg-primary text-white rounded-md text-sm disabled:opacity-50">
        <i class="fas fa-save mr-1"></i>
        {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useChallengesStore } from '../stores/challenges'
import { useSettingsStore } from '../stores/settings'
import { useNotification } from '../services/notification'
import RichTextEditor from '../components/RichTextEditor.vue'

const store = useChallengesStore()
const settingsStore = useSettingsStore()
const notification = useNotification()
const loading = ref(false)
const saving = ref(false)
const savingDistribution = ref(false)
const distributionEnabled = ref(true)

const OFFICIAL_LEVEL_CODES = ['bronze', 'silver', 'gold', 'platinum', 'elite']

const missingOfficialLevels = computed(() => {
  const codes = new Set(store.userLevels.map((l) => l.code))
  return OFFICIAL_LEVEL_CODES.filter((code) => !codes.has(code))
})

const activeUserLevels = computed(() =>
  [...store.userLevels]
    .filter((l) => l.is_active)
    .sort((a, b) => a.sort_order - b.sort_order || a.min_points - b.min_points),
)

async function load() {
  loading.value = true
  try {
    await Promise.all([store.fetchPointsConfig(), settingsStore.fetchSettings()])
    distributionEnabled.value =
      settingsStore.settings?.box_coins_distribution_enabled ?? true
  } finally { loading.value = false }
}

async function toggleDistribution() {
  savingDistribution.value = true
  const ok = await settingsStore.updateSettings({
    box_coins_distribution_enabled: distributionEnabled.value,
  })
  if (ok) {
    notification.addNotification(
      distributionEnabled.value
        ? 'Distribution des pièces BOX activée'
        : 'Distribution des pièces BOX désactivée',
      'success',
    )
  } else {
    distributionEnabled.value = !distributionEnabled.value
    notification.addNotification('Erreur lors de la mise à jour', 'error')
  }
  savingDistribution.value = false
}

async function saveActions() {
  saving.value = true
  try {
    await store.savePointsActions(store.pointsActions)
    notification.addNotification('Pièces BOX enregistrées', 'success')
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
  try {
    await store.seedLevels()
    notification.addNotification('Niveaux manquants ajoutés', 'success')
  } catch { notification.addNotification('Erreur ajout des niveaux', 'error') }
  finally { saving.value = false }
}

onMounted(load)
</script>
