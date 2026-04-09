import { Link, useLocation } from 'react-router-dom'
import styles from './AppShell.module.css'

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>✦</span>
            <span className={styles.logoText}>Meme Forge</span>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link
            to="/"
            className={`${styles.navLink} ${location.pathname === '/' ? styles.navLinkActive : ''}`}
          >
            Gallery
          </Link>
          <Link
            to="/history"
            className={`${styles.navLink} ${location.pathname === '/history' ? styles.navLinkActive : ''}`}
          >
            History
          </Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
