<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
        <p class="mt-1 text-3xl font-semibold" :class="`text-${color}-600`">
          {{ typeof value === 'number' ? value.toLocaleString() : value }}
        </p>
        <p class="mt-1 text-sm text-gray-500">{{ description }}</p>
      </div>
      <div class="w-12 h-12 rounded-full flex items-center justify-center" :class="`bg-${color}-100`">
        <i :class="[`fas fa-${icon}`, `text-${color}-500`]"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'primary'
  }
})
</script> 