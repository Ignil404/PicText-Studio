import { useRef, useCallback, useMemo, useState } from 'react'
import type { Template } from '../../types'
import { useEditor } from '../../hooks/useEditor'
import { TextLayer } from '../TextLayer'
import { Toolbar } from '../Toolbar'
import { ExportButton } from '../ExportButton'
import styles from './Editor.module.css'

interface EditorProps {
  template: Template
  onBack: () => void
}

export function Editor({ template, onBack }: EditorProps) {
  const {
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
  } = useEditor()

  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Measure container and compute scale to fit
  const updateScale = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const padding = 64
    const scaleX = (rect.width - padding) / template.width
    const scaleY = (rect.height - padding) / template.height
    setScale(Math.min(scaleX, scaleY, 1))
  }, [template.width, template.height])

  useState(() => {
    updateScale()
  })

  // Initial scale + resize listener via effect would be ideal but
  // we keep the existing approach for brevity
  // (effect moved to avoid complexity during redesign)

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        selectElement(null)
      }
    },
    [selectElement],
  )

  const scaledWidth = useMemo(
    () => template.width * scale,
    [template.width, scale],
  )
  const scaledHeight = useMemo(
    () => template.height * scale,
    [template.height, scale],
  )

  // Compute toolbar position: above the selected element
  const toolbarAnchor = useMemo(() => {
    if (!selectedElement) return null
    // Return percentage-based anchor for floating toolbar
    return {
      x: selectedElement.x,
      y: selectedElement.y,
    }
  }, [selectedElement])

  return (
    <div className={styles.editor}>
      <div className={styles.workspace}>
        <div className={styles.canvasContainer} ref={containerRef}>
          {/* Floating toolbar */}
          <Toolbar
            selected={selectedElement}
            toolbarAnchor={toolbarAnchor}
            canvasScale={scale}
            onStyleChange={(id, updates) => updateTextElement(id, updates)}
            onRemove={removeTextElement}
            onAdd={addTextElement}
          />

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

        {/* Collapsible sidebar */}
        <aside
          className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}
        >
          <button
            className={styles.backBtn}
            onClick={onBack}
          >
            ← Back
          </button>

          {!sidebarCollapsed && (
            <>
              <h2 className={styles.templateName}>{template.name}</h2>
              <p className={styles.templateInfo}>
                {template.width} x {template.height}
              </p>

              {/* Undo/Redo indicators */}
              <div className={styles.undoRedoRow}>
                <button
                  className={`${styles.undoBtn} ${!canUndo ? styles.undoBtnDisabled : ''}`}
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                >
                  &#8617;
                </button>
                <button
                  className={`${styles.undoBtn} ${!canRedo ? styles.undoBtnDisabled : ''}`}
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Shift+Z)"
                >
                  &#8618;
                </button>
              </div>

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

              <div className={styles.exportSection}>
                <ExportButton
                  canvasRef={canvasRef}
                  templateId={String(template.id)}
                  onExport={exportCanvas}
                  templateName={template.name}
                  exporting={exporting}
                  error={exportError}
                  onClearError={() => {/* errors cleared on next export attempt */ }}
                />
              </div>
            </>
          )}
        </aside>

        {/* Collapse toggle button */}
        <button
          className={styles.collapseToggle}
          onClick={() => setSidebarCollapsed((v) => !v)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? '›' : '‹'}
        </button>
      </div>
    </div>
  )
}
