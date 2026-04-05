import type { Template } from '../../types'
import styles from './TemplateCard.module.css'

interface TemplateCardProps {
  template: Template
  onSelect: (id: string) => void
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        <img
          src={template.imageUrl}
          alt={template.name}
          className={styles.image}
        />
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{template.name}</h3>
        <span className={styles.category}>{template.category}</span>
      </div>
      <button
        className={styles.selectBtn}
        onClick={() => onSelect(template.id)}
        aria-label={`Select template ${template.name}`}
      >
        Select
      </button>
    </article>
  )
}
