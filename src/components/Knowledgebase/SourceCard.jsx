import React from 'react'
import Badge from '../ui/Badge'

export default function SourceCard({ icon: Icon, title, description, status, accent }) {
  return (
    <article className="group overflow-hidden border border-white/10 bg-[#111111] p-8 transition duration-200 hover:border-violet-400/30 hover:bg-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-violet-300 shadow-[0_20px_45px_-30px_rgba(124,58,237,0.85)]">
          <Icon size={24} />
        </div>
        <Badge variant={accent === 'connected' ? 'Connected' : 'Inactive'}>{status}</Badge>
      </div>
      <div className="mt-6 space-y-3">
        <h3 className="text-lg font-[18px] text-[#E8DFEE]">{title}</h3>
        <p className="text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </article>
  )
}
