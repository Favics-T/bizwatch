import { useState } from 'react'
import Sidebar from './Sidebar'
import NavBar from './NavBar'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <NavBar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-[var(--surface)] px-6 py-6 sm:px-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}
