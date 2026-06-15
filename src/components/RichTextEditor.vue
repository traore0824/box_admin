<template>
  <div class="rich-editor border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
      <!-- Texte -->
      <button type="button" @click="editor?.chain().focus().toggleBold().run()"
        :class="{ 'bg-gray-200': editor?.isActive('bold') }"
        class="toolbar-btn" title="Gras">
        <i class="fas fa-bold"></i>
      </button>
      <button type="button" @click="editor?.chain().focus().toggleItalic().run()"
        :class="{ 'bg-gray-200': editor?.isActive('italic') }"
        class="toolbar-btn" title="Italique">
        <i class="fas fa-italic"></i>
      </button>
      <button type="button" @click="editor?.chain().focus().toggleUnderline().run()"
        :class="{ 'bg-gray-200': editor?.isActive('underline') }"
        class="toolbar-btn" title="Souligné">
        <i class="fas fa-underline"></i>
      </button>
      <button type="button" @click="editor?.chain().focus().toggleStrike().run()"
        :class="{ 'bg-gray-200': editor?.isActive('strike') }"
        class="toolbar-btn" title="Barré">
        <i class="fas fa-strikethrough"></i>
      </button>

      <div class="w-px h-5 bg-gray-300 mx-1"></div>

      <!-- Titres -->
      <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'bg-gray-200': editor?.isActive('heading', { level: 1 }) }"
        class="toolbar-btn font-bold text-sm" title="Titre 1">H1</button>
      <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'bg-gray-200': editor?.isActive('heading', { level: 2 }) }"
        class="toolbar-btn font-bold text-sm" title="Titre 2">H2</button>
      <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'bg-gray-200': editor?.isActive('heading', { level: 3 }) }"
        class="toolbar-btn font-bold text-sm" title="Titre 3">H3</button>

      <div class="w-px h-5 bg-gray-300 mx-1"></div>

      <!-- Listes -->
      <button type="button" @click="editor?.chain().focus().toggleBulletList().run()"
        :class="{ 'bg-gray-200': editor?.isActive('bulletList') }"
        class="toolbar-btn" title="Liste à puces">
        <i class="fas fa-list-ul"></i>
      </button>
      <button type="button" @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="{ 'bg-gray-200': editor?.isActive('orderedList') }"
        class="toolbar-btn" title="Liste numérotée">
        <i class="fas fa-list-ol"></i>
      </button>

      <div class="w-px h-5 bg-gray-300 mx-1"></div>

      <!-- Alignement -->
      <button type="button" @click="editor?.chain().focus().setTextAlign('left').run()"
        :class="{ 'bg-gray-200': editor?.isActive({ textAlign: 'left' }) }"
        class="toolbar-btn" title="Aligner à gauche">
        <i class="fas fa-align-left"></i>
      </button>
      <button type="button" @click="editor?.chain().focus().setTextAlign('center').run()"
        :class="{ 'bg-gray-200': editor?.isActive({ textAlign: 'center' }) }"
        class="toolbar-btn" title="Centrer">
        <i class="fas fa-align-center"></i>
      </button>
      <button type="button" @click="editor?.chain().focus().setTextAlign('right').run()"
        :class="{ 'bg-gray-200': editor?.isActive({ textAlign: 'right' }) }"
        class="toolbar-btn" title="Aligner à droite">
        <i class="fas fa-align-right"></i>
      </button>

      <div class="w-px h-5 bg-gray-300 mx-1"></div>

      <!-- Bloc citation -->
      <button type="button" @click="editor?.chain().focus().toggleBlockquote().run()"
        :class="{ 'bg-gray-200': editor?.isActive('blockquote') }"
        class="toolbar-btn" title="Citation">
        <i class="fas fa-quote-left"></i>
      </button>

      <!-- Code -->
      <button type="button" @click="editor?.chain().focus().toggleCode().run()"
        :class="{ 'bg-gray-200': editor?.isActive('code') }"
        class="toolbar-btn" title="Code inline">
        <i class="fas fa-code"></i>
      </button>

      <div class="w-px h-5 bg-gray-300 mx-1"></div>

      <!-- Lien -->
      <button type="button" @click="setLink"
        :class="{ 'bg-gray-200': editor?.isActive('link') }"
        class="toolbar-btn" title="Insérer un lien">
        <i class="fas fa-link"></i>
      </button>
      <button type="button" v-if="editor?.isActive('link')" @click="editor?.chain().focus().unsetLink().run()"
        class="toolbar-btn text-red-500" title="Supprimer le lien">
        <i class="fas fa-unlink"></i>
      </button>

      <div class="w-px h-5 bg-gray-300 mx-1"></div>

      <!-- Undo/Redo -->
      <button type="button" @click="editor?.chain().focus().undo().run()"
        :disabled="!editor?.can().undo()"
        class="toolbar-btn disabled:opacity-30" title="Annuler">
        <i class="fas fa-undo"></i>
      </button>
      <button type="button" @click="editor?.chain().focus().redo().run()"
        :disabled="!editor?.can().redo()"
        class="toolbar-btn disabled:opacity-30" title="Refaire">
        <i class="fas fa-redo"></i>
      </button>

      <!-- Effacer le formatage -->
      <button type="button" @click="editor?.chain().focus().clearNodes().unsetAllMarks().run()"
        class="toolbar-btn text-gray-400 hover:text-red-500 ml-auto" title="Effacer le formatage">
        <i class="fas fa-remove-format"></i>
      </button>
    </div>

    <!-- Zone d'édition -->
    <editor-content
      :editor="editor"
      class="prose prose-sm max-w-none min-h-[150px] px-3 py-2 focus:outline-none"
    />

    <!-- Compteur de caractères -->
    <div class="px-3 py-1 bg-gray-50 border-t border-gray-100 text-right">
      <span class="text-xs text-gray-400">{{ charCount }} caractères</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Underline,
    Link.configure({ openOnClick: false, autolink: true }),
  ],
  editorProps: {
    attributes: {
      class: 'focus:outline-none min-h-[150px]',
    },
  },
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
})

// Sync quand la valeur change depuis l'extérieur (ex: reset du form)
watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val || '', false as unknown as Parameters<typeof editor.value.commands.setContent>[1])
  }
})

const charCount = computed(() => {
  return editor.value?.getText().length ?? 0
})

function setLink() {
  const prev = editor.value?.getAttributes('link').href ?? ''
  const url = window.prompt('URL du lien :', prev)
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.toolbar-btn {
  @apply p-1.5 rounded text-gray-600 hover:bg-gray-200 transition-colors text-sm min-w-[28px] flex items-center justify-center;
}
:deep(.ProseMirror) {
  @apply min-h-[150px] outline-none px-3 py-2;
}
:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  @apply text-gray-400 pointer-events-none float-left h-0;
}
:deep(.ProseMirror h1) { @apply text-2xl font-bold my-2; }
:deep(.ProseMirror h2) { @apply text-xl font-bold my-2; }
:deep(.ProseMirror h3) { @apply text-lg font-bold my-2; }
:deep(.ProseMirror ul) { @apply list-disc pl-5 my-1; }
:deep(.ProseMirror ol) { @apply list-decimal pl-5 my-1; }
:deep(.ProseMirror blockquote) { @apply border-l-4 border-gray-300 pl-3 italic text-gray-600 my-2; }
:deep(.ProseMirror code) { @apply bg-gray-100 rounded px-1 text-sm font-mono; }
:deep(.ProseMirror a) { @apply text-blue-600 underline; }
</style>
