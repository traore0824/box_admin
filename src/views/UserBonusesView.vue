<template>
  <div class="space-y-6 p-4 md:p-6">
    <h1 class="text-2xl font-bold text-gray-900">Bonus utilisateurs</h1>

    <!-- Formulaire attribution -->
    <div class="bg-white rounded-lg shadow p-4 space-y-4">
      <h2 class="text-lg font-semibold">Attribuer un bonus</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email(s) utilisateur</label>
          <textarea v-model="emailsText" rows="2" placeholder="un@email.com, autre@email.com"
            class="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select v-model="form.bonus_type" class="w-full border rounded-md px-3 py-2 text-sm">
            <option v-for="t in store.bonusTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Motif</label>
          <select v-model="form.reason_code" class="w-full border rounded-md px-3 py-2 text-sm">
            <option v-for="r in store.reasonCodes" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Titre affiché</label>
          <input v-model="form.label" type="text" class="w-full border rounded-md px-3 py-2 text-sm"
            placeholder="Ex: Bonus fidélité" />
        </div>
        <div v-if="form.bonus_type === 'money'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA)</label>
          <input v-model.number="form.amount" type="number" min="0" step="0.01"
            class="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
        <div v-if="form.bonus_type === 'coins'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Pièces BOX</label>
          <input v-model.number="form.coins_value" type="number" min="1"
            class="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
        <div v-if="form.bonus_type === 'object' || form.bonus_type === 'voucher'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'objet / bon</label>
          <input v-model="form.object_label" type="text" class="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea v-model="form.description" rows="2" class="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
        <div v-if="form.bonus_type === 'object'" class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Détails objet</label>
          <textarea v-model="form.object_details" rows="2" class="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
      </div>
      <button @click="submitGrant" :disabled="store.granting"
        class="px-4 py-2 bg-primary text-white rounded-md text-sm disabled:opacity-50">
        {{ store.granting ? 'Attribution...' : 'Attribuer le bonus' }}
      </button>
    </div>

    <!-- Liste -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex flex-wrap gap-3 mb-4">
        <input
          v-model="searchEmail"
          type="text"
          placeholder="Filtrer par email"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary/30"
          @keyup.enter="loadList(1)"
        />
        <select
          v-model="filterType"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Tous types</option>
          <option v-for="t in store.bonusTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
        <button
          @click="loadList(1)"
          :disabled="store.loading"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <i v-if="store.loading" class="fas fa-spinner fa-spin mr-1"></i>
          Actualiser
        </button>
      </div>

      <p v-if="!store.loading && store.pagination.total > 0" class="text-sm text-gray-500 mb-3">
        {{ store.pagination.total }} bonus — page {{ store.currentPage }} / {{ totalPages }}
      </p>

      <div v-if="store.loading" class="text-center py-8 text-gray-400">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <div v-else-if="store.items.length === 0" class="text-center py-8 text-gray-400">
        Aucun bonus{{ hasActiveFilters ? ' pour ces filtres' : '' }}
      </div>
      <div v-else class="divide-y">
        <div v-for="b in store.items" :key="b.id" class="py-3 flex flex-wrap justify-between gap-2">
          <div>
            <p class="font-medium">{{ b.label }}</p>
            <p class="text-xs text-gray-500">
              {{ b.user_email }} · {{ b.reason_display }} · {{ formatDate(b.created_at) }}
            </p>
            <p v-if="b.description" class="text-sm text-gray-600 mt-1">{{ b.description }}</p>
          </div>
          <div class="text-right text-sm">
            <span class="inline-block px-2 py-0.5 rounded bg-gray-100">{{ b.bonus_type_display }}</span>
            <p v-if="b.amount" class="font-semibold mt-1">{{ b.amount }} FCFA</p>
            <p v-if="b.coins_value" class="font-semibold mt-1">{{ b.coins_value }} pièces BOX</p>
            <p v-if="b.object_label" class="mt-1">{{ b.object_label }}</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="store.pagination.total > store.pagination.page_size"
        class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200"
      >
        <p class="text-sm text-gray-600">
          Page {{ store.currentPage }} sur {{ totalPages }}
        </p>
        <div class="flex gap-2">
          <button
            @click="loadList(store.currentPage - 1)"
            :disabled="store.currentPage <= 1 || store.loading"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-chevron-left mr-1"></i>
            Précédent
          </button>
          <button
            @click="loadList(store.currentPage + 1)"
            :disabled="!store.pagination.has_next || store.loading"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
            <i class="fas fa-chevron-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useUserBonusesStore } from '../stores/userBonuses'
import { useNotification } from '../services/notification'

const store = useUserBonusesStore()
const notification = useNotification()
const emailsText = ref('')
const searchEmail = ref('')
const filterType = ref('')

const form = reactive({
  bonus_type: 'money',
  reason_code: 'admin',
  label: '',
  description: '',
  amount: null as number | null,
  coins_value: null as number | null,
  object_label: '',
  object_details: '',
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(store.pagination.total / store.pagination.page_size))
)

const hasActiveFilters = computed(
  () => Boolean(searchEmail.value.trim() || filterType.value)
)

let emailDebounce: ReturnType<typeof setTimeout> | null = null

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR')
}

async function loadList(page = store.currentPage) {
  await store.fetchBonuses({
    email: searchEmail.value.trim(),
    type: filterType.value,
    page,
  })
}

async function submitGrant() {
  const emails = emailsText.value.split(/[,;\n]+/).map(e => e.trim()).filter(Boolean)
  if (!emails.length || !form.label.trim()) {
    notification.addNotification('Email et titre requis', 'error')
    return
  }
  try {
    await store.grantBonus({
      user_emails: emails,
      bonus_type: form.bonus_type,
      reason_code: form.reason_code,
      label: form.label.trim(),
      description: form.description,
      amount: form.amount,
      coins_value: form.coins_value,
      object_label: form.object_label,
      object_details: form.object_details,
    })
    notification.addNotification('Bonus attribué', 'success')
    form.label = ''
    form.description = ''
    form.amount = null
    form.coins_value = null
    form.object_label = ''
    form.object_details = ''
    await loadList(1)
  } catch (e: unknown) {
    notification.addNotification(e instanceof Error ? e.message : 'Erreur', 'error')
  }
}

watch(filterType, () => {
  loadList(1)
})

watch(searchEmail, () => {
  if (emailDebounce) clearTimeout(emailDebounce)
  emailDebounce = setTimeout(() => loadList(1), 400)
})

onMounted(async () => {
  await store.fetchMeta()
  if (!form.bonus_type && store.bonusTypes.length) {
    form.bonus_type = store.bonusTypes[0].value
  }
  await loadList(1)
})
</script>
