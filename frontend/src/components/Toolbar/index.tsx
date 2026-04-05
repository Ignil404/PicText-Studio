import type { TextElement } from '../../types'
import styles from './Toolbar.module.css'

const FONTS = [
  'Arial, sans-serif',
  'Georgia, serif',
  'Courier New, monospace',
  'Impact, sans-serif',
  'Comic Sans MS, cursive',
  'Verdana, sans-serif',
  'Times New Roman, serif',
  'Trebuchet MS, sans-serif',
]

interface ToolbarProps {
  selected: TextElement | null
  onStyleChange: (id: string, updates: Partial<TextElement>) => void
  onRemove: (id: string) => void
  onAdd: () => void
}

export function Toolbar({ selected, onStyleChange, onRemove, onAdd }: ToolbarProps) {
  if (!selected) {
    return (
      <div className={styles.toolbar}>
        <button className={styles.addBtn} onClick={onAdd}>
          + Add Text
        </button>
        <span className={styles.hint}>Select a text element to edit styles</span>
      </div>
    )
  }

  return (
    <div className={styles.toolbar}>
      <button className={styles.addBtn} onClick={onAdd}>
        + Add Text
      </button>

      <div className={styles.group}>
        <label htmlFor="font-family" className={styles.label}>Font</label>
        <select
          id="font-family"
          className={styles.select}
          value={selected.fontFamily}
          onChange={(e) => onStyleChange(selected.id, { fontFamily: e.target.value })}
        >
          {FONTS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f.split(',')[0]}
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

      <button
        className={styles.removeBtn}
        onClick={() => onRemove(selected.id)}
      >
        Remove
      </button>
    </div>
  )
}
