<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      baseClasses,
      variantClasses,
      sizeClasses,
      { 'opacity-50 cursor-not-allowed': disabled || loading }
    ]"
    @click="$emit('click', $event)"
  >
    <i
      v-if="loading"
      class="fas fa-spinner fa-spin"
      :class="iconClasses"
    ></i>
    <i
      v-else-if="icon"
      :class="[icon, iconClasses]"
    ></i>
    <span v-if="loading && loadingText">{{ loadingText }}</span>
    <span v-else-if="!loading">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  label: string
  loading?: boolean
  loadingText?: string
  disabled?: boolean
  icon?: string
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'outline' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingText: '',
  disabled: false,
  icon: '',
  variant: 'primary',
  size: 'md',
  type: 'button'
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

const iconClasses = props.size === 'sm' ? 'mr-1.5' : props.size === 'lg' ? 'mr-3' : 'mr-2'
</script>

