import React from 'react'

const variantStyles = {
  primary: 'bg-violet-600 text-white hover:bg-violet-500',
  secondary: 'bg-white/5 text-slate-100 hover:bg-white/10',
  outline: 'border border-white/10 text-slate-100 hover:border-violet-400/30 hover:text-white',
}

const sizeStyles = {
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
