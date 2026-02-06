import { defineStore } from 'pinia'
import { format } from 'date-fns'

export interface Snippet {
  id: string
  text: string
  modelLabel: string
  timestamp: Date
  metadata: {
    cardId: string
    selectionRange: string
  }
}

export interface ComparisonState {
  slotCount: number // 2-4
  modelResponses: Record<string, string> // key: 'modelA', 'modelB', etc.
  snippets: Snippet[]
  arbitrationNotes: string
  selectedSnippetId: string | null
  isArbitrationModalOpen: boolean
  currentComparisonIndex: number // for Left/Right switching
  comparisonHistory: Array<{
    id: string
    modelResponses: Record<string, string>
    timestamp: Date
  }>
}

const STORAGE_KEY = 'ai-comparison-state'

const defaultState = (): ComparisonState => ({
  slotCount: 3,
  modelResponses: {
    modelA: '',
    modelB: '',
    modelC: '',
    modelD: '',
  },
  snippets: [],
  arbitrationNotes: '',
  selectedSnippetId: null,
  isArbitrationModalOpen: false,
  currentComparisonIndex: 0,
  comparisonHistory: [],
})

const loadState = (): ComparisonState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Convert string dates back to Date objects
      parsed.snippets = parsed.snippets?.map((s: any) => ({
        ...s,
        timestamp: new Date(s.timestamp),
      })) || []
      parsed.comparisonHistory = parsed.comparisonHistory?.map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      })) || []
      return { ...defaultState(), ...parsed }
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error)
  }
  return defaultState()
}

const saveState = (state: ComparisonState) => {
  try {
    const stateToSave = {
      ...state,
      snippets: state.snippets.map(s => ({
        ...s,
        timestamp: s.timestamp.toISOString(),
      })),
      comparisonHistory: state.comparisonHistory.map(h => ({
        ...h,
        timestamp: h.timestamp.toISOString(),
      })),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  } catch (error) {
    console.error('Failed to save state to localStorage:', error)
  }
}

export const useComparisonStore = defineStore('comparison', {
  state: (): ComparisonState => loadState(),
  
  getters: {
    modelLabels: (state) => {
      const labels = ['Model A', 'Model B', 'Model C', 'Model D']
      return labels.slice(0, state.slotCount)
    },
    
    activeModelKeys: (state) => {
      const keys = ['modelA', 'modelB', 'modelC', 'modelD']
      return keys.slice(0, state.slotCount)
    },
    
    currentModelResponses: (state) => {
      const activeKeys = ['modelA', 'modelB', 'modelC', 'modelD'].slice(0, state.slotCount)
      return activeKeys.map(key => ({
        key,
        label: `Model ${key.charAt(key.length - 1)}`,
        content: state.modelResponses[key] || '',
      }))
    },
    
    selectedSnippet: (state) => {
      if (!state.selectedSnippetId) return null
      return state.snippets.find(s => s.id === state.selectedSnippetId)
    },
    
    arbitrationTemplate: (state) => {
      if (state.snippets.length === 0) {
        return 'No quotes selected. Select text from AI responses to create quotes.'
      }
      
      let template = `# AI Response Arbitration Request\n\n`
      template += `## Context\n${state.arbitrationNotes || '[Add any additional context here]'}\n\n`
      template += `## Quoted Responses\n\n`
      
      state.snippets.forEach((snippet, index) => {
        template += `### Quote ${index + 1} (${snippet.modelLabel})\n`
        template += `> ${snippet.text.replace(/\n/g, '\n> ')}\n\n`
        template += `*Timestamp: ${format(snippet.timestamp, 'yyyy-MM-dd HH:mm:ss')}*\n\n`
      })
      
      template += `## Arbitration Request\n`
      template += `Please analyze the above quoted responses and provide a comprehensive comparison, highlighting:\n`
      template += `1. Key similarities and differences\n`
      template += `2. Accuracy and completeness of each response\n`
      template += `3. Any factual errors or omissions\n`
      template += `4. Overall recommendation\n`
      
      return template
    },
  },
  
  actions: {
    setSlotCount(count: number) {
      if (count < 2 || count > 4) return
      this.slotCount = count
      this.persistState()
    },
    
    setModelResponse(modelKey: string, content: string) {
      this.modelResponses[modelKey] = content
      this.persistState()
    },
    
    addSnippet(text: string, modelLabel: string, metadata: { cardId: string; selectionRange: string }) {
      const snippet: Snippet = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text,
        modelLabel,
        timestamp: new Date(),
        metadata,
      }
      this.snippets.push(snippet)
      this.persistState()
    },
    
    removeSnippet(snippetId: string) {
      this.snippets = this.snippets.filter(s => s.id !== snippetId)
      if (this.selectedSnippetId === snippetId) {
        this.selectedSnippetId = null
      }
      this.persistState()
    },
    
    clearSnippets() {
      this.snippets = []
      this.selectedSnippetId = null
      this.persistState()
    },
    
    setArbitrationNotes(notes: string) {
      this.arbitrationNotes = notes
      this.persistState()
    },
    
    setArbitrationModalOpen(isOpen: boolean) {
      this.isArbitrationModalOpen = isOpen
    },
    
    selectSnippet(snippetId: string | null) {
      this.selectedSnippetId = snippetId
    },
    
    saveCurrentComparison() {
      const comparison = {
        id: Date.now().toString(),
        modelResponses: { ...this.modelResponses },
        timestamp: new Date(),
      }
      this.comparisonHistory.push(comparison)
      this.currentComparisonIndex = this.comparisonHistory.length - 1
      this.persistState()
    },
    
    navigateComparison(direction: 'prev' | 'next') {
      if (direction === 'prev' && this.currentComparisonIndex > 0) {
        this.currentComparisonIndex--
        this.loadComparison(this.currentComparisonIndex)
      } else if (direction === 'next' && this.currentComparisonIndex < this.comparisonHistory.length - 1) {
        this.currentComparisonIndex++
        this.loadComparison(this.currentComparisonIndex)
      }
    },
    
    loadComparison(index: number) {
      if (index >= 0 && index < this.comparisonHistory.length) {
         const comparison = this.comparisonHistory[index]!
        this.modelResponses = { ...comparison.modelResponses }
        this.currentComparisonIndex = index
        this.persistState()
      }
    },
    
    clearAllData() {
      const state = defaultState()
      Object.assign(this, state)
      localStorage.removeItem(STORAGE_KEY)
    },
    
    persistState() {
      saveState(this.$state)
    },
  },
})