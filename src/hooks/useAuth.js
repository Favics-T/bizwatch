import { useState, useEffect } from 'react'
import { getMe } from '../lib/api.js'
import { mockUser } from '../lib/mockData.js'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      setUser(mockUser)
      setLoading(false)
      return
    }
    getMe()
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}
