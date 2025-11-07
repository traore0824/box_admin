<template>
    <div class="card">
        <h3 class="font-medium text-gray-700 mb-4">{{ title }}</h3>
        <slot />
    </div>
</template>

<script setup lang="ts">
defineProps({
    title: String
})
</script>

<style scoped>
.card {
    @apply bg-white rounded-card shadow-card p-6;
}
</style>