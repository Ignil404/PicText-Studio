import type { TextElement } from '../../types'
import styles from './Toolbar.module.css'

// Backend FONT_REGISTRY keys — must match exactly
const FONTS = [
  'Roboto',
  'Roboto Bold',
  'Impact',
  'Arial',
  'Comic Sans',
  'Times New Roman',
  'Courier New',
  'Open Sans',
]

interface ToolbarProps {
  selected: TextElement | null
  toolbarAnchor: { x: number; y: number } | null
  canvasScale: number
  onStyleChange: (id: string, updates: Partial<TextElement>) => void
  onRemove: (id: string) => void
  onAdd: () => void
}

export function Toolbar({ selected, toolbarAnchor, canvasScale, onStyleChange, onRemove, onAdd }: ToolbarProps) {
  const hasSelection = selected !== null

  return (
    <div
      className={`${styles.toolbar} ${hasSelection ? styles.visible : ''}`}
      style={
        toolbarAnchor
          ? {
              bottom: `calc(100% - ${toolbarAnchor.y / 100 * 100}% + ${24 * canvasScale}px)`,
              left: `${toolbarAnchor.x}%`,
              transform: 'translateX(-50%)',
            }
          : {}
      }
    >
      <button className={styles.addBtn} onClick={onAdd}>
        + Add Text
      </button>

      {selected && (
        <>
          <div className={styles.group}>
            <label htmlFor="font-family" className={styles.label}>Font</label>
            <select
              id="font-family"
              className={styles.select}
              value={selected.fontFamily}
              onChange={(e) => onStyleChange(selected.id, { fontFamily: e.target.value })}
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.group}>
            <label htmlFor="font-size" className={styles.label}>Size</label>
            <input
              id="font-size"
              type="number"
              className={styles.numberInput}
              min={8}
              max={200}
              value={selected.fontSize}
              onChange={(e) =>
                onStyleChange(selected.id, { fontSize: parseInt(e.target.value, 10) || 24 })
              }
            />
          </div>

          <div className={styles.group}>
            <label htmlFor="color" className={styles.label}>Color</label>
            <input
              id="color"
              type="color"
              className={styles.colorInput}
              value={selected.color}
              onChange={(e) => onStyleChange(selected.id, { color: e.target.value })}
            />
          </div>

          <div className={styles.group}>
            <button
              className={`${styles.toggle} ${selected.bold ? styles.toggleActive : ''}`}
              onClick={() => onStyleChange(selected.id, { bold: !selected.bold })}
              aria-pressed={selected.bold}
            >
              <strong>B</strong>
            </button>
            <button
              className={`${styles.toggle} ${selected.italic ? styles.toggleActive : ''}`}
              onClick={() => onStyleChange(selected.id, { italic: !selected.italic })}
              aria-pressed={selected.italic}
            >
              <em>I</em>
            </button>
          </div>

          {/* Text alignment controls */}
          <div className={styles.group}>
            <label className={styles.label}>Align</label>
            <button
              className={`${styles.toggle} ${(selected as TextElement).textAlign === 'left' ? styles.toggleActive : ''}`}
              onClick={() => onStyleChange(selected.id, { textAlign: 'left' })}
              aria-label="Align left"
              aria-pressed={(selected as TextElement).textAlign === 'left'}
              title="Left"
            >
              ▎
            </button>
            <button
              className={`${styles.toggle} ${(selected as TextElement).textAlign === 'center' ? styles.toggleActive : ''}`}
              onClick={() => onStyleChange(selected.id, { textAlign: 'center' })}
              aria-label="Align center"
              aria-pressed={(selected as TextElement).textAlign === 'center'}
              title="Center"
            >
              ▎▎
            </button>
            <button
              className={`${styles.toggle} ${(selected as TextElement).textAlign === 'right' ? styles.toggleActive : ''}`}
              onClick={() => onStyleChange(selected.id, { textAlign: 'right' })}
              aria-label="Align right"
              aria-pressed={(selected as TextElement).textAlign === 'right'}
              title="Right"
            >
              ▐
            </button>
          </div>

          <button
            className={styles.removeBtn}
            onClick={() => onRemove(selected.id)}
          >
            Remove
          </button>
        </>
      )}

      {!selected && (
        <span className={styles.hint}>Select a text element to edit styles</span>
      )}
    </div>
  )
}
