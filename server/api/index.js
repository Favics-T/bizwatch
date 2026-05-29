const express = require('express')
const cors = require('cors')
const session = require('express-session')
const connectPgSimple = require('connect-pg-simple')
const { Pool } = require('pg')
const { google } = require('googleapis')

const app = express()

// Enable trust proxy for secure cookies to work on Vercel
app.set('trust proxy', 1)

const PgSession = connectPgSimple(session)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 10000,
})

app.use(express.json())

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))

app.use(session({
  store: new PgSession({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  }
}))

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  )
}

const SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
]

app.get('/auth/google', (req, res) => {
  const client = getOAuthClient()
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  })
  res.redirect(url)
})

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query
  try {
    const client = getOAuthClient()
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)
    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const { data: profile } = await oauth2.userinfo.get()
    req.session.user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
      connectedSources: {
        gmail: true,
        drive: true,
        sheets: true,
        calendar: true,
      },
    }
    req.session.googleToken = tokens.access_token
    req.session.save(() => {
      res.redirect(`${process.env.FRONTEND_URL}/analytics`)
    })
  } catch (err) {
    console.error('OAuth callback error:', err)
    res.redirect(`${process.env.FRONTEND_URL}/connect?error=auth_failed`)
  }
})

app.get('/auth/me', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ user: null })
  res.json({ user: req.session.user })
})

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid')
    res.json({ ok: true })
  })
})

app.get('/auth/token', (req, res) => {
  if (!req.session?.googleToken) return res.status(401).json({ error: 'Not authenticated' })
  res.json({ token: req.session.googleToken })
})

module.exports = app