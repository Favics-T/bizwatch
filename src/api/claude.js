export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  // Google OAuth token must come from the frontend (stored after OAuth flow)
  const googleToken = req.headers['x-google-token']

  const mcpServers = googleToken ? [
    {
      type: 'url',
      url: 'https://gmailmcp.googleapis.com/mcp/v1',
      name: 'gmail',
      authorization_token: googleToken,
    },
    {
      type: 'url',
      url: 'https://drivemcp.googleapis.com/mcp/v1',
      name: 'google-drive',
      authorization_token: googleToken,
    },
    {
      type: 'url',
      url: 'https://calendarmcp.googleapis.com/mcp/v1',
      name: 'google-calendar',
      authorization_token: googleToken,
    },
  ] : []

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'mcp-client-2025-04-04',  // required for MCP
      },
      body: JSON.stringify({
        ...req.body,
        ...(mcpServers.length > 0 && { mcp_servers: mcpServers }),
      }),
    })

    const data = await response.json()
    if (!response.ok) return res.status(response.status).json(data)
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}