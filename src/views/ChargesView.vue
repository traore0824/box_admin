<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Charges</h1>
        <p class="text-sm text-gray-500 mt-1">
          Enregistrement et suivi des charges de l'entreprise
        </p>
      </div>
      <button
        @click="openCreate"
        class="mt-4 sm:mt-0 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
      >
        <i class="fas fa-plus mr-2"></i>
        Nouvelle charge
      </button>
    </div>

    <div v-if="store.summary" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-primary">
        <p class="text-xs text-gray-500 uppercase tracking-wide">Ce mois</p>
        <p class="text-xl font-semibold text-gray-900 mt-1">
          {{ formatMoney(store.summary.month.total) }}
        </p>
        <p class="text-xs text-gray-400 mt-1">{{ store.summary.month.count }} charge(s)</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-amber-500">
        <p class="text-xs text-gray-500 uppercase tracking-wide">Ce trimestre</p>
        <p class="text-xl font-semibold text-gray-900 mt-1">
          {{ formatMoney(store.summary.quarter.total) }}
        </p>
        <p class="text-xs text-gray-400 mt-1">{{ store.summary.quarter.count }} charge(s)</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4 border-l-4 border-emerald-500">
        <p class="text-xs text-gray-500 uppercase tracking-wide">Cette année</p>
        <p class="text-xl font-semibold text-gray-900 mt-1">
          {{ formatMoney(store.summary.year.total) }}
        </p>
        <p class="text-xs text-gray-400 mt-1">{{ store.summary.year.count }} charge(s)</p>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row gap-3 md:items-end">
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
        <select v-model="store.filters.category" class="input w-full" @change="applyFilters">
          <option value="">Toutes</option>
          <option v-for="c in CHARGE_CATEGORIES" :key="c.value" :value="c.value">
            {{ c.label }}
          </option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-600 mb-1">Du</label>
        <input v-model="store.filters.date_from" type="date" class="input w-full" @change="applyFilters" />
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-600 mb-1">Au</label>
        <input v-model="store.filters.date_to" type="date" class="input w-full" @change="applyFilters" />
      </div>
      <div class="flex-[1.5]">
        <label class="block text-xs font-medium text-gray-600 mb-1">Recherche</label>
        <input
          v-model="store.filters.search"
          type="text"
          class="input w-full"
          placeholder="Libellé / note"
          @keyup.enter="applyFilters"
        />
      </div>
      <button @click="applyFilters" class="btn btn-outline">Filtrer</button>
    </div>

    <div class="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table class="table w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs">Date</th>
            <th class="px-4 py-3 text-left text-xs">Libellé</th>
            <th class="px-4 py-3 text-left text-xs">Catégorie</th>
            <th class="px-4 py-3 text-left text-xs">Montant</th>
            <th class="px-4 py-3 text-left text-xs">Créé par</th>
            <th class="px-4 py-3 text-left text-xs">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="item in store.items" :key="item.id">
            <td class="px-4 py-3 text-sm">{{ formatDate(item.date) }}</td>
            <td class="px-4 py-3 text-sm">
              <div class="font-medium text-gray-900">{{ item.label }}</div>
              <div v-if="item.note" class="text-xs text-gray-400 truncate max-w-xs">{{ item.note }}</div>
            </td>
            <td class="px-4 py-3 text-sm">
              <span class="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                {{ item.category_label }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm font-medium">{{ formatMoney(item.amount) }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ item.created_by_email || '—' }}</td>
            <td class="px-4 py-3 text-sm">
              <div class="flex items-center gap-3">
                <button
                  @click="openEdit(item)"
                  class="text-primary hover:text-primary-dark"
                  title="Modifier"
                  aria-label="Modifier"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="remove(item.id)"
                  class="text-red-600 hover:text-red-800"
                  title="Supprimer"
                  aria-label="Supprimer"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!store.isLoading && store.items.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">Aucune charge enregistrée</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="store.totalCount > 20" class="flex justify-between items-center text-sm text-gray-600">
      <span>{{ store.totalCount }} charge(s)</span>
      <div class="space-x-2">
        <button
          class="btn btn-outline btn-sm"
          :disabled="store.currentPage <= 1"
          @click="store.fetchItems(store.currentPage - 1)"
        >
          Précédent
        </button>
        <span>Page {{ store.currentPage }}</span>
        <button
          class="btn btn-outline btn-sm"
          :disabled="store.currentPage * 20 >= store.totalCount"
          @click="store.fetchItems(store.currentPage + 1)"
        >
          Suivant
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click="closeModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6" @click.stop>
          <h2 class="text-lg font-semibold mb-4">
            {{ editing ? 'Modifier' : 'Nouvelle' }} charge
          </h2>
          <form @submit.prevent="save" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input v-model="form.date" type="date" required class="input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
              <input v-model="form.label" type="text" required class="input w-full" placeholder="Ex: Campagne Facebook" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select v-model="form.category" required class="input w-full">
                <option v-for="c in CHARGE_CATEGORIES" :key="c.value" :value="c.value">
                  {{ c.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant (XOF)</label>
              <input v-model.number="form.amount" type="number" min="1" step="1" required class="input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea v-model="form.note" rows="2" class="input w-full" />
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" @click="closeModal" class="btn btn-outline">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="store.isLoading">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useChargesStore, CHARGE_CATEGORIES, type Charge } from '../stores/charges'

const store = useChargesStore()
const showModal = ref(false)
const editing = ref<Charge | null>(null)

const form = reactive({
  date: '',
  label: '',
  category: 'autre',
  amount: 0,
  note: '',
})

function todayIso() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatDate(iso: string) {
  try {
    return new Date(iso + (iso.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('fr-FR')
  } catch {
    return iso
  }
}

function formatMoney(v: number | string) {
  const n = Number(v || 0)
  return `${n.toLocaleString('fr-FR')} XOF`
}

function openCreate() {
  editing.value = null
  form.date = todayIso()
  form.label = ''
  form.category = 'autre'
  form.amount = 0
  form.note = ''
  showModal.value = true
}

function openEdit(item: Charge) {
  editing.value = item
  form.date = item.date?.slice(0, 10) || todayIso()
  form.label = item.label
  form.category = item.category
  form.amount = Number(item.amount)
  form.note = item.note || ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editing.value = null
}

async function save() {
  const payload = {
    date: form.date,
    label: form.label.trim(),
    category: form.category,
    amount: form.amount,
    note: form.note,
  }
  if (editing.value) {
    await store.updateItem(editing.value.id, payload)
  } else {
    await store.createItem(payload)
  }
  closeModal()
}

async function remove(id: number) {
  if (!confirm('Supprimer cette charge ?')) return
  await store.deleteItem(id)
}

async function applyFilters() {
  await store.fetchItems(1)
}

onMounted(async () => {
  await Promise.all([store.fetchItems(1), store.fetchSummary()])
})
</script>
