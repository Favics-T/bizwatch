import React from 'react'

const variants = {
  subtle: 'bg-white/5 text-slate-300',
  success: 'bg-emerald-500/15 text-emerald-300',
  outline: 'border border-white/10 text-slate-300',
}

export default function Badge({ variant = 'subtle', className = '', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
