import { useState, useEffect } from 'react'
import type { Template } from '../types'
import { fetchTemplates } from '../services/api'

interface UseTemplatesReturn {
  templates: Template[]
  categories: string[]
  loading: boolean
  error: string | null
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    const load = async () => {
      try {
        const data = await fetchTemplates()
        if (!cancelled) {
          setTemplates(data)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load templates')
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  const categories = ['All', ...Array.from(new Set(templates.map((t) => t.category)))]

  return { templates, categories, loading, error }
}
