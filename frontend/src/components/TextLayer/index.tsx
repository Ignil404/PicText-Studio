import { useRef, useCallback, useEffect } from 'react'
import type { TextElement } from '../../types'
import styles from './TextLayer.module.css'

interface TextLayerProps {
  elements: TextElement[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdatePosition: (id: string, x: number, y: number) => void
  onUpdateText: (id: string, text: string) => void
  canvasDimensions: { width: number; height: number }
}

export function TextLayer({
  elements,
  selectedId,
  onSelect,
  onUpdatePosition,
  onUpdateText,
  canvasDimensions,
}: TextLayerProps) {
  return (
    <div className={styles.layer}>
      {elements.map((el) => (
        <DraggableText
          key={el.id}
          element={el}
          isSelected={el.id === selectedId}
          onSelect={onSelect}
          onUpdatePosition={onUpdatePosition}
          onUpdateText={onUpdateText}
          canvasDimensions={canvasDimensions}
        />
      ))}
    </div>
  )
}

interface DraggableTextProps {
  element: TextElement
  isSelected: boolean
  onSelect: (id: string | null) => void
  onUpdatePosition: (id: string, x: number, y: number) => void
  onUpdateText: (id: string, text: string) => void
  canvasDimensions: { width: number; height: number }
}

function DraggableText({
  element,
  isSelected,
  onSelect,
  onUpdatePosition,
  onUpdateText,
  canvasDimensions,
}: DraggableTextProps) {
  const dragRef = useRef<{
    startX: number
    startY: number
    origX: number
    origY: number
  } | null>(null)

  // Auto-focus textarea when element becomes selected
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (isSelected && textareaRef.current) {
      textareaRef.current.select()
    }
  }, [isSelected])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      // Don't drag if user clicked the textarea itself
      const target = e.target as HTMLElement
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
        return
      }
      onSelect(element.id)
      const canvasEl = (e.target as HTMLElement).closest(
        '[data-canvas]',
      ) as HTMLElement | null
      if (!canvasEl) return

      const rect = canvasEl.getBoundingClientRect()

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: element.x,
        origY: element.y,
      }

      const onMove = (ev: MouseEvent) => {
        const d = dragRef.current
        if (!d) return
        const pctX = ((ev.clientX - rect.left) / rect.width) * 100
        const pctY = ((ev.clientY - rect.top) / rect.height) * 100
        onUpdatePosition(
          element.id,
          Math.max(0, Math.min(100, pctX)),
          Math.max(0, Math.min(100, pctY)),
        )
      }

      const onUp = () => {
        dragRef.current = null
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [element.x, element.y, element.id, onSelect, onUpdatePosition, canvasDimensions],
  )

  const handleInputClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect(element.id)
    },
    [onSelect, element.id],
  )

  return (
    <div
      className={`${styles.textBlock} ${isSelected ? styles.selected : ''}`}
      style={{
        left: `${element.x}%`,
        top: `${element.y}%`,
        transform: 'translate(-50%, -50%)',
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        color: element.color,
        fontWeight: element.bold ? 700 : 400,
        fontStyle: element.italic ? 'italic' : 'normal',
      }}
      onMouseDown={handleMouseDown}
    >
      <textarea
        ref={textareaRef}
        className={styles.textInput}
        value={element.text}
        onChange={(e) => onUpdateText(element.id, e.target.value)}
        onClick={handleInputClick}
        aria-label="Text content"
        data-export-text={element.text}
        readOnly={!isSelected}
        tabIndex={isSelected ? 0 : -1}
      />
    </div>
  )
}
