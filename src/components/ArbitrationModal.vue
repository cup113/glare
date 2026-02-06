<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { ClipboardDocumentIcon, XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline'
import { useComparisonStore } from '@/stores/comparisonStore'

const store = useComparisonStore()
const isCopied = ref(false)
const userNotes = ref(store.arbitrationNotes)

// Watch store arbitrationNotes for changes
watch(() => store.arbitrationNotes, (newNotes) => {
  userNotes.value = newNotes
})

// Update store when user notes change (with debounce)
let updateTimeout: number | null = null
const handleNotesChange = () => {
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }
  updateTimeout = window.setTimeout(() => {
    store.setArbitrationNotes(userNotes.value)
  }, 500)
}

// Copy template to clipboard
const copyTemplate = async () => {
  try {
    await navigator.clipboard.writeText(store.arbitrationTemplate)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy template:', error)
  }
}

// Select all text in template textarea
const selectTemplate = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  textarea.select()
}

// Close modal
const closeModal = () => {
  store.setArbitrationModalOpen(false)
}
</script>

<template>
  <Dialog
    :open="store.isArbitrationModalOpen"
    @close="closeModal"
    class="relative z-50"
  >
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50" aria-hidden="true" />

    <!-- Modal Container -->
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <ChatBubbleLeftRightIcon class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              AI Response Arbitration
            </DialogTitle>
          </div>
          
          <div class="flex items-center space-x-3">
            <button
              @click="copyTemplate"
              class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              :title="isCopied ? 'Copied!' : 'Copy template to clipboard'"
            >
              <ClipboardDocumentIcon class="w-4 h-4" />
              <span class="text-sm font-medium">
                {{ isCopied ? 'Copied!' : 'Copy Template' }}
              </span>
            </button>
            
            <button
              @click="closeModal"
              class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex flex-col lg:flex-row h-[70vh]">
          <!-- Left Panel: User Notes -->
          <div class="lg:w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100">Additional Context & Notes</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add any additional information, context, or specific questions for the arbitrator.
              </p>
            </div>
            
            <div class="flex-1 p-4">
              <textarea
                v-model="userNotes"
                @input="handleNotesChange"
                placeholder="Enter any additional context, specific questions, or notes for the arbitrator here..."
                class="w-full h-full min-h-[300px] p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-100"
              />
            </div>
            
            <div class="p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
              <p>• Your notes will be included in the arbitration request template.</p>
              <p>• Changes are saved automatically.</p>
            </div>
          </div>

          <!-- Right Panel: Generated Template -->
          <div class="lg:w-1/2 flex flex-col">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-gray-100">Arbitration Request Template</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Ready-to-use template with {{ store.snippets.length }} quote(s). Select all and copy.
                  </p>
                </div>
                
                <div class="flex items-center space-x-2">
                  <span class="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                    {{ store.snippets.length }} quote(s)
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex-1 p-4">
              <textarea
                :value="store.arbitrationTemplate"
                @click="selectTemplate"
                readonly
                class="w-full h-full min-h-[300px] p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none font-mono text-sm whitespace-pre-wrap dark:text-gray-100 cursor-text"
                @focus="selectTemplate"
              />
            </div>
            
            <div class="p-4 border-t border-gray-200 dark:border-gray-700">
              <div class="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>• Click the textarea to select all text, or use the "Copy Template" button.</p>
                <p>• Paste this template into your preferred AI tool for arbitration.</p>
                <p>• Template includes quoted responses with model labels and timestamps.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <span v-if="store.snippets.length === 0" class="text-amber-600 dark:text-amber-400">
              No quotes selected. Select text from AI responses to create quotes.
            </span>
            <span v-else>
              Template ready with {{ store.snippets.length }} quote(s). Copy and paste into your AI tool.
            </span>
          </div>
          
          <div class="flex items-center space-x-3">
            <button
              @click="store.clearSnippets"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              :disabled="store.snippets.length === 0"
              :class="{ 'opacity-50 cursor-not-allowed': store.snippets.length === 0 }"
            >
              Clear All Quotes
            </button>
            
            <button
              @click="closeModal"
              class="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>