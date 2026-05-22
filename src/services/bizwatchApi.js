const MOCK_RESPONSE = {
  response:
    "Based on your connected workspace data, here's what I'm seeing right now.",
  insights: [
    {
      type: 'opportunity',
      title: 'Mock opportunity',
      body: 'Details here',
    },
    {
      type: 'risk',
      title: 'Mock risk',
      body: 'Details here',
    },
  ],
}

export async function sendChatMessage(messages) {
  const base = import.meta.env.VITE_API_URL

  if (!base) {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return MOCK_RESPONSE
  }

  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
  return res.json()
}
