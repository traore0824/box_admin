<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
        <button @click="close" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="p-4 space-y-4">
        <div v-if="!hideEmails" class="md:col-span-2">
          <UserEmailSearchPicker
            v-model="selectedEmails"
            label="Utilisateur(s)"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
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
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Titre affiché</label>
            <input v-model="form.label" type="text" class="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Ex: Bonus fidélité" />
          </div>
          <div v-if="form.bonus_type === 'money'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Montant (XOF)</label>
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
      </div>

      <div class="flex justify-end gap-3 p-4 border-t">
        <button @click="close" class="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">Annuler</button>
        <button @click="submit" :disabled="store.granting"
          class="px-4 py-2 bg-primary text-white rounded-md text-sm disabled:opacity-50">
          {{ store.granting ? 'Attribution...' : 'Attribuer le bonus' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useUserBonusesStore } from '../stores/userBonuses'
import { useNotification } from '../services/notification'
import UserEmailSearchPicker from './UserEmailSearchPicker.vue'

const props = withDefaults(defineProps<{
  show: boolean
  title?: string
  presetEmails?: string[]
  hideEmails?: boolean
}>(), {
  title: 'Attribuer un bonus',
  presetEmails: () => [],
  hideEmails: false,
})

const emit = defineEmits<{
  close: []
  success: []
}>()

const store = useUserBonusesStore()
const notification = useNotification()
const selectedEmails = ref<string[]>([])

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

watch(
  () => props.show,
  (visible) => {
    if (visible && props.presetEmails.length) {
      selectedEmails.value = [...props.presetEmails]
    }
    if (!visible) {
      selectedEmails.value = []
    }
  },
  { immediate: true },
)

function close() {
  emit('close')
}

function resetForm() {
  form.label = ''
  form.description = ''
  form.amount = null
  form.coins_value = null
  form.object_label = ''
  form.object_details = ''
}

async function submit() {
  const emails = props.hideEmails
    ? props.presetEmails
    : selectedEmails.value

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
    resetForm()
    emit('success')
    close()
  } catch (e: unknown) {
    notification.addNotification(e instanceof Error ? e.message : 'Erreur', 'error')
  }
}

onMounted(async () => {
  if (!store.bonusTypes.length) {
    await store.fetchMeta()
  }
  if (store.bonusTypes.length) {
    form.bonus_type = store.bonusTypes[0].value
  }
})
</script>
