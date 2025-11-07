<template>
  <div class="card p-6 hover:shadow-md transition-shadow">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-gray-500 text-sm font-medium">{{ title }}</h3>
        <p class="mt-1 text-2xl font-semibold text-gray-900">
          {{ typeof value === 'number' ? value.toLocaleString() : value }}
        </p>
        <p v-if="subtitle" class="text-sm text-gray-500 mt-1">
          {{ subtitle }}
        </p>
      </div>
      <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="`bg-${color}-100`">
        <i :class="[`fas fa-${icon}`, `text-${color}-500`]"></i>
      </div>
    </div>

    <div v-if="growth !== undefined && growth !== null" class="mt-4 flex items-center">
      <i :class="[
        'fas',
        growth > 0 ? 'fa-arrow-up text-green-500' :
          growth < 0 ? 'fa-arrow-down text-red-500' : 'fa-minus text-gray-400',
        'mr-1'
      ]"></i>
      <span :class="[
        growth > 0 ? 'text-green-500' :
          growth < 0 ? 'text-red-500' : 'text-gray-400',
        'text-sm font-medium'
      ]">
        {{ Math.abs(growth).toFixed(1) }}%
      </span>
      <span class="text-gray-500 text-sm ml-1">vs période précédente</span>
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
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'primary'
  },
  subtitle: String,
  growth: {
    type: Number,
    default: undefined
  }
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg border border-gray-200;
}
</style>