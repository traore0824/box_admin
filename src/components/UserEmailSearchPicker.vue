<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700">{{ label }}</label>

    <div v-if="modelValue.length" class="flex flex-wrap gap-2">
      <span
        v-for="email in modelValue"
        :key="email"
        class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-gray-800"
      >
        {{ email }}
        <button
          type="button"
          class="text-gray-400 hover:text-red-500"
          @click="removeEmail(email)"
        >
          <i class="fas fa-times"></i>
        </button>
      </span>
    </div>

    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
        placeholder="Rechercher par nom, prénom ou email..."
        @input="debouncedSearch?.()"
      />
      <i class="fas fa-search absolute left-3 top-2.5 h-4 w-4 text-gray-400"></i>
    </div>

    <div v-if="showList" class="border border-gray-200 rounded-md">
      <div class="p-2 bg-gray-50 border-b border-gray-200">
        <p class="text-xs font-medium text-gray-600">Cliquez pour ajouter un utilisateur</p>
      </div>
      <div class="max-h-48 overflow-y-auto">
        <div v-if="usersStore.isLoading" class="p-4 text-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
        <div v-else-if="usersStore.users.length === 0" class="p-4 text-center text-sm text-gray-500">
          Aucun utilisateur trouvé
        </div>
        <button
          v-for="user in usersStore.users"
          :key="user.id"
          type="button"
          class="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left"
          :class="modelValue.includes(user.email) ? 'bg-blue-50/50' : ''"
          @click="addUser(user)"
        >
          <div>
            <p class="text-sm font-medium text-gray-900">
              {{ user.first_name }} {{ user.last_name }}
            </p>
            <p class="text-xs text-gray-500">{{ user.email }}</p>
          </div>
          <i
            v-if="modelValue.includes(user.email)"
            class="fas fa-check text-primary text-sm"
          ></i>
        </button>
      </div>
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs"
      >
        <span class="text-gray-600">Page {{ listPage }} / {{ totalPages }}</span>
        <div class="flex gap-1">
          <button
            type="button"
            :disabled="listPage <= 1 || usersStore.isLoading"
            class="px-2 py-1 border rounded disabled:opacity-50"
            @click="goPage(listPage - 1)"
          >
            &lt;
          </button>
          <button
            type="button"
            :disabled="listPage >= totalPages || usersStore.isLoading"
            class="px-2 py-1 border rounded bg-primary text-white disabled:opacity-50"
            @click="goPage(listPage + 1)"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>

    <div v-if="allowManual">
      <p class="text-xs text-gray-500 mb-1">Ou coller des emails (virgule, point-virgule ou retour ligne)</p>
      <textarea
        v-model="manualText"
        rows="2"
        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        placeholder="un@email.com, autre@email.com"
        @blur="mergeManualEmails"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { debounce } from 'lodash'
import { useUsersStore } from '../stores/users'

interface PickUser {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
}

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    label?: string
    allowManual?: boolean
  }>(),
  {
    label: 'Utilisateur(s)',
    allowManual: true,
  }
)

const emit = defineEmits<{
  'update:modelValue': [string[]]
}>()

const usersStore = useUsersStore()
const searchQuery = ref('')
const showList = ref(false)
const listPage = ref(1)
const manualText = ref('')
const debouncedSearch = ref<ReturnType<typeof debounce> | null>(null)

const pageSize = 10
const totalPages = computed(() =>
  Math.max(1, Math.ceil(usersStore.totalUsers / pageSize))
)

function addUser(user: PickUser) {
  if (!user.email || props.modelValue.includes(user.email)) {
    return
  }
  emit('update:modelValue', [...props.modelValue, user.email])
}

function removeEmail(email: string) {
  emit(
    'update:modelValue',
    props.modelValue.filter((e) => e !== email)
  )
}

function mergeManualEmails() {
  const extra = manualText.value
    .split(/[,;\n]+/)
    .map((e) => e.trim())
    .filter(Boolean)
  if (!extra.length) return
  const merged = [...props.modelValue]
  for (const email of extra) {
    if (!merged.includes(email)) merged.push(email)
  }
  emit('update:modelValue', merged)
  manualText.value = ''
}

async function runSearch(page = 1) {
  if (!searchQuery.value.trim()) {
    showList.value = false
    usersStore.searchQuery = ''
    return
  }
  showList.value = true
  listPage.value = page
  usersStore.searchQuery = searchQuery.value.trim()
  await usersStore.fetchUsers(page)
}

function goPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  runSearch(page)
}

onMounted(() => {
  debouncedSearch.value = debounce(() => runSearch(1), 300)
})

onUnmounted(() => {
  debouncedSearch.value?.cancel()
  usersStore.searchQuery = ''
})
</script>
