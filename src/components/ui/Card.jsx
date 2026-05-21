import React from 'react'

export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.75)] backdrop-blur-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
