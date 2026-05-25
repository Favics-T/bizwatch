const BASE = import.meta.env.VITE_API_URL

export async function getMe() {
  const res = await fetch(`${BASE}/auth/me`, { credentials: 'include' })
  if (!res.ok) return null
  const data = await res.json()
  return data.user
}

export async function logout() {
  await fetch(`${BASE}/auth/logout`, { method: 'POST', credentials: 'include' })
}

export async function runAnalysis(businessType = 'general') {
  const res = await fetch(`${BASE}/api/analyse`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessType }),
  })
  if (!res.ok) throw new Error('Analysis failed. Please refresh and try again.')
  return res.json()
}

export function getGoogleAuthUrl() {
  if (!BASE) throw new Error('API URL is not configured. Check VITE_API_URL.')
  return `${BASE}/auth/google`
}
