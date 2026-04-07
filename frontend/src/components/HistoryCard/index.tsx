import type { HistoryEntry } from '../../types'
import styles from './HistoryCard.module.css'

interface HistoryCardProps {
  entry: HistoryEntry
  onReEdit: (templateId: string) => void
}

export function HistoryCard({ entry, onReEdit }: HistoryCardProps) {
  const date = new Date(entry.created_at)
  const formatted = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={entry.image_url}
          alt={entry.template_name}
          className={styles.image}
        />
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{entry.template_name}</span>
        <span className={styles.date}>{formatted}</span>
      </div>
      <button
        className={styles.reEditBtn}
        onClick={() => onReEdit(entry.template_id)}
      >
        Re-edit
      </button>
    </div>
  )
}
