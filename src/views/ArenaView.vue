<script setup lang="ts">
import AIComparison from '@/components/AIComparison.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Response Comparison</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Compare 2-4 AI model responses side by side</p>
    </header>

    <AIComparison />
  </div>
</template>