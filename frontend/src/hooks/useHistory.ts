import { useState, useEffect } from 'react'
import type { HistoryEntry } from '../types'
import { fetchHistory } from '../services/api'
import { getSessionId } from '../lib/session'

interface UseHistoryReturn {
  entries: HistoryEntry[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useHistory(): UseHistoryReturn {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const sessionId = getSessionId()
      const data = await fetchHistory(sessionId)
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return { entries, loading, error, refetch: load }
}
