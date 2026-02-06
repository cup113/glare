<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { ClipboardDocumentIcon, ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline'
import { useElementTextSelection } from '@/composables/useTextSelection'
import { useComparisonStore } from '@/stores/comparisonStore'

interface Props {
  modelKey: string
  modelLabel: string
  content: string
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
})

const emit = defineEmits<{
  'update:content': [content: string]
  'quote': [text: string]
}>()

const store = useComparisonStore()
const cardRef = ref<HTMLElement | null>(null)
const { selection, clearSelection } = useElementTextSelection(cardRef)
const isCopied = ref(false)

const renderedContent = computed(() => {
  if (!props.content.trim()) {
    return '<div class="text-gray-400 italic">No response yet. Paste Markdown content here.</div>'
  }
  const rawMarkdown = props.content
  const html = marked.parse(rawMarkdown, {
    gfm: true,
    breaks: true,
  }) as string
  return DOMPurify.sanitize(html)
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLDivElement
  emit('update:content', target.innerText)
}

const handleQuote = () => {
  if (selection.value.text) {
    emit('quote', selection.value.text)
    store.addSnippet(selection.value.text, props.modelLabel, {
      cardId: props.modelKey,
      selectionRange: 'user-selection',
    })
    clearSelection()
  }
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedText = event.clipboardData?.getData('text') || ''
  emit('update:content', pastedText)
}

onMounted(() => {
  if (cardRef.value && props.editable) {
    cardRef.value.addEventListener('paste', handlePaste)
  }
})
</script>

<template>
  <div 
    ref="cardRef"
    class="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-200 hover:shadow-xl"
    :class="{
      'ring-2 ring-blue-500 dark:ring-blue-400': selection.isSelecting,
    }"
  >
    <!-- Card Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-3">
        <div class="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400"></div>
        <h3 class="font-semibold text-gray-900 dark:text-gray-100 text-lg">
          {{ modelLabel }}
        </h3>
        <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
          {{ modelKey }}
        </span>
      </div>
      
      <div class="flex items-center space-x-2">
        <button
          @click="handleCopy"
          class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          :title="isCopied ? 'Copied!' : 'Copy to clipboard'"
        >
          <ClipboardDocumentIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 p-4 overflow-y-auto">
      <div
        v-if="editable"
        :contenteditable="editable"
        @input="handleInput"
        class="prose dark:prose-invert prose-sm max-w-none focus:outline-none min-h-[200px]"
        :class="{
          'cursor-text': editable,
          'select-none': !content,
        }"
        v-html="renderedContent"
      />
      <div
        v-else
        class="prose dark:prose-invert prose-sm max-w-none"
        v-html="renderedContent"
      />
    </div>

    <!-- Quote Button (appears when text is selected) -->
    <div
      v-if="selection.isSelecting && selection.rect"
      class="absolute z-10"
      :style="{
        top: `${selection.rect.top - 50}px`,
        left: `${selection.rect.left + selection.rect.width / 2 - 40}px`,
      }"
    >
      <button
        @click="handleQuote"
        class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
        title="Quote selected text"
      >
        <ChatBubbleLeftRightIcon class="w-4 h-4" />
        <span class="text-sm font-medium">Quote</span>
      </button>
    </div>

    <!-- Footer -->
    <div class="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
      <div class="flex justify-between">
        <span>Markdown supported</span>
        <span>{{ content.length }} chars</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose :deep(*) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.prose :deep(h1) {
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 0.75em;
  margin-bottom: 0.5em;
}

.prose :deep(h2) {
  font-size: 1.25em;
  font-weight: bold;
  margin-top: 0.75em;
  margin-bottom: 0.5em;
}

.prose :deep(pre) {
  background-color: #f7f7f7;
  padding: 0.75em;
  border-radius: 0.375em;
  overflow-x: auto;
}

.dark .prose :deep(pre) {
  background-color: #2d3748;
}

.prose :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125em 0.25em;
  border-radius: 0.25em;
  font-size: 0.875em;
}

.dark .prose :deep(code) {
  background-color: #4a5568;
}

[contenteditable]:empty:before {
  content: attr(placeholder);
  color: #9ca3af;
}

[contenteditable]:focus {
  outline: none;
}
</style>