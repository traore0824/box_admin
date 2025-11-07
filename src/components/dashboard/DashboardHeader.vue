<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>

    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Filtre par date -->
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Filtrer par date:</label>
        <div class="flex items-center gap-2">
          <div class="relative">
            <input 
              :value="dateFrom" 
              @input="$emit('update:dateFrom', ($event.target as HTMLInputElement).value)" 
              type="date" 
              class="input-date" 
              :class="{ 'border-custom-yellow bg-custom-yellow-light': dateFrom }"
            />
            <div v-if="dateFrom" class="absolute -top-1 -right-1 w-3 h-3 bg-custom-yellow rounded-full"></div>
          </div>
          <span class="text-gray-500">à</span>
          <div class="relative">
            <input 
              :value="dateTo" 
              @input="$emit('update:dateTo', ($event.target as HTMLInputElement).value)" 
              type="date" 
              class="input-date"
              :class="{ 'border-custom-yellow bg-custom-yellow-light': dateTo }"
            />
            <div v-if="dateTo" class="absolute -top-1 -right-1 w-3 h-3 bg-custom-yellow rounded-full"></div>
          </div>
          <button 
            v-if="dateFrom || dateTo"
            @click="$emit('clear-dates')"
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Périodes -->
      <div class="inline-flex bg-white rounded-lg shadow-sm">
        <button 
          v-for="period in periods" 
          :key="period" 
          @click="$emit('update:period', period)"
          class="px-4 py-2 text-sm font-medium transition-colors relative" 
          :class="{
            'bg-custom-yellow text-white': activePeriod === period,
            'text-gray-500 hover:bg-gray-50': activePeriod !== period,
            'rounded-l-lg': period === periods[0],
            'rounded-r-lg': period === periods[periods.length - 1]
          }"
        >
          {{ period }}
          <div 
            v-if="activePeriod === period" 
            class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-custom-yellow rounded-full"
          ></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  dateFrom: String,
  dateTo: String,
  activePeriod: {
    type: String,
    default: 'Tous'
  },
  periods: {
    type: Array,
    default: () => ['Tous', 'Aujourd\'hui', 'Cette semaine', 'Ce mois']
  }
})

defineEmits(['update:dateFrom', 'update:dateTo', 'update:period', 'clear-dates'])
</script>

<style scoped>
.input-date {
  @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-custom-yellow focus:border-custom-yellow transition-colors;
}

.input-date:focus {
  @apply border-custom-yellow;
}

.bg-custom-yellow {
  background-color: #BC8A1A;
}

.bg-custom-yellow-light {
  background-color: rgba(188, 138, 26, 0.1);
}

.border-custom-yellow {
  border-color: #BC8A1A;
}

.text-custom-yellow {
  color: #BC8A1A;
}

.hover\:bg-custom-yellow-dark:hover {
  background-color: #A67A15;
}

.focus\:ring-custom-yellow:focus {
  --tw-ring-color: rgba(188, 138, 26, 0.5);
}

.focus\:border-custom-yellow:focus {
  border-color: #BC8A1A;
}
</style> 