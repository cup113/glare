<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AICard from './AICard.vue'
import ArbitrationModal from './ArbitrationModal.vue'
import QuoteSnippet from './QuoteSnippet.vue'
import { useComparisonStore } from '@/stores/comparisonStore'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  ScaleIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

const store = useComparisonStore()

// Reactive slot count
const slotCount = ref(store.slotCount)

// Update store when slotCount changes
watch(slotCount, (newCount) => {
  if (newCount >= 2 && newCount <= 4) {
    store.setSlotCount(newCount)
  }
})

// Watch store slotCount for changes from other components
watch(() => store.slotCount, (newCount) => {
  slotCount.value = newCount
})

// Get current model responses
const modelResponses = computed(() => store.currentModelResponses)

// Handle card content updates
const handleContentUpdate = (modelKey: string, content: string) => {
  store.setModelResponse(modelKey, content)
}

// Handle quote from card
const handleQuote = (modelLabel: string, text: string) => {
  store.addSnippet(text, modelLabel, {
    cardId: modelLabel,
    selectionRange: 'user-selection',
  })
}

// Navigation functions
const navigateLeft = () => store.navigateComparison('prev')
const navigateRight = () => store.navigateComparison('next')

// Clear all data
const clearAllData = () => {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    store.clearAllData()
  }
}

// Grid column classes based on slot count
const gridColsClass = computed(() => {
  switch (slotCount.value) {
    case 2: return 'md:grid-cols-2'
    case 3: return 'md:grid-cols-2 lg:grid-cols-3'
    case 4: return 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    default: return 'md:grid-cols-2'
  }
})

// Card width classes for responsive design
const cardWidthClass = computed(() => {
  // Mobile: 80% width (w-4/5), Desktop: based on column count
  return 'w-4/5 md:w-full'
})

// History navigation enabled
const canNavigateLeft = computed(() => store.currentComparisonIndex > 0)
const canNavigateRight = computed(() => store.currentComparisonIndex < store.comparisonHistory.length - 1)
</script>

<template>
  <div class="space-y-6">
    <!-- Control Panel -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 md:p-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div class="flex items-center space-x-4">
          <!-- Slot Count Control -->
          <div class="flex items-center space-x-2">
            <span class="text-gray-700 dark:text-gray-300 font-medium">Slots:</span>
            <div class="flex items-center space-x-1">
              <button
                @click="slotCount = Math.max(2, slotCount - 1)"
                :disabled="slotCount <= 2"
                class="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <MinusIcon class="w-4 h-4" />
              </button>
              <span class="w-8 text-center font-semibold text-gray-900 dark:text-gray-100">
                {{ slotCount }}
              </span>
              <button
                @click="slotCount = Math.min(4, slotCount + 1)"
                :disabled="slotCount >= 4"
                class="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <PlusIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- History Navigation -->
          <div class="flex items-center space-x-2">
            <span class="text-gray-700 dark:text-gray-300 font-medium">History:</span>
            <div class="flex items-center space-x-1">
              <button
                @click="navigateLeft"
                :disabled="!canNavigateLeft"
                class="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronLeftIcon class="w-4 h-4" />
              </button>
              <span class="text-sm text-gray-600 dark:text-gray-400 min-w-[80px] text-center">
                {{ store.currentComparisonIndex + 1 }} / {{ Math.max(1, store.comparisonHistory.length) }}
              </span>
              <button
                @click="navigateRight"
                :disabled="!canNavigateRight"
                class="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronRightIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <!-- Save Current Comparison -->
          <button
            @click="store.saveCurrentComparison"
            class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ScaleIcon class="w-4 h-4" />
            <span class="text-sm font-medium">Save</span>
          </button>

          <!-- Arbitration Button -->
          <button
            @click="store.setArbitrationModalOpen(true)"
            class="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            :disabled="store.snippets.length === 0"
            :class="{ 'opacity-50 cursor-not-allowed': store.snippets.length === 0 }"
          >
            <ChatBubbleLeftRightIcon class="w-4 h-4" />
            <span class="text-sm font-medium">Arbitration</span>
            <span v-if="store.snippets.length > 0" class="bg-white text-green-600 text-xs px-2 py-0.5 rounded-full">
              {{ store.snippets.length }}
            </span>
          </button>

          <!-- Clear All -->
          <button
            @click="clearAllData"
            class="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <TrashIcon class="w-4 h-4" />
            <span class="text-sm font-medium">Clear All</span>
          </button>
        </div>
      </div>

      <!-- Instructions -->
      <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>• Paste Markdown content into each card. Select text to quote.</p>
        <p>• Use left/right arrows to navigate saved comparisons.</p>
        <p>• Click "Arbitration" after selecting quotes to generate a comparison request.</p>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- AI Cards Grid -->
      <div class="flex-1">
        <div :class="['grid gap-4 md:gap-6', gridColsClass]">
          <div
            v-for="model in modelResponses"
            :key="model.key"
            class="flex justify-center md:justify-start"
          >
            <div :class="['mx-auto md:mx-0', cardWidthClass]">
              <AICard
                :model-key="model.key"
                :model-label="model.label"
                :content="model.content"
                :editable="true"
                @update:content="(content) => handleContentUpdate(model.key, content)"
                @quote="(text) => handleQuote(model.label, text)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Quote Sidebar -->
      <div class="lg:w-96">
        <QuoteSnippet />
      </div>
    </div>

    <!-- Arbitration Modal -->
    <ArbitrationModal />
  </div>
</template>

<style scoped>
/* Custom scrollbar for the grid */
.grid {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.dark .grid {
  scrollbar-color: #4a5568 #2d3748;
}
</style>