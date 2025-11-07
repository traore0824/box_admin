<template>
  <div class="p-4 rounded-lg" :class="[
    border ? 'border border-gray-200' : '',
    `bg-${color}-50`
  ]">
    <div class="text-sm font-medium text-gray-500">{{ label }}</div>
    <div class="mt-1 text-2xl font-semibold" :class="`text-${color}-600`">
      {{ typeof value === 'number' ? value.toLocaleString() : value }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  color: {
    type: String,
    default: 'primary'
  },
  border: {
    type: Boolean,
    default: false
  }
})
</script> 