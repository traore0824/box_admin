<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <input
        v-model.number="inputValue"
        type="number"
        min="1"
        max="31"
        placeholder="Jours (ex: 1, 5, 15)"
        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        @input="updateDays"
      />
      <button
        type="button"
        @click="addDay"
        class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        :disabled="!inputValue || inputValue < 1 || inputValue > 31"
      >
        <i class="fas fa-plus"></i>
      </button>
    </div>
    <div v-if="modelValue.length > 0" class="flex flex-wrap gap-2 mt-2">
      <span
        v-for="day in sortedDays"
        :key="day"
        class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm"
      >
        {{ day }}
        <button
          type="button"
          @click="removeDay(day)"
          class="ml-2 text-blue-600 hover:text-blue-800"
        >
          <i class="fas fa-times text-xs"></i>
        </button>
      </span>
    </div>
    <p class="text-xs text-gray-500 mt-1">
      Jours du mois (1-31). Sélectionnés: {{ modelValue.length > 0 ? sortedDays.join(', ') : 'Aucun' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const inputValue = ref<number | null>(null)

const sortedDays = computed(() => {
  return [...props.modelValue].sort((a, b) => a - b)
})

const addDay = () => {
  if (inputValue.value && inputValue.value >= 1 && inputValue.value <= 31) {
    const newValue = [...props.modelValue]
    if (!newValue.includes(inputValue.value)) {
      newValue.push(inputValue.value)
      emit('update:modelValue', newValue.sort((a, b) => a - b))
    }
    inputValue.value = null
  }
}

const removeDay = (day: number) => {
  const newValue = props.modelValue.filter(d => d !== day)
  emit('update:modelValue', newValue)
}

const updateDays = () => {
  // Permet d'entrer plusieurs jours séparés par des virgules
  if (inputValue.value) {
    const value = String(inputValue.value)
    const days = value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d) && d >= 1 && d <= 31)
    if (days.length > 0) {
      const newValue = [...new Set([...props.modelValue, ...days])]
      emit('update:modelValue', newValue.sort((a, b) => a - b))
      inputValue.value = null
    }
  }
}
</script>

