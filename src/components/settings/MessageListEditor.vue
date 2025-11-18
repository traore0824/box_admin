<template>
  <div class="space-y-3">
    <div class="space-y-2">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="flex items-start gap-2"
      >
        <input
          v-model="messages[index]"
          type="text"
          :placeholder="`Message ${index + 1}`"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="updateMessages"
          @keyup.enter="handleEnter"
        />
        <button
          type="button"
          @click="removeMessage(index)"
          class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Supprimer ce message"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    
    <button
      type="button"
      @click="addMessage"
      class="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
    >
      <i class="fas fa-plus mr-2"></i>
      Ajouter un message
    </button>
    
    <p v-if="messages.length === 0" class="text-xs text-gray-500 italic">
      Aucun message. Si vide, les messages par défaut seront utilisés.
    </p>
    <p v-else class="text-xs text-gray-500">
      {{ messages.length }} message(s) configuré(s). Un message sera choisi aléatoirement.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'save': []
}>()

const messages = ref<string[]>([...props.modelValue])

watch(() => props.modelValue, (newValue) => {
  messages.value = [...newValue]
}, { deep: true })

const updateMessages = () => {
  // Ne pas filtrer les messages vides pour permettre à l'utilisateur de les remplir
  emit('update:modelValue', [...messages.value])
}

const addMessage = () => {
  messages.value.push('')
  updateMessages()
}

const removeMessage = (index: number) => {
  messages.value.splice(index, 1)
  updateMessages()
}

const handleEnter = () => {
  // Émettre un événement pour déclencher la sauvegarde
  emit('save')
}
</script>

