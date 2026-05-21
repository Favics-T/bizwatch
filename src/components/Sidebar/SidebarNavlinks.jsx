import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  MessageSquarePlus,
  TimerReset,
  FileChartColumn,
  Layers,
  Settings2,
  BookOpen,
} from 'lucide-react'

const links = [
  { label: 'New Chat', to: '/new-chat', icon: MessageSquarePlus },
  { label: 'History', to: '/history', icon: TimerReset },
  { label: 'Analytics', to: '/analytics', icon: FileChartColumn },
  { label: 'Workspace', to: '/workspace', icon: Layers },
  { label: 'Knowledgebase', to: '/knowledgebase', icon: BookOpen },
  { label: 'Settings', to: '/settings', icon: Settings2 },
]

export default function SidebarNavlinks() {
  return (
    <ul className="flex flex-col ">
      {links.map(({ label, to, icon: Icon }) => (
        <li key={label}>
          <NavLink
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-[12px] font-medium leading-[16.8px] tracking-[0.14px] transition ${
                isActive
                  ? 'bg-violet-500/20 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                  : 'text-[#ccc3d8] hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={20} className="text-inherit" />
            <span>{label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
