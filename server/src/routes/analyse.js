const { Router } = require('express')
const { google } = require('googleapis')
const Anthropic = require('@anthropic-ai/sdk')
const prisma = require('../lib/prisma')
const requireAuth = require('../middleware/requireAuth')

const router = Router()

function makeOAuthClient(accessToken, refreshToken) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken })
  return client
}

async function fetchGoogleData(auth) {
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

  const driveFiles =
    driveRes.status === 'fulfilled'
      ? (driveRes.value.data.files ?? []).map((f) => ({
          name: f.name,
          type: f.mimeType,
          modified: f.modifiedTime,
        }))
      : []

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
    const { driveFiles, emails, events } = await fetchGoogleData(auth)

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
