import { Link, useNavigate } from 'react-router-dom'
import { useHistory } from '../hooks/useHistory'
import { HistoryCard } from '../components/HistoryCard'
import styles from './HistoryPage.module.css'

export function HistoryPage() {
  const { entries, loading, error, refetch } = useHistory()
  const navigate = useNavigate()

  if (loading) {
    return <div className={styles.status}>Loading history…</div>
  }

  if (error) {
    return (
      <div className={styles.status}>
        <p className={styles.errorText}>Error: {error}</p>
        <button className={styles.retryBtn} onClick={refetch}>
          Retry
        </button>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <section className={styles.section}>
        <header className={styles.header}>
          <h1 className={styles.title}>Render History</h1>
          <p className={styles.subtitle}>Your recently exported images</p>
        </header>
        <div className={styles.empty}>
          <p>No exports yet.</p>
          <Link to="/" className={styles.link}>
            Browse templates →
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h1 className={styles.title}>Render History</h1>
        <p className={styles.subtitle}>
          {entries.length} export{entries.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div className={styles.grid}>
        {entries.map((entry) => (
          <HistoryCard
            key={entry.id}
            entry={entry}
            onReEdit={(templateId) => navigate(`/editor/${templateId}`)}
          />
        ))}
      </div>
    </section>
  )
}
