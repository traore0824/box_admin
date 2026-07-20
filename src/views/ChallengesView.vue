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

    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold">Notifications à la publication</h2>
          <p class="text-sm text-gray-500 mt-1">
            Quand activée, tous les utilisateurs reçoivent une notification push/in-app
            dès qu'un challenge passe au statut « publié » pour la première fois.
          </p>
        </div>
        <label class="inline-flex items-center gap-2 shrink-0">
          <span class="text-sm text-gray-700">
            {{ publishNotificationsEnabled ? 'Activées' : 'Désactivées' }}
          </span>
          <input
            type="checkbox"
            v-model="publishNotificationsEnabled"
            :disabled="savingNotifications"
            class="w-5 h-5"
            @change="togglePublishNotifications"
          />
        </label>
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
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participants</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Début</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase sticky right-0 bg-gray-50">Actions</th>
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
            <td class="px-4 py-3 text-sm text-gray-600">
              {{ formatParticipants(c) }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(c.start_date) }}</td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(c.end_date) }}</td>
            <td class="px-4 py-3 text-sm text-right sticky right-0 bg-white">
              <div class="inline-flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                <button
                  type="button"
                  @click="openParticipants(c)"
                  title="Voir les participants"
                  class="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                >
                  <i class="fas fa-users"></i>
                  Participants
                </button>
                <button
                  type="button"
                  @click="copySmartLink(c)"
                  title="Copier le smart link"
                  class="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                >
                  <i class="fas fa-link"></i>
                  Lien
                </button>
                <button
                  type="button"
                  @click="openEdit(c)"
                  title="Modifier ce challenge"
                  class="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
                >
                  <i class="fas fa-pen"></i>
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
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Participants minimum</label>
              <input
                v-model.number="form.min_participants"
                type="number"
                min="1"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Participants maximum</label>
              <input
                :value="form.max_participants ?? ''"
                type="number"
                min="1"
                placeholder="Illimité"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                @input="updateMaxParticipants"
              />
              <p class="text-xs text-gray-500 mt-1">Laisser vide = pas de limite</p>
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
                  <label class="block text-sm font-medium text-gray-700 mb-1">Pièces BOX minimum</label>
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

    <!-- Modal participants -->
    <div v-if="showParticipantsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between p-4 border-b">
          <div>
            <h2 class="text-lg font-bold text-gray-900">
              Participants — {{ selectedChallenge?.name }}
            </h2>
            <p v-if="participantsSummary" class="text-sm text-gray-500 mt-1">
              {{ participantsSummary.count }} participant(s) ·
              Total déposé : {{ formatAmount(participantsSummary.total_deposited) }} ·
              Actifs : {{ participantsSummary.active_count }}
            </p>
          </div>
          <button @click="closeParticipants" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="p-4 overflow-y-auto flex-1">
          <div v-if="loadingParticipants" class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <div v-else-if="!participants.length" class="text-center text-gray-500 py-10">
            Aucun participant pour ce challenge.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Déposé</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Retards</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inscrit le</th>
                  <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="p in participants" :key="p.id" class="hover:bg-gray-50">
                  <td class="px-3 py-2">
                    <div class="font-medium text-gray-900">{{ p.user_name }}</div>
                    <div class="text-xs text-gray-500">{{ p.user_email }}</div>
                  </td>
                  <td class="px-3 py-2">
                    <span class="px-2 py-0.5 rounded-full text-xs" :class="participationStatusClass(p.status)">
                      {{ p.status }}
                    </span>
                    <div v-if="p.failure_reason" class="text-xs text-red-600 mt-1 max-w-xs truncate" :title="p.failure_reason">
                      {{ p.failure_reason }}
                    </div>
                  </td>
                  <td class="px-3 py-2 font-medium">{{ formatAmount(p.amount_deposited) }}</td>
                  <td class="px-3 py-2">{{ p.delays }}</td>
                  <td class="px-3 py-2 text-gray-600">{{ formatDate(p.joined_at) }}</td>
                  <td class="px-3 py-2 text-right whitespace-nowrap">
                    <button
                      v-if="canRemoveParticipant(p)"
                      type="button"
                      @click="askRemoveParticipant(p)"
                      class="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      Retirer
                    </button>
                    <span v-else class="text-xs text-gray-400" title="Participation déjà terminée">
                      Non retirable
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal raison retrait -->
    <div v-if="removeTarget" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-5 space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">Retirer du challenge</h3>
        <p class="text-sm text-gray-600">
          {{ removeTarget.user_name }} ({{ removeTarget.user_email }})
        </p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Raison</label>
          <textarea
            v-model="removeReason"
            rows="3"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="Indiquez la raison du retrait…"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" @click="removeTarget = null" class="px-4 py-2 border rounded-md text-sm">
            Annuler
          </button>
          <button
            type="button"
            :disabled="removing || !removeReason.trim()"
            @click="confirmRemoveParticipant"
            class="px-4 py-2 bg-red-600 text-white rounded-md text-sm disabled:opacity-50"
          >
            {{ removing ? 'Retrait…' : 'Confirmer le retrait' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  useChallengesStore,
  type ChallengeAdmin,
  type ChallengeParticipant,
  type ChallengeParticipantsSummary,
} from '../stores/challenges'
import { useSettingsStore } from '../stores/settings'
import { useNotification } from '../services/notification'

const store = useChallengesStore()
const settingsStore = useSettingsStore()
const notification = useNotification()
const showModal = ref(false)
const editing = ref<ChallengeAdmin | null>(null)
const saving = ref(false)
const savingNotifications = ref(false)
const publishNotificationsEnabled = ref(true)
const smartLink = ref('')
const copyingLink = ref(false)

const showParticipantsModal = ref(false)
const selectedChallenge = ref<ChallengeAdmin | null>(null)
const participants = ref<ChallengeParticipant[]>([])
const participantsSummary = ref<ChallengeParticipantsSummary | null>(null)
const loadingParticipants = ref(false)
const removeTarget = ref<ChallengeParticipant | null>(null)
const removeReason = ref('')
const removing = ref(false)

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
  max_participants: null as number | null,
})

function updateMaxParticipants(event: Event) {
  const raw = (event.target as HTMLInputElement).value.trim()
  if (!raw) {
    form.max_participants = null
    return
  }
  const parsed = Number(raw)
  form.max_participants = Number.isNaN(parsed) ? null : parsed
}

function formatParticipants(c: ChallengeAdmin) {
  const current = c.participant_count ?? 0
  if (c.max_participants != null) {
    return `${current} / ${c.max_participants}`
  }
  return `${current} (illimité)`
}

function buildChallengePayload() {
  return {
    name: form.name,
    description: form.description,
    rules_text: form.rules_text,
    rewards_text: form.rewards_text,
    admin_status: form.admin_status,
    is_public: form.is_public,
    ranking_type: form.ranking_type,
    min_participants: form.min_participants,
    max_participants: form.max_participants,
    start_date: toIso(form.start_date),
    end_date: toIso(form.end_date),
    registration_deadline: toIso(form.registration_deadline),
    caisse_config: buildCaisseConfigPayload(),
    success_rules: buildSuccessRulesPayload(),
    entry_rules: buildEntryRulesPayload(),
    rewards_config: {},
  }
}

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

function formatAmount(value: number) {
  return `${Number(value || 0).toLocaleString('fr-FR')} F CFA`
}

function participationStatusClass(s: string) {
  if (s === 'EN_COURS' || s === 'EN_ATTENTE') return 'bg-blue-100 text-blue-800'
  if (s === 'REUSSI') return 'bg-green-100 text-green-800'
  return 'bg-red-100 text-red-800'
}

function canRemoveParticipant(p: ChallengeParticipant) {
  if (p.can_remove === true) return true
  // Fallback si l'API ne renvoie pas encore can_remove
  return p.status === 'EN_ATTENTE' || p.status === 'EN_COURS'
}

async function openParticipants(c: ChallengeAdmin) {
  selectedChallenge.value = c
  showParticipantsModal.value = true
  loadingParticipants.value = true
  participants.value = []
  participantsSummary.value = null
  try {
    const data = await store.fetchChallengeParticipants(c.id)
    participants.value = data.data ?? []
    participantsSummary.value = data.summary ?? null
  } catch (e) {
    notification.addNotification(
      e instanceof Error ? e.message : 'Erreur chargement participants',
      'error',
    )
  } finally {
    loadingParticipants.value = false
  }
}

function closeParticipants() {
  showParticipantsModal.value = false
  selectedChallenge.value = null
  participants.value = []
  participantsSummary.value = null
  removeTarget.value = null
  removeReason.value = ''
}

function askRemoveParticipant(p: ChallengeParticipant) {
  removeTarget.value = p
  removeReason.value = ''
}

async function confirmRemoveParticipant() {
  if (!selectedChallenge.value || !removeTarget.value || !removeReason.value.trim()) return
  removing.value = true
  try {
    await store.removeChallengeParticipant(
      selectedChallenge.value.id,
      removeTarget.value.id,
      removeReason.value.trim(),
    )
    notification.addNotification('Participant retiré', 'success')
    removeTarget.value = null
    removeReason.value = ''
    const data = await store.fetchChallengeParticipants(selectedChallenge.value.id)
    participants.value = data.data ?? []
    participantsSummary.value = data.summary ?? null
    await store.fetchChallenges()
  } catch (e) {
    notification.addNotification(
      e instanceof Error ? e.message : 'Erreur retrait',
      'error',
    )
  } finally {
    removing.value = false
  }
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
    min_participants: 1, max_participants: null,
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
    min_participants: c.min_participants ?? 1,
    max_participants: c.max_participants ?? null,
  })
  loadCaisseConfigFrom(c.caisse_config)
  loadSuccessRulesFrom(c.success_rules)
  loadEntryRulesFrom(c.entry_rules)
  smartLink.value = c.smart_link || ''
  showModal.value = true
}

async function save() {
  if (
    form.max_participants != null &&
    form.max_participants < form.min_participants
  ) {
    alert('Le maximum de participants doit être supérieur ou égal au minimum.')
    return
  }

  saving.value = true
  try {
    const payload = buildChallengePayload()
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
  await Promise.all([store.fetchChallenges(), settingsStore.fetchSettings()])
  publishNotificationsEnabled.value =
    settingsStore.settings?.challenge_publish_notifications_enabled ?? true
}

async function togglePublishNotifications() {
  savingNotifications.value = true
  const ok = await settingsStore.updateSettings({
    challenge_publish_notifications_enabled: publishNotificationsEnabled.value,
  })
  if (ok) {
    notification.addNotification(
      publishNotificationsEnabled.value
        ? 'Notifications challenge activées'
        : 'Notifications challenge désactivées',
      'success',
    )
  } else {
    publishNotificationsEnabled.value = !publishNotificationsEnabled.value
    notification.addNotification('Erreur lors de la mise à jour', 'error')
  }
  savingNotifications.value = false
}

onMounted(load)
</script>
