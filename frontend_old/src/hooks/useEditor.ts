import { useState, useCallback, useRef, useEffect } from 'react'
import type { TextElement } from '../types'
import html2canvas from 'html2canvas'
import { renderImage, RenderError } from '../services/api'
import { getSessionId } from '../lib/session'

let nextId = 0

function createDefaultElement(): TextElement {
  return {
    id: `te-${Date.now()}-${++nextId}`,
    text: 'Your text here',
    x: 50,
    y: 50,
    fontSize: 24,
    fontFamily: 'Arial',
    color: '#ffffff',
    bold: false,
    italic: false,
    textAlign: 'left',
  }
}

// --- Command stack for undo/redo ---
type CommandType = 'add' | 'remove' | 'updateText' | 'updatePosition' | 'updateStyle'

interface Command {
  type: CommandType
  elementId: string
  // Snapshot-based: store before/after state for surgical undo
  before: TextElement | null  // null for 'add'
  after: TextElement | null   // null for 'remove'
}

const MAX_STACK = 50
const UNDO_STORAGE_KEY = 'memeforge-undo-stack'

function loadStack(): Command[] {
  try {
    const raw = localStorage.getItem(UNDO_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Command[]
  } catch { /* ignore */ }
  return []
}

function saveStack(stack: Command[]) {
  try {
    const trimmed = stack.slice(-MAX_STACK)
    localStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify(trimmed))
  } catch { /* quota exceeded — silently drop */ }
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
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  exportCanvas: (
    element: HTMLElement,
    templateId: string,
    format: 'png' | 'jpeg',
    filename: string,
  ) => Promise<void>
  exportError: string | null
  exporting: boolean
}

export function useEditor(): UseEditorReturn {
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  // Undo/redo stacks
  const undoStackRef = useRef<Command[]>(loadStack())
  const redoStackRef = useRef<Command[]>([])
  const [, forceUpdate] = useState(0) // re-render on stack change

  const selectedElement =
    textElements.find((el) => el.id === selectedElementId) ?? null

  const canUndo = undoStackRef.current.length > 0
  const canRedo = redoStackRef.current.length > 0

  // Helper: push command and persist
  const pushCommand = useCallback((cmd: Command) => {
    undoStackRef.current.push(cmd)
    if (undoStackRef.current.length > MAX_STACK) {
      undoStackRef.current = undoStackRef.current.slice(-MAX_STACK)
    }
    redoStackRef.current = [] // clear redo on new action
    saveStack(undoStackRef.current)
    forceUpdate((n) => n + 1)
  }, [])

  // Helper: execute undo — restore before state
  const undo = useCallback(() => {
    const stack = undoStackRef.current
    if (stack.length === 0) return
    const cmd = stack.pop()!
    redoStackRef.current.push(cmd)
    saveStack(stack)

    if (cmd.type === 'add') {
      // Undo add = remove the element
      setTextElements((prev) => prev.filter((el) => el.id !== cmd.elementId))
      setSelectedElementId(null)
    } else if (cmd.type === 'remove') {
      // Undo remove = restore the element
      if (cmd.before) {
        setTextElements((prev) => [...prev, cmd.before!])
      }
    } else {
      // Undo update = restore before state
      if (cmd.before) {
        setTextElements((prev) =>
          prev.map((el) => (el.id === cmd.elementId ? cmd.before! : el)),
        )
      }
    }
    forceUpdate((n) => n + 1)
  }, [])

  // Helper: execute redo — re-apply after state
  const redo = useCallback(() => {
    const stack = redoStackRef.current
    if (stack.length === 0) return
    const cmd = stack.pop()!
    undoStackRef.current.push(cmd)
    saveStack(undoStackRef.current)

    if (cmd.type === 'add') {
      if (cmd.after) {
        setTextElements((prev) => [...prev, cmd.after!])
        setSelectedElementId(cmd.after!.id)
      }
    } else if (cmd.type === 'remove') {
      setTextElements((prev) => prev.filter((el) => el.id !== cmd.elementId))
      setSelectedElementId(null)
    } else {
      if (cmd.after) {
        setTextElements((prev) =>
          prev.map((el) => (el.id === cmd.elementId ? cmd.after! : el)),
        )
      }
    }
    forceUpdate((n) => n + 1)
  }, [])

  // Restore stack from localStorage on mount
  useEffect(() => {
    const saved = loadStack()
    if (saved.length > 0) {
      undoStackRef.current = saved
      forceUpdate((n) => n + 1)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement

      // Ctrl+Z / Cmd+Z → undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      // Ctrl+Shift+Z / Cmd+Shift+Z / Ctrl+Y → redo
      if (
        (e.metaKey || e.ctrlKey) &&
        ((e.shiftKey && e.key === 'z') || e.key === 'y')
      ) {
        e.preventDefault()
        redo()
        return
      }
      // Delete/Backspace → remove selected (only when not typing in textarea)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
        if (selectedElementId) {
          e.preventDefault()
          removeTextElement(selectedElementId)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedElementId, undo, redo])

  // ── Element operations ──

  const addTextElement = useCallback(() => {
    const el = createDefaultElement()
    setTextElements((prev) => [...prev, el])
    setSelectedElementId(el.id)
    pushCommand({
      type: 'add',
      elementId: el.id,
      before: null,
      after: el,
    })
  }, [pushCommand])

  const updateTextElement = useCallback(
    (id: string, updates: Partial<TextElement>) => {
      setTextElements((prev) => {
        const target = prev.find((el) => el.id === id)
        if (!target) return prev

        // Determine command type
        const hasText = 'text' in updates
        const hasPos = 'x' in updates || 'y' in updates
        const hasStyle =
          'fontFamily' in updates ||
          'fontSize' in updates ||
          'color' in updates ||
          'bold' in updates ||
          'italic' in updates ||
          'textAlign' in updates

        let cmdType: CommandType = 'updateStyle'
        if (hasText && !hasPos && !hasStyle) cmdType = 'updateText'
        else if (hasPos && !hasText && !hasStyle) cmdType = 'updatePosition'

        const after = { ...target, ...updates }

        pushCommand({
          type: cmdType,
          elementId: id,
          before: target,
          after,
        })

        return prev.map((el) => (el.id === id ? after : el))
      })
    },
    [pushCommand],
  )

  const removeTextElement = useCallback(
    (id: string) => {
      setTextElements((prev) => {
        const target = prev.find((el) => el.id === id)
        if (target) {
          pushCommand({
            type: 'remove',
            elementId: id,
            before: target,
            after: null,
          })
        }
        return prev.filter((el) => el.id !== id)
      })
      setSelectedElementId((prev) => (prev === id ? null : prev))
    },
    [pushCommand],
  )

  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id)
  }, [])

  const updatePosition = useCallback(
    (id: string, x: number, y: number) => {
      updateTextElement(id, { x, y })
    },
    [updateTextElement],
  )

  // ── Export (unchanged logic) ──

  const exportCanvas = useCallback(
    async (
      element: HTMLElement,
      templateId: string,
      format: 'png' | 'jpeg',
      filename: string,
    ) => {
      setExporting(true)
      setExportError(null)

      const textBlocks = textElements.map(({ id: _id, ...rest }) => ({
        ...rest,
        text_align: rest.textAlign,
      }))

      // ── Primary: server-side Pillow render ──
      try {
        const blob = await renderImage({
          template_id: templateId,
          text_blocks: textBlocks,
          format,
          session_id: getSessionId(),
        })

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.${format}`
        a.click()
        URL.revokeObjectURL(url)
        setExporting(false)
        return
      } catch (err: unknown) {
        if (err instanceof RenderError && err.status === 422) {
          setExportError(err.message)
          setExporting(false)
          return
        }
      }

      // ── Fallback: client-side html2canvas ──
      const targetWidth = element.offsetWidth
      const targetHeight = element.offsetHeight

      const clone = element.cloneNode(true) as HTMLElement

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
        setExporting(false)
      }
    },
    [textElements],
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
    undo,
    redo,
    canUndo,
    canRedo,
    exportCanvas,
    exportError,
    exporting,
  }
}
