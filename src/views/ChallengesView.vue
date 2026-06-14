<template>
  <div class="space-y-6 p-4 md:p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h1 class="text-2xl font-bold text-gray-900">Challenges</h1>
      <div class="flex gap-2">
        <button
          @click="openCreate"
          class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-600"
        >
          <i class="fas fa-plus mr-2"></i>Nouveau challenge
        </button>
        <button
          @click="load"
          :disabled="store.isLoading"
          class="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50"
        >
          <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': store.isLoading }"></i>
          Actualiser
        </button>
      </div>
    </div>

    <div v-if="store.error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
      {{ store.error }}
    </div>

    <div v-if="store.isLoading && !store.challenges.length" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="!store.challenges.length" class="bg-white rounded-lg shadow p-10 text-center text-gray-500">
      Aucun challenge. Créez-en un pour l’afficher dans l’app mobile.
    </div>

    <div v-else class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Début</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="c in store.challenges" :key="c.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ c.name }}</td>
            <td class="px-4 py-3 text-sm">
              <span class="px-2 py-1 rounded-full text-xs" :class="statusClass(c.admin_status)">
                {{ c.admin_status }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(c.start_date) }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(c.end_date) }}</td>
            <td class="px-4 py-3 text-sm text-right">
              <div class="inline-flex items-center gap-2">
                <button
                  type="button"
                  @click="copySmartLink(c)"
                  title="Copier le smart link"
                  class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <i class="fas fa-link text-[10px]"></i>
                  Copier lien
                </button>
                <button
                  type="button"
                  @click="openEdit(c)"
                  title="Modifier ce challenge"
                  class="group inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-primary/25 text-primary bg-primary/5 shadow-sm hover:bg-primary hover:text-white hover:border-primary hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1"
                >
                  <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 group-hover:bg-white/20 transition-colors">
                    <i class="fas fa-pen-to-square text-[10px]"></i>
                  </span>
                  Modifier
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <h2 class="text-xl font-bold mb-4">{{ editing ? 'Modifier' : 'Nouveau' }} challenge</h2>
        <form @submit.prevent="save" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input v-model="form.name" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea v-model="form.description" rows="2" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input v-model="form.start_date" type="datetime-local" required class="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input v-model="form.end_date" type="datetime-local" required class="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Limite inscription</label>
              <input v-model="form.registration_deadline" type="datetime-local" required class="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut admin</label>
              <select v-model="form.admin_status" class="w-full border rounded-md px-3 py-2 text-sm">
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="suspended">Suspendu</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Règles (texte affiché)</label>
              <textarea v-model="form.rules_text" rows="3" class="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Récompenses (texte affiché)</label>
              <textarea v-model="form.rewards_text" rows="3" class="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
            <div class="sm:col-span-2 border-t pt-4">
              <h3 class="text-sm font-semibold text-gray-800 mb-3">Configuration de la caisse challenge</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Montant de cotisation (FCFA)</label>
                  <input v-model.number="caisseConfig.amount" type="number" min="0" class="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Objectif montant (FCFA)</label>
                  <input v-model.number="caisseConfig.amount_obj" type="number" min="0" class="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                  <select v-model="caisseConfig.frequence" class="w-full border rounded-md px-3 py-2 text-sm">
                    <option value="all_week">Toutes les semaines</option>
                    <option value="all_month">Tous les mois</option>
                    <option value="all_days">Tous les jours</option>
                    <option value="unlimited">Illimité</option>
                    <option value="custom">Personnalisée</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Durée (jours)</label>
                  <input v-model.number="caisseConfig.duration_days" type="number" min="1" class="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Type de caisse</label>
                  <select v-model="caisseConfig.type_box" class="w-full border rounded-md px-3 py-2 text-sm">
                    <option value="locked">Bloquée</option>
                    <option value="free">Libre</option>
                  </select>
                </div>
                <div class="flex items-center gap-2 pt-6">
                  <input id="caisse-personal" v-model="caisseConfig.personal" type="checkbox" class="rounded" />
                  <label for="caisse-personal" class="text-sm text-gray-700">Caisse personnelle</label>
                </div>
              </div>
            </div>
            <div class="sm:col-span-2 border-t pt-4">
              <h3 class="text-sm font-semibold text-gray-800 mb-3">Règles de réussite</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Montant cible pour réussir (FCFA)</label>
                  <input v-model.number="successRules.target_amount" type="number" min="0" class="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Retards maximum autorisés</label>
                  <input v-model.number="successRules.max_delays" type="number" min="0" class="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div class="sm:col-span-2 flex items-center gap-2">
                  <input id="no-withdrawal" v-model="successRules.no_withdrawal" type="checkbox" class="rounded" />
                  <label for="no-withdrawal" class="text-sm text-gray-700">Interdire les retraits pendant le challenge</label>
                </div>
              </div>
            </div>
            <div class="sm:col-span-2 border-t pt-4">
              <h3 class="text-sm font-semibold text-gray-800 mb-3">Conditions d'inscription (optionnel)</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Points BOX minimum</label>
                  <input v-model.number="entryRules.min_points" type="number" min="0" placeholder="Aucun" class="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
                <div class="flex flex-col gap-2 pt-1">
                  <label class="flex items-center gap-2 text-sm text-gray-700">
                    <input v-model="entryRules.kyc_verified" type="checkbox" class="rounded" />
                    KYC validé requis
                  </label>
                  <label class="flex items-center gap-2 text-sm text-gray-700">
                    <input v-model="entryRules.has_caisse" type="checkbox" class="rounded" />
                    Au moins une caisse existante
                  </label>
                  <label class="flex items-center gap-2 text-sm text-gray-700">
                    <input v-model="entryRules.completed_caisse" type="checkbox" class="rounded" />
                    Au moins une caisse terminée
                  </label>
                </div>
              </div>
            </div>
            <div v-if="editing" class="sm:col-span-2 border-t pt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Smart link (Branch.io)</label>
              <div class="flex gap-2">
                <input
                  :value="smartLink"
                  readonly
                  placeholder="Le lien sera généré à l'enregistrement"
                  class="flex-1 border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-700"
                />
                <button
                  type="button"
                  :disabled="!smartLink || copyingLink"
                  @click="copyText(smartLink)"
                  class="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="showModal = false" class="px-4 py-2 border rounded-md text-sm">Annuler</button>
            <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary text-white rounded-md text-sm">
              {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useChallengesStore, type ChallengeAdmin } from '../stores/challenges'

const store = useChallengesStore()
const showModal = ref(false)
const editing = ref<ChallengeAdmin | null>(null)
const saving = ref(false)
const smartLink = ref('')
const copyingLink = ref(false)

const defaultCaisseConfig = () => ({
  amount: 5000,
  amount_obj: 100000,
  frequence: 'all_week',
  duration_days: 30,
  type_box: 'locked',
  personal: true,
})

const defaultSuccessRules = () => ({
  target_amount: 50000,
  no_withdrawal: true,
  max_delays: 2,
})

const defaultEntryRules = () => ({
  min_points: undefined as number | undefined,
  kyc_verified: false,
  has_caisse: false,
  completed_caisse: false,
})

const caisseConfig = reactive(defaultCaisseConfig())
const successRules = reactive(defaultSuccessRules())
const entryRules = reactive(defaultEntryRules())

function resetConfigForms() {
  Object.assign(caisseConfig, defaultCaisseConfig())
  Object.assign(successRules, defaultSuccessRules())
  Object.assign(entryRules, defaultEntryRules())
}

function loadCaisseConfigFrom(data: Record<string, unknown> | undefined) {
  const d = data ?? {}
  Object.assign(caisseConfig, {
    amount: Number(d.amount ?? 5000),
    amount_obj: Number(d.amount_obj ?? 100000),
    frequence: String(d.frequence ?? 'all_week'),
    duration_days: Number(d.duration_days ?? 30),
    type_box: String(d.type_box ?? 'locked'),
    personal: d.personal !== false,
  })
}

function loadSuccessRulesFrom(data: Record<string, unknown> | undefined) {
  const d = data ?? {}
  Object.assign(successRules, {
    target_amount: d.target_amount != null ? Number(d.target_amount) : 50000,
    no_withdrawal: d.no_withdrawal === true,
    max_delays: d.max_delays != null ? Number(d.max_delays) : 2,
  })
}

function loadEntryRulesFrom(data: Record<string, unknown> | undefined) {
  const d = data ?? {}
  Object.assign(entryRules, {
    min_points: d.min_points != null ? Number(d.min_points) : undefined,
    kyc_verified: d.kyc_verified === true,
    has_caisse: d.has_caisse === true,
    completed_caisse: d.completed_caisse === true,
  })
}

function buildCaisseConfigPayload() {
  return {
    amount: caisseConfig.amount,
    amount_obj: caisseConfig.amount_obj,
    frequence: caisseConfig.frequence,
    duration_days: caisseConfig.duration_days,
    type_box: caisseConfig.type_box,
    personal: caisseConfig.personal,
  }
}

function buildSuccessRulesPayload() {
  const payload: Record<string, unknown> = {}
  if (successRules.target_amount != null && !Number.isNaN(successRules.target_amount)) {
    payload.target_amount = successRules.target_amount
  }
  if (successRules.no_withdrawal) {
    payload.no_withdrawal = true
  }
  if (successRules.max_delays != null && !Number.isNaN(successRules.max_delays)) {
    payload.max_delays = successRules.max_delays
  }
  return payload
}

function buildEntryRulesPayload() {
  const payload: Record<string, unknown> = {}
  if (entryRules.min_points != null && !Number.isNaN(entryRules.min_points) && entryRules.min_points > 0) {
    payload.min_points = entryRules.min_points
  }
  if (entryRules.kyc_verified) payload.kyc_verified = true
  if (entryRules.has_caisse) payload.has_caisse = true
  if (entryRules.completed_caisse) payload.completed_caisse = true
  return payload
}

const form = reactive({
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  registration_deadline: '',
  admin_status: 'draft' as ChallengeAdmin['admin_status'],
  rules_text: '',
  rewards_text: '',
  is_public: true,
  ranking_type: 'amount_saved',
  min_participants: 1,
})

function toLocalInput(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toIso(local: string) {
  return local ? new Date(local).toISOString() : ''
}

function formatDate(iso: string) {
  return iso ? new Date(iso).toLocaleString('fr-FR') : '—'
}

function statusClass(s: string) {
  if (s === 'published') return 'bg-green-100 text-green-800'
  if (s === 'draft') return 'bg-gray-100 text-gray-800'
  if (s === 'suspended') return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

async function copySmartLink(c: ChallengeAdmin) {
  copyingLink.value = true
  try {
    let link = c.smart_link || ''
    if (!link) {
      link = await store.fetchChallengeSmartLink(c.id)
      c.smart_link = link
    }
    if (!link) {
      alert('Impossible de générer le lien')
      return
    }
    await navigator.clipboard.writeText(link)
    alert('Smart link copié dans le presse-papiers')
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Erreur copie du lien')
  } finally {
    copyingLink.value = false
  }
}

async function copyText(text: string) {
  if (!text) return
  await navigator.clipboard.writeText(text)
  alert('Lien copié')
}

function openCreate() {
  editing.value = null
  smartLink.value = ''
  Object.assign(form, {
    name: '', description: '', rules_text: '', rewards_text: '',
    admin_status: 'draft', start_date: '', end_date: '', registration_deadline: '',
  })
  resetConfigForms()
  showModal.value = true
}

function openEdit(c: ChallengeAdmin) {
  editing.value = c
  Object.assign(form, {
    name: c.name,
    description: c.description,
    rules_text: c.rules_text,
    rewards_text: c.rewards_text,
    admin_status: c.admin_status,
    start_date: toLocalInput(c.start_date),
    end_date: toLocalInput(c.end_date),
    registration_deadline: toLocalInput(c.registration_deadline),
  })
  loadCaisseConfigFrom(c.caisse_config)
  loadSuccessRulesFrom(c.success_rules)
  loadEntryRulesFrom(c.entry_rules)
  smartLink.value = c.smart_link || ''
  showModal.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = {
      ...form,
      start_date: toIso(form.start_date),
      end_date: toIso(form.end_date),
      registration_deadline: toIso(form.registration_deadline),
      caisse_config: buildCaisseConfigPayload(),
      success_rules: buildSuccessRulesPayload(),
      entry_rules: buildEntryRulesPayload(),
      rewards_config: {},
    }
    if (editing.value) {
      const updated = await store.updateChallenge(editing.value.id, payload)
      smartLink.value = updated.smart_link || smartLink.value
    } else {
      const created = await store.createChallenge(payload)
      smartLink.value = created.smart_link || ''
    }
    showModal.value = false
    await load()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Erreur')
  } finally {
    saving.value = false
  }
}

async function load() {
  await store.fetchChallenges()
}

onMounted(load)
</script>
