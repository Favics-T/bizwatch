import { useState, useCallback } from 'react'
import { runAnalysis } from '../lib/api.js'
import { mockData } from '../lib/mockData.js'

export function useEngines(businessType) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const analyse = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result =
        import.meta.env.VITE_USE_MOCK === 'false'
          ? await new Promise((res) => setTimeout(() => res(mockData), 1200))
          : await runAnalysis(businessType)
      setData(result)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [businessType])

  return { data, loading, error, lastUpdated, analyse }
}