import { HelpCircle, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../lib/api.js'

export default function Bottom() {
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="mt-auto pt-6 space-y-3 border-t border-white/10">
      <button
        type="button"
        className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-500"
      >
        Upgrade Plan
      </button>
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
        >
          <HelpCircle size={14} />
          Help
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  )
}
