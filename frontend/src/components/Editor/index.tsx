import { useRef, useCallback, useMemo, useEffect, useState } from 'react'
import type { Template } from '../../types'
import { useEditor } from '../../hooks/useEditor'
import { TextLayer } from '../TextLayer'
import { Toolbar } from '../Toolbar'
import { ExportButton } from '../ExportButton'
import styles from './Editor.module.css'

interface EditorProps {
  template: Template
}

export function Editor({ template }: EditorProps) {
  const {
    textElements,
    selectedElementId,
    selectedElement,
    addTextElement,
    updateTextElement,
    removeTextElement,
    selectElement,
    updatePosition,
    exportCanvas,
    exportError,
    exporting,
  } = useEditor()

  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Measure container and compute scale to fit
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const measure = () => {
      const rect = el.getBoundingClientRect()
      const padding = 64
      const scaleX = (rect.width - padding) / template.width
      const scaleY = (rect.height - padding) / template.height
      setScale(Math.min(scaleX, scaleY, 1))
    }

    measure()
    window.addEventListener('resize', measure)

    // Also observe container size changes
    const observer = new ResizeObserver(measure)
    observer.observe(el)

    return () => {
      window.removeEventListener('resize', measure)
      observer.disconnect()
    }
  }, [template.width, template.height])

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        selectElement(null)
      }
    },
    [selectElement],
  )

  // The scaled wrapper uses the template's native pixel dimensions
  // then gets scaled down to fit the viewport.
  const scaledWidth = useMemo(
    () => template.width * scale,
    [template.width, scale],
  )
  const scaledHeight = useMemo(
    () => template.height * scale,
    [template.height, scale],
  )

  return (
    <div className={styles.editor}>
      <Toolbar
        selected={selectedElement}
        onStyleChange={(id, updates) => updateTextElement(id, updates)}
        onRemove={removeTextElement}
        onAdd={addTextElement}
      />

      <div className={styles.workspace}>
        <div className={styles.canvasContainer} ref={containerRef}>
          <div
            className={styles.canvasWrapper}
            style={{
              width: scaledWidth,
              height: scaledHeight,
            }}
          >
            <div
              ref={canvasRef}
              className={styles.canvas}
              data-canvas
              style={{
                width: template.width,
                height: template.height,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
              onClick={handleSelect}
            >
              <img
                src={template.imageUrl}
                alt={template.name}
                className={styles.bgImage}
              />
              <TextLayer
                elements={textElements}
                selectedId={selectedElementId}
                onSelect={selectElement}
                onUpdatePosition={updatePosition}
                onUpdateText={(id, text) => updateTextElement(id, { text })}
                canvasDimensions={{ width: template.width, height: template.height }}
              />
            </div>
          </div>
        </div>

        <aside className={styles.sidebar}>
          <h2 className={styles.templateName}>{template.name}</h2>
          <p className={styles.templateInfo}>
            {template.width} x {template.height}
          </p>

          <div className={styles.elementsList}>
            {textElements.length === 0 && (
              <p className={styles.emptyHint}>
                Click &quot;Add Text&quot; to start composing
              </p>
            )}
            {textElements.map((el, i) => (
              <button
                key={el.id}
                className={`${styles.elementRow} ${
                  selectedElementId === el.id ? styles.elementRowActive : ''
                }`}
                onClick={() => selectElement(el.id)}
              >
                <span className={styles.elementIndex}>{i + 1}</span>
                <span className={styles.elementText}>
                  {el.text || '(empty)'}
                </span>
              </button>
            ))}
          </div>

          <ExportButton
            canvasRef={canvasRef}
            templateId={String(template.id)}
            onExport={exportCanvas}
            templateName={template.name}
            exporting={exporting}
            error={exportError}
            onClearError={() => {/* errors cleared on next export attempt */ }}
          />
        </aside>
      </div>
    </div>
  )
}
