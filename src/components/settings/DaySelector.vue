<template>
  <div class="space-y-2">
    <div class="flex flex-wrap gap-2">
      <label
        v-for="day in daysOfWeek"
        :key="day.value"
        class="inline-flex items-center px-3 py-2 border rounded-lg cursor-pointer transition-colors"
        :class="isSelected(day.value) 
          ? 'bg-blue-500 text-white border-blue-500' 
          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'"
      >
        <input
          type="checkbox"
          :value="day.value"
          :checked="isSelected(day.value)"
          @change="toggleDay(day.value)"
          class="sr-only"
        />
        <span class="text-sm font-medium">{{ day.label }}</span>
      </label>
    </div>
    <p class="text-xs text-gray-500 mt-2">
      Sélectionnés: {{ modelValue.length > 0 ? modelValue.join(', ') : 'Aucun' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const daysOfWeek = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sam' },
  { value: 7, label: 'Dim' }
]

const isSelected = (day: number) => {
  return props.modelValue.includes(day)
}

const toggleDay = (day: number) => {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(day)
  
  if (index > -1) {
    newValue.splice(index, 1)
  } else {
    newValue.push(day)
  }
  
  emit('update:modelValue', newValue.sort((a, b) => a - b))
}
</script>

