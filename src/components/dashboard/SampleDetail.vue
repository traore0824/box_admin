<template>
  <div class="space-y-6">
    <!-- Tabs -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex border-b border-gray-200">
        <button
          @click="activeTab = 'with'"
          class="flex-1 py-3 text-sm font-medium transition-colors"
          :class="activeTab === 'with' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'"
        >
          <i class="fas fa-briefcase mr-2 text-blue-500"></i>
          Avec caisse ({{ sample.entries_with_caisse.length }})
        </button>
        <button
          @click="activeTab = 'without'"
          class="flex-1 py-3 text-sm font-medium transition-colors"
          :class="activeTab === 'without' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'"
        >
          <i class="fas fa-user mr-2 text-gray-400"></i>
          Sans caisse ({{ sample.entries_without_caisse.length }})
        </button>
      </div>

      <!-- Entries -->
      <div class="divide-y divide-gray-100">
        <div
          v-for="entry in activeEntries"
          :key="entry.id"
          class="p-4"
          :class="entry.called ? 'bg-green-50' : ''"
        >
          <div class="flex flex-col sm:flex-row sm:items-start gap-4">
            <!-- Avatar + infos user -->
            <div class="flex items-start gap-3 flex-1">
              <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {{ initials(entry.user) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <router-link
                    :to="{ name: 'user-profile', params: { id: entry.user.id.toString() } }"
                    class="font-semibold text-primary text-sm hover:underline"
                  >
                    {{ entry.user.first_name }} {{ entry.user.last_name }}
                  </router-link>
                  <span v-if="entry.called" class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                    <i class="fas fa-check-circle"></i> Appelé
                  </span>
                  <span v-else class="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1">
                    <i class="fas fa-phone"></i> À appeler
                  </span>
                </div>
                <p class="text-xs text-gray-500">{{ entry.user.email }}</p>
                <p v-if="entry.user.phone" class="text-xs text-gray-500">{{ entry.user.phone }}</p>

                <!-- Appelé par / quand -->
                <div v-if="entry.called" class="mt-1 text-xs text-gray-500">
                  Appelé le {{ formatDate(entry.called_at!) }}
                  <span v-if="entry.called_by"> · par {{ entry.called_by.email }}</span>
                </div>
                <div v-if="entry.notes" class="mt-1 text-xs text-gray-600 italic bg-yellow-50 px-2 py-1 rounded">
                  "{{ entry.notes }}"
                </div>
              </div>
            </div>

            <!-- Caisses -->
            <div v-if="entry.caisses && entry.caisses.length > 0" class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-500 uppercase mb-1">Caisses</p>
              <div v-for="(caisse, i) in entry.caisses" :key="i" class="text-xs text-gray-700 mb-1">
                <span class="font-medium">{{ caisse.name }}</span>
                <span class="text-gray-400 ml-1">· {{ formatAmount(caisse.amount_obj) }}</span>
                <span :class="['ml-1 px-1.5 py-0.5 rounded text-xs', statusClass(caisse.status)]">
                  {{ caisse.status }}
                </span>
              </div>
            </div>

            <!-- Retraits -->
            <div v-if="entry.withdrawals && entry.withdrawals.length > 0" class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-500 uppercase mb-1">Retraits</p>
              <div v-for="(w, i) in entry.withdrawals" :key="i" class="text-xs text-gray-700 mb-1">
                {{ formatAmount(w.amount) }}
                <span class="text-gray-400 ml-1">· {{ formatDate(w.created_at) }}</span>
              </div>
            </div>

            <!-- Action -->
            <div v-if="!readonly" class="flex-shrink-0">
              <button
                v-if="!entry.called"
                @click="$emit('mark-called', entry)"
                class="px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 flex items-center gap-1"
              >
                <i class="fas fa-phone-check"></i>
                Marquer appelé
              </button>
              <button
                v-else
                @click="$emit('mark-called', entry)"
                class="px-3 py-2 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50 flex items-center gap-1"
              >
                <i class="fas fa-edit"></i>
                Modifier notes
              </button>
            </div>
          </div>
        </div>

        <div v-if="activeEntries.length === 0" class="p-8 text-center text-gray-500 text-sm">
          Aucun utilisateur dans cette catégorie
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WeeklySample, SampleEntry } from '../../stores/weeklySample'

const props = defineProps<{
  sample: WeeklySample
  readonly: boolean
}>()

defineEmits<{
  'mark-called': [entry: SampleEntry]
}>()

const activeTab = ref<'with' | 'without'>('with')

const activeEntries = computed(() =>
  activeTab.value === 'with' ? props.sample.entries_with_caisse : props.sample.entries_without_caisse
)

const initials = (user: SampleEntry['user']) =>
  `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase() || 'U'

const formatDate = (date: string) =>
  new Date(date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('fr-FR').format(amount) + ' XOF'

const statusClass = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    blocked: 'bg-red-100 text-red-700'
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}
</script>
