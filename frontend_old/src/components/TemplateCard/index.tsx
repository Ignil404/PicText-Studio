import type { Template } from '../../types'
import styles from './TemplateCard.module.css'

const CATEGORY_COLORS: Record<string, string> = {
  classic: 'var(--color-category-classic)',
  reaction: 'var(--color-category-reaction)',
  decision: 'var(--color-category-decision)',
  opinion: 'var(--color-category-opinion)',
  escalation: 'var(--color-category-escalation)',
}

interface TemplateCardProps {
  template: Template
  onClick: () => void
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const accentColor = CATEGORY_COLORS[template.category] ?? 'var(--color-text-muted)'

  return (
    <article
      className={styles.card}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      tabIndex={0}
      role="button"
      aria-label={`Open ${template.name} template`}
    >
      <div className={styles.thumb}>
        <img
          src={template.imageUrl}
          alt={template.name}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.overlay} />
      </div>
      <span
        className={styles.category}
        style={{ '--accent-color': accentColor } as React.CSSProperties}
      >
        {template.category}
      </span>
      <div className={styles.info}>
        <h3 className={styles.name}>{template.name}</h3>
      </div>
    </article>
  )
}
