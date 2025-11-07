<template>
  <div class="flex flex-col items-center justify-center py-8">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    <p class="mt-2 text-gray-600">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    default: 'Chargement...'
  }
})
</script> 