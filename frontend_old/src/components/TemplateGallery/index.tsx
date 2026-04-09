import { useState } from 'react'
import { useTemplates } from '../../hooks/useTemplates'
import { TemplateCard } from '../TemplateCard'
import styles from './TemplateGallery.module.css'

const CATEGORY_COLORS: Record<string, string> = {
  classic: 'var(--color-category-classic)',
  reaction: 'var(--color-category-reaction)',
  decision: 'var(--color-category-decision)',
  opinion: 'var(--color-category-opinion)',
  escalation: 'var(--color-category-escalation)',
}

interface TemplateGalleryProps {
  onSelect: (id: string) => void
}

export function TemplateGallery({ onSelect }: TemplateGalleryProps) {
  const { templates, categories, loading, error } = useTemplates()
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filtered =
    selectedCategory === 'All'
      ? templates
      : templates.filter((t) => t.category === selectedCategory)

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.status + ' ' + styles.error}>Error: {error}</div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Meme Forge</h1>
        <p className={styles.heroSubtitle}>
          Pick a template, add text, and export — fast and simple.
        </p>
        {!loading && (
          <span className={styles.templateCount}>
            {templates.length} template{templates.length !== 1 ? 's' : ''} available
          </span>
        )}
      </div>

      {/* Category filter */}
      <nav className={styles.filter} aria-label="Category filter">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
              style={
                isActive
                  ? {}
                  : {
                      '--accent-hover': CATEGORY_COLORS[cat] ?? 'var(--color-text-muted)',
                    } as React.CSSProperties
              }
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          )
        })}
      </nav>

      {/* Grid or skeletons */}
      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={styles.skeletonCard}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonBadge} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No templates in this category</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((template, i) => (
            <div
              key={template.id}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <TemplateCard
                template={template}
                onClick={() => onSelect(template.id)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
