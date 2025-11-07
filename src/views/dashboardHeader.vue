<template>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>

        <div class="flex flex-col sm:flex-row gap-4">
            <!-- Filtre par date -->
            <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Filtrer par date:</label>
                <div class="flex items-center gap-2">
                    <input v-model="dateFrom" type="date" class="input-date" />
                    <span class="text-gray-500">à</span>
                    <input v-model="dateTo" type="date" class="input-date" />
                    <button @click="$emit('clear-dates')"
                        class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- Périodes -->
            <div class="inline-flex bg-white rounded-lg shadow-sm">
                <button v-for="period in periods" :key="period" @click="$emit('update:period', period)"
                    class="px-3 py-2 text-sm font-medium transition-colors" :class="{
                        'bg-primary-500 text-white': activePeriod === period,
                        'text-gray-500 hover:bg-gray-50': activePeriod !== period,
                        'rounded-l-lg': period === periods[0],
                        'rounded-r-lg': period === periods[periods.length - 1]
                    }">
                    {{ period }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    dateFrom: String,
    dateTo: String,
    activePeriod: String,
    periods: {
        type: Array,
        default: () => ['Tous', 'Aujourd\'hui', 'Cette semaine', 'Ce mois']
    }
})

defineEmits(['update:dateFrom', 'update:dateTo', 'update:period', 'clear-dates'])
</script>

<style scoped>
.input-date {
    @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm w-full;
}
</style>