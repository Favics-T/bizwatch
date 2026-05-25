import React from 'react'
import Badge from '../ui/Badge'
import { FileText } from 'lucide-react'



export default function CustomKnowledgeCard({ title, time, status, size }) {
  return (
    <article className=" border border-white/10 bg-[#111111] px-2 py-5 transition duration-200 hover:border-violet-400/30 hover:bg-white/10">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-violet-300">
          <FileText size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] text-[#E8DFEE]">{title}</h3>
          <p className="mt-2 text-sm text-slate-400">{time}</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 text-[12px] text-slate-300">
        <span>{size}</span>
        <Badge variant={status === 'Synchronized' ? 'Indexing' : 'Synchronized'}>{status}</Badge>
      </div>
    </article>
  )
}
