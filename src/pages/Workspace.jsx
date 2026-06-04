import { Loader2 } from 'lucide-react'
import WorkspaceConnector from '../components/WorkspaceConnector'
import { useAuth } from '../hooks/useAuth.js'
import { getGoogleAuthUrl } from '../lib/api.js'
import { mockData } from '../lib/mockData.js'

// ── OAuth logic handler ───────────────────────────────────────────────────────
//
// Receives { services: string[] } from WorkspaceConnector and initiates the
// Google OAuth 2.0 consent flow.
//
// Return contract:
//   string[]  → mock path — no redirect; component flips those service badges to CONNECTED
//   void      → real path — browser navigates to /auth/google; Promise never settles
//   throw     → component surfaces an error banner
//
async function initOAuthFlow(payload) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return payload.services
  }

  // The backend's /auth/google already requests all required workspace scopes.
  window.location.href = getGoogleAuthUrl()
  await new Promise(() => {}) // Suspend so the component stays in loading during navigation
}

// ── Key mapping ───────────────────────────────────────────────────────────────
//
// Backend and mock fixture use short keys (drive, sheets, calendar).
// WorkspaceConnector expects long camelCase keys (googleDrive, googleSheets, googleCalendar).
//
function toConnectorShape(sources) {
  return {
    googleDrive:    sources?.drive    ?? false,
    gmail:          sources?.gmail    ?? false,
    googleSheets:   sources?.sheets   ?? false,
    googleCalendar: sources?.calendar ?? false,
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Workspace() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={20} className="animate-spin text-violet-400" />
      </div>
    )
  }

  const rawSources =
    import.meta.env.VITE_USE_MOCK === 'true'
      ? mockData.connectedSources
      : user?.connectedSources

  return (
    <WorkspaceConnector
      initialConnected={toConnectorShape(rawSources)}
      onInitOAuth={initOAuthFlow}
    />
  )
}
