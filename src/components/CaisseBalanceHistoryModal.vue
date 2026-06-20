<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    @click.self="close"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Historique du solde</h3>
          <p v-if="caisseName" class="text-sm text-gray-500 mt-0.5">{{ caisseName }}</p>
        </div>
        <button type="button" class="text-gray-400 hover:text-gray-600" @click="close">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
        <p v-if="caisseStore.balanceHistoryTotal > 0" class="text-sm text-gray-600">
          {{ caisseStore.balanceHistoryTotal }} mouvement(s)
        </p>
        <div v-if="caisseStore.balanceHistoryCurrentAmount > 0" class="ml-auto text-right">
          <p class="text-xs text-gray-500">Solde actuel</p>
          <p class="text-base font-bold text-primary">{{ formatCurrency(caisseStore.balanceHistoryCurrentAmount) }}</p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-5 py-4">
        <div v-if="caisseStore.balanceHistoryLoading" class="flex justify-center py-12">
          <i class="fas fa-spinner fa-spin text-2xl text-primary"></i>
        </div>

        <div v-else-if="caisseStore.balanceHistoryError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {{ caisseStore.balanceHistoryError }}
        </div>

        <div v-else-if="caisseStore.balanceHistory.length === 0" class="text-center py-12 text-gray-500">
          Aucun mouvement enregistré pour cette caisse.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Avant</th>
                <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Variation</th>
                <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Après</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Par</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="entry in caisseStore.balanceHistory" :key="entry.id">
                <td class="px-3 py-2 whitespace-nowrap text-gray-600">
                  {{ formatDateTime(entry.created_at) }}
                </td>
                <td class="px-3 py-2 whitespace-nowrap">{{ entry.reason_label || entry.reason }}</td>
                <td class="px-3 py-2 whitespace-nowrap text-right">{{ formatCurrency(entry.amount_before) }}</td>
                <td class="px-3 py-2 whitespace-nowrap text-right font-medium" :class="entry.delta >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ entry.delta >= 0 ? '+' : '' }}{{ formatCurrency(entry.delta) }}
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-right font-semibold">{{ formatCurrency(entry.amount_after) }}</td>
                <td class="px-3 py-2 whitespace-nowrap text-gray-600">
                  <span v-if="entry.triggered_by">
                    {{ entry.triggered_by.first_name }} {{ entry.triggered_by.last_name }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="caisseStore.balanceHistoryTotalPages() > 1"
        class="px-5 py-3 border-t border-gray-200 flex items-center justify-between"
      >
        <span class="text-sm text-gray-600">
          Page {{ caisseStore.balanceHistoryPage }} / {{ caisseStore.balanceHistoryTotalPages() }}
        </span>
        <div class="flex gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline"
            :disabled="caisseStore.balanceHistoryPage <= 1 || caisseStore.balanceHistoryLoading"
            @click="loadPage(caisseStore.balanceHistoryPage - 1)"
          >
            Précédent
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline"
            :disabled="caisseStore.balanceHistoryPage >= caisseStore.balanceHistoryTotalPages() || caisseStore.balanceHistoryLoading"
            @click="loadPage(caisseStore.balanceHistoryPage + 1)"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useCaisseStore } from '../stores/caisse'
import { formatCurrency } from '../utils/currency'

const props = defineProps<{
  modelValue: boolean
  caisseId: number | null
  caisseName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const caisseStore = useCaisseStore()

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const close = () => {
  emit('update:modelValue', false)
  caisseStore.resetBalanceHistory()
}

const loadPage = async (page: number) => {
  if (!props.caisseId) return
  await caisseStore.fetchBalanceHistory(props.caisseId, page)
}

watch(
  () => [props.modelValue, props.caisseId] as const,
  async ([open, id]) => {
    if (open && id) {
      await caisseStore.fetchBalanceHistory(id, 1)
    }
  }
)
</script>

<style scoped>
.btn {
  @apply inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors;
}
.btn-outline {
  @apply border border-gray-300 text-gray-700 bg-white hover:bg-gray-50;
}
.btn-sm {
  @apply px-3 py-1.5 text-xs;
}
.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>
