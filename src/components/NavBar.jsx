import { Bell, Menu, LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { logout } from '../lib/api.js'

const navLinks = [
  { label: 'Models', to: '/model' },
  { label: 'Knowledge Base', to: '/knowledgebase' },
  { label: 'API', to: '/api' },
]

export default function NavBar({ onOpenSidebar }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-20 w-full bg-[#15121B] border-b border-white/10 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.65)]">
      <div className="mx-auto flex max-w-400 items-center justify-between gap-4 px-6 py-4 sm:px-8">
        {/* Left: hamburger + nav tabs */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-white/5 text-[#ccc3d8] shadow-sm shadow-black/20 transition hover:bg-white/10 hover:text-white sm:hidden"
          >
            <Menu size={18} />
          </button>
          {/* Search bar — visible on md+ */}
          <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 min-w-55">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-xs text-slate-500">Search analytics or reports...</span>
          </div>

          {/* <div className="hidden sm:flex min-w-0 flex-wrap items-center gap-1 overflow-x-auto ml-2">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `relative rounded-full px-3 py-2 text-[13px] font-medium transition ${
                    isActive
                      ? 'text-white after:absolute after:left-1/2 after:bottom-0 after:-translate-x-1/2 after:h-0.5 after:w-6 after:rounded-full after:bg-white'
                      : 'text-biz-muted hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div> */}

        </div>

        {/* Right: bell + user */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 text-biz-muted shadow-sm shadow-black/20 transition hover:bg-white/10 hover:text-white"
          >
            <Bell size={16} />
          </button>
          {user && (
            <>
              <img
                src={user.picture || `https://i.pravatar.cc/40`}
                alt={user.name}
                className="h-9 w-9 rounded-2xl border border-white/10 object-cover"
              />
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition"
                title="Logout"
              >
                <LogOut size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
