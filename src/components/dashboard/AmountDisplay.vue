<template>
  <div class="mt-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between">
      <div>
        <div class="text-sm font-medium text-gray-500">{{ label }}</div>
        <div class="mt-1 text-2xl font-semibold text-gray-900">
          {{ formatAmount(value || 0) }}
        </div>
      </div>
      <div class="w-10 h-10 rounded-full flex items-center justify-center bg-primary-50">
        <i class="fas fa-money-bill-wave text-primary-500"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  label: {
    type: String,
    required: true
  }
})

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount)
}
</script> 