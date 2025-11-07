<template>
  <div 
    v-if="visible"
    class="fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white transition-all duration-300 ease-in-out transform"
    :class="toastClass"
    role="alert"
    @click="dismiss"
  >
    <div class="flex items-center">
      <i :class="['fas', iconClass, 'mr-3 text-xl']"></i>
      <p>{{ message }}</p>
    </div>
    <button @click.stop="dismiss" class="absolute top-2 right-2 text-white hover:text-gray-200">
        <i class="fas fa-times text-sm"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

interface ToastProps {
  id: string | number;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 3000,
});

const emit = defineEmits(['dismiss']);

const visible = ref(false);

const toastClass = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-green-500';
    case 'error': return 'bg-red-500';
    case 'warning': return 'bg-yellow-500';
    default: return 'bg-blue-500';
  }
});

const iconClass = computed(() => {
  switch (props.type) {
    case 'success': return 'fa-check-circle';
    case 'error': return 'fa-exclamation-circle';
    case 'warning': return 'fa-exclamation-triangle';
    default: return 'fa-info-circle';
  }
});

let timeoutId: number | undefined;

const dismiss = () => {
  if (timeoutId) clearTimeout(timeoutId);
  visible.value = false;
  // Give time for fade-out animation before emitting dismiss
  setTimeout(() => {
    emit('dismiss', props.id);
  }, 300); // Corresponds to transition duration
};

watch(() => props.id, () => {
    visible.value = true;
    if (props.duration > 0) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = window.setTimeout(dismiss, props.duration);
    }
}, { immediate: true });

onMounted(() => {
    visible.value = true;
    if (props.duration > 0) {
        timeoutId = window.setTimeout(dismiss, props.duration);
    }
});

</script>

<style scoped>
/* Add fade-in/out transitions */
div {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}
.transform {
  transform: translateY(20px);
  opacity: 0;
}
/* When visible */
div[style*="display: none;"] ~ div.transform {
  /* This is a bit of a hack, better to control visibility directly */
}
/* When visible and transitioned */
.fixed.bottom-5.right-5 {
    transform: translateY(0);
    opacity: 1;
}
</style>
