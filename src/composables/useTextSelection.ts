import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { useTextSelection as useVueUseTextSelection } from '@vueuse/core'

export interface TextSelection {
  text: string
  rect: DOMRect | null
  isSelecting: boolean
}

export function useTextSelection(containerRef?: Ref<HTMLElement | null>) {
  const selection = ref<TextSelection>({
    text: '',
    rect: null,
    isSelecting: false,
  })
  
  const { text, rects } = useVueUseTextSelection()
  
  let selectionTimeout: number | null = null
  
  const handleSelectionChange = () => {
    if (selectionTimeout) {
      clearTimeout(selectionTimeout)
    }
    
    selection.value = {
      text: text.value,
      rect: rects.value.length > 0 ? rects.value[0]! : null,
      isSelecting: true,
    }
    
    // Reset isSelecting after a short delay to hide the quote button
    selectionTimeout = window.setTimeout(() => {
      selection.value.isSelecting = false
    }, 3000)
  }
  
  onMounted(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
  })
  
  onUnmounted(() => {
    document.removeEventListener('selectionchange', handleSelectionChange)
    if (selectionTimeout) {
      clearTimeout(selectionTimeout)
    }
  })
  
  const clearSelection = () => {
    window.getSelection()?.removeAllRanges()
    selection.value = {
      text: '',
      rect: null,
      isSelecting: false,
    }
  }
  
  return {
    selection,
    clearSelection,
  }
}

export function useElementTextSelection(elementRef: Ref<HTMLElement | null>) {
  const selection = ref<TextSelection>({
    text: '',
    rect: null,
    isSelecting: false,
  })
  
  const handleMouseUp = () => {
    const element = elementRef.value
    if (!element) return
    
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) {
      selection.value.isSelecting = false
      return
    }
    
    const range = sel.getRangeAt(0)
    if (!element.contains(range.commonAncestorContainer)) {
      selection.value.isSelecting = false
      return
    }
    
    const text = sel.toString().trim()
    if (!text) {
      selection.value.isSelecting = false
      return
    }
    
    const rect = range.getBoundingClientRect()
    selection.value = {
      text,
      rect,
      isSelecting: true,
    }
  }
  
  const handleClickOutside = (event: MouseEvent) => {
    const element = elementRef.value
    if (element && !element.contains(event.target as Node)) {
      selection.value.isSelecting = false
    }
  }
  
  onMounted(() => {
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('click', handleClickOutside)
  })
  
  onUnmounted(() => {
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('click', handleClickOutside)
  })
  
  const clearSelection = () => {
    window.getSelection()?.removeAllRanges()
    selection.value = {
      text: '',
      rect: null,
      isSelecting: false,
    }
  }
  
  return {
    selection,
    clearSelection,
  }
}