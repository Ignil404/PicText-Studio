import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTemplates } from '../../hooks/useTemplates'
import { TemplateCard } from '../TemplateCard'
import styles from './TemplateGallery.module.css'

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

  if (loading) {
    return <div className={styles.status}>Loading templates…</div>
  }

  if (error) {
    return <div className={styles.status + ' ' + styles.error}>Error: {error}</div>
  }

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h1 className={styles.title}>Template Gallery</h1>
        <p className={styles.subtitle}>Choose a template to start composing</p>
        <Link to="/history" className={styles.historyLink}>
          View History →
        </Link>
      </header>

      <nav className={styles.filter} aria-label="Category filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${selectedCategory === cat ? styles.filterBtnActive : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No templates in this category</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  )
}
