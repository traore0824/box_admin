<template>
    <div class="p-4 rounded-lg text-center transition-all hover:shadow-sm" :class="[
        border ? 'border' : '',
        `bg-${color}-50`,
        border ? `border-${color}-200` : ''
    ]">
        <div class="text-2xl font-bold" :class="`text-${color}-600`">
            {{ typeof value === 'number' ? value.toLocaleString() : value }}
        </div>
        <div class="text-sm mt-1" :class="`text-${color}-600`">
            {{ label }}
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    value: [Number, String],
    label: String,
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