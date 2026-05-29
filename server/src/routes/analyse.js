const { Router } = require('express')
const { google } = require('googleapis')
const Anthropic = require('@anthropic-ai/sdk')
const pdfParse = require('pdf-parse')
const prisma = require('../lib/prisma')
const requireAuth = require('../middleware/requireAuth')

const router = Router()

const EXTRACTABLE_TYPES = new Set([
  'application/pdf',
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'text/plain',
])

const CHARS_PER_FILE = 4000 // ~1000 tokens per file

async function extractFileContent(driveClient, file) {
  try {
    const { id, type } = file

    if (type === 'application/vnd.google-apps.document') {
      const res = await driveClient.files.export(
        { fileId: id, mimeType: 'text/plain' },
        { responseType: 'text' }
      )
      return String(res.data).slice(0, CHARS_PER_FILE)
    }

    if (type === 'application/vnd.google-apps.spreadsheet') {
      const res = await driveClient.files.export(
        { fileId: id, mimeType: 'text/csv' },
        { responseType: 'text' }
      )
      return String(res.data).slice(0, CHARS_PER_FILE)
    }

    if (type === 'application/pdf') {
      const res = await driveClient.files.get(
        { fileId: id, alt: 'media' },
        { responseType: 'arraybuffer' }
      )
      const buffer = Buffer.isBuffer(res.data)
        ? res.data
        : Buffer.from(res.data)
      const parsed = await pdfParse(buffer)
      return parsed.text.slice(0, CHARS_PER_FILE)
    }

    if (type === 'text/plain') {
      const res = await driveClient.files.get(
        { fileId: id, alt: 'media' },
        { responseType: 'text' }
      )
      return String(res.data).slice(0, CHARS_PER_FILE)
    }
  } catch (err) {
    console.warn(`Could not extract content from "${file.name}":`, err.message)
  }
  return null
}

const FILE_REQUEST_PATTERN = /\b(read|open|summarize|summarise|what(('s| is) in| does .+ say)|contents? of|extract|show me|analyse|analyze)\b/i

function isFileContentRequest(message) {
  return FILE_REQUEST_PATTERN.test(message)
}

function makeOAuthClient(accessToken, refreshToken) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken })
  return client
}

async function fetchGoogleData(auth, { extractContents = false, targetFileName = null } = {}) {
  const driveClient = google.drive({ version: 'v3', auth })
  const gmailClient = google.gmail({ version: 'v1', auth })
  const calendarClient = google.calendar({ version: 'v3', auth })

  const [driveRes, gmailRes, calendarRes] = await Promise.allSettled([
    driveClient.files.list({
      pageSize: 20,
      orderBy: 'modifiedTime desc',
      fields: 'files(id,name,mimeType,modifiedTime,size)',
    }),
    gmailClient.users.messages.list({
      userId: 'me',
      maxResults: 30,
      q: 'in:inbox',
    }),
    calendarClient.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    }),
  ])

  // Build drive file list — keep id for content extraction
  const rawFiles = driveRes.status === 'fulfilled'
    ? (driveRes.value.data.files ?? [])
    : []

  let driveFiles
  if (extractContents) {
    // If a target filename is given, extract only files whose name matches the query.
    // Otherwise (e.g. /api/analyse full analysis) extract top 5 extractable files.
    const query = targetFileName?.toLowerCase() ?? ''
    const candidates = rawFiles.filter((f) => EXTRACTABLE_TYPES.has(f.mimeType))
    const nameMatches = query
      ? candidates.filter((f) => f.name.toLowerCase().includes(query) || query.includes(f.name.toLowerCase())).slice(0, 2)
      : []
    // Fall back to top 5 extractable files when no filename matches the query
    const extractable = nameMatches.length > 0 ? nameMatches : candidates.slice(0, 5)

    const contentResults = await Promise.allSettled(
      extractable.map((f) => extractFileContent(driveClient, { id: f.id, type: f.mimeType, name: f.name }))
    )
    driveFiles = rawFiles.map((f) => {
      const idx = extractable.findIndex((e) => e.id === f.id)
      const content = idx !== -1 && contentResults[idx].status === 'fulfilled'
        ? contentResults[idx].value
        : null
      return {
        name: f.name,
        type: f.mimeType,
        modified: f.modifiedTime,
        ...(content ? { content } : {}),
      }
    })
  } else {
    driveFiles = rawFiles.map((f) => ({
      name: f.name,
      type: f.mimeType,
      modified: f.modifiedTime,
    }))
  }

  // Fetch subject/sender for first 10 emails
  let emails = []
  if (gmailRes.status === 'fulfilled') {
    const messageIds = (gmailRes.value.data.messages ?? []).slice(0, 10).map((m) => m.id)
    const emailDetails = await Promise.allSettled(
      messageIds.map((id) =>
        gmailClient.users.messages.get({
          userId: 'me',
          id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        })
      )
    )
    emails = emailDetails
      .filter((r) => r.status === 'fulfilled')
      .map((r) => {
        const headers = r.value.data.payload?.headers ?? []
        const get = (name) => headers.find((h) => h.name === name)?.value ?? ''
        return { subject: get('Subject'), from: get('From'), date: get('Date') }
      })
  }

  const events =
    calendarRes.status === 'fulfilled'
      ? (calendarRes.value.data.items ?? []).map((e) => ({
          title: e.summary,
          start: e.start?.dateTime ?? e.start?.date,
          end: e.end?.dateTime ?? e.end?.date,
        }))
      : []

  return { driveFiles, emails, events }
}

const ANALYSE_PROMPT = `You are BizWatch AI — a business intelligence layer for small business owners.

You will receive raw data from the user's Google Workspace. Analyse it and return a JSON object with this exact shape (no markdown, no preamble):
{
  "connectedSources": { "drive": true, "gmail": true, "sheets": true, "calendar": true },
  "insights": {
    "summary": "<2-3 sentence executive summary>",
    "insights": [
      { "id": "ins_001", "type": "financial|communication|client|operational", "title": "<short title>", "detail": "<1-2 specific sentences>", "severity": "critical|warning|info", "source": "drive|gmail|sheets|calendar", "timestamp": "<ISO timestamp>" }
    ]
  },
  "predictions": {
    "outlook": "positive|cautious|negative",
    "predictions": [
      { "id": "pred_001", "type": "cashflow|workload|churn|growth", "title": "<short title>", "detail": "<specific forecast>", "confidence": "high|medium|low", "timeframe": "<e.g. 2 weeks>", "recommended_action": "<concrete action>", "source": "drive|gmail|sheets|calendar" }
    ]
  },
  "alerts": {
    "unread_count": <number>,
    "alerts": [
      { "id": "alert_001", "type": "churn_risk|contract_expiry|overdue_payment|deadline", "title": "<short title>", "detail": "<specific detail>", "urgency": "critical|high|medium", "action_required": "<concrete action>", "deadline": "<ISO timestamp or null>", "source": "drive|gmail|sheets|calendar", "client_or_entity": "<name or null>" }
    ]
  }
}

Derive everything from the actual data provided. Use ₦ for financial figures unless another currency is evident. Be specific — reference actual file names, email senders, event titles.`

// POST /api/claude — server-side proxy so the API key is never in the browser
// If the user is authenticated, fetches their Google Workspace data and injects
// it into the system prompt so the AI can answer questions about their business.
router.post('/claude', async (req, res) => {
  try {
    const { model, max_tokens, system, messages } = req.body
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

    let enrichedSystem = system

    if (req.session?.userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.session.userId },
          select: { accessToken: true, refreshToken: true },
        })

        if (user?.accessToken) {
          const auth = makeOAuthClient(user.accessToken, user.refreshToken)
          const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''

          // Only extract file contents when the user is clearly asking about a file
          const wantsFileContent = isFileContentRequest(lastUserMessage)
          const { driveFiles, emails, events } = await fetchGoogleData(auth, {
            extractContents: wantsFileContent,
            targetFileName: wantsFileContent ? lastUserMessage : null,
          })
          const dataContext = JSON.stringify({ driveFiles, emails, events }, null, 2)
          enrichedSystem = `${system}\n\n---\n\nLIVE WORKSPACE DATA (as of this request):\n${dataContext}`
        }
      } catch (dataErr) {
        console.warn('Could not fetch Google data for chat:', dataErr.message)
        // Continue without data rather than failing the whole request
      }
    }

    const message = await anthropic.messages.create({ model, max_tokens, system: enrichedSystem, messages })
    res.json(message)
  } catch (err) {
    console.error('POST /api/claude error:', err)
    const status = err.status ?? 500
    res.status(status).json({ error: err.message ?? 'Claude API error' })
  }
})

// POST /api/analyse
router.post('/analyse', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { accessToken: true, refreshToken: true },
    })

    if (!user?.accessToken) {
      return res.status(401).json({ error: 'Google account not connected' })
    }

    const auth = makeOAuthClient(user.accessToken, user.refreshToken)
    const { driveFiles, emails, events } = await fetchGoogleData(auth, { extractContents: true })

    const dataContext = JSON.stringify({ driveFiles, emails, events }, null, 2)

    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: ANALYSE_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is the Google Workspace data for this business:\n\n${dataContext}\n\nGenerate the full analysis JSON.`,
        },
      ],
    })

    const raw = message.content[0]?.text ?? '{}'
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const result = JSON.parse(cleaned)

    res.json(result)
  } catch (err) {
    console.error('POST /api/analyse error:', err)
    res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
})

module.exports = router
