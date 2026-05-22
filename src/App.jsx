import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Connect from './pages/Connect'
import Onboarding from './pages/Onboarding'
import NewChat from './pages/NewChat'
import Analytics from './pages/Analytics'
import History from './pages/History'
import Knowledgebase from './pages/Knowledgebase'
import Workspace from './pages/Workspace'
import Settings from './pages/Settings'
import API from './pages/API'
import Model from './pages/Model'

function App() {
  return (
    <Routes>
      {/* Public auth flow — no sidebar */}
      <Route path="/" element={<Landing />} />
      <Route path="/connect" element={<Connect />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* Protected app — wrapped in sidebar layout */}
      <Route
        path="/new-chat"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NewChat />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NewChat />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Analytics />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppLayout>
              <History />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/knowledgebase"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Knowledgebase />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Workspace />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/api"
        element={
          <ProtectedRoute>
            <AppLayout>
              <API />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/model"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Model />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/new-chat" replace />} />
    </Routes>
  )
}

export default App
