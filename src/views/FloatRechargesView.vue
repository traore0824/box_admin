<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Recharges Float</h1>
        <p class="text-sm text-gray-500 mt-1">
          FeexPay → SIM personnelle → SIM agent (suivi des pertes)
        </p>
      </div>
      <button
        @click="openCreate"
        class="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <i class="fas fa-plus mr-2"></i>
        Nouvelle recharge
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table class="table w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs">Date</th>
            <th class="px-4 py-3 text-left text-xs">FeexPay</th>
            <th class="px-4 py-3 text-left text-xs">SIM perso</th>
            <th class="px-4 py-3 text-left text-xs">Reçu agent</th>
            <th class="px-4 py-3 text-left text-xs">Frais</th>
            <th class="px-4 py-3 text-left text-xs">Commission</th>
            <th class="px-4 py-3 text-left text-xs">Perte</th>
            <th class="px-4 py-3 text-left text-xs">Réseau</th>
            <th class="px-4 py-3 text-left text-xs">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="item in store.items" :key="item.id">
            <td class="px-4 py-3 text-sm">{{ formatDate(item.date) }}</td>
            <td class="px-4 py-3 text-sm">{{ formatMoney(item.amount_from_feexpay) }}</td>
            <td class="px-4 py-3 text-sm font-mono">{{ item.recipient_phone }}</td>
            <td class="px-4 py-3 text-sm">{{ formatMoney(item.amount_received_by_agent) }}</td>
            <td class="px-4 py-3 text-sm">{{ formatMoney(item.transfer_fees) }}</td>
            <td class="px-4 py-3 text-sm">{{ formatMoney(item.commission) }}</td>
            <td class="px-4 py-3 text-sm text-red-600 font-medium">{{ formatMoney(item.loss_amount) }}</td>
            <td class="px-4 py-3 text-sm">{{ item.network_name || '—' }}</td>
            <td class="px-4 py-3 text-sm space-x-2">
              <button @click="openEdit(item)" class="text-blue-600 hover:underline text-xs">Modifier</button>
              <button @click="remove(item.id)" class="text-red-600 hover:underline text-xs">Suppr.</button>
            </td>
          </tr>
          <tr v-if="!store.isLoading && store.items.length === 0">
            <td colspan="9" class="px-4 py-8 text-center text-gray-500">Aucune recharge enregistrée</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click="closeModal">
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6" @click.stop>
          <h2 class="text-lg font-semibold mb-4">{{ editing ? 'Modifier' : 'Nouvelle' }} recharge float</h2>
          <form @submit.prevent="save" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input v-model="form.date" type="datetime-local" required class="input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant sorti FeexPay</label>
              <input v-model.number="form.amount_from_feexpay" type="number" min="0" step="1" required class="input w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Numéro SIM personnelle</label>
              <input v-model="form.recipient_phone" type="text" required class="input w-full" placeholder="01…" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant reçu SIM agent</label>
              <input v-model.number="form.amount_received_by_agent" type="number" min="0" step="1" required class="input w-full" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Frais perso→agent</label>
                <input v-model.number="form.transfer_fees" type="number" min="0" step="1" class="input w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Commission</label>
                <input v-model.number="form.commission" type="number" min="0" step="1" class="input w-full" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Réseau</label>
              <select v-model="form.network" class="input w-full">
                <option :value="null">—</option>
                <option v-for="n in networksStore.networks" :key="n.id" :value="n.id">
                  {{ n.publique_name }} ({{ n.name }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Device ID</label>
              <input v-model="form.device_id" type="text" class="input w-full font-mono" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea v-model="form.note" rows="2" class="input w-full" />
            </div>
            <p class="text-xs text-gray-500">
              Perte calculée = FeexPay − reçu agent
              ({{ formatMoney((form.amount_from_feexpay || 0) - (form.amount_received_by_agent || 0)) }})
            </p>
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
import { useFloatRechargesStore, type FloatRecharge } from '../stores/floatRecharges'
import { useNetworksStore } from '../stores/networks'

const store = useFloatRechargesStore()
const networksStore = useNetworksStore()
const showModal = ref(false)
const editing = ref<FloatRecharge | null>(null)

const form = reactive({
  date: '',
  amount_from_feexpay: 0,
  recipient_phone: '',
  amount_received_by_agent: 0,
  transfer_fees: 0,
  commission: 0,
  network: null as number | null,
  device_id: '',
  note: '',
})

function toLocalInput(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR')
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
  const now = new Date()
  form.date = toLocalInput(now.toISOString())
  form.amount_from_feexpay = 0
  form.recipient_phone = ''
  form.amount_received_by_agent = 0
  form.transfer_fees = 0
  form.commission = 0
  form.network = null
  form.device_id = ''
  form.note = ''
  showModal.value = true
}

function openEdit(item: FloatRecharge) {
  editing.value = item
  form.date = toLocalInput(item.date)
  form.amount_from_feexpay = Number(item.amount_from_feexpay)
  form.recipient_phone = item.recipient_phone
  form.amount_received_by_agent = Number(item.amount_received_by_agent)
  form.transfer_fees = Number(item.transfer_fees)
  form.commission = Number(item.commission)
  form.network = item.network
  form.device_id = item.device_id || ''
  form.note = item.note || ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editing.value = null
}

async function save() {
  const payload = {
    date: new Date(form.date).toISOString(),
    amount_from_feexpay: form.amount_from_feexpay,
    recipient_phone: form.recipient_phone,
    amount_received_by_agent: form.amount_received_by_agent,
    transfer_fees: form.transfer_fees,
    commission: form.commission,
    network: form.network,
    device_id: form.device_id,
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
  if (!confirm('Supprimer cette recharge float ?')) return
  await store.deleteItem(id)
}

onMounted(async () => {
  await Promise.all([
    store.fetchItems(1),
    networksStore.fetchNetworks(true),
  ])
})
</script>
