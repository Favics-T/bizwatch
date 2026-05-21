import React from 'react'
import { Search } from 'lucide-react'

export default function Input({ label = 'Search', icon, className = '', ...props }) {
  return (
    <label className="group relative block w-full text-slate-300">
      <span className="sr-only">{label}</span>
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 transition group-focus-within:text-indigo-200">
        {icon || <Search size={18} />}
      </span>
      <input
        className={`w-full rounded-3xl border border-white/10 bg-[#1b162b] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/15 ${className}`}
        {...props}
      />
    </label>
  )
}
