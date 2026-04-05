import { useState } from 'react'
import styles from './ExportButton.module.css'

interface ExportButtonProps {
  canvasRef: React.RefObject<HTMLDivElement | null>
  onExport: (
    element: HTMLElement,
    format: 'png' | 'jpeg',
    filename: string,
  ) => Promise<void>
  templateName: string
}

export function ExportButton({ canvasRef, onExport, templateName }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format: 'png' | 'jpeg') => {
    if (!canvasRef.current || exporting) return
    setExporting(true)
    try {
      await onExport(canvasRef.current, format, templateName)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className={styles.export}>
      <button
        className={styles.btn}
        onClick={() => handleExport('png')}
        disabled={exporting}
      >
        {exporting ? 'Exporting…' : 'Export PNG'}
      </button>
      <button
        className={styles.btnOutline}
        onClick={() => handleExport('jpeg')}
        disabled={exporting}
      >
        Export JPEG
      </button>
    </div>
  )
}
