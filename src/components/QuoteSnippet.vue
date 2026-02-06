<script setup lang="ts">
import { computed } from 'vue'
import { TrashIcon, ChatBubbleLeftIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
import { useComparisonStore } from '@/stores/comparisonStore'

const store = useComparisonStore()

// Computed property for snippets sorted by timestamp (newest first)
const sortedSnippets = computed(() => {
  return [...store.snippets].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
})

// Remove a snippet
const removeSnippet = (snippetId: string) => {
  store.removeSnippet(snippetId)
}

// Clear all snippets
const clearAllSnippets = () => {
  if (store.snippets.length === 0) return
  if (confirm(`Clear all ${store.snippets.length} quotes?`)) {
    store.clearSnippets()
  }
}

// Select a snippet
const selectSnippet = (snippetId: string) => {
  store.selectSnippet(snippetId === store.selectedSnippetId ? null : snippetId)
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <ChatBubbleLeftIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">Quoted Snippets</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ store.snippets.length }} quote(s) stored
            </p>
          </div>
        </div>
        
        <button
          v-if="store.snippets.length > 0"
          @click="clearAllSnippets"
          class="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Clear all quotes"
        >
          <TrashIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
        v-if="store.snippets.length === 0"
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <ChatBubbleLeftIcon class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p class="font-medium">No quotes yet</p>
        <p class="text-sm mt-1">Select text from AI responses to create quotes</p>
      </div>

      <!-- Snippet List -->
      <div
        v-for="snippet in sortedSnippets"
        :key="snippet.id"
        @click="selectSnippet(snippet.id)"
        :class="[
          'p-4 rounded-lg border cursor-pointer transition-all duration-200',
          snippet.id === store.selectedSnippetId
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
        ]"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {{ snippet.modelLabel }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ format(snippet.timestamp, 'HH:mm') }}
            </span>
          </div>
          
          <button
            @click.stop="removeSnippet(snippet.id)"
            class="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded"
            title="Remove quote"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
        
        <div class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
          {{ snippet.text }}
        </div>
        
        <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
          <span>{{ snippet.text.length }} chars</span>
          <span>{{ format(snippet.timestamp, 'MMM d, yyyy') }}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div
      v-if="store.snippets.length > 0"
      class="p-4 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="text-sm text-gray-600 dark:text-gray-400 space-y-2">
        <p class="flex items-center justify-between">
          <span>Total quotes:</span>
          <span class="font-medium">{{ store.snippets.length }}</span>
        </p>
        <p class="flex items-center justify-between">
          <span>Selected:</span>
          <span class="font-medium">{{ store.selectedSnippetId ? '1' : '0' }}</span>
        </p>
        <div class="pt-2">
          <button
            @click="store.setArbitrationModalOpen(true)"
            class="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
            :disabled="store.snippets.length === 0"
            :class="{ 'opacity-50 cursor-not-allowed': store.snippets.length === 0 }"
          >
            Open Arbitration ({{ store.snippets.length }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.dark .overflow-y-auto {
  scrollbar-color: #4a5568 #2d3748;
}
</style>