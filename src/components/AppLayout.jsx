import { useState } from 'react'
import Sidebar from './Sidebar'
import NavBar from './NavBar'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0f0d17] text-[#ccc3d8]">
      <NavBar onOpenSidebar={() => setSidebarOpen(true)} />
      <div className="flex min-h-[calc(100vh-72px)] overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto px-6 py-6 sm:px-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}
