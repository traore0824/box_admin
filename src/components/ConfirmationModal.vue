<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click.self="handleOverlayClick">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 ease-out" :class="animationClass">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-800">{{ title }}</h3>
            <button @click="emitCancel" class="text-gray-400 hover:text-gray-600 transition-colors">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <p class="text-gray-600 mb-6">{{ message }}</p>
          <div class="flex justify-end space-x-3">
            <button 
              @click="emitCancel"
              class="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Annuler
            </button>
            <button 
              @click="emitConfirm"
              class="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Confirmation',
  },
  message: {
    type: String,
    required: true,
  },
  preventOverlayClose: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const animationClass = ref('');

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    // Trigger enter animation
    animationClass.value = 'scale-95 opacity-0';
    requestAnimationFrame(() => {
      animationClass.value = 'scale-100 opacity-100';
    });
  } else {
    document.body.style.overflow = '';
    // Trigger leave animation before actual close (if needed, handled by transition)
  }
});

const emitConfirm = () => {
  emit('confirm');
};

const emitCancel = () => {
  emit('cancel');
};

const handleOverlayClick = () => {
  if (!props.preventOverlayClose) {
    emitCancel();
  }
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    emitCancel();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey);
  document.body.style.overflow = ''; // Ensure overflow is reset
});

</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Animation for the modal content itself */
.bg-white {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}
</style>
