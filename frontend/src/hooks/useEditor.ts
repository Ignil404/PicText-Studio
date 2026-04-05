import { useState, useCallback } from 'react'
import type { TextElement } from '../types'
import html2canvas from 'html2canvas'

let nextId = 0

function createDefaultElement(): TextElement {
  return {
    id: `te-${Date.now()}-${++nextId}`,
    text: 'Your text here',
    x: 50,
    y: 50,
    fontSize: 24,
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    bold: false,
    italic: false,
  }
}

interface UseEditorReturn {
  textElements: TextElement[]
  selectedElementId: string | null
  selectedElement: TextElement | null
  addTextElement: () => void
  updateTextElement: (id: string, updates: Partial<TextElement>) => void
  removeTextElement: (id: string) => void
  selectElement: (id: string | null) => void
  updatePosition: (id: string, x: number, y: number) => void
  exportCanvas: (element: HTMLElement, format: 'png' | 'jpeg', filename: string) => Promise<void>
}

export function useEditor(): UseEditorReturn {
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

  const selectedElement =
    textElements.find((el) => el.id === selectedElementId) ?? null

  const addTextElement = useCallback(() => {
    const el = createDefaultElement()
    setTextElements((prev) => [...prev, el])
    setSelectedElementId(el.id)
  }, [])

  const updateTextElement = useCallback(
    (id: string, updates: Partial<TextElement>) => {
      setTextElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      )
    },
    [],
  )

  const removeTextElement = useCallback((id: string) => {
    setTextElements((prev) => prev.filter((el) => el.id !== id))
    setSelectedElementId((prev) => (prev === id ? null : prev))
  }, [])

  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id)
  }, [])

  const updatePosition = useCallback((id: string, x: number, y: number) => {
    setTextElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, x, y } : el)),
    )
  }, [])

  const exportCanvas = useCallback(
    async (
      element: HTMLElement,
      format: 'png' | 'jpeg',
      filename: string,
    ) => {
      const targetWidth = element.offsetWidth
      const targetHeight = element.offsetHeight

      // Build an offscreen clone with inputs replaced by spans (to fix
      // cloneNode not copying .value) and styled to render pixel-perfect
      // without the CSS transform applied in the visible editor.
      const clone = element.cloneNode(true) as HTMLElement

      // Swap all inputs/textareas for span elements with the text rendered
      clone.querySelectorAll('input, textarea').forEach((input) => {
        const val = (input as HTMLInputElement | HTMLTextAreaElement).value
        const span = document.createElement('span')
        span.className = String((input as HTMLElement).className)
        span.style.whiteSpace = 'pre-wrap'
        span.style.textAlign = 'center'
        span.style.border = 'none'
        span.style.background = 'transparent'
        span.style.outline = 'none'
        span.innerText = String(val)
        const parent = input.parentElement
        if (parent) {
          parent.replaceChild(span, input)
        }
      })

      // Strip selection border styles
      clone.querySelectorAll(
        `[style*="outline"]`,
      ).forEach((el) => {
        ;(el as HTMLElement).style.outline = '2px solid transparent'
      })

      clone.style.position = 'fixed'
      clone.style.left = '0'
      clone.style.top = '0'
      clone.style.transform = 'none'
      clone.style.width = `${targetWidth}px`
      clone.style.height = `${targetHeight}px`
      clone.style.margin = '0'
      clone.style.boxShadow = 'none'
      clone.style.borderRadius = '0'
      clone.style.pointerEvents = 'none'

      document.body.appendChild(clone)

      try {
        const canvas = await html2canvas(clone, {
          backgroundColor: '#000000',
          useCORS: true,
          scale: 2,
        })

        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
        canvas.toBlob(
          (blob) => {
            if (!blob) return
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${filename}.${format}`
            a.click()
            URL.revokeObjectURL(url)
          },
          mimeType,
          0.92,
        )
      } finally {
        document.body.removeChild(clone)
      }
    },
    [],
  )

  return {
    textElements,
    selectedElementId,
    selectedElement,
    addTextElement,
    updateTextElement,
    removeTextElement,
    selectElement,
    updatePosition,
    exportCanvas,
  }
}
