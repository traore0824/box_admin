<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="close"></div>
      
      <!-- Dialog -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div class="sm:flex sm:items-start">
            <div 
              class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
              :class="{
                'bg-danger-light': type === 'danger',
                'bg-warning-light': type === 'warning',
                'bg-info-light': type === 'info'
              }"
            >
              <i 
                class="text-xl"
                :class="{
                  'fas fa-exclamation-triangle text-danger-dark': type === 'danger',
                  'fas fa-exclamation-circle text-warning-dark': type === 'warning',
                  'fas fa-info-circle text-info-dark': type === 'info'
                }"
              ></i>
            </div>
            <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 class="text-lg font-medium leading-6 text-gray-900">{{ title }}</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">{{ message }}</p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              class="btn"
              :class="{
                'btn-danger': type === 'danger',
                'btn-warning': type === 'warning',
                'btn-primary': type === 'info'
              }"
              @click="confirm"
            >
              {{ confirmText }}
            </button>
            <button 
              type="button" 
              class="btn btn-outline mt-3 sm:mt-0 sm:mr-3" 
              @click="close"
            >
              {{ cancelText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'close'): void;
  (e: 'update:isOpen', value: boolean): void;
}>();

// Set default values
const type = props.type || 'info';
const confirmText = props.confirmText || 'Confirm';
const cancelText = props.cancelText || 'Cancel';

function confirm() {
  emit('confirm');
  emit('update:isOpen', false);
}

function close() {
  emit('close');
  emit('update:isOpen', false);
}

// Watch for escape key press
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleEscapeKey);
  } else {
    document.removeEventListener('keydown', handleEscapeKey);
  }
});

function handleEscapeKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen) {
    close();
  }
}
</script>