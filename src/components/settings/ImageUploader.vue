<template>
  <div class="space-y-2">
    <div v-if="modelValue" class="relative">
      <img 
        :src="modelValue" 
        alt="Image uploadée" 
        class="w-full h-32 object-cover rounded-lg border border-gray-300"
      />
      <button
        type="button"
        @click="removeImage"
        class="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        title="Supprimer l'image"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div v-else class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
      <i class="fas fa-image text-4xl text-gray-400 mb-2"></i>
      <p class="text-sm text-gray-600 mb-2">Aucune image</p>
    </div>
    
    <div class="flex items-center gap-2">
      <label class="flex-1 cursor-pointer">
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          @change="handleFileSelect"
          class="hidden"
        />
        <span class="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          <i class="fas fa-upload mr-2"></i>
          {{ modelValue ? 'Changer l\'image' : 'Sélectionner une image' }}
        </span>
      </label>
      
      <button
        v-if="modelValue"
        type="button"
        @click="removeImage"
        class="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
      >
        <i class="fas fa-trash mr-2"></i>
        Supprimer
      </button>
    </div>
    
    <div v-if="isUploading" class="flex items-center gap-2 text-sm text-blue-600">
      <i class="fas fa-spinner animate-spin"></i>
      <span>Upload en cours...</span>
    </div>
    
    <p class="text-xs text-gray-500">
      Formats acceptés: JPEG, PNG, GIF, WebP (max 5MB)
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUploadStore } from '../../stores/upload'

const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploadStore = useUploadStore()
const isUploading = ref(false)

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    isUploading.value = true
    const url = await uploadStore.uploadFile(file, 'image')
    emit('update:modelValue', url)
  } catch (error) {
    // L'erreur est déjà gérée dans le store avec notification
    console.error('Erreur upload:', error)
  } finally {
    isUploading.value = false
    // Réinitialiser l'input pour permettre de sélectionner le même fichier
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const removeImage = () => {
  emit('update:modelValue', null)
}
</script>

