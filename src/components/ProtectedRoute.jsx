import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/connect" replace />
  return children
}
