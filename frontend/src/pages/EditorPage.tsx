import { useParams, Link } from 'react-router-dom'
import { useTemplates } from '../hooks/useTemplates'
import { Editor } from '../components/Editor'

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const { templates, loading, error } = useTemplates()

  const template = templates.find((t) => t.id === id)

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '4rem', color: '#a3a3a3' }}>Loading…</div>
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem', color: '#f87171' }}>
        <p>Error: {error}</p>
        <Link to="/" style={{ color: '#60a5fa' }}>← Back to gallery</Link>
      </div>
    )
  }

  if (!template) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <p style={{ color: '#a3a3a3', marginBottom: '1rem' }}>
          Template not found
        </p>
        <Link to="/" style={{ color: '#60a5fa' }}>
          ← Back to gallery
        </Link>
      </div>
    )
  }

  return <Editor template={template} />
}
