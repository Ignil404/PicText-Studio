import { useParams, useNavigate } from 'react-router-dom'
import { useTemplates } from '../hooks/useTemplates'
import { Editor } from '../components/Editor'
import styles from './EditorPage.module.css'

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const { templates, loading, error } = useTemplates()
  const navigate = useNavigate()

  const template = templates.find((t) => t.id === id)

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--color-text-muted)' }}>Loading…</div>
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p style={{ color: 'var(--color-danger)' }}>Error: {error}</p>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← Back to gallery</button>
      </div>
    )
  }

  if (!template) {
    return (
      <div className={styles.errorState}>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Template not found
        </p>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ← Back to gallery
        </button>
      </div>
    )
  }

  return <Editor template={template} onBack={() => navigate('/')} />
}
