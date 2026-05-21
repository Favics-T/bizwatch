import { useLocation } from 'react-router-dom'
import { BarChart2, Lock, HardDrive, Mail, Calendar, Shield } from 'lucide-react'
import { getGoogleAuthUrl } from '../lib/api.js'

const perms = [
  { icon: HardDrive, label: 'Google Drive', desc: 'Contracts and documents' },
  { icon: Mail, label: 'Gmail & Sheets', desc: 'Client communication and financial data' },
  { icon: Calendar, label: 'Google Calendar', desc: 'Meeting load and deadlines' },
]

export default function Connect() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const hasError = params.get('error') === 'auth_failed'

  function handleConnect() {
    window.location.href = getGoogleAuthUrl()
  }

  return (
    <div className="min-h-screen bg-[#0F0D17] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-[0_12px_40px_-12px_rgba(124,58,237,0.5)] mb-4">
            <BarChart2 size={26} className="text-white" />
          </div>
          <span className="font-mono font-semibold text-white text-sm tracking-wide">BizWatch</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          {hasError && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              Connection failed. Please try again.
            </div>
          )}

          <h1 className="text-xl font-semibold text-white mb-2 text-center">
            Connect your Google Workspace
          </h1>
          <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
            BizWatch reads your data to generate insights. No raw data is stored.
          </p>

          {/* Permissions list */}
          <div className="space-y-3 mb-6">
            {perms.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-300 shrink-0">
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                <div className="ml-auto shrink-0 flex items-center gap-1 text-[10px] text-slate-500">
                  <Lock size={10} />
                  Read-only
                </div>
              </div>
            ))}
          </div>

          {/* Privacy note */}
          <div className="flex items-start gap-2 text-xs text-slate-500 mb-8 px-1">
            <Shield size={13} className="shrink-0 mt-0.5 text-slate-600" />
            <span className="leading-relaxed">
              BizWatch reads your data to generate insights. No raw data is stored. You can
              disconnect at any time.
            </span>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleConnect}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition text-sm shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.25 9c0-.51.09-1 .25-1.48V5.45H1.83a8 8 0 0 0 0 7.1l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 3.72c1.22 0 2.31.42 3.17 1.25l2.37-2.38A8 8 0 0 0 1.83 5.45L4.5 7.52A4.77 4.77 0 0 1 8.98 3.72z"/>
            </svg>
            Connect with Google
          </button>
        </div>
      </div>
    </div>
  )
}
