import { useState } from 'react'
import Sidebar from './Sidebar'
import NavBar from './NavBar'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0d17] text-[#ccc3d8]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <NavBar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}
