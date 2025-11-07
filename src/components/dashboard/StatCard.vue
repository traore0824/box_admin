<template>
  <div class="card">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-gray-500 text-sm font-medium">{{ title }}</h3>
        <p class="mt-1 text-2xl font-semibold text-gray-900">{{ value }}</p>
      </div>
      <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="iconBgClass">
        <i :class="[icon, iconColorClass]"></i>
      </div>
    </div>
    <div class="mt-4">
      <div class="flex items-center">
        <i :class="[
          growthDirection === 'up' ? 'fas fa-arrow-up text-success' :
            growthDirection === 'down' ? 'fas fa-arrow-down text-danger' :
              'fas fa-minus text-gray-400',
          'mr-1'
        ]"></i>
        <span :class="[
          growthDirection === 'up' ? 'text-success' :
            growthDirection === 'down' ? 'text-danger' :
              'text-gray-400',
          'text-sm font-medium'
        ]">
          {{ growth.toFixed(1) }}%
        </span>
        <span class="text-gray-500 text-sm ml-1">since last month</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  growth: number;
}>();

const growthDirection = computed(() => {
  if (props.growth === 0) return 'neutral';
  return props.growth > 0 ? 'up' : 'down';
});

const iconBgClass = computed(() => {
  switch (props.color) {
    case 'primary': return 'bg-primary-100';
    case 'success': return 'bg-success-light';
    case 'warning': return 'bg-warning-light';
    case 'danger': return 'bg-danger-light';
    case 'info': return 'bg-info-light';
    default: return 'bg-gray-100';
  }
});

const iconColorClass = computed(() => {
  switch (props.color) {
    case 'primary': return 'text-primary';
    case 'success': return 'text-success-dark';
    case 'warning': return 'text-warning-dark';
    case 'danger': return 'text-danger-dark';
    case 'info': return 'text-info-dark';
    default: return 'text-gray-500';
  }
});
</script>
