import styles from './ExportButton.module.css'

interface ExportButtonProps {
  canvasRef: React.RefObject<HTMLDivElement | null>
  templateId: string
  onExport: (
    element: HTMLElement,
    templateId: string,
    format: 'png' | 'jpeg',
    filename: string,
  ) => Promise<void>
  templateName: string
  exporting: boolean
  error: string | null
  onClearError: () => void
}

export function ExportButton({
  canvasRef,
  templateId,
  onExport,
  templateName,
  exporting,
  error,
  onClearError,
}: ExportButtonProps) {
  const handleExport = async (format: 'png' | 'jpeg') => {
    if (!canvasRef.current || exporting) return
    onClearError()
    await onExport(canvasRef.current, templateId, format, templateName)
  }

  return (
    <div className={styles.export}>
      {error && <p className={styles.error}>{error}</p>}
      <button
        className={styles.btn}
        onClick={() => handleExport('png')}
        disabled={exporting}
      >
        {exporting ? 'Rendering…' : 'Export PNG'}
      </button>
      <button
        className={styles.btnOutline}
        onClick={() => handleExport('jpeg')}
        disabled={exporting}
      >
        {exporting ? 'Rendering…' : 'Export JPEG'}
      </button>
    </div>
  )
}
